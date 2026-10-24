import {
    parsePendingSpellEffects,
    pendingEffectsStorageKey,
    withPendingEffect,
    withoutPendingEffect
} from '../pendingSpellEffects';

describe('parsePendingSpellEffects', () => {
    it('lê o que o navegador guardou', () => {
        expect(parsePendingSpellEffects('{"brasa":2,"mare":1}')).toEqual({ brasa: 2, mare: 1 });
    });

    it.each([
        [ 'nada guardado', null ],
        [ 'texto vazio', '' ],
        [ 'JSON inválido', '{brasa:' ],
        [ 'lista', '[1,2]' ],
        [ 'número solto', '5' ],
        [ 'null', 'null' ]
    ])('%s vira vazio', (_nome, raw) => {
        expect(parsePendingSpellEffects(raw)).toEqual({});
    });

    it('descarta estágio que não existe e chave vazia, e mantém o resto', () => {
        expect(parsePendingSpellEffects('{"a":4,"b":"2","c":0,"":1,"d":3}')).toEqual({ d: 3 });
    });
});

describe('withPendingEffect / withoutPendingEffect', () => {
    it('marca e desmarca sem mexer no original', () => {
        const base = { brasa: 1 } as const;
        const marked = withPendingEffect(base, 'mare', 3);

        expect(marked).toEqual({ brasa: 1, mare: 3 });
        expect(base).toEqual({ brasa: 1 });
        expect(withoutPendingEffect(marked, 'brasa')).toEqual({ mare: 3 });
        expect(withoutPendingEffect(marked, 'nao-existe')).toEqual(marked);
    });

    it('conjurar de novo troca o estágio pendente da mesma magia', () => {
        expect(withPendingEffect({ brasa: 1 }, 'brasa', 2)).toEqual({ brasa: 2 });
    });
});

describe('pendingEffectsStorageKey', () => {
    it('é por campanha e por ficha', () => {
        expect(pendingEffectsStorageKey('camp-1', 'cs-1')).not.toBe(pendingEffectsStorageKey('camp-1', 'cs-2'));
        expect(pendingEffectsStorageKey('camp-1', 'cs-1')).not.toBe(pendingEffectsStorageKey('camp-2', 'cs-1'));
    });
});
