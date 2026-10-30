'use client';

import { useCampaignContext } from '@contexts';
import type { Charsheet } from '@models/entities';
import { campaignService } from '@services';
import { buildAttackProposal, type AttackProposal, type ProposalChoice, type ProposalTarget } from '@utils/combat/attackProposal';
import { attackSurprise, stealthDiceAlreadyRolled, type AttackSurprise } from '@utils/combat/awareness';
import { rollCreatureExpertise } from '@utils/combat/creatureRoll';
import { effectDice } from '@utils/combat/effectDice';
import { invulnerableSpellName, ownedPassives, passiveReminders, withPassiveEffects } from '@utils/combat/passives';
import { hasStealthEffect } from '@utils/combat/stealth';
import { DODGE_EXPERTISE, type DefenseChoice } from '@utils/combat/engine/defense';
import { rollD20 } from '@utils/campaignTest';
import type { DamageKind } from '@utils/combat/engine/types';
import { defenseSkillFor, describeDefense, type PendingAttackData } from '@utils/combat/pendingAttacks';
import { findBaseCreature } from '@utils/combatCreatureLookup';
import { errorMessage } from '@utils/errors';
import { planSheetRoll, rollSheetPlan } from '@utils/sheetRoll';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';

export interface AttackResolution {
    proposal: AttackProposal;
    /** Escolhas do mestre; os campos vazios seguem a proposta */
    kind: DamageKind;
    setKind: (kind: DamageKind) => void;
    defense: DefenseChoice;
    setDefense: (defense: DefenseChoice) => void;
    defenseTotal: string;
    setDefenseTotal: (value: string) => void;
    /** Como saiu a última rolagem de defesa ("[12, 7: 12] + 3 = 15") */
    defenseRollText: string;
    /** A defesa vem do teste que o jogador alvo rolou (e o mestre não trocou a escolha nem o total) */
    defenseFromPlayer: boolean;
    /** O alvo é um jogador que ainda não declarou a defesa */
    awaitingPlayerDefense: boolean;
    /** O alvo está desprevenido: não via o atacante (parte da matriz de percepção; o mestre pode trocar) */
    surprised: boolean;
    setSurprised: (value: boolean) => void;
    /** O que a matriz de percepção diz do atacante contra esse alvo (furtivo, invisível...); `null` se o alvo o via */
    surprise: AttackSurprise | null;
    area: string;
    setArea: (value: string) => void;
    extraRolls: number[];
    hitOverride: boolean | null;
    setHitOverride: (value: boolean | null) => void;
    damageOverride: string;
    setDamageOverride: (value: string) => void;
    /** O resultado que será gravado */
    hit: boolean;
    finalDamage: number;
    /** Dá para confirmar: o jogador já rolou o dano, ou o mestre decidiu o resultado */
    canConfirm: boolean;
    busy: boolean;
    rollExtraDie: () => void;
    rollDefense: () => void;
    confirm: () => Promise<void>;
    dismiss: () => Promise<void>;
}

/** "Reflexos: [12, 7: 12] + 3 = 15"; com efeitos, "... (Cegueira: desvantagem, −1d20)" (de onde vêm os d20 a mais e a menos) */
export const describeRoll = (skill: string, rolls: readonly number[], used: number, bonus: number, total: number, notes: readonly string[] = []): string =>
    `${skill}: [${rolls.join(', ')}${rolls.length > 1 ? `: ${used}` : ''}] ${bonus >= 0 ? '+' : '−'} ${Math.abs(bonus)} = ${total}${notes.length > 0 ? ` (${notes.join('; ')})` : ''}`;

const toInt = (text: string): number | null => {
    if (text.trim() === '') return null;
    const number = Number(text);
    return Number.isInteger(number) ? number : null;
};

/** A resolução de um ataque pendente: estado das escolhas do mestre, a proposta do motor refeita a cada mudança e as ações (rolar, confirmar, descartar) */
export function useAttackResolution(attack: PendingAttackData): AttackResolution {
    const { campaign, charsheets, rpgSystem } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();

    const [ kind, setKind ] = useState<DamageKind>(attack.kind);
    // A defesa parte da que o jogador alvo declarou (`attack.defense`, que pode chegar depois de o cartão abrir); o que o mestre mexer vale no lugar dela
    const [ defenseOverride, setDefenseOverride ] = useState<DefenseChoice | null>(null);
    const [ totalOverride, setTotalOverride ] = useState<string | null>(null);
    const [ rollTextOverride, setRollTextOverride ] = useState<string | null>(null);
    // Desprevenido parte da matriz de percepção (o atacante está fora da vista do alvo); o que o mestre marcar vale no lugar dela
    const [ surprisedOverride, setSurprised ] = useState<boolean | null>(null);
    const [ area, setArea ] = useState(attack.areaMeters ? String(attack.areaMeters) : '');
    const [ extraRolls, setExtraRolls ] = useState<number[]>([]);
    const [ hitOverride, setHitOverride ] = useState<boolean | null>(null);
    const [ damageOverride, setDamageOverride ] = useState('');
    const [ busy, setBusy ] = useState(false);

    const combatants = campaign.session?.combat?.combatants ?? [];
    const targetCombatant = combatants.find(combatant => combatant.id === attack.targetId);
    const attackerCombatant = combatants.find(combatant => combatant.id === attack.attackerId);
    const creature = useMemo(
        () => (targetCombatant?.type === 'creature' ? findBaseCreature(targetCombatant.id, campaign.custom?.creatures ?? []) ?? null : null),
        [ targetCombatant, campaign.custom?.creatures ]
    );
    const sheet = useMemo<Charsheet | null>(
        () => (targetCombatant?.type === 'player' ? charsheets.find(candidate => candidate.id === targetCombatant.id) ?? null : null),
        [ targetCombatant, charsheets ]
    );

    // O teste do jogador só vale para a escolha e a perícia que ele rolou: trocar a esquiva por resistência, ou a natureza do ataque (outra RES), pede outro teste
    const playerDefense = attack.defense;
    const defense: DefenseChoice = defenseOverride ?? playerDefense?.choice ?? 'none';
    const playerTestApplies = Boolean(
        playerDefense && playerDefense.choice !== 'none' && playerDefense.choice === defense
        && playerDefense.skill === defenseSkillFor({ kind, attackType: attack.attackType }, defense)
    );
    const defenseTotal = totalOverride ?? (playerTestApplies && playerDefense ? String(playerDefense.total) : '');
    const defenseRollText = rollTextOverride ?? (playerTestApplies && playerDefense ? `${describeDefense(playerDefense)} (rolado pelo jogador)` : '');
    const defenseFromPlayer = playerTestApplies && totalOverride === null;
    const awaitingPlayerDefense = targetCombatant?.type === 'player' && !playerDefense;

    const setDefense = (value: DefenseChoice): void => {
        setDefenseOverride(value);
        setTotalOverride(null);
        setRollTextOverride(null);
    };
    const setDefenseTotal = (value: string): void => {
        setTotalOverride(value);
        setRollTextOverride('');
    };

    const surprise = attackSurprise(campaign.session?.combat?.unseen, attack.attackerId, targetCombatant);
    const surprised = surprisedOverride ?? surprise !== null;

    // Habilidades de classe e subclasse: o AP e as resistências do alvo (Pele Resistente, Imunidade Mágica...) e o que o atacante causa a mais (Muralha) entram como efeitos
    // derivados da ficha; o que depende de dado fica de lembrete para o mestre
    const attackerSheet = useMemo<Charsheet | null>(
        () => (attackerCombatant?.type === 'player' ? charsheets.find(candidate => candidate.id === attackerCombatant.id) ?? null : null),
        [ attackerCombatant, charsheets ]
    );
    const targetPassives = ownedPassives(sheet);
    const attackerPassives = ownedPassives(attackerSheet);
    const attackerEffects = withPassiveEffects(attackerCombatant?.effects, attackerPassives, { sheet: attackerSheet, stealthy: hasStealthEffect(attackerCombatant?.effects) });
    const target: ProposalTarget = {
        effects: withPassiveEffects(targetCombatant?.effects, targetPassives, { sheet, stealthy: hasStealthEffect(targetCombatant?.effects) }),
        creature,
        sheet,
        reminders: passiveReminders(targetPassives, 'defender'),
        // Fixação Mágica do alvo: a magia que ele fixou não o atinge
        invulnerableTo: invulnerableSpellName(sheet, targetPassives)
    };
    const choice: ProposalChoice = {
        kind,
        defense,
        defenseTotal: toInt(defenseTotal),
        surprised,
        surprise: surprise ? { cause: surprise.cause, advantages: surprise.advantages, alreadyRolled: stealthDiceAlreadyRolled(attack.source, attackerCombatant?.effects) } : null,
        areaMeters: toInt(area),
        extraRolls,
        hasReaction: (targetCombatant?.actions?.reacao ?? 1) > 0
    };
    const proposal = buildAttackProposal(attack, attackerEffects, target, choice);

    const hit = hitOverride ?? proposal.hit;
    const typedDamage = toInt(damageOverride);
    const finalDamage = hit ? Math.max(0, typedDamage ?? proposal.finalDamage) : 0;
    const canConfirm = !hit || attack.damageRolled !== undefined || typedDamage !== null;

    const rollExtraDie = (): void => { setExtraRolls(rolls => [ ...rolls, rollD20() ]); };

    const rollDefense = (): void => {
        const skill = defense === 'dodge' ? DODGE_EXPERTISE : proposal.resistanceSkill;
        if (defense === 'none') return;

        // A esquiva do alvo leva as vantagens e desvantagens de esquiva dos efeitos aplicados a ele, e a resistência as de resistência
        const effects = effectDice(targetCombatant?.effects, defense === 'dodge' ? 'dodge' : 'resistance');

        if (creature) {
            const result = rollCreatureExpertise(creature, skill, undefined, effects);
            if (!result) {
                enqueueSnackbar(`${targetCombatant?.name ?? 'A criatura'} não tem a perícia ${skill}. Digite o total.`, { variant: 'warning' });
                return;
            }
            setTotalOverride(String(result.total));
            setRollTextOverride(describeRoll(skill, result.rolls, result.used, result.bonus, result.total, result.notes));
            return;
        }

        const plan = planSheetRoll(sheet, skill, rpgSystem, effects);
        if (!plan) {
            enqueueSnackbar(`Não deu para rolar ${skill} pela ficha. Digite o total.`, { variant: 'warning' });
            return;
        }
        const result = rollSheetPlan(plan);
        setTotalOverride(String(result.total));
        setRollTextOverride(describeRoll(skill, result.rolls, result.used, plan.bonus, result.total, plan.notes));
    };

    const confirm = async (): Promise<void> => {
        setBusy(true);
        try {
            const lines = [ ...proposal.lines ];
            if (typedDamage !== null || hitOverride !== null) {
                lines.push({ label: 'Ajuste do mestre', detail: hit ? `dano final ${finalDamage}` : 'errou', visibility: 'all' });
            }
            const response = await campaignService.resolveAttack(campaign.id, {
                attackId: attack.id,
                hit,
                damage: finalDamage,
                reactionSpent: hit && proposal.resolution?.targetSpentReaction === true,
                // A defesa que valeu: as reações armadas do alvo (Reflexos Táticos...) leem se ele esquivou
                defense,
                lines
            });
            for (const warning of response.warnings ?? []) enqueueSnackbar(warning, { variant: 'warning' });
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao resolver o ataque'), { variant: 'error' });
        } finally {
            setBusy(false);
        }
    };

    const dismiss = async (): Promise<void> => {
        setBusy(true);
        try {
            await campaignService.dismissAttack(campaign.id, attack.id);
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao descartar o ataque'), { variant: 'error' });
        } finally {
            setBusy(false);
        }
    };

    return {
        proposal, kind, setKind, defense, setDefense, defenseTotal, setDefenseTotal, defenseRollText, defenseFromPlayer, awaitingPlayerDefense, surprised, setSurprised, surprise, area, setArea,
        extraRolls, hitOverride, setHitOverride, damageOverride, setDamageOverride, hit, finalDamage, canConfirm, busy,
        rollExtraDie, rollDefense, confirm, dismiss
    };
}
