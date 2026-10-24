import type { Rect } from './windowGeometry';
import {
    MAX_OPEN_WINDOWS,
    WINDOW_DEFAULT_SIZE,
    WINDOW_TITLE_HEIGHT,
    isWindowKind,
    windowKey,
    windowTargetOf,
    type WindowKind,
    type WindowTarget
} from './windowKinds';

/** Uma janela aberta: o que mostra (tipo + alvo), onde está e se está recolhida na barra de título */
export interface WindowEntry {
    key: string;
    kind: WindowKind;
    /** Id do que a janela mostra: ficha, criatura ou combatente, conforme o tipo (`windowTargetOf`) */
    targetId: string;
    x: number;
    y: number;
    w: number;
    h: number;
    collapsed: boolean;
    /** Ordem de empilhamento: a maior fica na frente */
    z: number;
}

/** Pedido para pôr o foco do teclado na janela `key` (o `n` muda a cada pedido, mesmo para a mesma janela) */
export interface FocusRequest {
    key: string;
    n: number;
}

export interface WindowsState {
    windows: WindowEntry[];
    nextZ: number;
    focusRequest: FocusRequest | null;
}

export type WindowsAction =
    | { type: 'open'; kind: WindowKind; targetId: string; rect: Rect }
    | { type: 'focus'; key: string }
    | { type: 'close'; key: string }
    /**
     * Fecha as janelas cujo alvo saiu da campanha (ficha removida, criatura excluída, combatente fora do combate).
     * Só olha os tipos de alvo presentes em `keep`: um tipo ausente não é podado (ainda carregando).
     */
    | { type: 'keepTargets'; keep: Partial<Record<WindowTarget, string[]>> }
    /** Grava o resultado de um arrastar ou redimensionar */
    | { type: 'commit'; key: string; rect: Rect }
    | { type: 'toggleCollapse'; key: string }
    /** Janelas guardadas no navegador (texto ainda não confiável) */
    | { type: 'restore'; windows: unknown };

export const initialWindowsState: WindowsState = { windows: [], nextZ: 1, focusRequest: null };

interface RawWindow {
    kind?: unknown;
    targetId?: unknown;
    /** Nome antigo de `targetId`, de quando só havia janelas de ficha: o que o navegador guardou antes ainda usa */
    charsheetId?: unknown;
    x?: unknown;
    y?: unknown;
    w?: unknown;
    h?: unknown;
    collapsed?: unknown;
    z?: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const finiteNumber = (value: unknown, fallback: number): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

/**
 * Lê o que o navegador guardou: ignora o que não é uma janela conhecida, repetida ou sem alvo, corrige
 * números inválidos e renumera a ordem de empilhamento. O que sobra respeita o limite de janelas abertas.
 */
export function sanitizeWindows(raw: unknown): WindowEntry[] {
    if (!Array.isArray(raw)) return [];

    const seen = new Set<string>();
    const found: Array<{ entry: WindowEntry; order: number }> = [];

    raw.forEach((item: unknown, index) => {
        if (!isRecord(item)) return;
        const candidate: RawWindow = item;
        if (!isWindowKind(candidate.kind)) return;
        const targetId = typeof candidate.targetId === 'string' ? candidate.targetId : candidate.charsheetId;
        if (typeof targetId !== 'string' || targetId === '') return;

        const key = windowKey(candidate.kind, targetId);
        if (seen.has(key)) return;
        seen.add(key);

        const size = WINDOW_DEFAULT_SIZE[candidate.kind];
        found.push({
            order: index,
            entry: {
                key,
                kind: candidate.kind,
                targetId,
                x: finiteNumber(candidate.x, 0),
                y: finiteNumber(candidate.y, 0),
                w: Math.max(0, finiteNumber(candidate.w, size.w)) || size.w,
                h: Math.max(WINDOW_TITLE_HEIGHT, finiteNumber(candidate.h, size.h)),
                collapsed: candidate.collapsed === true,
                z: finiteNumber(candidate.z, index)
            }
        });
    });

    return found
        .sort((a, b) => a.entry.z - b.entry.z || a.order - b.order)
        .slice(-MAX_OPEN_WINDOWS)
        .map(({ entry }, index) => ({ ...entry, z: index + 1 }));
}

/** Chave da janela que está na frente, se houver alguma */
export function frontWindowKey(state: Pick<WindowsState, 'windows'>): string | null {
    let front: WindowEntry | null = null;
    for (const entry of state.windows) {
        if (!front || entry.z > front.z) front = entry;
    }
    return front?.key ?? null;
}

const nextFocus = (state: WindowsState, key: string): FocusRequest => ({ key, n: (state.focusRequest?.n ?? 0) + 1 });

export function windowsReducer(state: WindowsState, action: WindowsAction): WindowsState {
    switch (action.type) {
    case 'open': {
        const key = windowKey(action.kind, action.targetId);
        const existing = state.windows.find(entry => entry.key === key);

        // Já aberta: só vem para a frente (e desrecolhe), sem mudar de lugar
        if (existing) {
            return {
                windows: state.windows.map(entry => (entry.key === key ? { ...entry, collapsed: false, z: state.nextZ } : entry)),
                nextZ: state.nextZ + 1,
                focusRequest: nextFocus(state, key)
            };
        }

        if (state.windows.length >= MAX_OPEN_WINDOWS) return state;

        const entry: WindowEntry = {
            key,
            kind: action.kind,
            targetId: action.targetId,
            ...action.rect,
            collapsed: false,
            z: state.nextZ
        };
        return { windows: [ ...state.windows, entry ], nextZ: state.nextZ + 1, focusRequest: nextFocus(state, key) };
    }

    case 'focus': {
        if (!state.windows.some(entry => entry.key === action.key)) return state;
        if (frontWindowKey(state) === action.key) return state;

        return {
            ...state,
            windows: state.windows.map(entry => (entry.key === action.key ? { ...entry, z: state.nextZ } : entry)),
            nextZ: state.nextZ + 1
        };
    }

    case 'close': {
        if (!state.windows.some(entry => entry.key === action.key)) return state;

        return {
            ...state,
            windows: state.windows.filter(entry => entry.key !== action.key),
            focusRequest: state.focusRequest?.key === action.key ? null : state.focusRequest
        };
    }

    case 'keepTargets': {
        const keep = new Map<WindowTarget, Set<string>>();
        (Object.entries(action.keep) as Array<[ WindowTarget, string[] | undefined ]>).forEach(([ target, ids ]) => {
            if (ids) keep.set(target, new Set(ids));
        });

        const windows = state.windows.filter(entry => keep.get(windowTargetOf(entry.kind))?.has(entry.targetId) ?? true);
        if (windows.length === state.windows.length) return state;

        return { ...state, windows, focusRequest: null };
    }

    case 'commit': {
        const { x, y, w, h } = action.rect;
        if (![ x, y, w, h ].every(Number.isFinite)) return state;

        return {
            ...state,
            windows: state.windows.map(entry => (entry.key === action.key ? { ...entry, x, y, w, h } : entry))
        };
    }

    case 'toggleCollapse': {
        return {
            ...state,
            windows: state.windows.map(entry => (entry.key === action.key ? { ...entry, collapsed: !entry.collapsed } : entry))
        };
    }

    case 'restore': {
        const windows = sanitizeWindows(action.windows);
        return { windows, nextZ: windows.length + 1, focusRequest: null };
    }

    default:
        return state;
    }
}
