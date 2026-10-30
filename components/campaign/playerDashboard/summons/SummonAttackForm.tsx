'use client';

import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { Creature } from '@models';
import { describeCreatureDice } from '@utils/combat/creatureDice';
import type { DamageKind } from '@utils/combat/engine/types';
import { isSummonAttackSkill, SUMMON_ATTACK_SKILLS, type SummonAttackChoice } from '@utils/combat/summonAttack';
import type { ReactElement } from 'react';

const KIND_LABEL: Record<DamageKind, string> = { fisico: 'Físico', magico: 'Mágico', mental: 'Mental' };

export interface SummonAttackDraft {
    targetId: string;
    skill: string;
    diceId: string;
    kind: DamageKind;
    attackType: string;
}

export const emptySummonAttackDraft = (): SummonAttackDraft => ({ targetId: '', skill: 'Luta', diceId: '', kind: 'fisico', attackType: '' });

/** O rascunho vale como escolha de ataque? Precisa de alvo e de uma perícia de ataque; o resto é opcional */
export function toSummonAttackChoice(draft: SummonAttackDraft): SummonAttackChoice | null {
    if (!draft.targetId || !isSummonAttackSkill(draft.skill)) return null;
    return { targetId: draft.targetId, skill: draft.skill, kind: draft.kind, ...(draft.diceId ? { diceId: draft.diceId } : {}), ...(draft.attackType.trim() ? { attackType: draft.attackType.trim() } : {}) };
}

interface SummonAttackFormProps {
    summonName: string;
    targets: ReadonlyArray<{ id: string; name: string }>;
    creature?: Creature;
    draft: SummonAttackDraft;
    onChange: (draft: SummonAttackDraft) => void;
    busy: boolean;
    onSubmit: () => void;
}

/** O formulário do ataque do invocado (separado do diálogo para poder ser testado fora do navegador): alvo, perícia do acerto, dado do dano, natureza e elemento */
export default function SummonAttackForm({ summonName, targets, creature, draft, onChange, busy, onSubmit }: SummonAttackFormProps): ReactElement {
    const dices = creature?.dices ?? [];
    const valid = toSummonAttackChoice(draft) !== null;
    const set = (patch: Partial<SummonAttackDraft>): void => { onChange({ ...draft, ...patch }); };

    return (
        <Stack spacing={1.5} data-testid="summon-attack-form">
            <Typography variant="body2" color="text.secondary">
                {`${summonName} testa o acerto com a perícia escolhida e rola o dano do dado escolhido. O mestre confirma contra o AP e a defesa do alvo.`}
            </Typography>
            <TextField select size="small" label="Alvo" value={draft.targetId} onChange={(event) => { set({ targetId: event.target.value }); }} fullWidth>
                {targets.map(target => <MenuItem key={target.id} value={target.id}>{target.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Perícia do acerto" value={draft.skill} onChange={(event) => { set({ skill: event.target.value }); }} fullWidth>
                {SUMMON_ATTACK_SKILLS.map(skill => <MenuItem key={skill} value={skill}>{skill}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Dado do dano" value={draft.diceId} onChange={(event) => { set({ diceId: event.target.value }); }} fullWidth helperText={dices.length === 0 ? 'Este invocado não tem dados cadastrados: o mestre diz o dano.' : undefined}>
                <MenuItem value="">Sem dano (o mestre diz)</MenuItem>
                {dices.map(dice => <MenuItem key={dice.id} value={dice.id}>{`${dice.name} (${describeCreatureDice(dice)})`}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={1.5}>
                <TextField select size="small" label="Natureza" value={draft.kind} onChange={(event) => { set({ kind: event.target.value as DamageKind }); }} sx={{ flex: 1 }}>
                    {(Object.keys(KIND_LABEL) as DamageKind[]).map(kind => <MenuItem key={kind} value={kind}>{KIND_LABEL[kind]}</MenuItem>)}
                </TextField>
                <TextField size="small" label="Elemento ou tipo" value={draft.attackType} onChange={(event) => { set({ attackType: event.target.value }); }} sx={{ flex: 1 }} />
            </Stack>
            <Button variant="contained" disabled={!valid || busy} onClick={onSubmit} sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
                Atacar
            </Button>
        </Stack>
    );
}
