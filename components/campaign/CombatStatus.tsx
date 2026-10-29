'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { Alert, Box, Button, Chip, Collapse, Divider, Paper, Typography } from '@mui/material';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CasinoIcon from '@mui/icons-material/Casino';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { duration, easing } from '@themes/tokens';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import { useSession } from 'next-auth/react';
import type { Attributes, Combat } from '@models';
import { effectiveBudget } from '@utils/combat/actionFlags';
import { opportunitiesForReactor } from '@utils/combat/opportunities';
import { sheetExpertisePenalty } from '@utils/combat/sheetOverweight';
import { incomingAttacks } from '@utils/combat/pendingAttacks';
import ActionPips from './ActionPips';
import HiddenFromNotice from './awareness/HiddenFromNotice';
import CombatOrderList from './combatStatus/CombatOrderList';
import DamageHealDialog from './combatStatus/DamageHealDialog';
import InitiativeDialog from './combatStatus/InitiativeDialog';
import { useCombatStatusCalls } from './combatStatus/useCombatStatusCalls';
import LeaveReachButton from './opportunity/LeaveReachButton';
import OpportunityOffers from './opportunity/OpportunityOffers';
import ReactionOffers from './reaction/ReactionOffers';
import IncomingAttacks from './playerDashboard/attacks/IncomingAttacks';

interface CombatStatusProps {
    campaignId: string;
    combat: Combat | null;
    userCharsheetId?: string;
    onActionComplete?: () => void;
}

const TOP_CENTER = { vertical: 'top', horizontal: 'center' } as const;

/**
 * O card de combate do jogador (no dock, canto inferior direito): de quem é a vez, os alertas que pedem resposta (ataque recebido, ataque de oportunidade, reação, furtividade),
 * as ações da rodada, dano, cura e passar o turno na vez dele, e a ordem de combate. Começa recolhido (só o cabeçalho) e abre sozinho quando chega o turno ou algo pede resposta.
 * As chamadas à rota moram em `combatStatus/useCombatStatusCalls`, os diálogos e a lista em `combatStatus/`.
 */
function CombatStatus({
    campaignId,
    combat,
    userCharsheetId,
    onActionComplete
}: CombatStatusProps) {
    const { enqueueSnackbar } = useSnackbar();
    const { data: session } = useSession();
    const { campaign, charsheets } = useCampaignContext();

    // Começa recolhido (só o cabeçalho, que já diz de quem é a vez): o card flutua sobre a ficha
    // e abre sozinho quando chega o turno do jogador
    const [ expanded, setExpanded ] = useState(false);
    const [ initiativeDialogOpen, setInitiativeDialogOpen ] = useState(false);
    const [ actionDialog, setActionDialog ] = useState<'damage' | 'heal' | null>(null);
    const [ turnNotificationShown, setTurnNotificationShown ] = useState(false);

    const isGM = Boolean(campaign?.admin?.includes(session?.user?.id || ''));

    // Encontra o combatente do usuário atual - busca por charsheetId, odacId ou session user id
    const userCombatant = combat?.combatants?.find(c => {
        if (c.type !== 'player') return false;
        return c.id === userCharsheetId ||
                c.odacId === session?.user?.id ||
                c.odacId === userCharsheetId;
    });

    const currentCombatant = combat?.combatants?.[combat?.currentTurnIndex || 0];

    const calls = useCombatStatusCalls({ campaignId, userCombatant, isGM, currentCombatant, onActionComplete });

    const initiativeFormula = useMemo(() => {
        if (!userCombatant || !charsheets?.length) return null;

        const charsheet = charsheets.find(c =>
            c.id === userCombatant.id || c.id === userCombatant.odacId
        );

        if (!charsheet) return null;

        const agiExpertise = charsheet.expertises?.Agilidade;
        const expertiseValue = Number(agiExpertise?.value ?? 0) || 0;

        const defaultAttrKey = (agiExpertise?.defaultAttribute ?? 'des') as string;
        let modsValue = Number(charsheet.mods?.attributes?.[defaultAttrKey as keyof Attributes] ?? 1);
        if (!Number.isFinite(modsValue) || modsValue < 1) modsValue = 1;

        // Agilidade é perícia de DES: o Sobrepeso (−1 por kg excedido) também tira da iniciativa
        return { numDice: modsValue, expertiseValue: expertiseValue + sheetExpertisePenalty(charsheet, defaultAttrKey) };
    }, [ charsheets, userCombatant ]);

    const isUserTurn = combat?.isActive &&
        combat.phase === 'ACTION' &&
        combat.combatants?.[combat.currentTurnIndex]?.id === userCombatant?.id;

    // Verifica se o usuário precisa rolar iniciativa (não é GM e não rolou ainda)
    const needsToRollInitiative = combat?.isActive &&
        combat.phase === 'INITIATIVE' &&
        userCombatant &&
        userCombatant.initiativeRoll === 0 &&
        !isGM;

    // LP/MP da ficha para jogadores (o combatente guarda uma cópia que pode estar velha)
    const getPlayerStats = useCallback((combatantId: string, odacId?: string) => {
        const charsheet = charsheets?.find(c =>
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

    useEffect(() => {
        if (isUserTurn) setExpanded(true);
    }, [ isUserTurn ]);

    // Ataque assistido contra o personagem do jogador: abre o card e avisa uma vez por ataque, para ele escolher a defesa (ver IncomingAttacks)
    const awaitingDefense = isGM ? [] : incomingAttacks(combat?.pendingAttacks, userCombatant?.id).awaiting;
    const awaitingIds = awaitingDefense.map(attack => attack.id).join(',');
    const notifiedAttacks = useRef<Set<string>>(new Set());
    useEffect(() => {
        const fresh = awaitingDefense.filter(attack => !notifiedAttacks.current.has(attack.id));
        if (fresh.length === 0) return;

        fresh.forEach(attack => notifiedAttacks.current.add(attack.id));
        setExpanded(true);
        enqueueSnackbar(`${fresh[0].attackerName} atacou você! Escolha a sua defesa.`, { variant: 'warning', autoHideDuration: 6000, anchorOrigin: TOP_CENTER });
        // awaitingDefense muda de identidade a cada render; o que interessa são os ids
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ awaitingIds, enqueueSnackbar ]);

    // Ataque de oportunidade: um inimigo saiu do alcance do personagem do jogador. Abre o card e avisa uma vez por oportunidade
    const offers = isGM ? [] : opportunitiesForReactor(combat?.opportunities, userCombatant?.id);
    const offerIds = offers.map(offer => offer.id).join(',');
    const notifiedOffers = useRef<Set<string>>(new Set());
    useEffect(() => {
        const fresh = offers.filter(offer => !notifiedOffers.current.has(offer.id));
        if (fresh.length === 0) return;

        fresh.forEach(offer => notifiedOffers.current.add(offer.id));
        setExpanded(true);
        enqueueSnackbar(`${fresh[0].moverName} está saindo do seu alcance! Dá para fazer um ataque de oportunidade.`, { variant: 'info', autoHideDuration: 6000, anchorOrigin: TOP_CENTER });
        // offers muda de identidade a cada render; o que interessa são os ids
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ offerIds, enqueueSnackbar ]);

    // Notifica quando é o turno do jogador
    useEffect(() => {
        if (isUserTurn && !turnNotificationShown && !isGM) {
            enqueueSnackbar('É sua vez de agir!', { variant: 'info', autoHideDuration: 5000, anchorOrigin: TOP_CENTER });
            setTurnNotificationShown(true);
        } else if (!isUserTurn) {
            setTurnNotificationShown(false);
        }
    }, [ isUserTurn, turnNotificationShown, isGM, enqueueSnackbar ]);

    // Abre o diálogo de iniciativa sozinho se precisar rolar, e reabre se fechou sem rolar
    useEffect(() => {
        if (needsToRollInitiative && !initiativeDialogOpen) setInitiativeDialogOpen(true);
    }, [ needsToRollInitiative, initiativeDialogOpen ]);

    const handleRollInitiative = useCallback(async () => {
        if (await calls.rollInitiative()) setInitiativeDialogOpen(false);
    }, [ calls ]);

    // Não mostra nada se não houver combate ativo
    if (!combat?.isActive) return null;

    const showEnemyLp = Boolean(combat.showEnemyLp) || isGM;
    const acting = combat.phase === 'ACTION';
    const asPlayer = acting && Boolean(userCombatant) && !isGM;

    // Linha do cabeçalho: a informação que o jogador quer sem expandir o card
    const turnSummary = combat.phase === 'INITIATIVE'
        ? 'Rolando iniciativa'
        : isUserTurn ? 'É a sua vez' : currentCombatant ? `Vez de ${currentCombatant.name}` : '';

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    // Vive no FloatingDock (canto inferior direito, ao lado do chat): aqui só o tamanho.
                    // Superfície plana; o combate é marcado pelo filete vermelho, não por um cartão cheio
                    width: 340,
                    maxWidth: '100%',
                    maxHeight: expanded ? 450 : 68,
                    overflow: 'hidden',
                    transition: `max-height ${duration.slow}ms ${easing.standard}`,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderLeft: '3px solid',
                    borderLeftColor: 'error.main',
                    bgcolor: 'background.raised'
                }}
            >
                <Box
                    component="button"
                    type="button"
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Recolher o combate' : 'Expandir o combate'}
                    sx={{
                        p: 1.5,
                        width: '100%',
                        border: 0,
                        bgcolor: 'transparent',
                        color: 'text.primary',
                        font: 'inherit',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer'
                    }}
                    onClick={() => { setExpanded(!expanded); }}
                >
                    <SportsKabaddiIcon sx={{ color: 'error.light' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                            Combate - Round {combat.round}
                        </Typography>
                        {turnSummary && (
                            <Typography variant="caption" noWrap component="div" sx={{ color: isUserTurn ? 'primary.light' : 'text.secondary', fontWeight: isUserTurn ? 700 : 400, lineHeight: 1.3 }}>
                                {turnSummary}
                            </Typography>
                        )}
                    </Box>
                    <Chip
                        label={combat.phase === 'INITIATIVE' ? 'Iniciativa' : 'Ação'}
                        size="small"
                        sx={{
                            bgcolor: combat.phase === 'INITIATIVE' ? 'primary.main' : 'success.main',
                            color: combat.phase === 'INITIATIVE' ? 'primary.contrastText' : 'success.contrastText',
                            fontWeight: 600
                        }}
                    />
                    {expanded ? <ExpandLessIcon sx={{ color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ p: 1.5, maxHeight: 380, overflow: 'auto' }}>
                        {/* Turno Atual */}
                        {acting && currentCombatant && (
                            <Alert
                                severity={isUserTurn ? 'warning' : 'info'}
                                sx={{ mb: 1.5, py: 0.5 }}
                                icon={isUserTurn ? <SportsKabaddiIcon /> : undefined}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {isUserTurn ? 'É sua vez de agir!' : `Vez de ${currentCombatant.name}`}
                                </Typography>
                            </Alert>
                        )}

                        {/* Ataques ao personagem do jogador: escolher e rolar a defesa */}
                        {asPlayer && userCombatant && <IncomingAttacks combat={combat} combatantId={userCombatant.id} />}

                        {/* Reação aberta (o mestre abriu, ou o ataque resolvido abriu): o que aconteceu e as magias de Reação que combinam */}
                        {asPlayer && userCombatant && (
                            <ReactionOffers
                                combat={combat}
                                combatantId={userCombatant.id}
                                onFresh={(text) => {
                                    setExpanded(true);
                                    enqueueSnackbar(`${text}. Dá para reagir.`, { variant: 'info', autoHideDuration: 6000, anchorOrigin: TOP_CENTER });
                                }}
                            />
                        )}

                        {/* Quem se esconde sabe de quem (a matriz de percepção é do mestre) */}
                        {asPlayer && userCombatant && <HiddenFromNotice combatantId={userCombatant.id} />}

                        {/* Ataque de oportunidade: ofertas para reagir e a declaração de saída do alcance */}
                        {asPlayer && userCombatant && (
                            <>
                                <OpportunityOffers combat={combat} combatantId={userCombatant.id} />
                                <LeaveReachButton combat={combat} combatantId={userCombatant.id} />
                            </>
                        )}

                        {/* Ações da rodada do próprio personagem (Padrão, Bônus, Movimento, Reação) */}
                        {asPlayer && userCombatant && (
                            <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    Suas ações nesta rodada
                                </Typography>
                                <ActionPips
                                    budget={effectiveBudget(userCombatant)}
                                    onSelect={calls.spendAction}
                                    disableSpent
                                    busy={calls.isSpendingAction}
                                />
                            </Box>
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
                                    onClick={() => { setInitiativeDialogOpen(true); }}
                                    sx={{ mt: 1, bgcolor: 'warning.main', color: 'warning.contrastText', '&:hover': { bgcolor: 'warning.light' } }}
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
                                    onClick={() => { setActionDialog('damage'); }}
                                    sx={{ flex: 1, bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.light' }, minWidth: 80 }}
                                >
                                    Dano
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<LocalHospitalIcon />}
                                    onClick={() => { setActionDialog('heal'); }}
                                    sx={{ flex: 1, bgcolor: 'success.main', color: 'success.contrastText', '&:hover': { bgcolor: 'success.light' }, minWidth: 80 }}
                                >
                                    Cura
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<SkipNextIcon />}
                                    onClick={() => { void calls.passTurn(); }}
                                    disabled={calls.isPassingTurn}
                                    sx={{ flex: 1, minWidth: 100 }}
                                >
                                    {calls.isPassingTurn ? 'Passando...' : 'Passar Turno'}
                                </Button>
                            </Box>
                        )}

                        <Divider sx={{ my: 1 }} />

                        <CombatOrderList combat={combat} viewerId={userCharsheetId} showEnemyLp={showEnemyLp} playerStats={getPlayerStats} />
                    </Box>
                </Collapse>
            </Paper>

            <InitiativeDialog
                open={initiativeDialogOpen}
                rolling={calls.isRolling}
                formula={initiativeFormula}
                onClose={() => { setInitiativeDialogOpen(false); }}
                onRoll={() => { void handleRollInitiative(); }}
            />

            <DamageHealDialog
                open={actionDialog !== null}
                type={actionDialog ?? 'damage'}
                combat={combat}
                showEnemyLp={showEnemyLp}
                playerStats={getPlayerStats}
                busy={calls.isApplying}
                onClose={() => { setActionDialog(null); }}
                onApply={async ({ targetId, value }) => await calls.applyDamageHeal({ type: actionDialog ?? 'damage', targetId, value })}
            />
        </>
    );
}

export default memo(CombatStatus);
