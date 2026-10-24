'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';

export interface SetMpSpentTarget {
    /** Id do combatente (a ficha, para jogador; o id da criatura no combate, para criatura) */
    id: string;
    name: string;
    /** MP já gasto nesta rodada */
    spent: number;
    /** Limite de MP por turno: o máximo, que este diálogo não altera */
    limit: number;
}

interface SetMpSpentDialogProps {
    target: SetMpSpentTarget | null;
    onClose: () => void;
    onSave: (target: SetMpSpentTarget, value: number) => Promise<void>;
}

/** Inteiro de 0 até o limite, ou `null` se o texto não vale */
export function parseMpSpent(input: string, limit: number): number | null {
    if (!/^\d+$/.test(input.trim())) return null;
    const value = Number(input);
    return value <= limit ? value : null;
}

/**
 * O mestre define exatamente quanto MP o jogador (ou a criatura) já gastou nesta rodada, de 0 até o limite de MP por turno.
 * O limite (o máximo) não muda aqui; só o gasto atual.
 */
export default function SetMpSpentDialog({ target, onClose, onSave }: SetMpSpentDialogProps): ReactElement {
    const [ input, setInput ] = useState('');
    const [ saving, setSaving ] = useState(false);

    useEffect(() => {
        if (target) setInput(String(target.spent));
    }, [ target ]);

    const parsed = target ? parseMpSpent(input, target.limit) : null;

    const handleSave = async (): Promise<void> => {
        if (!target || parsed === null) return;
        setSaving(true);
        try {
            await onSave(target, parsed);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={Boolean(target)} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>MP gasto nesta rodada</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    {target ? `${target.name}: define o MP já gasto, de 0 até o limite de ${target.limit}. O limite em si não muda.` : ''}
                </DialogContentText>
                <TextField
                    autoFocus
                    fullWidth
                    size="small"
                    type="number"
                    label="MP gasto"
                    value={input}
                    onChange={event => { setInput(event.target.value); }}
                    onKeyDown={event => { if (event.key === 'Enter') void handleSave(); }}
                    error={parsed === null}
                    helperText={parsed === null ? `Use um número inteiro de 0 a ${target?.limit ?? 0}` : `Vai ficar ${parsed} / ${target?.limit ?? 0}`}
                    inputProps={{ min: 0, max: target?.limit, step: 1, 'aria-label': 'MP gasto nesta rodada' }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={saving} color="secondary">Cancelar</Button>
                <Button onClick={() => { void handleSave(); }} disabled={saving || parsed === null} variant="contained">Definir</Button>
            </DialogActions>
        </Dialog>
    );
}
