'use client';

import { useCampaignContext } from '@contexts';
import type { Charsheet } from '@models/entities';
import { campaignService } from '@services';
import { buildAttackProposal, type AttackProposal, type ProposalChoice, type ProposalTarget } from '@utils/combat/attackProposal';
import { rollCreatureExpertise } from '@utils/combat/creatureRoll';
import { DODGE_EXPERTISE, type DefenseChoice } from '@utils/combat/engine/defense';
import { rollD20 } from '@utils/campaignTest';
import type { DamageKind } from '@utils/combat/engine/types';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
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
    surprised: boolean;
    setSurprised: (value: boolean) => void;
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

/** "Reflexos: [12, 7: 12] + 3 = 15" */
const describeRoll = (skill: string, rolls: readonly number[], used: number, bonus: number, total: number): string =>
    `${skill}: [${rolls.join(', ')}${rolls.length > 1 ? `: ${used}` : ''}] ${bonus >= 0 ? '+' : '−'} ${Math.abs(bonus)} = ${total}`;

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
    const [ defense, setDefense ] = useState<DefenseChoice>('none');
    const [ defenseTotal, setDefenseTotal ] = useState('');
    const [ defenseRollText, setDefenseRollText ] = useState('');
    const [ surprised, setSurprised ] = useState(false);
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

    const target: ProposalTarget = { effects: targetCombatant?.effects, creature, sheet };
    const choice: ProposalChoice = {
        kind,
        defense,
        defenseTotal: toInt(defenseTotal),
        surprised,
        areaMeters: toInt(area),
        extraRolls,
        hasReaction: (targetCombatant?.actions?.reacao ?? 1) > 0
    };
    const proposal = buildAttackProposal(attack, attackerCombatant?.effects, target, choice);

    const hit = hitOverride ?? proposal.hit;
    const typedDamage = toInt(damageOverride);
    const finalDamage = hit ? Math.max(0, typedDamage ?? proposal.finalDamage) : 0;
    const canConfirm = !hit || attack.damageRolled !== undefined || typedDamage !== null;

    const rollExtraDie = (): void => { setExtraRolls(rolls => [ ...rolls, rollD20() ]); };

    const rollDefense = (): void => {
        const skill = defense === 'dodge' ? DODGE_EXPERTISE : proposal.resistanceSkill;
        if (defense === 'none') return;

        if (creature) {
            const result = rollCreatureExpertise(creature, skill);
            if (!result) {
                enqueueSnackbar(`${targetCombatant?.name ?? 'A criatura'} não tem a perícia ${skill}. Digite o total.`, { variant: 'warning' });
                return;
            }
            setDefenseTotal(String(result.total));
            setDefenseRollText(describeRoll(skill, result.rolls, result.used, result.bonus, result.total));
            return;
        }

        const plan = planSheetRoll(sheet, skill, rpgSystem);
        if (!plan) {
            enqueueSnackbar(`Não deu para rolar ${skill} pela ficha. Digite o total.`, { variant: 'warning' });
            return;
        }
        const result = rollSheetPlan(plan);
        setDefenseTotal(String(result.total));
        setDefenseRollText(describeRoll(skill, result.rolls, result.used, plan.bonus, result.total));
    };

    const confirm = async (): Promise<void> => {
        setBusy(true);
        try {
            const lines = [ ...proposal.lines ];
            if (typedDamage !== null || hitOverride !== null) {
                lines.push({ label: 'Ajuste do mestre', detail: hit ? `dano final ${finalDamage}` : 'errou', visibility: 'all' });
            }
            await campaignService.resolveAttack(campaign.id, {
                attackId: attack.id,
                hit,
                damage: finalDamage,
                reactionSpent: hit && proposal.resolution?.targetSpentReaction === true,
                lines
            });
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
        proposal, kind, setKind, defense, setDefense, defenseTotal, setDefenseTotal, defenseRollText, surprised, setSurprised, area, setArea,
        extraRolls, hitOverride, setHitOverride, damageOverride, setDamageOverride, hit, finalDamage, canConfirm, busy,
        rollExtraDie, rollDefense, confirm, dismiss
    };
}
