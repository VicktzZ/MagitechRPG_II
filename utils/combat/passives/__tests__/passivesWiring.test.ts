import type { SpellDTO } from '@models/dtos';
import type { Weapon } from '@models';
import type { AppliedEffect } from '@models';
import { buildAttackProposal, type ProposalTarget } from '../../attackProposal';
import { initiativeWithEffects } from '../../initiativeRoll';
import type { PendingAttackData } from '../../pendingAttacks';
import { buildDamageMessageText, rollWeaponDamage, rollWeaponHit } from '../../weaponRoller';
import { getSpellMpCost, rollSpellEffect } from '../../spellRoller';
import { rollHitTest } from '../../hitTest';
import { parseActionRoll } from '../../actionRollMessage';
import { ownedPassives, passiveEffects, passiveReminders, withPassiveEffects, weaponDamageSpecs, spellEffectSpecs, spellCostAdjustment, initiativeAdvantages, targetHasNotActed, describeAbilityUse, describeDuration, findPassive } from '..';

// diceRoller importa o barril de @enums, que puxa subscriptionEnum.ts (o ts-jest barra um erro de tipo antigo dele)
jest.mock('@enums', () => ({
    MessageType: { TEXT: 'text', ROLL: 'roll', DICE: 'dice', ERROR: 'error', SYSTEM: 'system', EXPERTISE: 'expertise', COMBAT_LOG: 'combat_log' }
}));

const sheet = (classSkills: string[], subclassSkills: string[] = [], extra: Record<string, unknown> = {}) => ({
    skills: { class: classSkills.map(name => ({ name })), subclass: subclassSkills.map(name => ({ name })) },
    attributes: { foc: 10, des: 10 },
    expertises: { Luta: { value: 4 }, Magia: { value: 6 } },
    mods: { attributes: { foc: 1, des: 1 } },
    elementalMastery: 'FOGO',
    stats: { lp: 50, maxLp: 100, mp: 30 },
    ...extra
});

const sword = { id: 'espada', name: 'Espada', hit: 'vig', categ: 'Arma Branca (Leve)', range: 'Corpo-a-corpo', effect: { value: '2d8+3', critValue: '4d8+3', effectType: 'Cortante' } } as unknown as Weapon;

const spell = (patch: Record<string, unknown> = {}): SpellDTO => ({
    id: 'brasa', name: 'Brasa Voraz', element: 'FOGO', level: 2, mpCost: 4, type: 'Ataque (imediato)',
    stages: [ 'Causa 2d6 de dano de fogo.', 'Causa 3d6 de dano de fogo.', 'Causa 4d6 de dano de fogo.' ], ...patch
}) as unknown as SpellDTO;

// Rola sempre o máximo? Não: fixa o gerador para o teste ser exato
const withRandom = (value: number, run: () => void): void => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(value);
    try { run(); } finally { spy.mockRestore(); }
};

describe('dano da arma com as passivas', () => {
    it('soma os acréscimos ao dano e mostra cada um como segmento com a origem', () => {
        const owned = ownedPassives(sheet([ 'Bom de Briga', 'Armado' ]));
        const extras = weaponDamageSpecs(owned, { sheet: sheet([ 'Bom de Briga', 'Armado' ]) }, sword);

        const result = rollWeaponDamage(sword, false, { extras });
        expect(result).not.toBeNull();
        expect(result!.extras.map(extra => extra.source)).toEqual([ 'Bom de Briga', 'Armado' ]);
        const armado = result!.extras.find(extra => extra.source === 'Armado')!;
        expect(armado.notation).toBe('Armado 1d8');
        expect(result!.total).toBe(result!.rolled + 4 + armado.total);

        const parsed = parseActionRoll(buildDamageMessageText('Aria', sword, result!));
        expect(parsed?.total).toBe(result!.total);
        expect(parsed?.segments.map(segment => segment.notation)).toEqual([ '2d8+3', 'Bom de Briga 4', 'Armado 1d8' ]);
        expect((parsed?.segments ?? []).reduce((sum, segment) => sum + segment.total, 0)).toBe(result!.total);
    });

    it('o Furtivo dobra a soma toda: arma e acréscimos', () => {
        const extras = [ { source: 'Bom de Briga', dice: [], flat: 4, sameDie: 0 } ];
        const result = rollWeaponDamage(sword, false, { stealth: true, extras })!;
        // 2d8+3 fica entre 5 e 19; o acréscimo fixo soma 4 e o Furtivo dobra tudo
        expect(result.rolled).toBeGreaterThanOrEqual(5);
        expect(result.rolled).toBeLessThanOrEqual(19);
        expect(result.total).toBe((result.rolled + 4) * 2);

        const parsed = parseActionRoll(buildDamageMessageText('Aria', sword, result));
        expect(parsed).toMatchObject({ stealth: true, total: result.total });
        // O cartão mostra os valores rolados sem dobrar; só o Total é o dobro da soma deles
        expect((parsed?.segments ?? []).reduce((sum, segment) => sum + segment.total, 0) * 2).toBe(result.total);
    });

    it('sem passivas o dano é o de sempre', () => {
        const result = rollWeaponDamage(sword, false)!;
        expect(result.extras).toEqual([]);
        expect(result.total).toBe(result.rolled);
    });

    it('dano fixo (sem dado) também recebe os acréscimos', () => {
        const fixed = { ...sword, effect: { value: '5', critValue: '10', effectType: 'Cortante' } } as unknown as Weapon;
        const result = rollWeaponDamage(fixed, false, { extras: [ { source: 'Bom de Briga', dice: [], flat: 4, sameDie: 0 } ] })!;
        expect(result.total).toBe(9);
    });
});

describe('acerto com o bônus fixo das habilidades', () => {
    it('soma o valor fixo ao total e diz de onde vem', () => {
        withRandom(0, () => {
            const charsheet = sheet([]) as never;
            const plain = rollWeaponHit(sword, charsheet);
            const boosted = rollWeaponHit(sword, charsheet, { flatBonus: { flat: 2, notes: [ 'Ritmo da Batalha: +2' ] } });
            expect(boosted.total).toBe(plain.total + 2);
            expect(boosted.bonus).toBe(plain.bonus + 2);
            expect(boosted.notes).toContain('Ritmo da Batalha: +2');
        });
    });

    it('rollHitTest sem bônus fixo não muda', () => {
        withRandom(0, () => {
            const test = rollHitTest('foc', sheet([]) as never, {});
            expect(test.bonus).toBe(6);
        });
    });
});

describe('magia com as passivas', () => {
    it('Magismo Total tira 1 MP e a Maestria do nível 4 custa como o estágio anterior', () => {
        const adjustment = spellCostAdjustment(ownedPassives(sheet([ 'Magismo Total' ])));
        const level2 = spell();
        expect(getSpellMpCost(level2, 1)).toBe(4);
        expect(getSpellMpCost(level2, 1, adjustment)).toBe(3);
        expect(getSpellMpCost(level2, 2, adjustment)).toBe(getSpellMpCost(level2, 2) - 1);

        const level4 = spell({ level: 4, mpCost: 12 });
        const stage2 = getSpellMpCost(level4, 2);
        expect(getSpellMpCost(level4, 3)).toBeGreaterThan(stage2);
        expect(getSpellMpCost(level4, 3, adjustment)).toBe(stage2 - 1);
        // Nunca abaixo de zero
        expect(getSpellMpCost(spell({ mpCost: 0 }), 1, { delta: -5, freeMasteryExtra: false })).toBe(0);
    });

    it('o efeito da magia recebe os acréscimos como segmentos à parte', () => {
        const charsheet = sheet([ 'Feitiçaria' ], [ 'Manipulação Elemental' ]);
        const owned = ownedPassives(charsheet);
        const extras = spellEffectSpecs(owned, { sheet: charsheet }, spell());

        const effect = rollSpellEffect(spell(), 1, extras);
        expect(effect.segments.map(segment => segment.notation)).toEqual([ '2d6', 'Feitiçaria 1', 'Manipulação Elemental 1d8' ]);
        expect(effect.extras).toHaveLength(2);
        expect(effect.totalDamage).toBe(effect.segments.reduce((sum, segment) => sum + segment.total, 0));
    });

    it('sameDie usa o dado do efeito da própria magia', () => {
        const charsheet = sheet([ 'Não-Elementalista' ]);
        const neutral = spell({ element: 'NÃO-ELEMENTAL' });
        const extras = spellEffectSpecs(ownedPassives(charsheet), { sheet: charsheet }, neutral);
        const effect = rollSpellEffect(neutral, 1, extras);
        expect(effect.segments.map(segment => segment.notation)).toEqual([ '2d6', 'Não-Elementalista 1d6' ]);
    });

    it('magia só de duração não recebe acréscimo de dano', () => {
        const duration = spell({ stages: [ 'O alvo fica lento por 1d4 turnos.', '', '' ] });
        const extras = [ { source: 'Feitiçaria', dice: [], flat: 1, sameDie: 0 } ];
        const effect = rollSpellEffect(duration, 1, extras);
        expect(effect.segments.map(segment => segment.notation)).toEqual([ '1d4' ]);
        expect(effect.extras).toBeUndefined();
    });

    it('sem acréscimos o efeito é o de sempre', () => {
        const effect = rollSpellEffect(spell(), 1);
        expect(effect.segments).toHaveLength(1);
        expect(effect.extras).toBeUndefined();
    });
});

describe('iniciativa com as passivas', () => {
    const dice = { numDice: 1, expertiseValue: 3 };

    it('Reflexos Aumentados rola 2 d20 e vale o maior', () => {
        const passive = initiativeAdvantages(ownedPassives(sheet([ 'Reflexos Aumentados' ])));
        const result = initiativeWithEffects(dice, [], passive);
        expect(result).toMatchObject({ numDice: 2, keep: 'highest' });
        expect(result.effectNotes).toEqual([ 'Reflexos Aumentados: vantagem, +1d20' ]);
    });

    it('sem passivas nem efeitos devolve os dados como vieram', () => {
        expect(initiativeWithEffects(dice, [])).toBe(dice);
        expect(initiativeWithEffects(dice, null)).toBe(dice);
    });
});

describe('proposta do ataque com as habilidades', () => {
    const attack = (patch: Partial<PendingAttackData> = {}): PendingAttackData => ({
        id: 'a1', attackerId: 'aria', attackerName: 'Aria', targetId: 'caio', targetName: 'Caio', source: 'spell', name: 'Brasa', kind: 'magico',
        attackType: 'Fogo', attackTotal: 14, rolls: [ 10 ], bonus: 4, damageRolled: 20, createdAt: '2026-10-29T12:00:00.000Z', ...patch
    });
    const effect = (modifiers: Array<Record<string, unknown>>): AppliedEffect => ({
        id: 'e', effectId: 'x', level: 1, remaining: 0, snapshot: { name: 'Habilidade', levels: [ { level: 1, modifiers } ] }
    }) as unknown as AppliedEffect;

    const target = (classSkills: string[], subclassSkills: string[] = []) => {
        const charsheet = sheet(classSkills, subclassSkills, { stats: { lp: 50, maxLp: 100, ap: 5 } });
        const passives = ownedPassives(charsheet);
        return { sheet: charsheet as ProposalTarget['sheet'], effects: withPassiveEffects([], passives, { sheet: charsheet }), reminders: passiveReminders(passives, 'defender') };
    };

    it('Pele Resistente sobe o AP do alvo e o ataque que passaria agora erra', () => {
        const plain = buildAttackProposal(attack({ attackTotal: 6, rolls: [ 2 ] }), [], target([]), { defense: 'none' });
        expect(plain).toMatchObject({ targetAp: 5, hit: true });
        const armored = buildAttackProposal(attack({ attackTotal: 6, rolls: [ 2 ] }), [], target([], [ 'Pele Resistente' ]), { defense: 'none' });
        expect(armored).toMatchObject({ targetAp: 7, hit: false });
    });

    it('Imunidade Mágica zera a magia do elemento da maestria; magia de outro elemento passa inteira', () => {
        const immune = buildAttackProposal(attack(), [], target([ 'Imunidade Mágica' ]), { defense: 'none' });
        expect(immune.finalDamage).toBe(0);
        const other = buildAttackProposal(attack({ attackType: 'Ar' }), [], target([ 'Imunidade Mágica' ]), { defense: 'none' });
        expect(other.finalDamage).toBe(20);
    });

    it('o lembrete da Resiliência Inata é linha só do mestre', () => {
        const proposal = buildAttackProposal(attack(), [], target([], [ 'Resiliência Inata' ]), { defense: 'none' });
        const line = proposal.lines.find(entry => entry.label === 'Habilidade do alvo');
        expect(line).toMatchObject({ visibility: 'gm' });
        expect(line?.detail).toContain('1d8+1');
    });

    it('ignorar o AP (Avatar da Destruição, Forma Primordial) faz o ataque acertar e diz isso a todos', () => {
        const proposal = buildAttackProposal(
            attack({ attackTotal: 3, rolls: [ 1 ] }),
            [ effect([ { kind: 'flag', target: 'ignore_ap' } ]) ],
            { creature: { stats: { ap: 20 }, expertises: {} } },
            { defense: 'none' }
        );
        expect(proposal).toMatchObject({ targetAp: 0, hit: true });
        expect(proposal.lines.find(entry => entry.label === 'Ignora a armadura')).toMatchObject({ visibility: 'all' });
    });

    it('furar parte do AP (Ritmo da Batalha: 2 pontos) tira só esses pontos', () => {
        const proposal = buildAttackProposal(
            attack({ attackTotal: 10 }),
            [ effect([ { kind: 'stat_bonus', target: 'apIgnore', value: 2 } ]) ],
            { creature: { stats: { ap: 11 }, expertises: {} } },
            { defense: 'none' }
        );
        expect(proposal).toMatchObject({ targetAp: 9, hit: true });
    });

    it('furar o AP nunca deixa o AP negativo', () => {
        const proposal = buildAttackProposal(
            attack(),
            [ effect([ { kind: 'stat_bonus', target: 'apIgnore', value: 50 } ]) ],
            { creature: { stats: { ap: 4 }, expertises: {} } },
            { defense: 'none' }
        );
        expect(proposal.targetAp).toBe(0);
    });

    it('Muralha: +50% no dano do atacante com o LP em 10% ou menos', () => {
        const low = sheet([ 'Muralha' ], [], { stats: { lp: 5, maxLp: 100 } });
        const attackerEffects = passiveEffects(ownedPassives(low), { sheet: low });
        const proposal = buildAttackProposal(attack({ kind: 'fisico', attackType: 'Cortante' }), attackerEffects, { creature: { stats: { ap: 0 }, expertises: {} } }, { defense: 'none' });
        expect(proposal.finalDamage).toBe(30);
    });
});

describe('começo do turno e texto do log', () => {
    it('o alvo ainda não agiu: só na primeira rodada, na fase de ação', () => {
        const combat = { round: 1, phase: 'ACTION', combatants: [ { id: 'a', hasActed: true }, { id: 'b', hasActed: false } ] };
        expect(targetHasNotActed(combat, 'b')).toBe(true);
        expect(targetHasNotActed(combat, 'a')).toBe(false);
        expect(targetHasNotActed(combat, 'fantasma')).toBe(false);
        expect(targetHasNotActed(combat, '')).toBe(false);
        expect(targetHasNotActed({ ...combat, round: 2 }, 'b')).toBe(false);
        expect(targetHasNotActed({ ...combat, phase: 'INITIATIVE' }, 'b')).toBe(false);
        expect(targetHasNotActed(null, 'b')).toBe(false);
    });

    it('diz a duração do efeito', () => {
        expect(describeDuration({ unit: 'turnos', amount: 1 })).toBe('por 1 turno');
        expect(describeDuration({ unit: 'turnos', amount: 3 })).toBe('por 3 turnos');
        expect(describeDuration({ unit: 'rodadas', amount: 2 })).toBe('por 2 rodadas');
        expect(describeDuration({ unit: 'combate' })).toBe('até o fim do combate');
    });

    it('descreve o uso da habilidade com custo, cura e efeito', () => {
        const postura = findPassive('subclass', 'Postura Defensiva')!;
        expect(describeAbilityUse({ actor: 'Aria', ability: postura.name, cost: 5, effect: postura.activation!.effect })).toBe(
            '**Aria** usou **Postura Defensiva** gastando 5 MP. Postura defensiva: +3 AP. (por 2 turnos).'
        );
        expect(describeAbilityUse({ actor: 'Aria', ability: 'Cura Interior', cost: 0, heal: { total: 9, applied: 7 } })).toBe('**Aria** usou **Cura Interior** e curou **7 de LP**.');
        expect(describeAbilityUse({ actor: 'Aria', ability: 'Postura Bestial', choice: 'Postura do Lobo', cost: 0 })).toBe('**Aria** usou **Postura Bestial** (Postura do Lobo).');
    });
});
