'use client';

import { useState, useCallback } from 'react';
import {
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
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
import { red, green, blue, orange, grey } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material';

interface Combatant {
    id: string;
    name: string;
    type: 'player' | 'creature';
    currentLp?: number;
    maxLp?: number;
    currentMp?: number;
    maxMp?: number;
    avatar?: string;
    odacId?: string;
}

interface CombatActionButtonProps {
    campaignId: string;
    campaignCode?: string;
    combat: {
        isActive: boolean;
        phase: string;
        round: number;
        currentTurnIndex: number;
        combatants: Combatant[];
    } | null;
    charsheets?: any[]; // Charsheets para obter stats de charsheet.session
    onActionComplete?: () => void;
}

export default function CombatActionButton({ 
    campaignId,
    campaignCode,
    combat,
    charsheets = [],
    onActionComplete 
}: CombatActionButtonProps) {
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    // Função para obter LP/MP de charsheet.session (fonte correta)
    const getPlayerSessionStats = (combatant: Combatant) => {
        if (combatant.type !== 'player') return null;
        
        // Busca o charsheet do combatente
        const charsheet = charsheets.find((c: any) => 
            c.id === combatant.id || c.id === combatant.odacId
        );
        
        if (charsheet) {
            // Busca os stats na sessão da charsheet para esta campanha
            const sessionData = charsheet.session?.find(
                (s: any) => s.campaignCode === campaignCode
            );
            
            if (sessionData?.stats) {
                return {
                    lp: sessionData.stats.lp ?? combatant.currentLp ?? 0,
                    maxLp: sessionData.stats.maxLp ?? combatant.maxLp ?? 0,
                    mp: sessionData.stats.mp ?? combatant.currentMp ?? 0,
                    maxMp: sessionData.stats.maxMp ?? combatant.maxMp ?? 0
                };
            }
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

    const handleApply = useCallback(async () => {
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
                    value
                })
            });

            const result = await response.json();

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
    }, [ campaignId, actionType, targetId, value, enqueueSnackbar, onActionComplete ]);

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
                        bgcolor: red[600],
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: red[700] }
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
                        bgcolor: green[600],
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: green[700] }
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
                    sx: { bgcolor: isDarkMode ? 'background.paper' : undefined }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: isDarkMode 
                        ? (actionType === 'damage' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(76, 175, 80, 0.15)')
                        : (actionType === 'damage' ? red[50] : green[50]),
                    borderBottom: '2px solid',
                    borderColor: actionType === 'damage' ? red[300] : green[300],
                    color: isDarkMode ? 'text.primary' : undefined
                }}>
                    {actionType === 'damage' ? (
                        <WhatshotIcon sx={{ color: isDarkMode ? red[400] : red[600] }} />
                    ) : (
                        <LocalHospitalIcon sx={{ color: isDarkMode ? green[400] : green[600] }} />
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
                                    ? <WhatshotIcon sx={{ mr: 1, color: red[500] }} />
                                    : <FavoriteIcon sx={{ mr: 1, color: green[500] }} />
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
                                        const sessionStats = getPlayerSessionStats(combatant);
                                        const currentLp = sessionStats?.lp ?? combatant.currentLp ?? 0;
                                        const maxLp = sessionStats?.maxLp ?? combatant.maxLp ?? 1;
                                        const lpPercent = (currentLp / maxLp) * 100;
                                        
                                        return (
                                            <ListItem
                                                key={combatant.id}
                                                button
                                                selected={isSelected}
                                                onClick={() => setTargetId(combatant.id)}
                                                sx={{
                                                    bgcolor: isSelected 
                                                        ? (actionType === 'damage' ? red[50] : green[50])
                                                        : 'transparent'
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar 
                                                        src={combatant.avatar}
                                                        sx={{ 
                                                            width: 32, 
                                                            height: 32,
                                                            bgcolor: combatant.type === 'creature' ? orange[500] : blue[500]
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
                                                            <FavoriteIcon sx={{ fontSize: 14, color: red[400] }} />
                                                            <Typography variant="caption">
                                                                {currentLp}/{maxLp}
                                                            </Typography>
                                                            <Box 
                                                                sx={{ 
                                                                    width: 50, 
                                                                    height: 6, 
                                                                    bgcolor: 'grey.300',
                                                                    borderRadius: 1,
                                                                    overflow: 'hidden'
                                                                }}
                                                            >
                                                                <Box 
                                                                    sx={{ 
                                                                        width: `${lpPercent}%`, 
                                                                        height: '100%',
                                                                        bgcolor: lpPercent > 50 
                                                                            ? green[500] 
                                                                            : lpPercent > 25 
                                                                                ? orange[500] 
                                                                                : red[500],
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
                                bgcolor: isDarkMode 
                                    ? (actionType === 'damage' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(76, 175, 80, 0.15)')
                                    : (actionType === 'damage' ? red[50] : green[50]),
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: actionType === 'damage' ? red[200] : green[200]
                            }}>
                                <Typography variant="body2">
                                    {actionType === 'damage' ? '💥' : '💚'}{' '}
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
                            bgcolor: actionType === 'damage' ? red[600] : green[600],
                            '&:hover': { 
                                bgcolor: actionType === 'damage' ? red[700] : green[700] 
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
