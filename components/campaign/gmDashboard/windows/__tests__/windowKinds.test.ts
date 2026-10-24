import {
    MAX_OPEN_WINDOWS,
    WINDOW_DEFAULT_SIZE,
    WINDOW_KINDS,
    WINDOW_KIND_LABEL,
    WINDOW_MIN_SIZE,
    isWindowKind,
    windowKey
} from '../windowKinds';

describe('tipos de janela', () => {
    it('o resumo vem primeiro, depois as abas do antigo modal na ordem dele e, por último, as anotações do mestre', () => {
        expect(WINDOW_KINDS).toEqual([ 'summary', 'info', 'attributes', 'expertises', 'inventory', 'skills', 'spells', 'notes' ]);
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

    it('a chave junta o tipo e a ficha, então cada seção de cada ficha tem a sua janela', () => {
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
