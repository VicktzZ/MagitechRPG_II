import {
    CREATURE_WINDOW_KINDS,
    MAX_OPEN_WINDOWS,
    SHEET_WINDOW_KINDS,
    WINDOW_DEFAULT_SIZE,
    WINDOW_KINDS,
    WINDOW_KIND_LABEL,
    WINDOW_MIN_SIZE,
    isSheetKind,
    isWindowKind,
    windowKey,
    windowTargetOf
} from '../windowKinds';

describe('tipos de janela', () => {
    it('o resumo vem primeiro, depois as abas do antigo modal na ordem dele e, por último, as anotações do mestre', () => {
        expect(SHEET_WINDOW_KINDS).toEqual([ 'summary', 'info', 'attributes', 'expertises', 'inventory', 'skills', 'spells', 'notes' ]);
    });

    it('as janelas de criatura vêm depois das de ficha: a criatura personalizada e a criatura em combate', () => {
        expect(CREATURE_WINDOW_KINDS).toEqual([ 'creature', 'combatant' ]);
        expect(WINDOW_KINDS).toEqual([ ...SHEET_WINDOW_KINDS, ...CREATURE_WINDOW_KINDS ]);
    });

    it('cada tipo tem um tipo de alvo: ficha para as seções, e criatura e combatente para os de criatura', () => {
        SHEET_WINDOW_KINDS.forEach(kind => {
            expect(isSheetKind(kind)).toBe(true);
            expect(windowTargetOf(kind)).toBe('sheet');
        });
        expect(isSheetKind('creature')).toBe(false);
        expect(windowTargetOf('creature')).toBe('creature');
        expect(windowTargetOf('combatant')).toBe('combatant');
    });

    it('todo tipo tem rótulo e um tamanho inicial que cabe numa tela comum', () => {
        WINDOW_KINDS.forEach(kind => {
            expect(WINDOW_KIND_LABEL[kind]).toBeTruthy();
            const size = WINDOW_DEFAULT_SIZE[kind];
            expect(size.w).toBeGreaterThanOrEqual(WINDOW_MIN_SIZE.w);
            expect(size.h).toBeGreaterThanOrEqual(WINDOW_MIN_SIZE.h);
            expect(size.w).toBeLessThanOrEqual(900);
            expect(size.h).toBeLessThanOrEqual(720);
        });
    });

    it('a chave junta o tipo e o alvo, então cada seção de cada ficha (e cada criatura) tem a sua janela', () => {
        expect(windowKey('inventory', 'abc')).toBe('inventory:abc');
        const keys = new Set(WINDOW_KINDS.flatMap(kind => [ 'a', 'b' ].map(id => windowKey(kind, id))));
        expect(keys.size).toBe(WINDOW_KINDS.length * 2);
    });

    it('só reconhece os tipos conhecidos (o que o navegador guardou pode ser qualquer coisa)', () => {
        expect(isWindowKind('spells')).toBe(true);
        expect(isWindowKind('bestiary')).toBe(false);
        expect(isWindowKind(undefined)).toBe(false);
        expect(isWindowKind(3)).toBe(false);
    });

    it('o limite de janelas comporta pelo menos duas fichas com várias seções', () => {
        expect(MAX_OPEN_WINDOWS).toBeGreaterThanOrEqual(8);
    });
});
