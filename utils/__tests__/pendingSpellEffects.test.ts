import {
    parsePendingSpellCriticals,
    parsePendingSpellEffects,
    parsePendingSpellExtras,
    pendingCriticalsStorageKey,
    pendingEffectsStorageKey,
    pendingExtrasStorageKey,
    withPendingCritical,
    withPendingEffect,
    withPendingExtras,
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

describe('conjurada em crítico (guardada à parte)', () => {
    it('lê só o que é verdadeiro e ignora o resto, sem lançar', () => {
        expect(parsePendingSpellCriticals('{"brasa":true,"mare":false,"x":1,"":true}')).toEqual({ brasa: true });
        for (const raw of [ null, '', '{brasa:', '[true]', '5', 'null' ]) expect(parsePendingSpellCriticals(raw)).toEqual({});
    });

    it('marca e desmarca sem mexer no original', () => {
        const base = { a: true } as const;
        const marked = withPendingCritical(base, 'b', true);
        expect(marked).toEqual({ a: true, b: true });
        expect(base).toEqual({ a: true });
        expect(withPendingCritical(marked, 'a', false)).toEqual({ b: true });
        expect(withPendingCritical({}, 'x', false)).toEqual({});
    });

    it('a chave é de cada campanha e ficha, e diferente da dos efeitos pendentes', () => {
        expect(pendingCriticalsStorageKey('camp', 'ficha')).toBe('spell-effects-critical:camp:ficha');
        expect(pendingCriticalsStorageKey('camp', 'ficha')).not.toBe(pendingEffectsStorageKey('camp', 'ficha'));
    });
});

describe('acréscimos da conjuração guardados até o "Efetuar"', () => {
    it('lê o que o navegador guardou e descarta o que não serve', () => {
        const raw = JSON.stringify({
            brasa: [ { source: 'Intensificação Mágica', dice: [ '2d8' ], flat: 0, sameDie: 0 }, { source: 'Fixação Mágica', dice: [], flat: 5, sameDie: 0 } ],
            lixo: [ { source: '', dice: [ '2d8' ] }, { source: 'Sem nada', dice: [], flat: 0 }, { source: 'Dado ruim', dice: [ 'abc', '99999d1' ], flat: 0 }, 'texto', null ],
            naoLista: 'x'
        });

        const extras = parsePendingSpellExtras(raw);

        expect(extras['brasa']).toEqual([ { source: 'Intensificação Mágica', dice: [ '2d8' ], flat: 0, sameDie: 0 }, { source: 'Fixação Mágica', dice: [], flat: 5, sameDie: 0 } ]);
        expect(extras['lixo']).toBeUndefined();
        expect(extras['naoLista']).toBeUndefined();
    });

    it('JSON inválido ou fora do formato vira vazio, nunca lança', () => {
        expect(parsePendingSpellExtras(null)).toEqual({});
        expect(parsePendingSpellExtras('{{')).toEqual({});
        expect(parsePendingSpellExtras('[]')).toEqual({});
        expect(parsePendingSpellExtras('"x"')).toEqual({});
    });

    it('a conjuração nova troca os acréscimos da anterior e uma sem acréscimo tira o que havia', () => {
        const first = withPendingExtras({}, 'brasa', [ { source: 'A', dice: [ '1d4' ], flat: 0, sameDie: 0 } ]);
        const second = withPendingExtras(first, 'brasa', [ { source: 'B', dice: [], flat: 5, sameDie: 0 } ]);
        expect(second['brasa']).toEqual([ { source: 'B', dice: [], flat: 5, sameDie: 0 } ]);
        expect(withPendingExtras(second, 'brasa', [])).toEqual({});
        // as outras magias ficam
        expect(withPendingExtras({ raio: [ { source: 'C', dice: [ '1d4' ], flat: 0, sameDie: 0 } ] }, 'brasa', [])['raio']).toHaveLength(1);
    });

    it('a chave do navegador é por campanha e ficha', () => {
        expect(pendingExtrasStorageKey('c1', 'f1')).toBe('spell-effects-extras:c1:f1');
    });
});
