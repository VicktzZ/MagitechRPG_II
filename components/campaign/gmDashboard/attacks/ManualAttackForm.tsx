'use client';

import { useCampaignContext } from '@contexts';
import { Autocomplete, Button, MenuItem, Stack, TextField } from '@mui/material';
import { campaignService } from '@services';
import type { DamageKind } from '@utils/combat/engine/types';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState, type ReactElement } from 'react';
import { WEAKNESS_OPTIONS } from '../creatureCreator/constants';

const KIND_LABEL: Record<DamageKind, string> = { fisico: 'Físico', magico: 'Mágico', mental: 'Mental' };

/**
 * Ataque declarado pelo mestre (de uma criatura, por exemplo): quem ataca, quem é o alvo, o que usou, o total do acerto e o dano. Vira um ataque pendente
 * como o do jogador e passa pela mesma resolução (AP, fraqueza, defesa do alvo).
 */
export default function ManualAttackForm({ onDone }: { onDone: () => void }): ReactElement {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const combatants = campaign.session?.combat?.combatants ?? [];

    const [ attackerId, setAttackerId ] = useState('');
    const [ targetId, setTargetId ] = useState('');
    const [ name, setName ] = useState('');
    const [ kind, setKind ] = useState<DamageKind>('fisico');
    const [ attackType, setAttackType ] = useState('');
    const [ total, setTotal ] = useState('');
    const [ damage, setDamage ] = useState('');
    const [ busy, setBusy ] = useState(false);

    const totalNumber = Number(total);
    const damageNumber = damage.trim() === '' ? undefined : Number(damage);
    const valid = Boolean(attackerId && targetId && attackerId !== targetId && name.trim() && total.trim() !== '' && Number.isInteger(totalNumber)
        && (damageNumber === undefined || (Number.isInteger(damageNumber) && damageNumber >= 0)));

    const submit = async (): Promise<void> => {
        setBusy(true);
        try {
            await campaignService.declareAttack(campaign.id, {
                combatantId: attackerId,
                targetId,
                attack: { source: 'manual', name: name.trim(), kind, attackType: attackType.trim() || undefined, attackTotal: totalNumber, rolls: [], bonus: 0 },
                ...(damageNumber !== undefined ? { damage: damageNumber } : {})
            });
            onDone();
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao declarar o ataque'), { variant: 'error' });
        } finally {
            setBusy(false);
        }
    };

    return (
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="flex-start" data-testid="manual-attack-form">
            <TextField select size="small" label="Quem ataca" value={attackerId} onChange={(event) => { setAttackerId(event.target.value); }} sx={{ width: 190 }}>
                {combatants.map(combatant => <MenuItem key={combatant.id} value={combatant.id}>{combatant.name}</MenuItem>)}
            </TextField>
            <TextField select size="small" label="Alvo" value={targetId} onChange={(event) => { setTargetId(event.target.value); }} sx={{ width: 190 }}>
                {combatants.filter(combatant => combatant.id !== attackerId).map(combatant => <MenuItem key={combatant.id} value={combatant.id}>{combatant.name}</MenuItem>)}
            </TextField>
            <TextField size="small" label="Ataque (arma ou magia)" value={name} onChange={(event) => { setName(event.target.value); }} sx={{ width: 200 }} />
            <TextField select size="small" label="Natureza" value={kind} onChange={(event) => { setKind(event.target.value as DamageKind); }} sx={{ width: 130 }}>
                {(Object.keys(KIND_LABEL) as DamageKind[]).map(option => <MenuItem key={option} value={option}>{KIND_LABEL[option]}</MenuItem>)}
            </TextField>
            <Autocomplete
                freeSolo
                size="small"
                options={WEAKNESS_OPTIONS}
                inputValue={attackType}
                onInputChange={(_, value) => { setAttackType(value); }}
                sx={{ width: 170 }}
                renderInput={(params) => <TextField {...params} label="Elemento ou tipo" />}
            />
            <TextField size="small" type="number" label="Total do acerto" value={total} onChange={(event) => { setTotal(event.target.value); }} sx={{ width: 140 }} />
            <TextField size="small" type="number" label="Dano rolado" value={damage} onChange={(event) => { setDamage(event.target.value); }} sx={{ width: 130 }} />
            <Button variant="contained" size="small" disabled={!valid || busy} onClick={() => { void submit(); }} sx={{ textTransform: 'none', mt: 0.5 }}>
                Declarar ataque
            </Button>
        </Stack>
    );
}
