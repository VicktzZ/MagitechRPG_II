'use client';

import { useState } from 'react';
import {
    alpha,
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
import { color } from '@themes/tokens';
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
                <AutoGraphIcon sx={{ color: 'success.main' }} />
                Evolução Roguelite (+5 Níveis)
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {/* Informações sobre os bônus */}
                    <Box 
                        sx={{ 
                            p: 2, 
                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.15), 
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette.success.main, 0.5)
                        }}
                    >
                        <Typography 
                            variant="subtitle2" 
                            sx={{ 
                                color: 'success.main',
                                mb: 1, 
                                fontWeight: 700 
                            }}
                        >
                            🎮 Bônus de Evolução Roguelite
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip label="+5 Níveis" size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.14), color: 'success.main' }} />
                            <Chip label="+1 Nível de ORM" size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.warning.main, 0.14), color: 'warning.light' }} />
                            <Chip label="+5 Atributos" size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.info.main, 0.14), color: 'info.main' }} />
                            <Chip label="+1 Modificadores" size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.info.main, 0.14), color: 'info.main' }} />
                            <Chip label="+1 Perícias" size="small" sx={{ bgcolor: 'background.raised', color: 'text.primary' }} />
                            <Chip label="+2 Espaços de Magia" size="small" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }} />
                            <Chip label="+2.0kg Capacidade" size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14), color: 'primary.main' }} />
                            <Chip label="+¢250 Dinheiro" size="small" sx={{ bgcolor: (theme) => alpha(theme.palette.success.main, 0.14), color: 'success.main' }} />
                            <Chip label="+10 LP Máximo" size="small" sx={{ bgcolor: alpha(color.lp, 0.14), color: 'error.light', fontWeight: 'bold' }} />
                            <Chip label="+5 MP Máximo" size="small" sx={{ bgcolor: alpha(color.mp, 0.14), color: color.mp, fontWeight: 'bold' }} />
                        </Box>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: 'success.main',
                                display: 'block', 
                                mt: 1,
                                fontWeight: 600
                            }}
                        >
                            ❤️ LP e MP máximos AUMENTAM e são totalmente restaurados
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: 'info.main',
                                display: 'block', 
                                fontStyle: 'italic'
                            }}
                        >
                            ⚠️ Stats são salvos na sessão da campanha, não globalmente
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
                                                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.14),
                                                    '&:hover': { bgcolor: (theme) => alpha(theme.palette.success.main, 0.22) }
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={player.avatar}
                                                    sx={{
                                                        border: selectedPlayers.includes(player.id)
                                                            ? `2px solid ${color.success}`
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
                                                                sx={{ height: 20, bgcolor: (theme) => alpha(theme.palette.success.main, 0.14), color: 'success.main' }}
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
                    sx={{ bgcolor: 'success.main', color: 'success.contrastText', '&:hover': { bgcolor: 'success.dark' } }}
                >
                    {isLevelingUp ? 'Evoluindo...' : 'Evoluir Jogadores'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
