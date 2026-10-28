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
import { useState, type ReactElement } from 'react';

export interface LeaveReachCombatant {
    id: string;
    name: string;
    type: string;
}

interface LeaveReachDialogProps {
    open: boolean;
    onClose: () => void;
    /** Todos os combatentes (o próprio personagem sai da lista de quem estava ao alcance) */
    combatants: readonly LeaveReachCombatant[];
    /** Quem saiu, quando já se sabe (o jogador, pelo próprio personagem); sem isso o mestre escolhe */
    moverId?: string;
    busy?: boolean;
    onDeclare: (moverId: string, reactorIds: string[]) => void;
    /** Desengajar gasta a ação Padrão e não provoca: sem isso o botão não aparece */
    onDisengage?: (moverId: string) => void;
}

/**
 * "Saí do alcance": quem saiu do alcance corpo a corpo de inimigos marca quem estava ao alcance e que já o tinha visto; cada um ganha a chance de um ataque de
 * oportunidade (opcional, gasta a Reação). Ou desengaja (ação Padrão), que não provoca. O mapa é de terceiros: quem declara é quem sabe onde cada um está.
 */
export default function LeaveReachDialog({ open, onClose, combatants, moverId, busy = false, onDeclare, onDisengage }: LeaveReachDialogProps): ReactElement {
    const [ chosenMover, setChosenMover ] = useState('');
    const [ reactors, setReactors ] = useState<string[]>([]);

    const mover = moverId ?? chosenMover;
    // Inimigos primeiro: quem é de outro tipo que o de quem saiu (jogador contra criatura) costuma ser quem provoca
    const moverType = combatants.find(candidate => candidate.id === mover)?.type;
    const others = combatants
        .filter(candidate => candidate.id !== mover)
        .sort((a, b) => Number(a.type === moverType) - Number(b.type === moverType));

    const toggle = (id: string, checked: boolean): void => {
        setReactors(current => (checked ? [ ...current, id ] : current.filter(entry => entry !== id)));
    };
    const picked = reactors.filter(id => others.some(candidate => candidate.id === id));

    return (
        <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth TransitionProps={{ onExited: () => { setReactors([]); setChosenMover(''); } }}>
            <DialogTitle>Saída do alcance corpo a corpo</DialogTitle>
            <DialogContent>
                {moverId === undefined && (
                    <TextField
                        select
                        size="small"
                        fullWidth
                        label="Quem saiu"
                        value={chosenMover}
                        onChange={(event) => { setChosenMover(event.target.value); setReactors([]); }}
                        sx={{ mt: 1, mb: 2 }}
                    >
                        {combatants.map(candidate => <MenuItem key={candidate.id} value={candidate.id}>{candidate.name}</MenuItem>)}
                    </TextField>
                )}
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, mt: moverId === undefined ? 0 : 1 }}>
                    Marque quem estava ao alcance corpo a corpo e já tinha visto quem saiu. Cada um pode fazer um ataque de oportunidade (gasta a Reação) antes do movimento.
                </Typography>
                <FormGroup>
                    {others.map(candidate => (
                        <FormControlLabel
                            key={candidate.id}
                            control={<Checkbox size="small" checked={reactors.includes(candidate.id)} onChange={(event) => { toggle(candidate.id, event.target.checked); }} />}
                            label={candidate.name}
                        />
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Button onClick={onClose} disabled={busy} color="inherit" sx={{ textTransform: 'none' }}>Cancelar</Button>
                {onDisengage && (
                    <Button onClick={() => { onDisengage(mover); }} disabled={busy || !mover} variant="outlined" sx={{ textTransform: 'none' }}>
                        Desengajar (ação Padrão)
                    </Button>
                )}
                <Button
                    onClick={() => { onDeclare(mover, picked); }}
                    disabled={busy || !mover || picked.length === 0}
                    variant="contained"
                    sx={{ textTransform: 'none' }}
                >
                    Declarar saída
                </Button>
            </DialogActions>
        </Dialog>
    );
}
