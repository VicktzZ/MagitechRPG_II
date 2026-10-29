'use client';

import { Add, Remove } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { describeBudget, describePerRound, MAX_ACTIONS_PER_SLOT, planActionGrant, SLOT_LABEL, stepNow, stepPerRound, type ActionGrantPlan } from '@utils/combat/actionBudgets';
import type { ActionBudget, ActionSlot } from '@utils/combat/engine/actionBudget';
import { useEffect, useState, type ReactElement } from 'react';

/** Os espaços que o mestre dá a mais: a Reação segue a regra de uma por rodada e fica fora do diálogo */
export const GRANTABLE_SLOTS: readonly ActionSlot[] = [ 'padrao', 'bonus', 'movimento' ];

export interface GrantActionsTarget {
    /** Id do combatente (a ficha, para jogador; o id da criatura no combate, para criatura) */
    id: string;
    name: string;
    /** As ações que ele tem agora */
    now: ActionBudget;
    /** Quantas ele recupera por rodada */
    perRound: ActionBudget;
}

interface GrantActionsDialogProps {
    target: GrantActionsTarget | null;
    onClose: () => void;
    onSave: (target: GrantActionsTarget, plan: ActionGrantPlan) => Promise<void>;
}

interface StepperProps {
    label: string;
    value: number;
    onStep: (step: number) => void;
    disabled?: boolean;
}

function Stepper({ label, value, onStep, disabled = false }: StepperProps): ReactElement {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" aria-label={`Tirar uma ação: ${label}`} disabled={disabled || value <= 0} onClick={() => { onStep(-1); }}>
                <Remove fontSize="small" />
            </IconButton>
            <Typography aria-label={`${label}: ${value}`} sx={{ minWidth: 24, textAlign: 'center', fontFamily: font.mono, fontSize: 16 }}>{value}</Typography>
            <IconButton size="small" aria-label={`Dar uma ação: ${label}`} disabled={disabled || value >= MAX_ACTIONS_PER_SLOT} onClick={() => { onStep(1); }}>
                <Add fontSize="small" />
            </IconButton>
        </Box>
    );
}

interface GrantDraft {
    now: ActionBudget;
    perRound: ActionBudget;
}

interface GrantActionsFormProps {
    name: string;
    draft: GrantDraft;
    /** O diálogo tem algo a aplicar (o rascunho difere do que o combatente tinha) */
    changed: boolean;
    saving?: boolean;
    onChange: (draft: GrantDraft) => void;
}

const columnTitleSx = { fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', textAlign: 'center' } as const;

/** Os números do diálogo: Agora e Por rodada de Padrão, Bônus e Movimento, e o resumo do que vai ficar (separado do diálogo para dar para testar sem o portal do Modal) */
export function GrantActionsForm({ name, draft, changed, saving = false, onChange }: GrantActionsFormProps): ReactElement {
    return (
        <>
            <DialogContentText sx={{ mb: 2 }}>
                {`${name}: até ${MAX_ACTIONS_PER_SLOT} ações de cada tipo. "Agora" vale só nesta rodada; "Por rodada" é quanto ele recupera toda vez que a rodada vira.`}
            </DialogContentText>

            <Stack spacing={1.5} data-testid="grant-actions-rows">
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', columnGap: 2, alignItems: 'center' }}>
                    <span />
                    <Typography sx={columnTitleSx}>Agora</Typography>
                    <Typography sx={columnTitleSx}>Por rodada</Typography>
                </Box>
                {GRANTABLE_SLOTS.map(slot => (
                    <Box key={slot} data-testid={`grant-row-${slot}`} sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', columnGap: 2, alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600 }}>{SLOT_LABEL[slot]}</Typography>
                        <Stepper label={`${SLOT_LABEL[slot]} agora`} value={draft.now[slot]} disabled={saving} onStep={step => { onChange(stepNow(draft, slot, step)); }} />
                        <Stepper label={`${SLOT_LABEL[slot]} por rodada`} value={draft.perRound[slot]} disabled={saving} onStep={step => { onChange(stepPerRound(draft, slot, step)); }} />
                    </Box>
                ))}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }} data-testid="grant-actions-summary">
                {changed
                    ? `Fica: ${describeBudget(draft.now)}. Por rodada: ${describePerRound(draft.perRound) || 'o padrão (1 de cada)'}.`
                    : 'Mexa nos números para dar ou tirar ações.'}
            </Typography>
        </>
    );
}

/**
 * O mestre dá ou tira ações Padrão, Bônus e de Movimento (até 9 de cada) de um jogador ou criatura em combate. Cada espaço tem dois números: **Agora** (as que o combatente
 * tem nesta rodada) e **Por rodada** (quantas ele recupera a cada rodada que vira; 1 se o mestre não mexeu). Mexer no por rodada leva o de agora junto, e o mestre ainda
 * acerta o de agora à parte (um extra só desta rodada é só subir o "Agora").
 */
export default function GrantActionsDialog({ target, onClose, onSave }: GrantActionsDialogProps): ReactElement {
    const [ draft, setDraft ] = useState<GrantDraft | null>(null);
    const [ saving, setSaving ] = useState(false);

    useEffect(() => {
        setDraft(target ? { now: target.now, perRound: target.perRound } : null);
    }, [ target ]);

    const plan = target && draft ? planActionGrant({ now: target.now, perRound: target.perRound }, draft) : null;

    const handleSave = async (): Promise<void> => {
        if (!target || !plan) return;
        setSaving(true);
        try {
            await onSave(target, plan);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={Boolean(target)} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Dar ou tirar ações</DialogTitle>
            <DialogContent>
                {target && draft && <GrantActionsForm name={target.name} draft={draft} changed={Boolean(plan)} saving={saving} onChange={setDraft} />}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving} color="secondary">Cancelar</Button>
                <Button onClick={() => { void handleSave(); }} disabled={saving || !plan} variant="contained">Aplicar</Button>
            </DialogActions>
        </Dialog>
    );
}
