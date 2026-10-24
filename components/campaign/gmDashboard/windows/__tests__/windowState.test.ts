import {
    frontWindowKey,
    initialWindowsState,
    sanitizeWindows,
    windowsReducer,
    type WindowsAction,
    type WindowsState
} from '../windowState';
import { MAX_OPEN_WINDOWS, WINDOW_DEFAULT_SIZE } from '../windowKinds';

const rect = { x: 120, y: 90, w: 380, h: 560 };

const run = (actions: WindowsAction[], from: WindowsState = initialWindowsState): WindowsState =>
    actions.reduce(windowsReducer, from);

const open = (charsheetId: string): WindowsAction => ({ type: 'open', kind: 'summary', charsheetId, rect });

describe('windowsReducer', () => {
    it('abre uma janela na frente, com o foco pedido', () => {
        const state = run([ open('a') ]);
        expect(state.windows).toHaveLength(1);
        expect(state.windows[0]).toMatchObject({ key: 'summary:a', charsheetId: 'a', ...rect, collapsed: false });
        expect(state.focusRequest).toEqual({ key: 'summary:a', n: 1 });
        expect(frontWindowKey(state)).toBe('summary:a');
    });

    it('abrir a mesma seção da mesma ficha de novo só traz para a frente, desrecolhe e não muda de lugar', () => {
        let state = run([ open('a'), open('b'), { type: 'toggleCollapse', key: 'summary:a' } ]);
        expect(frontWindowKey(state)).toBe('summary:b');

        state = windowsReducer(state, { type: 'open', kind: 'summary', charsheetId: 'a', rect: { x: 700, y: 700, w: 300, h: 300 } });
        expect(state.windows).toHaveLength(2);
        const reopened = state.windows.find(entry => entry.key === 'summary:a');
        expect(reopened).toMatchObject({ x: rect.x, y: rect.y, collapsed: false });
        expect(frontWindowKey(state)).toBe('summary:a');
        expect(state.focusRequest?.n).toBe(3);
    });

    it('respeita o limite de janelas abertas', () => {
        const ids = Array.from({ length: MAX_OPEN_WINDOWS + 3 }, (_, index) => `sheet-${index}`);
        const state = run(ids.map(open));
        expect(state.windows).toHaveLength(MAX_OPEN_WINDOWS);
        expect(state.windows.some(entry => entry.charsheetId === ids[MAX_OPEN_WINDOWS])).toBe(false);
    });

    it('focar traz para a frente; focar a que já está na frente não muda nada', () => {
        const state = run([ open('a'), open('b') ]);
        expect(windowsReducer(state, { type: 'focus', key: 'summary:b' })).toBe(state);

        const focused = windowsReducer(state, { type: 'focus', key: 'summary:a' });
        expect(frontWindowKey(focused)).toBe('summary:a');
        expect(windowsReducer(state, { type: 'focus', key: 'summary:zzz' })).toBe(state);
    });

    it('fechar remove a janela e desfaz o pedido de foco dela', () => {
        const state = run([ open('a'), open('b'), { type: 'close', key: 'summary:b' } ]);
        expect(state.windows.map(entry => entry.key)).toEqual([ 'summary:a' ]);
        expect(state.focusRequest).toBeNull();
        expect(windowsReducer(state, { type: 'close', key: 'summary:b' })).toBe(state);
    });

    it('keepSheets fecha só as janelas de fichas que saíram da campanha', () => {
        const state = run([ open('a'), open('b'), open('c') ]);
        const next = windowsReducer(state, { type: 'keepSheets', ids: [ 'a', 'c' ] });
        expect(next.windows.map(entry => entry.charsheetId)).toEqual([ 'a', 'c' ]);
        expect(windowsReducer(next, { type: 'keepSheets', ids: [ 'a', 'c', 'x' ] })).toBe(next);
    });

    it('commit grava posição e tamanho, mas ignora números inválidos', () => {
        const state = run([ open('a') ]);
        const moved = windowsReducer(state, { type: 'commit', key: 'summary:a', rect: { x: 300, y: 200, w: 420, h: 480 } });
        expect(moved.windows[0]).toMatchObject({ x: 300, y: 200, w: 420, h: 480 });
        expect(windowsReducer(moved, { type: 'commit', key: 'summary:a', rect: { x: NaN, y: 0, w: 1, h: 1 } })).toBe(moved);
    });

    it('recolher e expandir alternam, sem mexer na altura guardada', () => {
        const state = run([ open('a') ]);
        const collapsed = windowsReducer(state, { type: 'toggleCollapse', key: 'summary:a' });
        expect(collapsed.windows[0]).toMatchObject({ collapsed: true, h: rect.h });
        expect(windowsReducer(collapsed, { type: 'toggleCollapse', key: 'summary:a' }).windows[0].collapsed).toBe(false);
    });

    it('restore troca todas as janelas pelas guardadas e zera o pedido de foco', () => {
        const state = run([ open('a') ]);
        const restored = windowsReducer(state, {
            type: 'restore',
            windows: [ { kind: 'summary', charsheetId: 'z', x: 10, y: 20, w: 400, h: 300, collapsed: true, z: 4 } ]
        });
        expect(restored.windows).toHaveLength(1);
        expect(restored.windows[0]).toMatchObject({ key: 'summary:z', collapsed: true, z: 1 });
        expect(restored.nextZ).toBe(2);
        expect(restored.focusRequest).toBeNull();
    });
});

describe('sanitizeWindows', () => {
    it('devolve lista vazia para o que não é lista', () => {
        expect(sanitizeWindows(null)).toEqual([]);
        expect(sanitizeWindows('x')).toEqual([]);
        expect(sanitizeWindows({ 0: {} })).toEqual([]);
    });

    it('descarta tipos desconhecidos, itens sem ficha, lixo e repetidas', () => {
        const result = sanitizeWindows([
            { kind: 'summary', charsheetId: 'a', x: 1, y: 2, w: 400, h: 300 },
            { kind: 'summary', charsheetId: 'a', x: 9, y: 9, w: 400, h: 300 },
            { kind: 'bestiary', charsheetId: 'a' },
            { kind: 'summary', charsheetId: '' },
            { kind: 'summary' },
            null,
            7,
            [ 'summary' ]
        ]);
        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ key: 'summary:a', x: 1, y: 2 });
    });

    it('corrige números inválidos com o tamanho padrão da seção e mantém o booleano estrito', () => {
        const [ entry ] = sanitizeWindows([ { kind: 'summary', charsheetId: 'a', x: 'oi', y: Infinity, w: -5, h: NaN, collapsed: 'sim' } ]);
        expect(entry).toMatchObject({ x: 0, y: 0, w: WINDOW_DEFAULT_SIZE.summary.w, h: WINDOW_DEFAULT_SIZE.summary.h, collapsed: false });
    });

    it('renumera a ordem de empilhamento pelo z guardado e respeita o limite', () => {
        const stored = Array.from({ length: MAX_OPEN_WINDOWS + 2 }, (_, index) => ({
            kind: 'summary', charsheetId: `s${index}`, x: 0, y: 0, w: 400, h: 300, collapsed: false, z: 100 - index
        }));
        const result = sanitizeWindows(stored);
        expect(result).toHaveLength(MAX_OPEN_WINDOWS);
        expect(result.map(entry => entry.z)).toEqual(Array.from({ length: MAX_OPEN_WINDOWS }, (_, index) => index + 1));
        // as que estavam mais na frente (z maior) sobrevivem ao corte
        expect(result[result.length - 1].charsheetId).toBe('s0');
    });

    it('sobrevive a um JSON de ida e volta', () => {
        const state = run([ open('a'), open('b') ]);
        expect(sanitizeWindows(JSON.parse(JSON.stringify(state.windows)))).toEqual(state.windows.map(entry => ({ ...entry })));
    });
});
