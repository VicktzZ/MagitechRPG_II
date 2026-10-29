import { embeddedValues, planCampaignMove } from '../../../scripts/moveCreatureDefenses';

describe('plano de mover as defesas (puro)', () => {
    const orc = { id: 'orc', name: 'Orc', elementalMastery: 'Terra', weaknesses: [ 'Água' ] };
    const goblin = { id: 'goblin', name: 'Goblin' };

    it('só planeja as criaturas que ainda carregam algum campo, e tira os campos delas', () => {
        const plan = planCampaignMove([ goblin, orc ], new Set());
        expect(plan.moves).toEqual([ { creatureId: 'orc', removed: { elementalMastery: 'Terra', weaknesses: [ 'Água' ] }, keptExisting: false } ]);
        expect(plan.creatures).toEqual([ goblin, { id: 'orc', name: 'Orc' } ]);
    });

    it('sem nada a mover devolve a MESMA lista', () => {
        const list = [ goblin ];
        expect(planCampaignMove(list, new Set()).creatures).toBe(list);
        expect(planCampaignMove(list, new Set()).moves).toEqual([]);
    });

    it('documento privado que já existe é marcado e a criatura ainda perde os campos', () => {
        const plan = planCampaignMove([ orc ], new Set([ 'orc' ]));
        expect(plan.moves[0]).toMatchObject({ creatureId: 'orc', keptExisting: true });
        expect(plan.creatures).toEqual([ { id: 'orc', name: 'Orc' } ]);
    });

    it('criatura sem id e entradas que não são objeto ficam como estão', () => {
        const semId = { name: 'Sem id', elementalMastery: 'Fogo' };
        const plan = planCampaignMove([ semId, 'lixo', null ], new Set());
        expect(plan.moves).toEqual([]);
        expect(plan.creatures).toEqual([ semId, 'lixo', null ]);
    });

    it('lista que não é lista vira vazia', () => {
        expect(planCampaignMove(undefined, new Set())).toEqual({ creatures: [], moves: [] });
        expect(planCampaignMove({ id: 'x' }, new Set())).toEqual({ creatures: [], moves: [] });
    });

    it('embeddedValues guarda só os campos que existem, com o valor bruto', () => {
        expect(embeddedValues({ id: 'x', weaknesses: [ 'a', 'a' ] })).toEqual({ weaknesses: [ 'a', 'a' ] });
        expect(embeddedValues({ id: 'x' })).toEqual({});
    });
});
