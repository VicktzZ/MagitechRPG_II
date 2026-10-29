'use client';

import { useState, useCallback } from 'react';
import {
    alpha,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    CircularProgress,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import { color as tokenColor } from '@themes/tokens';
import { useSnackbar } from 'notistack';
import { handleHealingBlocked } from './healBlocked';
import type { Combat, Combatant } from '@models';
import type { Charsheet } from '@models/entities';
import { useTheme } from '@mui/material';

interface CombatActionButtonProps {
    campaignId: string;
    campaignCode?: string;
    combat?: Combat | null;
    charsheets?: Charsheet[]; // Charsheets para obter os pontos atuais (stats) de cada jogador
    onActionComplete?: () => void;
}

export default function CombatActionButton({ 
    campaignId,
    campaignCode,
    combat,
    charsheets = [],
    onActionComplete 
}: CombatActionButtonProps) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const theme = useTheme();

    // Função para obter LP/MP de charsheet.stats
    const getPlayerStats = (combatant: Combatant) => {
        if (combatant.type !== 'player') return null;
        
        // Busca o charsheet do combatente
        const charsheet = charsheets.find(c => 
            c.id === combatant.id || c.id === combatant.odacId
        );
        
        if (charsheet?.stats) {
            return {
                lp: charsheet.stats.lp ?? combatant.currentLp ?? 0,
                maxLp: charsheet.stats.maxLp ?? combatant.maxLp ?? 0,
                mp: charsheet.stats.mp ?? combatant.currentMp ?? 0,
                maxMp: charsheet.stats.maxMp ?? combatant.maxMp ?? 0
            };
        }
        
        return null;
    };
    const [ dialogOpen, setDialogOpen ] = useState(false);
    const [ actionType, setActionType ] = useState<'damage' | 'heal'>('damage');
    const [ targetId, setTargetId ] = useState<string>('');
    const [ value, setValue ] = useState<number>(0);
    const [ isLoading, setIsLoading ] = useState(false);

    const handleOpen = (type: 'damage' | 'heal') => {
        setActionType(type);
        setDialogOpen(true);
        setTargetId('');
        setValue(0);
    };

    const handleClose = () => {
        if (!isLoading) {
            setDialogOpen(false);
        }
    };

    const apply = useCallback(async (force: boolean) => {
        if (!targetId || value <= 0) {
            enqueueSnackbar('Selecione um alvo e um valor válido', { variant: 'warning' });
            return;
        }

        setIsLoading(true);
        try {
            // Usa o combatente do turno atual como ator
            const currentCombatant = combat?.combatants?.[combat?.currentTurnIndex || 0];

            const response = await fetch(`/api/campaign/${campaignId}/combat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: actionType === 'damage' ? 'apply_damage' : 'apply_heal',
                    combatantId: currentCombatant?.id,
                    targetId,
                    value,
                    ...(force ? { force: true } : {})
                })
            });

            const result = await response.json();

            // Necrose, Incurável...: o alvo não recebe cura. O mestre pode curar mesmo assim
            if (!response.ok && handleHealingBlocked(result, { enqueueSnackbar, closeSnackbar }, () => { void apply(true); })) {
                handleClose();
                return;
            }

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao aplicar ação');
            }

            enqueueSnackbar(
                actionType === 'damage' 
                    ? `${value} de dano aplicado!` 
                    : `${value} de cura aplicada!`, 
                { variant: 'success' }
            );
            
            handleClose();
            onActionComplete?.();
        } catch (error) {
            console.error('Erro ao aplicar ação:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao aplicar ação', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [ campaignId, actionType, targetId, value, enqueueSnackbar, closeSnackbar, onActionComplete ]);

    const handleApply = useCallback(async () => { await apply(false); }, [ apply ]);

    // Não mostra nada se não houver combate ativo
    if (!combat?.isActive) return null;

    const selectedTarget = combat.combatants.find(c => c.id === targetId);

    return (
        <>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<WhatshotIcon />}
                    onClick={() => handleOpen('damage')}
                    sx={{
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: 'error.light' }
                    }}
                >
                    Dano
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<LocalHospitalIcon />}
                    onClick={() => handleOpen('heal')}
                    sx={{
                        bgcolor: 'success.main',
                        color: 'success.contrastText',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: 'success.light' }
                    }}
                >
                    Cura
                </Button>
            </Box>

            <Dialog 
                open={dialogOpen} 
                onClose={handleClose} 
                maxWidth="xs" 
                fullWidth
                PaperProps={{
                    sx: { bgcolor: 'background.paper' }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: actionType === 'damage' ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.success.main, 0.15),
                    borderBottom: '2px solid',
                    borderColor: actionType === 'damage' ? 'error.main' : 'success.main',
                    color: 'text.primary'
                }}>
                    {actionType === 'damage' ? (
                        <WhatshotIcon sx={{ color: 'error.main' }} />
                    ) : (
                        <LocalHospitalIcon sx={{ color: 'success.main' }} />
                    )}
                    <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                        {actionType === 'damage' ? 'Aplicar Dano' : 'Aplicar Cura'}
                    </Typography>
                    <Chip 
                        label={`Round ${combat.round}`} 
                        size="small" 
                        sx={{ ml: 'auto' }}
                    />
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Valor */}
                        <TextField
                            label={actionType === 'damage' ? 'Dano' : 'Cura'}
                            type="number"
                            value={value}
                            onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
                            fullWidth
                            inputProps={{ min: 0 }}
                            InputProps={{
                                startAdornment: actionType === 'damage' 
                                    ? <WhatshotIcon sx={{ mr: 1, color: 'error.main' }} />
                                    : <FavoriteIcon sx={{ mr: 1, color: 'success.main' }} />
                            }}
                        />

                        {/* Seleção de Alvo */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Selecione o alvo:
                            </Typography>
                            <Box sx={{ 
                                maxHeight: 200, 
                                overflow: 'auto', 
                                border: '1px solid', 
                                borderColor: 'divider',
                                borderRadius: 1
                            }}>
                                <List dense>
                                    {combat.combatants.map(combatant => {
                                        const isSelected = targetId === combatant.id;
                                        const playerStats = getPlayerStats(combatant);
                                        const currentLp = playerStats?.lp ?? combatant.currentLp ?? 0;
                                        const maxLp = playerStats?.maxLp ?? combatant.maxLp ?? 1;
                                        const lpPercent = (currentLp / maxLp) * 100;
                                        
                                        return (
                                            <ListItem
                                                key={combatant.id}
                                                button
                                                selected={isSelected}
                                                onClick={() => setTargetId(combatant.id)}
                                                sx={{
                                                    bgcolor: isSelected 
                                                        ? (actionType === 'damage' ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.success.main, 0.15))
                                                        : 'transparent'
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar 
                                                        src={combatant.avatar}
                                                        sx={{ 
                                                            width: 32, 
                                                            height: 32,
                                                            bgcolor: combatant.type === 'creature' ? 'warning.main' : 'info.main'
                                                        }}
                                                    >
                                                        {combatant.type === 'creature' 
                                                            ? <PetsIcon fontSize="small" />
                                                            : <PersonIcon fontSize="small" />
                                                        }
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText 
                                                    primary={combatant.name}
                                                    secondary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <FavoriteIcon sx={{ fontSize: 14, color: tokenColor.lp }} />
                                                            <Typography variant="caption">
                                                                {currentLp}/{maxLp}
                                                            </Typography>
                                                            <Box 
                                                                sx={{ 
                                                                    width: 50, 
                                                                    height: 6, 
                                                                    bgcolor: 'divider',
                                                                    borderRadius: 1,
                                                                    overflow: 'hidden'
                                                                }}
                                                            >
                                                                <Box 
                                                                    sx={{ 
                                                                        width: `${lpPercent}%`, 
                                                                        height: '100%',
                                                                        bgcolor: lpPercent > 50 
                                                                            ? 'success.main' 
                                                                            : lpPercent > 25 
                                                                                ? 'warning.main' 
                                                                                : tokenColor.lp,
                                                                        transition: 'width 0.3s'
                                                                    }} 
                                                                />
                                                            </Box>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Box>
                        </Box>

                        {/* Preview da ação - não mostra LP final */}
                        {selectedTarget && value > 0 && (
                            <Box sx={{ 
                                p: 2, 
                                bgcolor: actionType === 'damage' ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.success.main, 0.15),
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: actionType === 'damage' ? 'error.main' : 'success.main'
                            }}>
                                <Typography variant="body2">
                                    <strong>{value}</strong> de {actionType === 'damage' ? 'dano' : 'cura'} em{' '}
                                    <strong>{selectedTarget.name}</strong>
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApply}
                        disabled={!targetId || value <= 0 || isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : (
                            actionType === 'damage' ? <WhatshotIcon /> : <LocalHospitalIcon />
                        )}
                        sx={{
                            bgcolor: actionType === 'damage' ? 'error.main' : 'success.main',
                            color: actionType === 'damage' ? 'error.contrastText' : 'success.contrastText',
                            '&:hover': { 
                                bgcolor: actionType === 'damage' ? 'error.light' : 'success.light' 
                            }
                        }}
                    >
                        {isLoading ? 'Aplicando...' : 'Aplicar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
