'use client';

import { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField,
    Typography
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { blue, green } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import { charsheetService } from '@services';
import type { PlayerInfo } from './types';

interface LevelUpDialogProps {
    open: boolean;
    onClose: () => void;
    players: PlayerInfo[];
}

export default function LevelUpDialog({ open, onClose, players }: LevelUpDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([]);
    const [ levelsToAdd, setLevelsToAdd ] = useState(1);
    const [ isLevelingUp, setIsLevelingUp ] = useState(false);

    const handleLevelUp = async () => {
        if (selectedPlayers.length === 0) {
            enqueueSnackbar('Selecione ao menos um jogador', { variant: 'warning' });
            return;
        }

        setIsLevelingUp(true);
        try {
            const charsheetIds = selectedPlayers
                .map(playerId => players.find(p => p.id === playerId)?.charsheet?.id)
                .filter(Boolean) as string[];

            for (const charsheetId of charsheetIds) {
                await charsheetService.increaseLevel(charsheetId, levelsToAdd);
            }

            enqueueSnackbar(
                `${charsheetIds.length} jogador(es) subiram ${levelsToAdd} nível(is)!`,
                { variant: 'success' }
            );
            handleClose();
        } catch (error) {
            console.error('Erro ao subir nível:', error);
            enqueueSnackbar('Erro ao subir nível', { variant: 'error' });
        } finally {
            setIsLevelingUp(false);
        }
    };

    const handleClose = () => {
        if (!isLevelingUp) {
            setSelectedPlayers([]);
            setLevelsToAdd(1);
            onClose();
        }
    };

    const togglePlayer = (playerId: string) => {
        if (isLevelingUp) return;
        setSelectedPlayers(prev =>
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [ ...prev, playerId ]
        );
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: blue[500] }} />
                Aumentar Nível de Jogadores
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Níveis a adicionar"
                        type="number"
                        value={levelsToAdd}
                        onChange={(e) => setLevelsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                        inputProps={{ min: 1, max: 20 }}
                        fullWidth
                    />

                    <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Jogadores ({selectedPlayers.length} selecionado{selectedPlayers.length !== 1 ? 's' : ''})
                        </Typography>
                        <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <List>
                                {players.map((player, index) => (
                                    <Box key={player.id}>
                                        <ListItem
                                            button
                                            onClick={() => togglePlayer(player.id)}
                                            selected={selectedPlayers.includes(player.id)}
                                            disabled={isLevelingUp || !player.charsheet}
                                            sx={{
                                                '&.Mui-selected': {
                                                    bgcolor: blue[100] + '60',
                                                    '&:hover': { bgcolor: blue[100] + '80' }
                                                }
                                            }}
                                        >
                                            <Checkbox
                                                checked={selectedPlayers.includes(player.id)}
                                                disabled={isLevelingUp || !player.charsheet}
                                            />
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={player.avatar}
                                                    sx={{
                                                        border: selectedPlayers.includes(player.id)
                                                            ? `2px solid ${blue[500]}`
                                                            : '2px solid transparent'
                                                    }}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {player.charsheet?.name ?? 'Sem charsheet'}
                                                        </Typography>
                                                        {selectedPlayers.includes(player.id) && (
                                                            <Chip label="Selecionado" size="small" color="primary" />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    player.charsheet ? (
                                                        <Box display="flex" gap={0.5} mt={0.5}>
                                                            <Chip
                                                                label={`Nível ${player.charsheet.level ?? 0}`}
                                                                size="small"
                                                                sx={{ height: 20 }}
                                                            />
                                                            <Chip
                                                                label={`→ Nível ${(player.charsheet.level ?? 0) + levelsToAdd}`}
                                                                size="small"
                                                                sx={{ height: 20, bgcolor: green[100], color: green[800] }}
                                                            />
                                                        </Box>
                                                    ) : 'Jogador sem charsheet'
                                                }
                                            />
                                        </ListItem>
                                        {index < players.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose} disabled={isLevelingUp} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    onClick={handleLevelUp}
                    variant="contained"
                    disabled={selectedPlayers.length === 0 || isLevelingUp}
                    startIcon={isLevelingUp ? <CircularProgress size={20} /> : <TrendingUpIcon />}
                >
                    {isLevelingUp ? 'Subindo...' : `Subir ${levelsToAdd} Nível(is)`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
