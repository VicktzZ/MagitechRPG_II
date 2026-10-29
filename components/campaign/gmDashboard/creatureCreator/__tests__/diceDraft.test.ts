import type { CreatureDice } from '@utils/combat/creatureDice';
import { addConfig, addModifier, diceFromDraft, draftFromDice, emptyDraft, removeConfig, removeModifier, updateConfig, updateModifier, upsertDice } from '../diceDraft';

const KEYS = [ 'vig', 'des', 'foc' ];

describe('rascunho do dado (editor de criatura)', () => {
    it('começa com um grupo 1d6, sem termos e sem id', () => {
        expect(emptyDraft()).toEqual({ id: null, name: '', description: '', dices: [ { quantity: 1, faces: 6 } ], modifiers: [] });
    });

    it('acrescenta e tira grupos de dados, até 6', () => {
        let draft = emptyDraft();
        for (let count = 0; count < 10; count++) draft = addConfig(draft);
        expect(draft.dices).toHaveLength(6);
        expect(removeConfig(draft, 0).dices).toHaveLength(5);
    });

    it('quantidade fica entre 1 e 99 e faces entre 2 e 1000 (fora disso o número é cortado)', () => {
        const draft = emptyDraft();
        expect(updateConfig(draft, 0, 'quantity', 0).dices[0]!.quantity).toBe(1);
        expect(updateConfig(draft, 0, 'quantity', 500).dices[0]!.quantity).toBe(99);
        expect(updateConfig(draft, 0, 'faces', 1).dices[0]!.faces).toBe(2);
        expect(updateConfig(draft, 0, 'faces', 5000).dices[0]!.faces).toBe(1000);
        expect(updateConfig(draft, 0, 'faces', Number.NaN).dices[0]!.faces).toBe(2);
    });

    it('termo novo é um bônus de 1; o tipo troca sem perder os outros valores digitados', () => {
        let draft = addModifier(emptyDraft(), KEYS);
        expect(draft.modifiers[0]).toEqual({ kind: 'bonus', bonus: 1, attribute: 'vig', expertise: '' });

        draft = updateModifier(draft, 0, { bonus: 4 });
        draft = updateModifier(draft, 0, { kind: 'attribute', attribute: 'foc' });
        draft = updateModifier(draft, 0, { kind: 'bonus' });
        expect(draft.modifiers[0]).toMatchObject({ kind: 'bonus', bonus: 4, attribute: 'foc' });
        expect(updateModifier(draft, 0, { bonus: 99999 }).modifiers[0]!.bonus).toBe(999);
        expect(removeModifier(draft, 0).modifiers).toEqual([]);
    });

    it('só vira dado com nome e ao menos um grupo; o id é o do que está sendo editado, ou o novo', () => {
        expect(diceFromDraft(emptyDraft(), 'novo')).toBeNull();

        const draft = { ...emptyDraft(), name: 'Mordida', dices: [ { quantity: 2, faces: 6 } ] };
        expect(diceFromDraft(draft, 'novo')).toEqual({ id: 'novo', name: 'Mordida', description: '', dices: [ { quantity: 2, faces: 6 } ], modifiers: [] });
        expect(diceFromDraft({ ...draft, id: 'antigo' }, 'novo')!.id).toBe('antigo');
    });

    it('descarta o termo sem valor (bônus 0, perícia não escolhida) e guarda os que valem', () => {
        let draft = { ...emptyDraft(), name: 'Golpe' };
        draft = { ...draft, modifiers: [
            { kind: 'bonus', bonus: 0, attribute: 'foc', expertise: '' },
            { kind: 'expertise', bonus: 1, attribute: 'foc', expertise: '' },
            { kind: 'expertise', bonus: 1, attribute: 'foc', expertise: 'Luta' },
            { kind: 'attribute', bonus: 1, attribute: 'foc', expertise: '' },
            { kind: 'bonus', bonus: -3, attribute: 'foc', expertise: '' }
        ] };
        expect(diceFromDraft(draft, 'x')!.modifiers).toEqual([ { expertise: 'Luta' }, { attribute: 'foc' }, { bonus: -3 } ]);
    });

    it('editar um dado salvo e guardá-lo de novo devolve o mesmo dado', () => {
        const saved: CreatureDice = { id: 'a', name: 'Rajada', description: 'x', dices: [ { quantity: 1, faces: 10 }, { quantity: 2, faces: 4 } ], modifiers: [ { attribute: 'foc' }, { expertise: 'Magia' }, { bonus: 2 } ] };
        expect(diceFromDraft(draftFromDice(saved, KEYS), 'outro')).toEqual(saved);
    });

    it('guardar troca o dado de mesmo id e acrescenta o novo ao fim', () => {
        const a: CreatureDice = { id: 'a', name: 'A', description: '', dices: [ { quantity: 1, faces: 6 } ], modifiers: [] };
        const b: CreatureDice = { ...a, id: 'b', name: 'B' };
        expect(upsertDice([ a ], b)).toEqual([ a, b ]);
        expect(upsertDice([ a, b ], { ...a, name: 'A2' })).toEqual([ { ...a, name: 'A2' }, b ]);
    });
});
