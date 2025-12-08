'use client';

import { useState, useEffect } from 'react';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField,
    Typography
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { blue, green, red } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import type { PlayerInfo, MassActionType } from './types';

interface MassActionDialogProps {
    open: boolean;
    onClose: () => void;
    actionType: MassActionType | null;
    players: PlayerInfo[];
    campaignId: string;
}

export default function MassActionDialog({ 
    open, 
    onClose, 
    actionType, 
    players, 
    campaignId 
}: MassActionDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [amount, setAmount] = useState(100);
    const [isLoading, setIsLoading] = useState(false);

    // Seleciona todos por padrão ao abrir
    useEffect(() => {
        if (open) {
            setSelectedPlayers(players.map(p => p.id));
            setAmount(actionType === 'addMoney' ? 100 : 0);
            
            // Debug: verificar dados dos jogadores
            if (actionType === 'addMoney') {
                console.log('[MassActionDialog] Players data:', players.map(p => ({
                    name: p.charsheet?.name || p.name,
                    money: p.charsheet?.inventory?.money,
                    inventory: p.charsheet?.inventory
                })));
            }
        }
    }, [open, players, actionType]);

    const handleAction = async () => {
        if (selectedPlayers.length === 0) {
            enqueueSnackbar('Selecione ao menos um jogador', { variant: 'warning' });
            return;
        }

        setIsLoading(true);
        try {
            const charsheetIds = selectedPlayers
                .map(playerId => players.find(p => p.id === playerId)?.charsheet?.id)
                .filter(Boolean) as string[];

            const response = await fetch(`/api/campaign/${campaignId}/mass-action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: actionType,
                    charsheetIds,
                    amount: actionType === 'addMoney' ? amount : undefined
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao executar ação');
            }

            enqueueSnackbar(result.message, { variant: 'success' });
            handleClose();
        } catch (error) {
            console.error('Erro na ação em massa:', error);
            enqueueSnackbar('Erro ao executar ação', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setSelectedPlayers([]);
            onClose();
        }
    };

    const togglePlayer = (playerId: string) => {
        if (isLoading) return;
        setSelectedPlayers(prev =>
            prev.includes(playerId)
                ? prev.filter(id => id !== playerId)
                : [...prev, playerId]
        );
    };

    const getIcon = () => {
        switch (actionType) {
            case 'restoreLP': return <FavoriteIcon sx={{ color: red[500] }} />;
            case 'restoreMP': return <BoltIcon sx={{ color: blue[500] }} />;
            case 'addMoney': return <AttachMoneyIcon sx={{ color: green[500] }} />;
            default: return null;
        }
    };

    const getTitle = () => {
        switch (actionType) {
            case 'restoreLP': return 'Restaurar LP';
            case 'restoreMP': return 'Restaurar MP';
            case 'addMoney': return 'Adicionar Dinheiro';
            default: return '';
        }
    };

    const getButtonColor = () => {
        switch (actionType) {
            case 'restoreLP': return red[600];
            case 'restoreMP': return blue[600];
            case 'addMoney': return green[600];
            default: return 'primary.main';
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getIcon()}
                {getTitle()}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    {actionType === 'addMoney' && (
                        <TextField
                            label="Quantidade de Dinheiro (¢)"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            inputProps={{ min: 0 }}
                            fullWidth
                        />
                    )}

                    {(actionType === 'restoreLP' || actionType === 'restoreMP') && (
                        <Box 
                            sx={{ 
                                p: 2, 
                                bgcolor: (theme) => theme.palette.mode === 'dark'
                                    ? (actionType === 'restoreLP' ? 'rgba(239, 83, 80, 0.15)' : 'rgba(66, 165, 245, 0.15)')
                                    : (actionType === 'restoreLP' ? red[50] : blue[50]), 
                                borderRadius: 2, 
                                border: '1px solid', 
                                borderColor: (theme) => theme.palette.mode === 'dark'
                                    ? (actionType === 'restoreLP' ? red[800] : blue[800])
                                    : (actionType === 'restoreLP' ? red[200] : blue[200])
                            }}
                        >
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: (theme) => theme.palette.mode === 'dark'
                                        ? (actionType === 'restoreLP' ? red[300] : blue[300])
                                        : 'text.secondary'
                                }}
                            >
                                {actionType === 'restoreLP' 
                                    ? '❤️ O LP de todos os jogadores selecionados será restaurado ao máximo.'
                                    : '⚡ O MP de todos os jogadores selecionados será restaurado ao máximo.'
                                }
                            </Typography>
                        </Box>
                    )}

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Jogadores ({selectedPlayers.length} selecionado{selectedPlayers.length !== 1 ? 's' : ''})
                        </Typography>
                        <Box sx={{ maxHeight: 250, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <List dense>
                                {players.map(player => (
                                    <ListItem
                                        key={player.id}
                                        button
                                        onClick={() => togglePlayer(player.id)}
                                        disabled={isLoading}
                                    >
                                        <Checkbox checked={selectedPlayers.includes(player.id)} size="small" />
                                        <ListItemAvatar>
                                            <Avatar src={player.avatar} sx={{ width: 28, height: 28 }} />
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={player.charsheet?.name || player.name}
                                            secondary={
                                                actionType === 'restoreLP' 
                                                    ? `LP: ${player.charsheet?.stats?.lp ?? 0}/${player.charsheet?.stats?.maxLp ?? 0}`
                                                    : actionType === 'restoreMP'
                                                        ? `MP: ${player.charsheet?.stats?.mp ?? 0}/${player.charsheet?.stats?.maxMp ?? 0}`
                                                        : `Dinheiro: ¢${player.charsheet?.inventory?.money ?? 0}`
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose} disabled={isLoading} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    onClick={handleAction}
                    variant="contained"
                    disabled={selectedPlayers.length === 0 || isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : getIcon()}
                    sx={{ 
                        bgcolor: getButtonColor(),
                        '&:hover': { bgcolor: actionType === 'restoreLP' ? red[700] : actionType === 'restoreMP' ? blue[700] : green[700] }
                    }}
                >
                    {isLoading ? 'Processando...' : 'Aplicar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
