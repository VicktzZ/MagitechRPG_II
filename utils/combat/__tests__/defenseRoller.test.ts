import { parseActionRoll } from '../actionRollMessage';
import { buildDefenseRollMessage, defenseRollDT } from '../defenseRoller';

const attack = { name: 'Bola de Fogo', attackerName: 'Orc', attackTotal: 25 };

describe('DT do teste de defesa', () => {
    it('resistência: metade do total do ataque, para cima (25 → 13)', () => {
        expect(defenseRollDT('resist', 25)).toBe(13);
        expect(defenseRollDT('resist', 24)).toBe(12);
    });

    it('esquiva: Reflexos tem de passar o total do ataque (25 → 26)', () => {
        expect(defenseRollDT('dodge', 25)).toBe(26);
    });
});

describe('mensagem do teste de defesa', () => {
    it('resistência: o cartão traz o total, a DT e a rolagem, e o texto volta pelo parser', () => {
        const text = buildDefenseRollMessage({
            who: 'Aria',
            skill: 'RES Mágica',
            choice: 'resist',
            attack,
            plan: { dice: 2, keep: 'highest', bonus: 2 },
            result: { rolls: [ 10, 4 ], used: 10, total: 12 }
        });

        expect(text.split('\n')[0]).toBe('[AÇÃO] defesa');
        const parsed = parseActionRoll(text);
        expect(parsed).toMatchObject({
            kind: 'defesa', player: 'Aria', title: 'RES Mágica', detail: 'Resistência · Bola de Fogo de Orc', total: 12, dt: 13, cost: null
        });
        expect(parsed?.keepLowest).toBeUndefined();
        expect(parsed?.segments).toEqual([ { notation: '2d20+2', display: '[10, 4] + 2 RES Mágica', total: 12 } ]);
    });

    it('esquiva com desvantagem: marca "menor" e leva a origem dos efeitos; DT é o total + 1', () => {
        const text = buildDefenseRollMessage({
            who: 'Aria',
            skill: 'Reflexos',
            choice: 'dodge',
            attack,
            plan: { dice: 2, keep: 'lowest', bonus: -1, notes: [ 'Cegueira: desvantagem, −1d20' ] },
            result: { rolls: [ 15, 6 ], used: 6, total: 5 }
        });

        expect(text.split('\n')[0]).toBe('[AÇÃO] defesa menor');
        expect(parseActionRoll(text)).toMatchObject({
            kind: 'defesa', detail: 'Esquiva · Bola de Fogo de Orc', total: 5, dt: 26, keepLowest: true, notes: [ 'Cegueira: desvantagem, −1d20' ]
        });
    });
});
