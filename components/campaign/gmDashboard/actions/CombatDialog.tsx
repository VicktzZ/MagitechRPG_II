'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    alpha,
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
import PetsIcon from '@mui/icons-material/Pets';
import RefreshIcon from '@mui/icons-material/Refresh';
import BoltIcon from '@mui/icons-material/Bolt';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EditIcon from '@mui/icons-material/Edit';
import { color } from '@themes/tokens';
import { useSnackbar } from 'notistack';
import { useChannel } from '@contexts/channelContext';
import { useCampaignContext } from '@contexts';
import { getCreatureMpLimit, getMpLimit, isCreatureMpLimitEnforced, isMpLimitEnforced } from '@utils/mpLimit';
import { findBaseCreature } from '@utils/combatCreatureLookup';
import { PusherEvent } from '@enums';
import type { PlayerInfo } from './types';
import type { AppliedEffect, CombatLog, Creature } from '@models';
import type { Charsheet } from '@models/entities';
import EffectBadges from './EffectBadges';
import AddCombatantsPanel from './combat/AddCombatantsPanel';
import { buildStartCreatures, buildStartPlayers, type JoinPayload } from './combat/combatPayload';
import CombatHistoryPanel from './combat/CombatHistoryPanel';
import ParticipantPicker from './combat/ParticipantPicker';
import { useParticipantSelection } from './combat/useParticipantSelection';
import ApplyEffectDialog from './ApplyEffectDialog';
import { useSetMpSpent } from './useSetMpSpent';
import { campaignService } from '@services';
import { errorMessage } from '@utils/errors';
import { combatantBudget } from '@utils/combat/actionBudgets';
import type { ActionBudget } from '@utils/combat/engine/actionBudget';
import ActionPips from '../../ActionPips';
import { useToggleCombatAction } from './useToggleCombatAction';

interface CombatDialogProps {
    open: boolean;
    onClose: () => void;
    campaignId: string;
    campaignCode?: string;
    players: PlayerInfo[];
    creatures: Creature[];
    charsheets?: Charsheet[];
    existingCombat?: Combat | null;
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
    effects?: AppliedEffect[];
    /** MP gasto em magias nesta rodada (limite por turno) */
    mpSpentThisTurn?: number;
    /** Mestre liberou o limite de MP por turno até a rodada virar */
    mpLimitOverride?: boolean;
    /** Ações que restam na rodada (ver utils/combat/actionBudgets.ts) */
    actions?: ActionBudget;
}

interface Combat {
    isActive: boolean;
    phase: 'INITIATIVE' | 'ACTION' | 'ENDED';
    round: number;
    currentTurnIndex: number;
    combatants: Combatant[];
    logs: CombatLog[];
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
    const { campaign } = useCampaignContext();
    const theme = useTheme();
    const { channel } = useChannel();
    const [ isLoading, setIsLoading ] = useState(false);
    const [ combat, setCombat ] = useState<Combat | null>(existingCombat || null);
    
    // Setup do combate - seleção de participantes
    const selection = useParticipantSelection();
    const { selectedPlayers, selectedCreatures, creatureQuantities } = selection;
    const [ initiativeValue, setInitiativeValue ] = useState<number>(0);
    const [ selectedCombatantForInit, setSelectedCombatantForInit ] = useState<string | null>(null);
    const [ showEnemyLp, setShowEnemyLp ] = useState(false);

    // Aplicação de efeito
    const [ applyEffectTarget, setApplyEffectTarget ] = useState<{ id: string; name: string } | null>(null);

    // O mestre define o MP gasto na rodada de um combatente
    const { openSetMpSpent, setMpSpentDialog } = useSetMpSpent(campaignId);
    // O mestre gasta ou devolve as ações da rodada (Padrão, Bônus, Movimento, Reação)
    const { toggleAction, busy: togglingAction } = useToggleCombatAction(campaignId);

    const handleRemoveEffect = useCallback(async (combatantId: string, appliedEffectId: string) => {
        try {
            await campaignService.removeCombatEffect(campaignId, { targetId: combatantId, appliedEffectId });
            enqueueSnackbar('Efeito removido', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(errorMessage(err, 'Erro ao remover efeito'), { variant: 'error' });
        }
    }, [ campaignId, enqueueSnackbar ]);

    const handleResetMpLimit = useCallback(async (combatantId: string) => {
        try {
            await campaignService.resetMpLimit(campaignId, { combatantId });
            enqueueSnackbar('Limite de MP resetado', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(errorMessage(err, 'Erro ao resetar o limite de MP'), { variant: 'error' });
        }
    }, [ campaignId, enqueueSnackbar ]);

    const handleToggleMpLimitOverride = useCallback(async (combatantId: string, enabled: boolean) => {
        try {
            await campaignService.setCombatMpLimitOverride(campaignId, { combatantId, enabled });
            enqueueSnackbar(enabled ? 'Limite de MP liberado até a rodada virar' : 'Limite de MP restabelecido', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar(errorMessage(err, 'Erro ao atualizar o limite de MP'), { variant: 'error' });
        }
    }, [ campaignId, enqueueSnackbar ]);

    // Função para obter stats do charsheet
    const getPlayerStats = useCallback((combatant: Combatant) => {
        if (combatant.type !== 'player') return null;
        
        // Busca o charsheet do combatente
        const charsheet = charsheets.find(c => 
            c.id === combatant.id || c.id === combatant.odacId
        );
        
        if (!charsheet?.stats) return null;
        
        return {
            lp: charsheet.stats.lp ?? combatant.currentLp ?? 0,
            maxLp: charsheet.stats.maxLp ?? combatant.maxLp ?? 0,
            mp: charsheet.stats.mp ?? combatant.currentMp ?? 0,
            maxMp: charsheet.stats.maxMp ?? combatant.maxMp ?? 0
        };
    }, [ charsheets ]);

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

    const executeCombatAction = useCallback(async (action: string, payload: Record<string, unknown> = {}) => {
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

        const playersData = buildStartPlayers(players, selectedPlayers);
        const creaturesData = buildStartCreatures(creatures, selectedCreatures, creatureQuantities);

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

    // Entrada no meio do combate (ver `add_combatants` na rota): avisos do servidor aparecem como alerta
    const handleAddCombatants = useCallback(async (payload: JoinPayload): Promise<boolean> => {
        const result = await executeCombatAction('add_combatants', { join: payload });
        if (!result) return false;
        for (const warning of (result.warnings as string[] | undefined) ?? []) {
            enqueueSnackbar(warning, { variant: 'warning' });
        }
        return true;
    }, [ executeCombatAction, enqueueSnackbar ]);

    // UI de configuração (antes de iniciar combate)
    const renderSetupUI = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
                Selecione os participantes do combate:
            </Typography>

            <ParticipantPicker players={players} creatures={creatures} selection={selection} />

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
                    bgcolor: combat.phase === 'INITIATIVE' ? alpha(theme.palette.warning.main, 0.15) : alpha(theme.palette.info.main, 0.15),
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: combat.phase === 'INITIATIVE' ? 'warning.main' : 'info.main'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                Round {combat.round}
                            </Typography>
                            <Chip 
                                label={combat.phase === 'INITIATIVE' ? 'Fase de Iniciativa' : 'Fase de Ação'}
                                size="small"
                                sx={{ 
                                    bgcolor: combat.phase === 'INITIATIVE' ? 'warning.main' : 'info.main',
                                    color: combat.phase === 'INITIATIVE' ? 'warning.contrastText' : 'info.contrastText',
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

                <AddCombatantsPanel
                    players={players}
                    creatures={creatures}
                    inCombat={new Set(combat.combatants.map(c => c.id))}
                    phase={combat.phase}
                    disabled={isLoading}
                    onAdd={handleAddCombatants}
                />

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
                                
                                // Obtém stats da charsheet para jogadores
                                const playerStats = combatant.type === 'player' ? getPlayerStats(combatant) : null;
                                const currentLp = playerStats?.lp ?? combatant.currentLp ?? 0;
                                const maxLp = playerStats?.maxLp ?? combatant.maxLp ?? 1;
                                const lpPercent = maxLp > 0 ? (currentLp / maxLp) * 100 : 0;

                                // Limite de MP por turno (utils/mpLimit.ts): só jogadores de fichas comuns do modo Classic
                                const mpSheet = combatant.type === 'player'
                                    ? charsheets.find(c => c.id === combatant.id || c.id === combatant.odacId)
                                    : undefined;
                                // Criatura também tem limite: nível e Foco da criatura de origem
                                const mpCreature = combatant.type === 'creature' ? findBaseCreature(combatant.id, campaign?.custom?.creatures ?? []) : undefined;
                                const mpLimitEnforced = mpSheet !== undefined
                                    ? isMpLimitEnforced(mpSheet, campaign?.mode)
                                    : mpCreature !== undefined && isCreatureMpLimitEnforced(mpCreature, campaign?.mode);
                                const mpLimit = mpSheet ? getMpLimit(mpSheet) : mpCreature ? getCreatureMpLimit(mpCreature) : 0;
                                const mpSpent = combatant.mpSpentThisTurn ?? 0;
                                const mpReleased = Boolean(combatant.mpLimitOverride);

                                return (
                                    <ListItem
                                        key={combatant.id}
                                        sx={{
                                            bgcolor: isCurrentTurn ? alpha(theme.palette.info.main, 0.1) : 'transparent',
                                            borderLeft: isCurrentTurn ? '4px solid' : 'none',
                                            borderColor: 'info.main'
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
                                                                onClick={async () => await handleRollInitiative(combatant.id)}
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
                                                    bgcolor: combatant.type === 'creature' ? 'error.main' : 'info.main'
                                                }}
                                            >
                                                {combatant.type === 'creature' ? <PetsIcon /> : combatant.name.charAt(0)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    {combatant.name}
                                                    {isCurrentTurn && <Chip label="Em turno" size="small" color="primary" />}
                                                    <Tooltip title="Aplicar efeito">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setApplyEffectTarget({ id: combatant.id, name: combatant.name })}
                                                            sx={{ ml: 0.5 }}
                                                        >
                                                            <BoltIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {mpLimitEnforced && (
                                                        <Tooltip title="Definir o MP gasto nesta rodada (o limite não muda)">
                                                            <IconButton
                                                                size="small"
                                                                aria-label={`Definir o MP gasto de ${combatant.name}`}
                                                                onClick={() => { openSetMpSpent({ id: combatant.id, name: combatant.name, spent: mpSpent, limit: mpLimit }); }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {mpLimitEnforced && (
                                                        <Tooltip title="Resetar o MP gasto nesta rodada (limite de MP por turno)">
                                                            <IconButton
                                                                size="small"
                                                                aria-label={`Resetar o limite de MP de ${combatant.name}`}
                                                                onClick={() => { void handleResetMpLimit(combatant.id); }}
                                                            >
                                                                <RestartAltIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {mpLimitEnforced && (
                                                        <Tooltip title={mpReleased
                                                            ? 'Restabelecer o limite de MP por turno'
                                                            : 'Liberar o limite de MP por turno (até a rodada virar)'}
                                                        >
                                                            <IconButton
                                                                size="small"
                                                                color={mpReleased ? 'success' : 'default'}
                                                                onClick={() => { void handleToggleMpLimitOverride(combatant.id, !mpReleased); }}
                                                            >
                                                                {mpReleased ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
                                                                bgcolor: 'background.raised',
                                                                '& .MuiLinearProgress-bar': {
                                                                    bgcolor: lpPercent > 50 
                                                                        ? 'success.main' 
                                                                        : lpPercent > 25 
                                                                            ? 'warning.main' 
                                                                            : color.lp
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                    {mpLimitEnforced && (
                                                        <Typography
                                                            variant="caption"
                                                            component="span"
                                                            sx={{ color: mpReleased ? 'success.main' : mpSpent >= mpLimit ? 'error.light' : 'text.secondary' }}
                                                        >
                                                            MP no turno: {mpSpent}/{mpLimit}{mpReleased ? ' (liberado)' : ''}
                                                        </Typography>
                                                    )}
                                                    {combat.phase === 'ACTION' && (
                                                        <ActionPips
                                                            budget={combatantBudget(combatant)}
                                                            onSelect={(slot, available) => { void toggleAction(combatant.id, slot, available); }}
                                                            busy={togglingAction}
                                                        />
                                                    )}
                                                    {combatant.effects && combatant.effects.length > 0 && (
                                                        <Box sx={{ mt: 0.5 }} onClick={e => e.stopPropagation()}>
                                                            <EffectBadges
                                                                effects={combatant.effects}
                                                                canRemove
                                                                onRemove={(id) => handleRemoveEffect(combatant.id, id)}
                                                            />
                                                        </Box>
                                                    )}
                                                </Box>
                                            }
                                            secondaryTypographyProps={{ component: 'div' }}
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
                            bgcolor: 'background.paper', 
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
                                        {renderLogText(log.message ?? '')}
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
                            sx={{ bgcolor: 'success.main', color: 'success.contrastText', '&:hover': { bgcolor: 'success.dark' } }}
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
                <SportsKabaddiIcon sx={{ color: 'text.secondary' }} />
                {isSetupMode ? 'Iniciar Combate' : `Combate em Andamento - Round ${combat?.round || 1}`}
            </DialogTitle>
            <DialogContent>
                {isLoading && <LinearProgress sx={{ mb: 2 }} />}
                {isSetupMode ? renderSetupUI() : renderCombatUI()}
                {combat && (
                    <CombatHistoryPanel
                        campaignId={campaignId}
                        signature={`${combat.isActive}|${combat.round}|${combat.logs?.length ?? 0}`}
                        onChanged={() => { void fetchCombat(); onCombatUpdate?.(); }}
                    />
                )}
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
                        sx={{ bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.dark' } }}
                    >
                        {isLoading ? 'Iniciando...' : 'Iniciar Combate'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleEndCombat}
                        variant="contained"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : <StopIcon />}
                        sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', '&:hover': { bgcolor: 'secondary.dark' } }}
                    >
                        {isLoading ? 'Encerrando...' : 'Encerrar Combate'}
                    </Button>
                )}
            </DialogActions>

            <ApplyEffectDialog
                open={!!applyEffectTarget}
                onClose={() => setApplyEffectTarget(null)}
                campaignId={campaignId}
                target={applyEffectTarget}
                appliedByName="GM"
                onApplied={() => { void fetchCombat(); }}
            />
            {setMpSpentDialog}
        </Dialog>
    );
}
