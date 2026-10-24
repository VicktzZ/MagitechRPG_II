import type { Creature } from '@models';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Collapse, Typography } from '@mui/material';
import { useState, type ReactElement } from 'react';
import type { PlayerInfo } from '../types';
import { buildJoinPayload, countJoining, type JoinPayload } from './combatPayload';
import ParticipantPicker from './ParticipantPicker';
import { useParticipantSelection } from './useParticipantSelection';

interface AddCombatantsPanelProps {
    players: PlayerInfo[];
    creatures: Creature[];
    /** Fichas que já estão no combate */
    inCombat: ReadonlySet<string>;
    /** Fase atual: muda o que acontece com quem entra */
    phase: 'INITIATIVE' | 'ACTION' | 'ENDED';
    disabled?: boolean;
    /** Manda quem entra; devolve `true` se deu certo (a seleção é limpa e o painel fecha) */
    onAdd: (payload: JoinPayload) => Promise<boolean>;
}

const PHASE_HINT: Record<'INITIATIVE' | 'ACTION', string> = {
    INITIATIVE: 'Quem entrar agora rola a iniciativa como os demais; a ordem só é definida depois que todos rolarem.',
    ACTION: 'A iniciativa de quem entrar é rolada na hora e a entrada vai para o lugar dela na ordem do round. Se a vez dela já passou, age logo depois de quem está agindo.'
};

/** "Adicionar ao combate": jogadores que ainda não estão nele e criaturas (com cópias), num combate em andamento */
export default function AddCombatantsPanel({ players, creatures, inCombat, phase, disabled, onAdd }: AddCombatantsPanelProps): ReactElement {
    const [ open, setOpen ] = useState(false);
    const selection = useParticipantSelection();

    const payload = buildJoinPayload(players, selection.selectedPlayers, selection.selectedCreatures, selection.creatureQuantities);
    const count = countJoining(payload);

    const handleAdd = async (): Promise<void> => {
        if (await onAdd(payload)) {
            selection.clear();
            setOpen(false);
        }
    };

    return (
        <Box data-testid="add-combatants" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    aria-expanded={open}
                    onClick={() => { setOpen(value => !value) }}
                    data-testid="add-combatants-toggle"
                >
                    {open ? 'Fechar' : 'Adicionar ao combate'}
                </Button>
            </Box>

            <Collapse in={open} unmountOnExit>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.raised' }}>
                    {phase !== 'ENDED' && <Typography variant="caption" color="text.secondary">{PHASE_HINT[phase]}</Typography>}
                    <ParticipantPicker players={players} creatures={creatures} selection={selection} inCombat={inCombat} />
                    <Box>
                        <Button
                            variant="contained"
                            size="small"
                            disabled={disabled || count === 0}
                            onClick={() => { void handleAdd() }}
                            data-testid="add-combatants-submit"
                        >
                            {count > 0 ? `Adicionar ${count} ${count === 1 ? 'combatente' : 'combatentes'}` : 'Adicionar'}
                        </Button>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
}
