'use client';

import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import { HIDDEN_CAUSES, HIDDEN_CAUSE_LABEL, type HiddenCause } from '@utils/combat/awareness';
import { useState, type ReactElement } from 'react';

export interface HideCombatant {
    id: string;
    name: string;
    type: string;
}

interface HideDialogProps {
    open: boolean;
    onClose: () => void;
    combatants: readonly HideCombatant[];
    busy?: boolean;
    onConfirm: (hiderId: string, observerIds: string[], cause: HiddenCause) => void;
}

/**
 * "Furtividade": o mestre diz quem está fora da vista de quem. O mapa é de terceiros, então quem sabe quem enxerga quem é ele. Quem não vê o escondido fica desprevenido
 * contra ele (sem esquiva; furtivo dá +1d20 no ataque, invisível +2d20) e testa Percepção para notá-lo.
 */
export default function HideDialog({ open, onClose, combatants, busy = false, onConfirm }: HideDialogProps): ReactElement {
    const [ hider, setHider ] = useState('');
    const [ cause, setCause ] = useState<HiddenCause>('furtivo');
    const [ observers, setObservers ] = useState<string[]>([]);

    // Quem é de outro tipo que o escondido (jogador contra criatura) costuma ser quem não o vê: vem primeiro
    const hiderType = combatants.find(candidate => candidate.id === hider)?.type;
    const others = combatants
        .filter(candidate => candidate.id !== hider)
        .sort((a, b) => Number(a.type === hiderType) - Number(b.type === hiderType));
    const picked = observers.filter(id => others.some(candidate => candidate.id === id));

    const toggle = (id: string, checked: boolean): void => {
        setObservers(current => (checked ? [ ...current, id ] : current.filter(entry => entry !== id)));
    };

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth TransitionProps={{ onExited: () => { setHider(''); setObservers([]); setCause('furtivo'); } }}>
            <DialogTitle>Quem não vê o escondido</DialogTitle>
            <DialogContent>
                <TextField
                    select
                    size="small"
                    fullWidth
                    label="Quem está escondido"
                    value={hider}
                    onChange={(event) => { setHider(event.target.value); setObservers([]); }}
                    sx={{ mt: 1, mb: 2 }}
                >
                    {combatants.map(candidate => <MenuItem key={candidate.id} value={candidate.id}>{candidate.name}</MenuItem>)}
                </TextField>
                <TextField
                    select
                    size="small"
                    fullWidth
                    label="Por que não é visto"
                    value={cause}
                    onChange={(event) => { setCause(event.target.value as HiddenCause); }}
                    sx={{ mb: 2 }}
                >
                    {HIDDEN_CAUSES.map(option => <MenuItem key={option} value={option}>{HIDDEN_CAUSE_LABEL[option]}</MenuItem>)}
                </TextField>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Marque quem não o enxerga. Eles ficam desprevenidos contra os ataques dele (sem esquiva) e podem testar Percepção para notá-lo: DT 20, ou 30 se estiver
                    invisível (15 com Visão Verdadeira).
                </Typography>
                <FormGroup>
                    {others.map(candidate => (
                        <FormControlLabel
                            key={candidate.id}
                            control={<Checkbox size="small" checked={picked.includes(candidate.id)} onChange={(event) => { toggle(candidate.id, event.target.checked); }} />}
                            label={candidate.name}
                        />
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={busy} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
                <Button
                    onClick={() => { onConfirm(hider, picked, cause); }}
                    disabled={busy || !hider || picked.length === 0}
                    variant="contained"
                    sx={{ textTransform: 'none' }}
                >
                    Esconder
                </Button>
            </DialogActions>
        </Dialog>
    );
}
