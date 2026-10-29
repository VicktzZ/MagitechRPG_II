/**
 * Habilidades de área (Fase 1 da 2ª leva das passivas): o catálogo, o efeito com tick de cura, o efeito exclusivo e o texto do log. A parte do servidor está em
 * `utils/firestore/__tests__/abilityUse.emulator.test.ts`.
 */
import { effectDice } from '../effectDice';
import { buildAbilityEffect, describeAbilityUse, findPassive, joinNames, buildAbilityHealText } from '../passives';
import { areaCandidates } from '../sides';

// diceRoller importa o barril de @enums, que puxa subscriptionEnum.ts (o ts-jest barra um erro de tipo antigo dele)
jest.mock('@enums', () => ({
    MessageType: { TEXT: 'text', ROLL: 'roll', DICE: 'dice', ERROR: 'error', SYSTEM: 'system', EXPERTISE: 'expertise', COMBAT_LOG: 'combat_log' },
    PusherEvent: {}
}));

describe('catálogo: habilidades de área', () => {
    it('Chamado à Glória marca aliados e dá vantagem no ataque e na resistência, +2 no acerto e cura por turno até o fim do combate', () => {
        const def = findPassive('subclass', 'Chamado à Glória')!;
        const activation = def.activation!;

        expect(def.mode).toBe('ativada');
        expect(activation.area).toEqual({ affects: 'allies' });
        expect(activation.cost).toEqual({ mp: 12 });
        expect(activation.limits).toEqual([ { per: 'dia', max: 3 }, { per: 'combate', max: 1 } ]);
        expect(activation.effect?.duration).toEqual({ unit: 'combate' });
        expect(activation.effect?.modifiers).toEqual([
            { kind: 'advantage', target: 'attack' },
            { kind: 'advantage', target: 'resistance' },
            { kind: 'stat_bonus', target: 'hit', value: 2 }
        ]);
        expect(activation.effect?.tick).toEqual({ kind: 'heal', dice: '1d6' });
    });

    it('Maldição Debilitante pega um inimigo só, por 3 turnos, e é exclusiva (uma criatura de cada vez)', () => {
        const activation = findPassive('subclass', 'Maldição Debilitante')!.activation!;

        expect(activation.area).toEqual({ affects: 'enemies', max: 1 });
        expect(activation.execution).toBe('Padrão');
        expect(activation.effect?.exclusive).toBe(true);
        expect(activation.effect?.duration).toEqual({ unit: 'turnos', amount: 3 });
        expect(activation.effect?.modifiers).toEqual([ { kind: 'disadvantage', target: 'resistance' } ]);
    });
});

describe('buildAbilityEffect com tick', () => {
    it('cura a cada tick: a categoria do efeito vira "heal" e a fórmula do nível é o dado', () => {
        const def = findPassive('subclass', 'Chamado à Glória')!;
        const applied = buildAbilityEffect(def, def.activation!.effect!, null, 2, 'Aria', 'aria');

        expect(applied.snapshot.category).toBe('heal');
        expect(applied.snapshot.levels[0]!.formula).toBe('1d6');
        expect(applied.snapshot.timing).toBe('round');
        expect(applied.indefinite).toBe(true);
        expect(applied.appliedById).toBe('aria');
        expect(applied.ability).toEqual({ key: 'subclass:chamado a gloria' });
    });

    it('sem tick o efeito continua sendo um bônus sem fórmula', () => {
        const def = findPassive('subclass', 'Maldição Debilitante')!;
        const applied = buildAbilityEffect(def, def.activation!.effect!, null, 1, 'Aria', 'aria');

        expect(applied.snapshot.category).toBe('buff');
        expect(applied.snapshot.levels[0]!.formula).toBe('0');
        expect(applied.snapshot.timing).toBe('turn');
        expect(applied.remaining).toBe(3);
    });
});

describe('o alvo "resistência" dos dados dos efeitos', () => {
    const effectsOf = (name: string) => {
        const def = findPassive('subclass', name)!;
        return [ buildAbilityEffect(def, def.activation!.effect!, null, 1, 'Aria', 'aria') ];
    };

    it('Chamado à Glória dá +1d20 na resistência e no ataque, mas não na esquiva', () => {
        const effects = effectsOf('Chamado à Glória');

        expect(effectDice(effects, 'resistance')).toMatchObject({ advantages: 1, disadvantages: 0 });
        expect(effectDice(effects, 'attack')).toMatchObject({ advantages: 1, disadvantages: 0 });
        expect(effectDice(effects, 'dodge')).toMatchObject({ advantages: 0, disadvantages: 0 });
    });

    it('Maldição Debilitante tira 1d20 da resistência do amaldiçoado e diz a origem', () => {
        const dice = effectDice(effectsOf('Maldição Debilitante'), 'resistance');

        expect(dice.disadvantages).toBe(1);
        expect(dice.notes).toEqual([ 'Maldição Debilitante: desvantagem, −1d20' ]);
    });
});

describe('texto do uso da habilidade de área', () => {
    it('joinNames junta com vírgula e "e"', () => {
        expect(joinNames([])).toBe('');
        expect(joinNames([ 'Borin' ])).toBe('Borin');
        expect(joinNames([ 'Borin', 'Caio' ])).toBe('Borin e Caio');
        expect(joinNames([ 'Aria', 'Borin', 'Caio' ])).toBe('Aria, Borin e Caio');
    });

    it('diz quem foi atingido', () => {
        const effect = findPassive('subclass', 'Chamado à Glória')!.activation!.effect!;
        const text = describeAbilityUse({ actor: 'Aria', ability: 'Chamado à Glória', cost: 12, effect, targets: [ 'Aria', 'Borin' ] });

        expect(text).toBe(`**Aria** usou **Chamado à Glória** gastando 12 MP em Aria e Borin. ${effect.description} (até o fim do combate).`);
    });

    it('diz quanto cada um curou, sem o LP de ninguém além do que a cura rendeu', () => {
        const text = describeAbilityUse({ actor: 'Aria', ability: 'Cura em Grupo', cost: 0, targets: [ 'Aria', 'Borin' ], healed: [ { name: 'Aria', applied: 4 }, { name: 'Borin', applied: 7 } ] });

        expect(text).toBe('**Aria** usou **Cura em Grupo** em Aria e Borin e curou Aria (**4**) e Borin (**7**).');
    });

    it('habilidade de uma pessoa só continua com o texto de antes', () => {
        expect(describeAbilityUse({ actor: 'Aria', ability: 'Cura Interior', cost: 0, heal: { total: 7, applied: 7 } })).toBe('**Aria** usou **Cura Interior** e curou **7 de LP**.');
    });

    it('o cartão da cura de um alvo diz em quem foi', () => {
        const text = buildAbilityHealText('Aria', 'Cura em Grupo', { notation: '2d6', display: '[3, 4]', total: 7 }, 'Borin');

        expect(text).toContain('Habilidade · Cura em Borin');
        expect(buildAbilityHealText('Aria', 'Cura Interior', { notation: '2d6', display: '[3, 4]', total: 7 })).toContain('Habilidade · Cura');
    });
});

describe('quem a habilidade pega', () => {
    const combatants = [
        { id: 'aria', type: 'player' },
        { id: 'borin', type: 'player' },
        { id: 'orc', type: 'creature' }
    ];

    it('Chamado à Glória: Aria e Borin; Maldição Debilitante: só o orc', () => {
        const glory = findPassive('subclass', 'Chamado à Glória')!.activation!.area!;
        const curse = findPassive('subclass', 'Maldição Debilitante')!.activation!.area!;

        expect(areaCandidates(combatants, 'aria', glory).map(c => c.id)).toEqual([ 'aria', 'borin' ]);
        expect(areaCandidates(combatants, 'aria', curse).map(c => c.id)).toEqual([ 'orc' ]);
    });
});
