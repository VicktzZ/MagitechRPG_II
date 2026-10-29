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
import { MAX_REACTION_TEXT, REACTION_TRIGGERS, TRIGGER_LABEL, type ReactionTrigger } from '@utils/combat/reactions';
import { useState, type ReactElement } from 'react';

export interface ReactionCombatant {
    id: string;
    name: string;
}

interface OpenReactionDialogProps {
    open: boolean;
    onClose: () => void;
    combatants: readonly ReactionCombatant[];
    busy?: boolean;
    onOpen: (input: { trigger: ReactionTrigger; subjectId?: string; text?: string; reactorIds: string[] }) => void;
}

/**
 * "Abrir reação" (mestre): o que aconteceu, com quem, e quem pode reagir. Cada um com a Reação disponível ganha a oferta (quem não tem aparece no aviso). O mapa e a
 * narração são do mestre, então é ele quem diz quem estava em posição de reagir; o app só leva a oferta a quem tem a Reação.
 */
export default function OpenReactionDialog({ open, onClose, combatants, busy = false, onOpen }: OpenReactionDialogProps): ReactElement {
    const [ trigger, setTrigger ] = useState<ReactionTrigger>('damaged');
    const [ subjectId, setSubjectId ] = useState('');
    const [ text, setText ] = useState('');
    const [ reactors, setReactors ] = useState<string[]>([]);

    const needsSubject = trigger !== 'other';
    const valid = reactors.length > 0 && (needsSubject ? subjectId !== '' : text.trim() !== '');

    const toggle = (id: string, checked: boolean): void => {
        setReactors(current => (checked ? [ ...current, id ] : current.filter(entry => entry !== id)));
    };

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth TransitionProps={{ onExited: () => { setSubjectId(''); setText(''); setReactors([]); } }}>
            <DialogTitle>Abrir reação</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, mt: 0.5 }}>
                    Diga o que aconteceu e quem pode reagir. Cada um com a Reação disponível ganha a oferta, com as magias de Reação dele que combinam. A oferta dura até o turno passar.
                </Typography>
                <TextField select size="small" fullWidth label="O que aconteceu" value={trigger} onChange={(event) => { setTrigger(event.target.value as ReactionTrigger); }} sx={{ mb: 1.5 }}>
                    {REACTION_TRIGGERS.map(option => <MenuItem key={option} value={option}>{TRIGGER_LABEL[option]}</MenuItem>)}
                </TextField>
                {needsSubject && (
                    <TextField select size="small" fullWidth label="Com quem" value={subjectId} onChange={(event) => { setSubjectId(event.target.value); }} sx={{ mb: 1.5 }}>
                        {combatants.map(candidate => <MenuItem key={candidate.id} value={candidate.id}>{candidate.name}</MenuItem>)}
                    </TextField>
                )}
                <TextField
                    size="small"
                    fullWidth
                    label={needsSubject ? 'Detalhe (opcional)' : 'Descreva o que aconteceu'}
                    value={text}
                    onChange={(event) => { setText(event.target.value); }}
                    inputProps={{ maxLength: MAX_REACTION_TEXT }}
                    sx={{ mb: 1.5 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Quem pode reagir</Typography>
                <FormGroup>
                    {combatants.map(candidate => (
                        <FormControlLabel
                            key={candidate.id}
                            control={<Checkbox size="small" checked={reactors.includes(candidate.id)} onChange={(event) => { toggle(candidate.id, event.target.checked); }} />}
                            label={candidate.name}
                        />
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={busy} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
                <Button
                    onClick={() => { onOpen({ trigger, ...(needsSubject ? { subjectId } : {}), ...(text.trim() ? { text: text.trim() } : {}), reactorIds: reactors }); }}
                    disabled={busy || !valid}
                    variant="contained"
                    sx={{ textTransform: 'none' }}
                >
                    Abrir reação
                </Button>
            </DialogActions>
        </Dialog>
    );
}
