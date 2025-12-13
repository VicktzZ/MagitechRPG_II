'use client';

import { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
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
    Typography
} from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { amber, blue, green, orange, purple, red } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import type { PlayerInfo } from './types';

interface RogueliteLevelUpDialogProps {
    open: boolean;
    onClose: () => void;
    players: PlayerInfo[];
    campaignId: string;
}

export default function RogueliteLevelUpDialog({ 
    open, 
    onClose, 
    players, 
    campaignId 
}: RogueliteLevelUpDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([]);
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

            const response = await fetch(`/api/campaign/${campaignId}/session/roguelite-levelup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ charsheetIds })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao evoluir jogadores');
            }

            enqueueSnackbar(result.message, { variant: 'success' });
            handleClose();
        } catch (error) {
            console.error('Erro ao evoluir jogadores:', error);
            enqueueSnackbar('Erro ao evoluir jogadores', { variant: 'error' });
        } finally {
            setIsLevelingUp(false);
        }
    };

    const handleClose = () => {
        if (!isLevelingUp) {
            setSelectedPlayers([]);
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
                <AutoGraphIcon sx={{ color: green[500] }} />
                Evolução Roguelite (+5 Níveis)
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {/* Informações sobre os bônus */}
                    <Box 
                        sx={{ 
                            p: 2, 
                            bgcolor: (theme) => theme.palette.mode === 'dark' 
                                ? 'rgba(76, 175, 80, 0.15)' 
                                : green[50], 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: (theme) => theme.palette.mode === 'dark' 
                                ? green[800] 
                                : green[200]
                        }}
                    >
                        <Typography 
                            variant="subtitle2" 
                            sx={{ 
                                color: (theme) => theme.palette.mode === 'dark' ? green[300] : green[800], 
                                mb: 1, 
                                fontWeight: 700 
                            }}
                        >
                            🎮 Bônus de Evolução Roguelite
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip label="+5 Níveis" size="small" sx={{ bgcolor: green[800], color: green[50] }} />
                            <Chip label="+1 Nível de ORM" size="small" sx={{ bgcolor: orange[700], color: orange[50] }} />
                            <Chip label="+5 Atributos" size="small" sx={{ bgcolor: blue[700], color: blue[50] }} />
                            <Chip label="+1 Modificadores" size="small" sx={{ bgcolor: blue[600], color: blue[50] }} />
                            <Chip label="+1 Perícias" size="small" sx={{ bgcolor: purple[700], color: purple[50] }} />
                            <Chip label="+2 Espaços de Magia" size="small" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }} />
                            <Chip label="+2.0kg Capacidade" size="small" sx={{ bgcolor: amber[700], color: amber[50] }} />
                            <Chip label="+¢250 Dinheiro" size="small" sx={{ bgcolor: green[600], color: green[50] }} />
                            <Chip label="+10 LP Máximo" size="small" sx={{ bgcolor: red[600], color: red[50] }} />
                            <Chip label="+5 MP Máximo" size="small" sx={{ bgcolor: blue[500], color: blue[50] }} />
                        </Box>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: (theme) => theme.palette.mode === 'dark' ? green[400] : green[700], 
                                display: 'block', 
                                mt: 1 
                            }}
                        >
                            💡 LP e MP serão totalmente restaurados ao novo máximo
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            Jogadores ({selectedPlayers.length} selecionado{selectedPlayers.length !== 1 ? 's' : ''})
                        </Typography>
                        <Box sx={{ maxHeight: 320, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
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
                                                    bgcolor: green[100] + '60',
                                                    '&:hover': { bgcolor: green[100] + '80' }
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={player.avatar}
                                                    sx={{
                                                        border: selectedPlayers.includes(player.id)
                                                            ? `2px solid ${green[500]}`
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
                                                            <Chip label="Selecionado" size="small" color="success" sx={{ fontWeight: 600 }} />
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
                                                                label={`→ Nível ${(player.charsheet.level ?? 0) + 5}`}
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
                    startIcon={isLevelingUp ? <CircularProgress size={20} /> : <AutoGraphIcon />}
                    sx={{ bgcolor: green[600], '&:hover': { bgcolor: green[700] } }}
                >
                    {isLevelingUp ? 'Evoluindo...' : 'Evoluir Jogadores'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
