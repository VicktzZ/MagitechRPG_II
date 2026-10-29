'use client';

import { useChatContext } from '@contexts/chatContext';
import { useMediaQuery, type Theme } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
    type ReactElement,
    type ReactNode
} from 'react';
import { CHAT_DOCK_GAP, CHAT_PANEL_WIDTH, useChatDocked } from '../../campaignLayout';
import { cascadeRect, computeBounds, type Bounds, type Rect } from './windowGeometry';
import { MAX_OPEN_WINDOWS, WINDOW_DEFAULT_SIZE, windowKey, type WindowKind, type WindowTarget } from './windowKinds';
import { frontWindowKey, initialWindowsState, windowsReducer, type FocusRequest, type WindowEntry } from './windowState';
import { WINDOW_AREA_EDGE, WINDOW_AREA_LEFT, WINDOW_AREA_TOP } from './layout';

/** O que as janelas fazem: estável, para quem só abre janelas (cartões, barra do grupo) não re-renderizar a cada arrasto */
export interface GMWindowActions {
    openWindow: (kind: WindowKind, targetId: string) => void;
    focusWindow: (key: string) => void;
    closeWindow: (key: string) => void;
    commitRect: (key: string, rect: Rect) => void;
    toggleCollapse: (key: string) => void;
}

export interface GMWindowViewState {
    windows: WindowEntry[];
    frontKey: string | null;
    focusRequest: FocusRequest | null;
    bounds: Bounds;
    /** Celular: a janela da frente ocupa a tela toda */
    mobile: boolean;
}

const noActions: GMWindowActions = {
    openWindow: () => undefined,
    focusWindow: () => undefined,
    closeWindow: () => undefined,
    commitRect: () => undefined,
    toggleCollapse: () => undefined
};

const emptyView: GMWindowViewState = {
    windows: [],
    frontKey: null,
    focusRequest: null,
    bounds: { left: 0, top: 0, right: 0, bottom: 0 },
    mobile: false
};

const GMWindowActionsContext = createContext<GMWindowActions>(noActions);
const GMWindowViewContext = createContext<GMWindowViewState>(emptyView);

export const useGMWindowActions = (): GMWindowActions => useContext(GMWindowActionsContext);
export const useGMWindowView = (): GMWindowViewState => useContext(GMWindowViewContext);

const storageKey = (campaignId: string): string => `gm-windows:${campaignId}`;

interface GMWindowProviderProps {
    campaignId: string;
    /** Fichas que existem na campanha; janelas de fichas que saíram são fechadas */
    charsheetIds: string[];
    /** Criaturas personalizadas que existem na campanha; janelas das excluídas são fechadas (lista vazia vale: não há nenhuma) */
    creatureIds?: string[];
    /** Combatentes que estão no combate agora; janelas de quem saiu (ou de combate encerrado) são fechadas */
    combatantIds?: string[];
    children: ReactNode;
}

/**
 * Estado das janelas do mestre: quais estão abertas, onde, em que ordem e recolhidas ou não.
 * A disposição fica guardada por campanha no navegador e volta ao reabrir a página.
 */
export function GMWindowProvider({ campaignId, charsheetIds, creatureIds, combatantIds, children }: GMWindowProviderProps): ReactElement {
    const [ state, dispatch ] = useReducer(windowsReducer, initialWindowsState);
    const [ hydrated, setHydrated ] = useState(false);
    const [ viewport, setViewport ] = useState({ width: 1280, height: 800 });

    const { isChatOpen } = useChatContext();
    const chatDocked = useChatDocked();
    const desktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
    const hasParty = charsheetIds.length > 0;

    // Com o chat encaixado e aberto, a área das janelas termina antes dele
    const rightInset = chatDocked && isChatOpen ? CHAT_PANEL_WIDTH + CHAT_DOCK_GAP : WINDOW_AREA_EDGE;
    const leftInset = desktop && hasParty ? WINDOW_AREA_LEFT : WINDOW_AREA_EDGE;

    const bounds = useMemo(
        () => computeBounds(viewport, { left: leftInset, top: WINDOW_AREA_TOP, right: rightInset, bottom: WINDOW_AREA_EDGE }),
        [ viewport, leftInset, rightInset ]
    );

    const stateRef = useRef(state);
    stateRef.current = state;
    const boundsRef = useRef(bounds);
    boundsRef.current = bounds;

    useEffect(() => {
        const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // Disposição guardada: só no navegador, depois da montagem (o servidor não tem localStorage)
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(storageKey(campaignId));
            if (raw) dispatch({ type: 'restore', windows: JSON.parse(raw) });
        } catch {
            // armazenamento bloqueado ou JSON inválido: começa sem janelas
        }
        setHydrated(true);
    }, [ campaignId ]);

    useEffect(() => {
        if (!hydrated) return;
        const timeout = window.setTimeout(() => {
            try {
                window.localStorage.setItem(storageKey(campaignId), JSON.stringify(state.windows));
            } catch {
                // sem armazenamento: as janelas só não voltam ao recarregar
            }
        }, 250);
        return () => window.clearTimeout(timeout);
    }, [ state.windows, hydrated, campaignId ]);

    // Alvo que saiu da campanha (jogador removido, criatura excluída, combatente fora do combate): fecha as janelas dele.
    // Fichas: lista vazia é "ainda carregando", não "ninguém". Criaturas e combatentes vêm da própria campanha, que já
    // está carregada aqui, então lista vazia vale (e só se a lista foi passada: sem ela, nada é podado).
    const sheetsKey = charsheetIds.join('|');
    const creaturesKey = creatureIds?.join('|');
    const combatantsKey = combatantIds?.join('|');
    useEffect(() => {
        if (!hydrated) return;

        const split = (key: string): string[] => (key === '' ? [] : key.split('|'));
        const keep: Partial<Record<WindowTarget, string[]>> = {};
        if (sheetsKey !== '') keep.sheet = split(sheetsKey);
        if (creaturesKey !== undefined) keep.creature = split(creaturesKey);
        if (combatantsKey !== undefined) keep.combatant = split(combatantsKey);

        dispatch({ type: 'keepTargets', keep });
    }, [ hydrated, sheetsKey, creaturesKey, combatantsKey ]);

    const openWindow = useCallback((kind: WindowKind, targetId: string) => {
        const current = stateRef.current;
        const key = windowKey(kind, targetId);
        const alreadyOpen = current.windows.some(entry => entry.key === key);

        if (!alreadyOpen && current.windows.length >= MAX_OPEN_WINDOWS) {
            enqueueSnackbar(`Há ${MAX_OPEN_WINDOWS} janelas abertas. Feche alguma para abrir outra.`, { variant: 'info' });
            return;
        }

        dispatch({
            type: 'open',
            kind,
            targetId,
            rect: cascadeRect(current.windows.length, WINDOW_DEFAULT_SIZE[kind], boundsRef.current)
        });
    }, []);

    const actions = useMemo<GMWindowActions>(() => ({
        openWindow,
        focusWindow: key => dispatch({ type: 'focus', key }),
        closeWindow: key => dispatch({ type: 'close', key }),
        commitRect: (key, rect) => dispatch({ type: 'commit', key, rect }),
        toggleCollapse: key => dispatch({ type: 'toggleCollapse', key })
    }), [ openWindow ]);

    const view = useMemo<GMWindowViewState>(() => ({
        windows: state.windows,
        frontKey: frontWindowKey(state),
        focusRequest: state.focusRequest,
        bounds,
        mobile: !desktop
    }), [ state, bounds, desktop ]);

    return (
        <GMWindowActionsContext.Provider value={actions}>
            <GMWindowViewContext.Provider value={view}>
                {children}
            </GMWindowViewContext.Provider>
        </GMWindowActionsContext.Provider>
    );
}
