'use client';

import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, ListItem, ListItemText, Typography } from '@mui/material';
import type { Creature } from '@models';
import { useState, type ReactElement } from 'react';
import { buildStartCreatures, buildStartPlayers } from './combat/combatPayload';
import ParticipantPicker from './combat/ParticipantPicker';
import { useParticipantSelection } from './combat/useParticipantSelection';
import { useGmCombat } from '../combatPanel/useGmCombat';
import type { PlayerInfo } from './types';

interface CombatSetupDialogProps {
    open: boolean;
    onClose: () => void;
    campaignId: string;
    players: PlayerInfo[];
    creatures: Creature[];
}

/**
 * "Iniciar combate": o mestre escolhe os participantes (jogadores e criaturas, com cópias) e se os jogadores veem a vida das criaturas. Depois de começar, o combate vive
 * no painel fixo do dashboard (`GMCombatPanel`), não mais neste diálogo.
 */
export default function CombatSetupDialog({ open, onClose, campaignId, players, creatures }: CombatSetupDialogProps): ReactElement {
    const controls = useGmCombat(campaignId);
    const selection = useParticipantSelection();
    const { selectedPlayers, selectedCreatures, creatureQuantities } = selection;
    const [ showEnemyLp, setShowEnemyLp ] = useState(false);
    const nobody = selectedPlayers.length === 0 && selectedCreatures.length === 0;

    const start = async (): Promise<void> => {
        const started = await controls.start({
            players: buildStartPlayers(players, selectedPlayers),
            creatures: buildStartCreatures(creatures, selectedCreatures, creatureQuantities),
            showEnemyLp
        });
        if (!started) return;
        selection.clear();
        onClose();
    };

    return (
        <Dialog open={open} onClose={() => { if (!controls.busy) onClose(); }} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SportsKabaddiIcon sx={{ color: 'text.secondary' }} />
                Iniciar combate
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>Selecione os participantes do combate:</Typography>

                    <ParticipantPicker players={players} creatures={creatures} selection={selection} />

                    <Divider />
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Opções:</Typography>
                        <ListItem button onClick={() => { setShowEnemyLp(value => !value); }} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Checkbox checked={showEnemyLp} size="small" />
                            <ListItemText primary="Mostrar LP dos inimigos" secondary="Os jogadores poderão ver a vida das criaturas" />
                        </ListItem>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={controls.busy} variant="outlined">Fechar</Button>
                <Button
                    onClick={() => { void start(); }}
                    variant="contained"
                    disabled={controls.busy || nobody}
                    startIcon={controls.busy ? <CircularProgress size={20} /> : <SportsKabaddiIcon />}
                >
                    {controls.busy ? 'Iniciando...' : 'Iniciar combate'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
