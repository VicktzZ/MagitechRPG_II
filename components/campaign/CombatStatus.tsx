'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Avatar,
    LinearProgress,
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Collapse,
    IconButton,
    Tooltip,
    Divider,
    TextField,
    useTheme
} from '@mui/material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CasinoIcon from '@mui/icons-material/Casino';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { red, green, blue, orange, grey, yellow } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import { useSession } from 'next-auth/react';
import type { Combat } from '@models';

interface CombatStatusProps {
    campaignId: string;
    combat: Combat | null;
    userCharsheetId?: string;
    onActionComplete?: () => void;
}

export default function CombatStatus({ 
    campaignId, 
    combat, 
    userCharsheetId,
    onActionComplete 
}: CombatStatusProps) {
    const { enqueueSnackbar } = useSnackbar();
    const { data: session } = useSession();
    const { campaign, charsheets } = useCampaignContext();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    
    const [ expanded, setExpanded ] = useState(true);
    const [ initiativeDialogOpen, setInitiativeDialogOpen ] = useState(false);
    const [ isRolling, setIsRolling ] = useState(false);
    const [ actionDialogOpen, setActionDialogOpen ] = useState(false);
    const [ actionType, setActionType ] = useState<'damage' | 'heal'>('damage');
    const [ targetId, setTargetId ] = useState<string>('');
    const [ actionValue, setActionValue ] = useState<number>(0);
    const [ isApplying, setIsApplying ] = useState(false);
    const [ turnNotificationShown, setTurnNotificationShown ] = useState(false);
    const [ isPassingTurn, setIsPassingTurn ] = useState(false);

    const isGM = campaign?.admin?.includes(session?.user?.id || '');

    const userCombatant = combat?.combatants?.find(c => {
        if (c.type !== 'player') return false;
        return c.id === userCharsheetId || 
                c.odacId === session?.user?.id ||
                c.odacId === userCharsheetId;
    });

    const initiativeFormula = useMemo(() => {
        if (!userCombatant || !charsheets?.length) return null;

        const charsheet = charsheets.find((c: any) => 
            c.id === userCombatant.id || c.id === userCombatant.odacId
        );

        if (!charsheet) return null;

        const agiExpertise = (charsheet as any).expertises?.Agilidade;
        const expertiseValue = Number(agiExpertise?.value ?? 0) || 0;

        const defaultAttrKey = (agiExpertise?.defaultAttribute ?? 'des') as string;
        let modsValue = Number((charsheet as any).mods?.attributes?.[defaultAttrKey] ?? 1);
        if (!Number.isFinite(modsValue) || modsValue < 1) modsValue = 1;

        return { numDice: modsValue, expertiseValue };
    }, [ charsheets, userCombatant ]);

    // Encontra o combatente do usuário atual - busca por charsheetId, odacId ou session user id
  
    const isUserTurn = combat?.isActive && 
        combat.phase === 'ACTION' && 
        combat.combatants?.[combat.currentTurnIndex]?.id === userCombatant?.id;
    const currentCombatant = combat?.combatants?.[combat?.currentTurnIndex || 0];

    // Verifica se o usuário precisa rolar iniciativa (não é GM e não rolou ainda)
    const needsToRollInitiative = combat?.isActive && 
        combat.phase === 'INITIATIVE' && 
        userCombatant && 
        userCombatant.initiativeRoll === 0 &&
        !isGM;
        
    // Função para obter LP/MP da charsheet para jogadores
    const getPlayerStats = useCallback((combatantId: string, odacId?: string) => {
        const charsheet = charsheets?.find((c: any) => 
            c.id === combatantId || c.id === odacId
        );
        
        if (charsheet?.stats) {
            return {
                lp: charsheet.stats.lp ?? 0,
                maxLp: charsheet.stats.maxLp ?? 0,
                mp: charsheet.stats.mp ?? 0,
                maxMp: charsheet.stats.maxMp ?? 0
            };
        }
        
        return null;
    }, [ charsheets ]);

    // Notifica quando é o turno do jogador
    useEffect(() => {
        if (isUserTurn && !turnNotificationShown && !isGM) {
            enqueueSnackbar('É sua vez de agir!', { 
                variant: 'info',
                autoHideDuration: 5000,
                anchorOrigin: { vertical: 'top', horizontal: 'center' }
            });
            setTurnNotificationShown(true);
        } else if (!isUserTurn) {
            setTurnNotificationShown(false);
        }
    }, [ isUserTurn, turnNotificationShown, isGM, enqueueSnackbar ]);

    // Abre dialog de iniciativa automaticamente se precisar rolar
    useEffect(() => {
        if (needsToRollInitiative && !initiativeDialogOpen) {
            console.log('[CombatStatus] Abrindo dialog de iniciativa automaticamente');
            setInitiativeDialogOpen(true);
        }
    }, [ needsToRollInitiative, initiativeDialogOpen ]);

    // Garante que o dialog reabra se fechou acidentalmente mas ainda precisa rolar
    useEffect(() => {
        if (needsToRollInitiative && !initiativeDialogOpen) {
            const timer = setTimeout(() => {
                if (needsToRollInitiative) {
                    console.log('[CombatStatus] Reabrindo dialog de iniciativa (timeout)');
                    setInitiativeDialogOpen(true);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [ needsToRollInitiative, initiativeDialogOpen ]);

    // Rolar iniciativa (teste de Agilidade)
    const handleRollInitiative = useCallback(async () => {
        if (!userCombatant) return;

        setIsRolling(true);
        try {
            const response = await fetch(`/api/campaign/${campaignId}/combat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'roll_initiative',
                    combatantId: userCombatant.id
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao rolar iniciativa');
            }

            enqueueSnackbar('Iniciativa rolada! Veja o chat para o resultado.', { variant: 'success' });
            
            setInitiativeDialogOpen(false);
            onActionComplete?.();
        } catch (error) {
            console.error('Erro ao rolar iniciativa:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao rolar iniciativa', { variant: 'error' });
        } finally {
            setIsRolling(false);
        }
    }, [ campaignId, userCombatant, enqueueSnackbar, onActionComplete ]);

    // Passar turno
    const handlePassTurn = useCallback(async () => {
        setIsPassingTurn(true);
        try {
            const response = await fetch(`/api/campaign/${campaignId}/combat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'next_turn'
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao passar turno');
            }

            enqueueSnackbar('Turno passado!', { variant: 'success' });
            onActionComplete?.();
        } catch (error) {
            console.error('Erro ao passar turno:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao passar turno', { variant: 'error' });
        } finally {
            setIsPassingTurn(false);
        }
    }, [ campaignId, enqueueSnackbar, onActionComplete ]);

    // Aplicar dano/cura
    const handleApplyAction = useCallback(async () => {
        if (!targetId || actionValue <= 0) {
            enqueueSnackbar('Selecione um alvo e um valor válido', { variant: 'warning' });
            return;
        }

        setIsApplying(true);
        try {
            // Se for GM, usa o combatente do turno atual; se for jogador, usa o próprio combatente
            const actorId = isGM && currentCombatant 
                ? currentCombatant.id 
                : userCombatant?.id;

            const response = await fetch(`/api/campaign/${campaignId}/combat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: actionType === 'damage' ? 'apply_damage' : 'apply_heal',
                    combatantId: actorId,
                    targetId,
                    value: actionValue
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao aplicar ação');
            }

            enqueueSnackbar(
                actionType === 'damage' 
                    ? `${actionValue} de dano aplicado!` 
                    : `${actionValue} de cura aplicada!`, 
                { variant: 'success' }
            );
            
            setActionDialogOpen(false);
            setTargetId('');
            setActionValue(0);
            onActionComplete?.();
        } catch (error) {
            console.error('Erro ao aplicar ação:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao aplicar ação', { variant: 'error' });
        } finally {
            setIsApplying(false);
        }
    }, [ campaignId, targetId, actionValue, actionType, isGM, currentCombatant, userCombatant, enqueueSnackbar, onActionComplete ]);

    // Não mostra nada se não houver combate ativo
    if (!combat?.isActive) return null;

    const showEnemyLp = combat.showEnemyLp || isGM;

    return (
        <>
            <Paper 
                elevation={3}
                sx={{
                    position: 'fixed',
                    bottom: 80,
                    left: 16,
                    width: 340,
                    maxHeight: expanded ? 450 : 56,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                    zIndex: 1200,
                    border: '2px solid',
                    borderColor: red[500],
                    bgcolor: isDarkMode ? 'background.paper' : 'background.default'
                }}
            >
                {/* Header */}
                <Box 
                    sx={{ 
                        p: 1.5, 
                        bgcolor: red[600], 
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer'
                    }}
                    onClick={() => setExpanded(!expanded)}
                >
                    <SportsKabaddiIcon />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
                        Combate - Round {combat.round}
                    </Typography>
                    <Chip 
                        label={combat.phase === 'INITIATIVE' ? 'Iniciativa' : 'Ação'}
                        size="small"
                        sx={{ 
                            bgcolor: combat.phase === 'INITIATIVE' ? yellow[700] : green[600],
                            color: 'white',
                            fontWeight: 600
                        }}
                    />
                    <IconButton size="small" sx={{ color: 'white' }}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ p: 1.5, maxHeight: 380, overflow: 'auto' }}>
                        {/* Turno Atual */}
                        {combat.phase === 'ACTION' && currentCombatant && (
                            <Alert 
                                severity={isUserTurn ? 'warning' : 'info'}
                                sx={{ mb: 1.5, py: 0.5 }}
                                icon={isUserTurn ? <SportsKabaddiIcon /> : undefined}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {isUserTurn 
                                        ? '🎯 É sua vez de agir!' 
                                        : `Vez de ${currentCombatant.name}`
                                    }
                                </Typography>
                            </Alert>
                        )}

                        {/* Fase de Iniciativa - Alerta para rolar */}
                        {needsToRollInitiative && (
                            <Alert severity="warning" sx={{ mb: 1.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Role seu teste de Agilidade!
                                </Typography>
                                <Button 
                                    size="small" 
                                    variant="contained"
                                    startIcon={<CasinoIcon />}
                                    onClick={() => setInitiativeDialogOpen(true)}
                                    sx={{ mt: 1, bgcolor: orange[600] }}
                                >
                                    Rolar Iniciativa
                                </Button>
                            </Alert>
                        )}

                        {/* Botões de Ação (só aparecem no turno do jogador) */}
                        {isUserTurn && (
                            <Box sx={{ mb: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<WhatshotIcon />}
                                    onClick={() => {
                                        setActionType('damage');
                                        setActionDialogOpen(true);
                                    }}
                                    sx={{ flex: 1, bgcolor: red[600], minWidth: 80 }}
                                >
                                    Dano
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<LocalHospitalIcon />}
                                    onClick={() => {
                                        setActionType('heal');
                                        setActionDialogOpen(true);
                                    }}
                                    sx={{ flex: 1, bgcolor: green[600], minWidth: 80 }}
                                >
                                    Cura
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<SkipNextIcon />}
                                    onClick={handlePassTurn}
                                    disabled={isPassingTurn}
                                    sx={{ flex: 1, minWidth: 100 }}
                                >
                                    {isPassingTurn ? 'Passando...' : 'Passar Turno'}
                                </Button>
                            </Box>
                        )}

                        <Divider sx={{ my: 1 }} />

                        {/* Lista de Combatentes */}
                        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                            Ordem de Combate:
                        </Typography>
                        <Stack spacing={0.5}>
                            {combat.combatants.map((combatant, index) => {
                                const isCurrentTurn = index === combat.currentTurnIndex && combat.phase === 'ACTION';
                                const isPlayer = combatant.type === 'player';
                                const isUser = combatant.id === userCharsheetId;
                                
                                // Obter stats da sessão para jogadores, do combatente para criaturas
                                const playerStats = isPlayer ? getPlayerStats(combatant.id, combatant.odacId) : null;
                                const currentLp = playerStats?.lp ?? combatant.currentLp ?? 0;
                                const maxLp = playerStats?.maxLp ?? combatant.maxLp ?? 1;
                                const currentMp = playerStats?.mp ?? combatant.currentMp ?? 0;
                                const maxMp = playerStats?.maxMp ?? combatant.maxMp ?? 0;
                                
                                const lpPercent = (currentLp / maxLp) * 100;
                                const mpPercent = maxMp > 0 ? (currentMp / maxMp) * 100 : 0;
                                const showLp = isPlayer || showEnemyLp;

                                return (
                                    <Paper
                                        key={combatant.id}
                                        elevation={isCurrentTurn ? 3 : 1}
                                        sx={{
                                            p: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            bgcolor: isCurrentTurn 
                                                ? (isDarkMode 
                                                    ? (isUser ? 'rgba(255, 193, 7, 0.2)' : 'rgba(33, 150, 243, 0.2)')
                                                    : (isUser ? yellow[100] : blue[50]))
                                                : combatant.hasActed 
                                                    ? (isDarkMode ? 'rgba(158, 158, 158, 0.1)' : grey[100])
                                                    : (isDarkMode ? 'background.paper' : 'white'),
                                            border: isCurrentTurn ? '2px solid' : '1px solid',
                                            borderColor: isCurrentTurn 
                                                ? (isUser ? yellow[600] : blue[400])
                                                : (isDarkMode ? 'rgba(255, 255, 255, 0.12)' : grey[300]),
                                            opacity: combatant.hasActed && !isCurrentTurn ? 0.6 : 1
                                        }}
                                    >
                                        <Avatar
                                            src={combatant.avatar}
                                            sx={{ 
                                                width: 32, 
                                                height: 32,
                                                bgcolor: isPlayer ? blue[500] : orange[500]
                                            }}
                                        >
                                            {isPlayer 
                                                ? <PersonIcon fontSize="small" />
                                                : <PetsIcon fontSize="small" />
                                            }
                                        </Avatar>
                                        
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: isCurrentTurn ? 700 : 500,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    color: 'text.primary'
                                                }}
                                            >
                                                {combatant.name}
                                                {isUser && ' (você)'}
                                            </Typography>
                                            
                                            {/* Barras de LP e MP */}
                                            {showLp && (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.5 }}>
                                                    {/* LP */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <FavoriteIcon sx={{ fontSize: 10, color: red[400] }} />
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={lpPercent}
                                                            sx={{
                                                                flex: 1,
                                                                height: 5,
                                                                borderRadius: 1,
                                                                bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : grey[300],
                                                                '& .MuiLinearProgress-bar': {
                                                                    bgcolor: lpPercent > 50 
                                                                        ? green[500] 
                                                                        : lpPercent > 25 
                                                                            ? orange[500] 
                                                                            : red[500]
                                                                }
                                                            }}
                                                        />
                                                        <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'right', fontSize: '0.65rem', color: 'text.secondary' }}>
                                                            {currentLp}/{maxLp}
                                                        </Typography>
                                                    </Box>
                                                    {/* MP (apenas se tiver) */}
                                                    {maxMp > 0 && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <BoltIcon sx={{ fontSize: 10, color: blue[400] }} />
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={mpPercent}
                                                                sx={{
                                                                    flex: 1,
                                                                    height: 5,
                                                                    borderRadius: 1,
                                                                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : grey[300],
                                                                    '& .MuiLinearProgress-bar': {
                                                                        bgcolor: blue[500]
                                                                    }
                                                                }}
                                                            />
                                                            <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'right', fontSize: '0.65rem', color: 'text.secondary' }}>
                                                                {currentMp}/{maxMp}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Iniciativa */}
                                        {combat.phase === 'ACTION' && combatant.initiativeTotal > 0 && (
                                            <Tooltip title="Iniciativa">
                                                <Chip 
                                                    label={combatant.initiativeTotal}
                                                    size="small"
                                                    sx={{ 
                                                        height: 20,
                                                        fontSize: '0.7rem',
                                                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : grey[200]
                                                    }}
                                                />
                                            </Tooltip>
                                        )}

                                        {/* Status de ação */}
                                        {combat.phase === 'ACTION' && (
                                            <Chip
                                                label={combatant.hasActed ? '✓' : '○'}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    width: 20,
                                                    fontSize: '0.7rem',
                                                    bgcolor: combatant.hasActed 
                                                        ? (isDarkMode ? 'rgba(76, 175, 80, 0.3)' : green[100])
                                                        : (isDarkMode ? 'rgba(255,255,255,0.1)' : grey[100])
                                                }}
                                            />
                                        )}
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </Box>
                </Collapse>
            </Paper>

            {/* Dialog de Iniciativa */}
            <Dialog open={initiativeDialogOpen} onClose={() => !isRolling && setInitiativeDialogOpen(false)}>
                <DialogTitle sx={{ 
                    bgcolor: isDarkMode ? 'rgba(255, 152, 0, 0.15)' : orange[50], 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1 
                }}>
                    <CasinoIcon sx={{ color: orange[600] }} />
                    Teste de Iniciativa
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        O combate começou! Role seu teste de <strong>Agilidade</strong> para determinar a ordem de ação.
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            {initiativeFormula
                                ? (
                                    <>
                                        Sua rolagem: <strong>{initiativeFormula.numDice}d20 + {initiativeFormula.expertiseValue}</strong> (Agilidade)
                                    </>
                                ) : (
                                    <>
                                        Sua rolagem considera seus modificadores de Destreza e sua perícia de <strong>Agilidade</strong>.
                                    </>
                                )}
                        </Typography>
                    </Alert>
                    <Typography variant="body2" color="text.secondary">
                        Em caso de empate, vence quem tiver maior Destreza (DES).
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleRollInitiative}
                        disabled={isRolling}
                        startIcon={<CasinoIcon />}
                        sx={{ bgcolor: orange[600] }}
                    >
                        {isRolling ? 'Rolando...' : 'Rolar Iniciativa'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de Ação (Dano/Cura) */}
            <Dialog 
                open={actionDialogOpen} 
                onClose={() => !isApplying && setActionDialogOpen(false)} 
                maxWidth="xs" 
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: isDarkMode ? 'background.paper' : undefined
                    }
                }}
            >
                <DialogTitle sx={{ 
                    bgcolor: isDarkMode 
                        ? (actionType === 'damage' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)')
                        : (actionType === 'damage' ? red[50] : green[50]),
                    color: isDarkMode ? 'text.primary' : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    {actionType === 'damage' 
                        ? <WhatshotIcon sx={{ color: isDarkMode ? red[400] : red[600] }} />
                        : <LocalHospitalIcon sx={{ color: isDarkMode ? green[400] : green[600] }} />
                    }
                    {actionType === 'damage' ? 'Aplicar Dano' : 'Aplicar Cura'}
                </DialogTitle>
                <DialogContent sx={{ mt: 2, bgcolor: isDarkMode ? 'background.paper' : undefined }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Valor */}
                        <TextField
                            label="Valor"
                            type="number"
                            value={actionValue}
                            onChange={(e) => setActionValue(Math.max(0, Number(e.target.value)))}
                            inputProps={{ min: 0 }}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : undefined
                                }
                            }}
                        />

                        {/* Seleção de Alvo */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Selecione o alvo:
                            </Typography>
                            <Stack spacing={0.5} sx={{ maxHeight: 200, overflow: 'auto' }}>
                                {combat?.combatants.map(combatant => {
                                    const isSelected = targetId === combatant.id;
                                    const isPlayer = combatant.type === 'player';
                                    const showLpTarget = isPlayer || showEnemyLp;
                                    
                                    const playerStats = isPlayer ? getPlayerStats(combatant.id, combatant.odacId) : null;
                                    const currentLp = playerStats?.lp ?? combatant.currentLp ?? 0;
                                    const maxLp = playerStats?.maxLp ?? combatant.maxLp ?? 1;
                                    
                                    return (
                                        <Paper
                                            key={combatant.id}
                                            onClick={() => setTargetId(combatant.id)}
                                            sx={{
                                                p: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                cursor: 'pointer',
                                                bgcolor: isSelected 
                                                    ? (isDarkMode
                                                        ? (actionType === 'damage' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)')
                                                        : (actionType === 'damage' ? red[50] : green[50]))
                                                    : 'background.paper',
                                                border: '2px solid',
                                                borderColor: isSelected
                                                    ? (actionType === 'damage' ? red[400] : green[400])
                                                    : (isDarkMode ? 'rgba(255,255,255,0.12)' : grey[200]),
                                                '&:hover': {
                                                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : grey[50]
                                                }
                                            }}
                                        >
                                            <Avatar
                                                src={combatant.avatar}
                                                sx={{ width: 28, height: 28, bgcolor: isPlayer ? blue[500] : orange[500] }}
                                            >
                                                {isPlayer ? <PersonIcon fontSize="small" /> : <PetsIcon fontSize="small" />}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ flex: 1 }}>
                                                {combatant.name}
                                            </Typography>
                                            {showLpTarget && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {currentLp}/{maxLp}
                                                </Typography>
                                            )}
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    p: 2, 
                    bgcolor: isDarkMode ? 'background.paper' : undefined 
                }}>
                    <Button 
                        onClick={() => setActionDialogOpen(false)} 
                        disabled={isApplying}
                        sx={{ color: isDarkMode ? 'text.secondary' : undefined }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleApplyAction}
                        disabled={!targetId || actionValue <= 0 || isApplying}
                        sx={{ 
                            bgcolor: actionType === 'damage' 
                                ? (isDarkMode ? red[700] : red[600]) 
                                : (isDarkMode ? green[700] : green[600]),
                            '&:hover': {
                                bgcolor: actionType === 'damage'
                                    ? (isDarkMode ? red[600] : red[700])
                                    : (isDarkMode ? green[600] : green[700])
                            }
                        }}
                    >
                        {isApplying ? 'Aplicando...' : 'Aplicar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
