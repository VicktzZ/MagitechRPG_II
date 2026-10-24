import type { Rect } from './windowGeometry';
import {
    MAX_OPEN_WINDOWS,
    WINDOW_DEFAULT_SIZE,
    WINDOW_TITLE_HEIGHT,
    isWindowKind,
    windowKey,
    type WindowKind
} from './windowKinds';

/** Uma janela aberta: o que mostra (seção + ficha), onde está e se está recolhida na barra de título */
export interface WindowEntry {
    key: string;
    kind: WindowKind;
    charsheetId: string;
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
    | { type: 'open'; kind: WindowKind; charsheetId: string; rect: Rect }
    | { type: 'focus'; key: string }
    | { type: 'close'; key: string }
    /** Fecha as janelas de fichas que saíram da campanha */
    | { type: 'keepSheets'; ids: string[] }
    /** Grava o resultado de um arrastar ou redimensionar */
    | { type: 'commit'; key: string; rect: Rect }
    | { type: 'toggleCollapse'; key: string }
    /** Janelas guardadas no navegador (texto ainda não confiável) */
    | { type: 'restore'; windows: unknown };

export const initialWindowsState: WindowsState = { windows: [], nextZ: 1, focusRequest: null };

interface RawWindow {
    kind?: unknown;
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
 * Lê o que o navegador guardou: ignora o que não é uma janela conhecida, repetida ou sem ficha, corrige
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
        if (typeof candidate.charsheetId !== 'string' || candidate.charsheetId === '') return;

        const key = windowKey(candidate.kind, candidate.charsheetId);
        if (seen.has(key)) return;
        seen.add(key);

        const size = WINDOW_DEFAULT_SIZE[candidate.kind];
        found.push({
            order: index,
            entry: {
                key,
                kind: candidate.kind,
                charsheetId: candidate.charsheetId,
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
        const key = windowKey(action.kind, action.charsheetId);
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
            charsheetId: action.charsheetId,
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

    case 'keepSheets': {
        const keep = new Set(action.ids);
        const windows = state.windows.filter(entry => keep.has(entry.charsheetId));
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
