'use client';

import { useEffect, useState, useMemo, type ReactElement } from 'react';
import {
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShieldIcon from '@mui/icons-material/Shield';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CasinoIcon from '@mui/icons-material/Casino';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { alpha, useTheme } from '@mui/material/styles';
import { amber, blue, green, grey, orange, purple, red } from '@mui/material/colors';
import type { CampaignStats, PlayerCampaignStats } from '@models/entities';

interface CampaignStatsModalProps {
    open: boolean;
    onClose: () => void;
    campaignId: string;
    campaignTitle?: string;
}

interface Highlight {
    icon: ReactElement;
    title: string;
    playerName: string;
    value: string;
    color: string;
}

function computeHighlights(players: PlayerCampaignStats[]): Highlight[] {
    if (players.length === 0) return [];

    const highlights: Highlight[] = [];

    const topBy = (selector: (p: PlayerCampaignStats) => number): PlayerCampaignStats | null => {
        const sorted = [ ...players ].sort((a, b) => selector(b) - selector(a));
        return selector(sorted[0]) > 0 ? sorted[0] : null;
    };

    const pushIf = (
        player: PlayerCampaignStats | null,
        icon: ReactElement,
        title: string,
        format: (p: PlayerCampaignStats) => string,
        color: string
    ) => {
        if (player) {
            highlights.push({ icon, title, playerName: player.charsheetName, value: format(player), color });
        }
    };

    pushIf(topBy(p => p.combat.damageDealt), <LocalFireDepartmentIcon />, 'Devastador', p => `${p.combat.damageDealt} de dano causado`, red[500]);
    pushIf(topBy(p => p.combat.damageTaken), <ShieldIcon />, 'Tanque', p => `${p.combat.damageTaken} de dano recebido`, blue[500]);
    pushIf(topBy(p => p.combat.healingDone), <FavoriteIcon />, 'Anjo da Guarda', p => `${p.combat.healingDone} de cura realizada`, green[500]);
    pushIf(topBy(p => p.combat.kills), <MilitaryTechIcon />, 'Caçador', p => `${p.combat.kills} abate(s)`, orange[700]);
    pushIf(topBy(p => p.dice.criticalHits), <CasinoIcon />, 'Abençoado pelos Dados', p => `${p.dice.criticalHits} crítico(s)`, amber[600]);
    pushIf(topBy(p => p.dice.criticalFailures), <SentimentVeryDissatisfiedIcon />, 'Azarado', p => `${p.dice.criticalFailures} falha(s) crítica(s)`, grey[600]);
    pushIf(topBy(p => p.resources.spellsCast), <AutoFixHighIcon />, 'Arcanista', p => `${p.resources.spellsCast} magia(s) conjurada(s)`, purple[500]);
    pushIf(topBy(p => p.dice.testsPassed), <EmojiEventsIcon />, 'Competente', p => `${p.dice.testsPassed} teste(s) passado(s)`, green[700]);

    return highlights;
}

function StatRow({ label, value }: { label: string; value: string | number }): ReactElement {
    return (
        <Box display="flex" justifyContent="space-between" py={0.25}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight={600}>{value}</Typography>
        </Box>
    );
}

function topExpertise(usage: Record<string, number>): string {
    const entries = Object.entries(usage ?? {});
    if (entries.length === 0) return '—';
    const [ name, count ] = entries.sort((a, b) => b[1] - a[1])[0];
    return `${name} (${count}x)`;
}

export default function CampaignStatsModal({ open, onClose, campaignId, campaignTitle }: CampaignStatsModalProps): ReactElement {
    const theme = useTheme();
    const [ stats, setStats ] = useState<CampaignStats | null>(null);
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        if (!open || !campaignId) return;
        setLoading(true);
        fetch(`/api/campaign/${campaignId}/stats`)
            .then(async res => {
                if (!res.ok) throw new Error('Erro ao carregar estatísticas');
                return await res.json();
            })
            .then((data: CampaignStats) => setStats(data))
            .catch(err => {
                console.error('Erro ao carregar estatísticas da campanha:', err);
                setStats(null);
            })
            .finally(() => setLoading(false));
    }, [ open, campaignId ]);

    const players = useMemo(
        () => Object.values(stats?.players ?? {}).sort((a, b) => b.combat.damageDealt - a.combat.damageDealt),
        [ stats ]
    );
    const highlights = useMemo(() => computeHighlights(players), [ players ]);
    const gm = stats?.gm;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmojiEventsIcon sx={{ color: amber[500], fontSize: 32 }} />
                <Box flex={1}>
                    <Typography variant="h6" component="div" fontWeight={700}>
                        Retrospectiva da Campanha
                    </Typography>
                    {campaignTitle && (
                        <Typography variant="body2" color="text.secondary">
                            {campaignTitle}
                        </Typography>
                    )}
                </Box>
                <IconButton onClick={onClose} edge="end">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress />
                    </Box>
                ) : !stats || players.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Typography color="text.secondary">
                            Nenhuma estatística registrada nesta campanha ainda.
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            As estatísticas são coletadas automaticamente durante as sessões: dano, cura, testes, magias, compras e muito mais.
                        </Typography>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={3}>
                        {/* ── Destaques ── */}
                        {highlights.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                    🏆 Destaques
                                </Typography>
                                <Grid container spacing={1.5}>
                                    {highlights.map((h, idx) => (
                                        <Grid item xs={12} sm={6} md={3} key={idx}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 1.5,
                                                    textAlign: 'center',
                                                    borderColor: alpha(h.color, 0.4),
                                                    bgcolor: alpha(h.color, 0.06)
                                                }}
                                            >
                                                <Avatar sx={{ bgcolor: alpha(h.color, 0.15), color: h.color, mx: 'auto', mb: 0.5 }}>
                                                    {h.icon}
                                                </Avatar>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {h.title}
                                                </Typography>
                                                <Typography variant="subtitle2" fontWeight={700} noWrap>
                                                    {h.playerName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {h.value}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        <Divider />

                        {/* ── Estatísticas por jogador ── */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                📊 Jogadores
                            </Typography>
                            <Grid container spacing={2}>
                                {players.map(player => (
                                    <Grid item xs={12} md={6} key={player.charsheetId}>
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                                <Typography variant="subtitle1" fontWeight={700} flex={1}>
                                                    {player.charsheetName || 'Personagem'}
                                                </Typography>
                                                {player.progression.highestLevel > 0 && (
                                                    <Chip
                                                        label={`Nível ${player.progression.highestLevel}`}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>

                                            <Typography variant="caption" fontWeight={700} color={red[400]}>⚔️ Combate</Typography>
                                            <StatRow label="Dano causado" value={player.combat.damageDealt} />
                                            <StatRow label="Dano recebido" value={player.combat.damageTaken} />
                                            <StatRow label="Cura realizada" value={player.combat.healingDone} />
                                            <StatRow label="Cura recebida" value={player.combat.healingReceived} />
                                            <StatRow label="Abates" value={player.combat.kills} />
                                            <StatRow label="Quedas (0 LP)" value={player.combat.knockouts} />

                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" fontWeight={700} color={amber[600]}>🎲 Dados</Typography>
                                            <StatRow label="Testes rolados" value={player.dice.totalRolls} />
                                            <StatRow label="Passou / Falhou" value={`${player.dice.testsPassed} / ${player.dice.testsFailed}`} />
                                            <StatRow label="Críticos / Fumbles" value={`${player.dice.criticalHits} / ${player.dice.criticalFailures}`} />
                                            <StatRow label="Maior rolagem" value={player.dice.highestRoll} />
                                            <StatRow label="Perícia favorita" value={topExpertise(player.dice.expertiseUsage)} />

                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" fontWeight={700} color={blue[400]}>💧 Recursos</Typography>
                                            <StatRow label="Magias conjuradas" value={player.resources.spellsCast} />
                                            <StatRow label="MP gasto" value={player.resources.mpSpent} />
                                            <StatRow label="Dinheiro gasto / ganho" value={`${player.resources.moneySpent} / ${player.resources.moneyEarned}`} />
                                            <StatRow label="Itens comprados" value={player.resources.itemsPurchased} />
                                            <StatRow label="Doações feitas / recebidas" value={`${player.resources.itemsDonated} / ${player.resources.itemsReceived}`} />

                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" fontWeight={700} color={green[500]}>📈 Progressão</Typography>
                                            <StatRow label="Níveis ganhos" value={player.progression.levelsGained} />
                                            <StatRow label="Magias adquiridas" value={player.progression.spellsLearned} />
                                            <StatRow label="Habilidades adquiridas" value={player.progression.skillsGained} />
                                            <StatRow label="Vantagens adquiridas" value={player.progression.perksGained} />
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* ── Estatísticas do Mestre ── */}
                        {gm && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                        🎩 Mestre
                                    </Typography>
                                    <Paper
                                        variant="outlined"
                                        sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}
                                    >
                                        <Grid container spacing={1}>
                                            <Grid item xs={6} sm={4}>
                                                <StatRow label="Dano infligido" value={gm.damageDealt} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <StatRow label="Cura concedida" value={gm.healingDone} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <StatRow label="Testes solicitados" value={gm.testsRequested} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <StatRow label="Combates iniciados" value={gm.combatsStarted} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <StatRow label="Rodadas conduzidas" value={gm.combatRoundsRun} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <StatRow label="Efeitos aplicados" value={gm.effectsApplied} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <StatRow label="Criaturas invocadas" value={gm.creaturesAdded} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <StatRow label="Itens entregues" value={gm.itemsGiven} />
                                            </Grid>
                                            <Grid item xs={6} sm={4}>
                                                <StatRow label="Dinheiro distribuído" value={gm.moneyGiven} />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Box>
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}
