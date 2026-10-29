import {
    attachCreatureDefenses,
    campaignWithoutCreatureDefenses,
    creatureDefensesFromDocs,
    embeddedDefensesOf,
    hasEmbeddedDefenses,
    resolveCreatureDefenses,
    sanitizeCreatureDefenses,
    stripCreatureDefenses,
    stripCreatureListDefenses,
    type CreatureDefenses
} from '../creatureSecrets';

const defenses = (overrides: Partial<CreatureDefenses> = {}): CreatureDefenses => ({
    elementalMastery: 'Fogo',
    weaknesses: [ 'Cortante' ],
    damageModifiers: [ { kind: 'resistance', element: 'Fogo', value: '25%' } ],
    ...overrides
});

const goblin = { id: 'goblin', name: 'Goblin', stats: { ap: 2 } };
const orc = { id: 'orc', name: 'Orc', stats: { ap: 4 }, elementalMastery: 'Terra', weaknesses: [ 'Água' ], damageModifiers: [] };

describe('limpeza das defesas', () => {
    it('devolve sempre os três campos, limpos', () => {
        const raw = {
            elementalMastery: '  Fogo  ',
            weaknesses: [ 'Cortante', 'cortante', '' ],
            damageModifiers: [ { kind: 'resistance', value: '10%' }, { kind: 'x', value: '1' } ]
        };
        expect(sanitizeCreatureDefenses(raw))
            .toEqual({ elementalMastery: 'Fogo', weaknesses: [ 'Cortante' ], damageModifiers: [ { kind: 'resistance', value: '10%' } ] });
    });

    it('lixo, null e objeto sem os campos viram defesas vazias', () => {
        const empty = { elementalMastery: '', weaknesses: [], damageModifiers: [] };
        expect(sanitizeCreatureDefenses(null)).toEqual(empty);
        expect(sanitizeCreatureDefenses('texto')).toEqual(empty);
        expect(sanitizeCreatureDefenses([ 1 ])).toEqual(empty);
        expect(sanitizeCreatureDefenses({ elementalMastery: 3, weaknesses: 'x' })).toEqual(empty);
    });

    it('o elemento tem no máximo 40 caracteres', () => {
        expect(sanitizeCreatureDefenses({ elementalMastery: 'x'.repeat(80) }).elementalMastery).toHaveLength(40);
    });
});

describe('tirar as defesas da criatura', () => {
    it('stripCreatureDefenses tira os três campos e não mexe no resto nem na original', () => {
        const stripped = stripCreatureDefenses(orc);
        expect(stripped).toEqual({ id: 'orc', name: 'Orc', stats: { ap: 4 } });
        expect(orc.weaknesses).toEqual([ 'Água' ]);
    });

    it('hasEmbeddedDefenses vê qualquer um dos campos, mesmo vazio (campo presente = ainda está no documento da campanha)', () => {
        expect(hasEmbeddedDefenses(goblin)).toBe(false);
        expect(hasEmbeddedDefenses({ ...goblin, weaknesses: [] })).toBe(true);
        expect(hasEmbeddedDefenses({ ...goblin, elementalMastery: '' })).toBe(true);
        expect(hasEmbeddedDefenses(null)).toBe(false);
        expect(hasEmbeddedDefenses('x')).toBe(false);
    });

    it('a lista sem nada a tirar volta a MESMA lista; com algo, uma nova só com as criaturas limpas', () => {
        const clean = [ goblin ];
        expect(stripCreatureListDefenses(clean)).toBe(clean);
        const mixed = [ goblin, orc ];
        const result = stripCreatureListDefenses(mixed);
        expect(result).not.toBe(mixed);
        expect(result).toEqual([ goblin, { id: 'orc', name: 'Orc', stats: { ap: 4 } } ]);
    });

    it('campaignWithoutCreatureDefenses: campanha limpa volta a mesma; campanha com defesas volta sem elas e sem mexer na original', () => {
        const clean = { id: 'c', custom: { creatures: [ goblin ], effects: [ 1 ] } };
        expect(campaignWithoutCreatureDefenses(clean)).toBe(clean);
        expect(campaignWithoutCreatureDefenses({ id: 'c' })).toEqual({ id: 'c' });
        expect(campaignWithoutCreatureDefenses({ id: 'c', custom: null })).toEqual({ id: 'c', custom: null });

        const dirty = { id: 'c', custom: { creatures: [ goblin, orc ], effects: [ 1 ] } };
        const result = campaignWithoutCreatureDefenses(dirty);
        expect(result.custom.creatures).toEqual([ goblin, { id: 'orc', name: 'Orc', stats: { ap: 4 } } ]);
        expect(result.custom.effects).toEqual([ 1 ]);
        expect(dirty.custom.creatures[1]).toBe(orc);
    });
});

describe('juntar as defesas de volta (navegador do mestre)', () => {
    it('o documento privado entra na criatura; criatura sem documento fica como está', () => {
        const list = [ goblin, orc ];
        const merged = attachCreatureDefenses(list, { goblin: defenses() });
        expect(merged[0]).toEqual({ ...goblin, ...defenses() });
        expect(merged[1]).toBe(orc);
    });

    it('o documento privado vale mais que os campos antigos que a criatura ainda carrega', () => {
        const merged = attachCreatureDefenses([ orc ], { orc: defenses({ elementalMastery: 'Água', weaknesses: [] }) });
        expect(merged[0]).toMatchObject({ elementalMastery: 'Água', weaknesses: [] });
    });

    it('sem nenhum documento devolve a MESMA lista (estável para o React)', () => {
        const list = [ goblin, orc ];
        expect(attachCreatureDefenses(list, {})).toBe(list);
        expect(attachCreatureDefenses(list, { outra: defenses() })).toBe(list);
    });

    it('id como "constructor" não casa com o protótipo do objeto', () => {
        const list = [ { id: 'constructor', name: 'X' } ];
        expect(attachCreatureDefenses(list, {})).toBe(list);
    });
});

describe('qual defesa vale', () => {
    it('privada > as da própria criatura > vazia', () => {
        expect(resolveCreatureDefenses(orc, defenses())).toEqual(defenses());
        expect(resolveCreatureDefenses(orc, null)).toEqual({ elementalMastery: 'Terra', weaknesses: [ 'Água' ], damageModifiers: [] });
        expect(resolveCreatureDefenses(goblin, undefined)).toEqual({ elementalMastery: '', weaknesses: [], damageModifiers: [] });
    });

    it('embeddedDefensesOf é null para a criatura limpa', () => {
        expect(embeddedDefensesOf(goblin)).toBeNull();
        expect(embeddedDefensesOf(orc)).not.toBeNull();
    });
});

describe('documentos de gmData', () => {
    it('só os de kind creatureDefenses com creatureId viram defesas', () => {
        const result = creatureDefensesFromDocs([
            { id: 'creature-defenses:goblin', data: { kind: 'creatureDefenses', creatureId: 'goblin', ...defenses(), updatedBy: 'gm' } },
            { id: 'awareness', data: { kind: 'awareness', pairs: [] } },
            { id: 'sem-id', data: { kind: 'creatureDefenses' } },
            { id: 'id-vazio', data: { kind: 'creatureDefenses', creatureId: '' } }
        ]);
        expect(Object.keys(result)).toEqual([ 'goblin' ]);
        expect(result['goblin']).toEqual(defenses());
    });

    it('sem documentos, nada', () => {
        expect(creatureDefensesFromDocs([])).toEqual({});
    });
});
