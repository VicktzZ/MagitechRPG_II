'use client';

import { useState, useEffect, useCallback } from 'react';
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
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import CasinoIcon from '@mui/icons-material/Casino';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import RefreshIcon from '@mui/icons-material/Refresh';
import { red, green, blue, orange, grey } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import { useChannel } from '@contexts/channelContext';
import { PusherEvent } from '@enums';
import type { PlayerInfo } from './types';
import type { Creature } from '@models';

interface CombatDialogProps {
    open: boolean;
    onClose: () => void;
    campaignId: string;
    campaignCode?: string;
    players: PlayerInfo[];
    creatures: Creature[];
    charsheets?: any[];
    existingCombat?: any;
    onCombatUpdate?: () => void;
}

interface Combatant {
    id: string;
    name: string;
    type: 'player' | 'creature';
    initiativeRoll: number;
    initiativeBonus: number;
    initiativeTotal: number;
    hasActed: boolean;
    odacId?: string;
    avatar?: string;
    currentLp?: number;
    maxLp?: number;
    currentMp?: number;
    maxMp?: number;
}

interface Combat {
    isActive: boolean;
    phase: 'INITIATIVE' | 'ACTION' | 'ENDED';
    round: number;
    currentTurnIndex: number;
    combatants: Combatant[];
    logs: any[];
}

export default function CombatDialog({ 
    open, 
    onClose, 
    campaignId,
    campaignCode,
    players, 
    creatures,
    charsheets = [],
    existingCombat,
    onCombatUpdate
}: CombatDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const { channel } = useChannel();
    const isDarkMode = theme.palette.mode === 'dark';
    const [ isLoading, setIsLoading ] = useState(false);
    const [ combat, setCombat ] = useState<Combat | null>(existingCombat || null);
    
    // Setup do combate - seleção de participantes
    const [ selectedPlayers, setSelectedPlayers ] = useState<string[]>([]);
    const [ selectedCreatures, setSelectedCreatures ] = useState<string[]>([]);
    const [ creatureQuantities, setCreatureQuantities ] = useState<Record<string, number>>({});
    const [ initiativeValue, setInitiativeValue ] = useState<number>(0);
    const [ selectedCombatantForInit, setSelectedCombatantForInit ] = useState<string | null>(null);
    const [ showEnemyLp, setShowEnemyLp ] = useState(false);

    // Função para obter stats do charsheet.session (a fonte correta)
    const getPlayerSessionStats = useCallback((combatant: Combatant) => {
        if (combatant.type !== 'player') return null;
        
        // Busca o charsheet do combatente
        const charsheet = charsheets.find((c: any) => 
            c.id === combatant.id || c.id === combatant.odacId
        );
        
        if (!charsheet) return null;
        
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
        
        // Fallback para stats do combatente
        return null;
    }, [ charsheets, campaignCode ]);

    // Carrega combate existente
    useEffect(() => {
        if (open && campaignId) {
            fetchCombat();
        }
    }, [ open, campaignId ]);

    // Escuta atualizações de combate em tempo real via Pusher
    useEffect(() => {
        if (!channel || !open) return;

        const handleCombatUpdated = (data: { combat: Combat, action: string }) => {
            console.log('[CombatDialog] Combate atualizado via Pusher:', data.action, data.combat);
            if (data.combat) {
                setCombat(data.combat);
            }
        };

        channel.bind(PusherEvent.COMBAT_UPDATED, handleCombatUpdated);

        return () => {
            channel.unbind(PusherEvent.COMBAT_UPDATED, handleCombatUpdated);
        };
    }, [ channel, open ]);

    // Fallback: Polling para garantir atualização em tempo real
    useEffect(() => {
        if (!open || !combat?.isActive) return;

        // Polling a cada 2 segundos para manter o modal atualizado
        const interval = setInterval(() => {
            fetchCombat();
        }, 2000);

        return () => clearInterval(interval);
    }, [ open, combat?.isActive ]);

    const fetchCombat = async () => {
        try {
            const response = await fetch(`/api/campaign/${campaignId}/combat`);
            const data = await response.json();
            if (data.success && data.combat) {
                setCombat(data.combat);
            }
        } catch (error) {
            console.error('Erro ao buscar combate:', error);
        }
    };

    const executeCombatAction = useCallback(async (action: string, payload: any = {}) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/campaign/${campaignId}/combat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...payload })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao executar ação');
            }

            setCombat(result.combat);
            enqueueSnackbar(result.message, { variant: 'success' });
            onCombatUpdate?.();

            return result;
        } catch (error) {
            console.error('Erro na ação de combate:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao executar ação', { variant: 'error' });
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [ campaignId, enqueueSnackbar, onCombatUpdate ]);

    const handleStartCombat = async () => {
        if (selectedPlayers.length === 0 && selectedCreatures.length === 0) {
            enqueueSnackbar('Selecione ao menos um combatente', { variant: 'warning' });
            return;
        }

        const playersData = selectedPlayers.map(id => {
            const player = players.find(p => p.id === id);
            return {
                odacId: player?.id,
                charsheetId: player?.charsheet?.id,
                name: player?.charsheet?.name || player?.name || 'Jogador',
                agility: (player?.charsheet as any)?.attributes?.agi || 0,
                dexterity: (player?.charsheet as any)?.attributes?.des || 0,
                avatar: player?.avatar,
                lp: player?.charsheet?.stats?.lp || 0,
                maxLp: player?.charsheet?.stats?.maxLp || 0,
                mp: player?.charsheet?.stats?.mp || 0,
                maxMp: player?.charsheet?.stats?.maxMp || 0
            };
        }).filter(p => p.charsheetId);

        const creaturesData = selectedCreatures.flatMap(id => {
            const creature = creatures.find(c => c.id === id);
            if (!creature) return [];

            const count = Math.max(1, creatureQuantities[id] ?? 1);

            return Array.from({ length: count }, (_, index) => ({
                id: `${creature.id}-${index + 1}`,
                name: count > 1 ? `${creature.name} (${index + 1})` : (creature.name || 'Criatura'),
                agility: (creature.attributes as any)?.agi ?? creature.attributes?.des ?? 0,
                dexterity: creature.attributes?.des ?? 0,
                lp: creature.stats?.lp ?? 0,
                maxLp: creature.stats?.maxLp ?? creature.stats?.lp ?? 0,
                mp: creature.stats?.mp ?? 0,
                maxMp: creature.stats?.maxMp ?? creature.stats?.mp ?? 0
            }));
        });

        await executeCombatAction('start', { 
            players: playersData, 
            creatures: creaturesData,
            showEnemyLp 
        });
    };

    const handleEndCombat = async () => {
        await executeCombatAction('end');
    };

    const handleRollInitiative = async (combatantId: string) => {
        await executeCombatAction('roll_initiative', { 
            combatantId,
            value: initiativeValue > 0 ? initiativeValue : undefined,
            advantageType: 'normal'
        });
        setInitiativeValue(0);
        setSelectedCombatantForInit(null);
    };

    const handleSetInitiativeOrder = async () => {
        await executeCombatAction('set_initiative');
    };

    const handleNextTurn = async () => {
        await executeCombatAction('next_turn');
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const togglePlayer = (playerId: string) => {
        setSelectedPlayers(prev => 
            prev.includes(playerId) 
                ? prev.filter(id => id !== playerId)
                : [ ...prev, playerId ]
        );
    };

    const toggleCreature = (creatureId: string) => {
        setSelectedCreatures(prev => {
            const isSelected = prev.includes(creatureId);
            if (isSelected) {
                return prev.filter(id => id !== creatureId);
            }

            setCreatureQuantities(prevQty => ({
                ...prevQty,
                [creatureId]: prevQty[creatureId] || 1
            }));

            return [ ...prev, creatureId ];
        });
    };

    const handleCreatureQuantityChange = (creatureId: string, value: number) => {
        const safeValue = Number.isNaN(value) ? 1 : Math.max(1, value);

        setCreatureQuantities(prev => ({
            ...prev,
            [creatureId]: safeValue
        }));

        setSelectedCreatures(prev =>
            prev.includes(creatureId) ? prev : [ ...prev, creatureId ]
        );
    };

    // UI de configuração (antes de iniciar combate)
    const renderSetupUI = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
                Selecione os participantes do combate:
            </Typography>

            {/* Jogadores */}
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" /> Jogadores
                </Typography>
                <Box sx={{ maxHeight: 150, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <List dense>
                        {players.filter(p => p.charsheet).map(player => (
                            <ListItem
                                key={player.id}
                                button
                                onClick={() => togglePlayer(player.id)}
                            >
                                <Checkbox checked={selectedPlayers.includes(player.id)} size="small" />
                                <ListItemAvatar>
                                    <Avatar src={player.avatar} sx={{ width: 28, height: 28 }} />
                                </ListItemAvatar>
                                <ListItemText 
                                    primary={player.charsheet?.name || player.name}
                                    secondary={`AGI: ${player.charsheet?.stats?.agi || 0} | LP: ${player.charsheet?.stats?.lp || 0}/${player.charsheet?.stats?.maxLp || 0}`}
                                />
                            </ListItem>
                        ))}
                        {players.filter(p => p.charsheet).length === 0 && (
                            <ListItem>
                                <ListItemText secondary="Nenhum jogador com ficha disponível" />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Box>

            {/* Criaturas */}
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PetsIcon fontSize="small" /> Criaturas
                </Typography>
                <Box sx={{ maxHeight: 150, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <List dense>
                        {creatures.map(creature => {
                            const isSelected = selectedCreatures.includes(creature.id!);
                            const quantity = creatureQuantities[creature.id!] ?? 1;

                            return (
                                <ListItem
                                    key={creature.id}
                                    secondaryAction={
                                        <TextField
                                            type="number"
                                            label="Qtd."
                                            size="small"
                                            value={quantity}
                                            onChange={(e) => handleCreatureQuantityChange(
                                                creature.id!,
                                                parseInt(e.target.value, 10)
                                            )}
                                            inputProps={{ min: 1, max: 99 }}
                                            sx={{ width: 80 }}
                                            disabled={!isSelected}
                                        />
                                    }
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        size="small"
                                        onChange={() => toggleCreature(creature.id!)}
                                    />
                                    <ListItemAvatar>
                                        <Avatar sx={{ width: 28, height: 28, bgcolor: red[500] }}>
                                            <PetsIcon fontSize="small" />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={creature.name}
                                        secondary={`AGI: ${creature.expertises?.Agilidade.value ?? 0} | LP: ${creature.stats?.lp ?? 0}`}
                                    />
                                </ListItem>
                            );
                        })}
                        {creatures.length === 0 && (
                            <ListItem>
                                <ListItemText secondary="Nenhuma criatura customizada disponível" />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Box>

            {/* Opções de Combate */}
            <Divider />
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Opções:
                </Typography>
                <ListItem 
                    button 
                    onClick={() => setShowEnemyLp(!showEnemyLp)}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                    <Checkbox checked={showEnemyLp} size="small" />
                    <ListItemText 
                        primary="Mostrar LP dos inimigos"
                        secondary="Os jogadores poderão ver a vida das criaturas"
                    />
                </ListItem>
            </Box>
        </Box>
    );

    // UI de combate ativo
    const renderCombatUI = () => {
        if (!combat) return null;

        const currentCombatant = combat.combatants[combat.currentTurnIndex];
        const pendingInitiative = combat.combatants.filter(c => c.initiativeRoll === 0);
        const allRolledInitiative = pendingInitiative.length === 0;

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Header do combate */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    bgcolor: isDarkMode 
                        ? (combat.phase === 'INITIATIVE' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(33, 150, 243, 0.15)')
                        : (combat.phase === 'INITIATIVE' ? orange[50] : blue[50]),
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isDarkMode
                        ? (combat.phase === 'INITIATIVE' ? orange[800] : blue[800])
                        : (combat.phase === 'INITIATIVE' ? orange[200] : blue[200])
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                Round {combat.round}
                            </Typography>
                            <Chip 
                                label={combat.phase === 'INITIATIVE' ? '⚡ Fase de Iniciativa' : '⚔️ Fase de Ação'}
                                size="small"
                                sx={{ 
                                    bgcolor: combat.phase === 'INITIATIVE' ? orange[500] : blue[500],
                                    color: 'white',
                                    fontWeight: 600
                                }}
                            />
                        </Box>
                        <Tooltip title="Atualizar">
                            <IconButton size="small" onClick={fetchCombat}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {combat.phase === 'ACTION' && currentCombatant && (
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">
                                Vez de:
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {currentCombatant.name}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Lista de combatentes */}
                <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Combatentes ({combat.combatants.length})
                    </Typography>
                    <Box sx={{ maxHeight: 250, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <List dense>
                            {combat.combatants.map((combatant, index) => {
                                const isCurrentTurn = combat.phase === 'ACTION' && index === combat.currentTurnIndex;
                                const needsInitiative = combat.phase === 'INITIATIVE' && combatant.initiativeRoll === 0;
                                
                                // Obtém stats da sessão da charsheet para jogadores
                                const sessionStats = combatant.type === 'player' ? getPlayerSessionStats(combatant) : null;
                                const currentLp = sessionStats?.lp ?? combatant.currentLp ?? 0;
                                const maxLp = sessionStats?.maxLp ?? combatant.maxLp ?? 1;
                                const lpPercent = maxLp > 0 ? (currentLp / maxLp) * 100 : 0;

                                return (
                                    <ListItem
                                        key={combatant.id}
                                        sx={{
                                            bgcolor: isCurrentTurn ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                                            borderLeft: isCurrentTurn ? '4px solid' : 'none',
                                            borderColor: blue[500]
                                        }}
                                        secondaryAction={
                                            combat.phase === 'INITIATIVE' ? (
                                                needsInitiative ? (
                                                    // GM pode forçar rolagem para qualquer combatente
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {combatant.type === 'player' && (
                                                            <>
                                                                <CircularProgress size={14} />
                                                                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                                                    Aguardando
                                                                </Typography>
                                                            </>
                                                        )}
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            placeholder="Dado"
                                                            value={selectedCombatantForInit === combatant.id ? initiativeValue : ''}
                                                            onChange={(e) => {
                                                                setSelectedCombatantForInit(combatant.id);
                                                                setInitiativeValue(Number(e.target.value));
                                                            }}
                                                            sx={{ width: 60 }}
                                                            inputProps={{ min: 1, max: 20 }}
                                                        />
                                                        <Tooltip title={combatant.type === 'player' ? 'Forçar rolagem (se jogador não responder)' : 'Rolar Iniciativa'}>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleRollInitiative(combatant.id)}
                                                                color="primary"
                                                            >
                                                                <CasinoIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                ) : (
                                                    <Chip 
                                                        label={`${combatant.initiativeTotal}`}
                                                        size="small"
                                                        color="success"
                                                    />
                                                )
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Chip 
                                                        label={`Init: ${combatant.initiativeTotal}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    {combatant.hasActed && (
                                                        <Chip label="✓" size="small" color="success" />
                                                    )}
                                                </Box>
                                            )
                                        }
                                    >
                                        <ListItemAvatar>
                                            <Avatar 
                                                src={combatant.avatar} 
                                                sx={{ 
                                                    width: 32, 
                                                    height: 32,
                                                    bgcolor: combatant.type === 'creature' ? red[500] : blue[500]
                                                }}
                                            >
                                                {combatant.type === 'creature' ? <PetsIcon /> : combatant.name.charAt(0)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {combatant.name}
                                                    {isCurrentTurn && <Chip label="🎯" size="small" />}
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="caption" component="span">
                                                        LP: {currentLp}/{maxLp}
                                                    </Typography>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={lpPercent}
                                                        sx={{ 
                                                            width: 60, 
                                                            height: 6, 
                                                            borderRadius: 1,
                                                            bgcolor: grey[300],
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: lpPercent > 50 
                                                                    ? green[500] 
                                                                    : lpPercent > 25 
                                                                        ? orange[500] 
                                                                        : red[500]
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Box>

                {/* Logs recentes */}
                {combat.logs.length > 0 && (
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Logs recentes
                        </Typography>
                        <Box sx={{ 
                            maxHeight: 150, 
                            overflow: 'auto', 
                            p: 1.5, 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            {combat.logs.slice(-5).reverse().map((log, idx) => {
                                // Renderiza markdown simples (**bold**)
                                const renderLogText = (text: string) => {
                                    const parts = text.split(/(\*\*[^*]+\*\*)/g)
                                    return parts.map((part, i) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={i}>{part.slice(2, -2)}</strong>
                                        }
                                        if (part.includes('\n')) {
                                            return part.split('\n').map((line, j) => (
                                                <span key={`${i}-${j}`}>
                                                    {j > 0 && <br />}
                                                    {line}
                                                </span>
                                            ))
                                        }
                                        return part
                                    })
                                }
                                
                                return (
                                    <Typography 
                                        key={idx} 
                                        variant="caption" 
                                        component="div"
                                        sx={{ 
                                            mb: 1, 
                                            pb: 1, 
                                            borderBottom: idx < 4 ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                            lineHeight: 1.5,
                                            '& strong': { fontWeight: 700 }
                                        }}
                                    >
                                        {renderLogText(log.message)}
                                    </Typography>
                                )
                            })}
                        </Box>
                    </Box>
                )}

                {/* Ações do combate */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {combat.phase === 'INITIATIVE' && allRolledInitiative && (
                        <Button
                            variant="contained"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleSetInitiativeOrder}
                            disabled={isLoading}
                            sx={{ bgcolor: green[600], '&:hover': { bgcolor: green[700] } }}
                        >
                            Definir Ordem
                        </Button>
                    )}
                    {combat.phase === 'ACTION' && (
                        <Button
                            variant="contained"
                            startIcon={<SkipNextIcon />}
                            onClick={handleNextTurn}
                            disabled={isLoading}
                        >
                            Passar Turno
                        </Button>
                    )}
                </Box>
            </Box>
        );
    };

    const isSetupMode = !combat?.isActive;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SportsKabaddiIcon sx={{ color: red[500] }} />
                {isSetupMode ? 'Iniciar Combate' : `Combate em Andamento - Round ${combat?.round || 1}`}
            </DialogTitle>
            <DialogContent>
                {isLoading && <LinearProgress sx={{ mb: 2 }} />}
                {isSetupMode ? renderSetupUI() : renderCombatUI()}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose} disabled={isLoading} variant="outlined">
                    Fechar
                </Button>
                {isSetupMode ? (
                    <Button
                        onClick={handleStartCombat}
                        variant="contained"
                        disabled={isLoading || (selectedPlayers.length === 0 && selectedCreatures.length === 0)}
                        startIcon={isLoading ? <CircularProgress size={20} /> : <SportsKabaddiIcon />}
                        sx={{ bgcolor: red[600], '&:hover': { bgcolor: red[700] } }}
                    >
                        {isLoading ? 'Iniciando...' : 'Iniciar Combate'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleEndCombat}
                        variant="contained"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : <StopIcon />}
                        sx={{ bgcolor: grey[700], '&:hover': { bgcolor: grey[800] } }}
                    >
                        {isLoading ? 'Encerrando...' : 'Encerrar Combate'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
