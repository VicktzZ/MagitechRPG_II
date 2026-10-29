'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import BoltIcon from '@mui/icons-material/Bolt';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import { alpha, Avatar, Box, Chip, LinearProgress, Stack, Tooltip, Typography } from '@mui/material';
import type { Combat, Combatant } from '@models';
import { color, font } from '@themes/tokens';
import type { ReactElement } from 'react';
import EffectBadges from '../gmDashboard/actions/EffectBadges';

interface CombatOrderListProps {
    combat: Combat;
    /** O id do personagem de quem está vendo (leva "você") */
    viewerId?: string;
    /** O mestre e a vida à mostra veem o LP das criaturas */
    showEnemyLp: boolean;
    /** LP, máximo e MP de um jogador, lidos da ficha */
    playerStats: (combatantId: string, odacId?: string) => { lp: number; maxLp: number; mp: number; maxMp: number } | null;
}

const lpBarColor = (percent: number): string => (percent > 50 ? color.success : percent > 25 ? color.warning : color.lp);

function Meter({ icon, value, max, tint }: { icon: ReactElement; value: number; max: number; tint: string }): ReactElement {
    const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {icon}
            <LinearProgress variant="determinate" value={percent} sx={{ flex: 1, height: 5, borderRadius: 1, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: tint } }} />
            <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right', fontSize: 12, color: 'text.secondary', fontFamily: font.mono }}>{value}/{max}</Typography>
        </Box>
    );
}

interface RowProps {
    combatant: Combatant;
    current: boolean;
    viewer: boolean;
    showLp: boolean;
    stats: ReturnType<CombatOrderListProps['playerStats']>;
}

function Row({ combatant, current, viewer, showLp, stats }: RowProps): ReactElement {
    const isPlayer = combatant.type === 'player';
    const lp = stats?.lp ?? combatant.currentLp ?? 0;
    const maxLp = stats?.maxLp ?? combatant.maxLp ?? 1;
    const mp = stats?.mp ?? combatant.currentMp ?? 0;
    const maxMp = stats?.maxMp ?? combatant.maxMp ?? 0;
    const lpPercent = maxLp > 0 ? (lp / maxLp) * 100 : 0;

    return (
        <Box
            data-testid={`combat-order-${combatant.id}`}
            aria-current={current ? 'step' : undefined}
            sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                borderRadius: 2,
                border: '1px solid',
                borderColor: current ? 'primary.main' : 'divider',
                borderLeftWidth: current ? 3 : 1,
                bgcolor: current ? color.amberSubtle : 'background.raised',
                opacity: combatant.hasActed && !current ? 0.6 : 1
            }}
        >
            <Avatar src={combatant.avatar} sx={{ width: 32, height: 32, bgcolor: isPlayer ? 'info.main' : alpha(color.warning, 0.4) }}>
                {isPlayer ? <PersonIcon fontSize="small" /> : <PetsIcon fontSize="small" />}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: current ? 700 : 500, color: 'text.primary' }}>
                    {combatant.name}{viewer ? ' (você)' : ''}
                </Typography>

                {showLp && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.5 }}>
                        <Meter icon={<FavoriteIcon sx={{ fontSize: 12, color: color.lp }} />} value={lp} max={maxLp} tint={lpBarColor(lpPercent)} />
                        {maxMp > 0 && <Meter icon={<BoltIcon sx={{ fontSize: 12, color: color.mp }} />} value={mp} max={maxMp} tint={color.mp} />}
                    </Box>
                )}

                {combatant.effects && combatant.effects.length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                        <EffectBadges effects={combatant.effects} size="small" dense />
                    </Box>
                )}
            </Box>

            {combatant.initiativeTotal > 0 && (
                <Tooltip title="Iniciativa">
                    <Chip label={combatant.initiativeTotal} size="small" sx={{ height: 20, fontSize: 12, fontFamily: font.mono, bgcolor: 'action.hover' }} />
                </Tooltip>
            )}
            {combatant.hasActed && <Chip label="agiu" size="small" variant="outlined" sx={{ height: 20, fontSize: 12 }} />}
        </Box>
    );
}

/** "Ordem de Combate" dentro do card: cada combatente com vida, mana, efeitos e iniciativa; quem tem a vez ganha o filete âmbar e quem já agiu na rodada, "agiu". */
export default function CombatOrderList({ combat, viewerId, showEnemyLp, playerStats }: CombatOrderListProps): ReactElement {
    const acting = combat.phase === 'ACTION';

    return (
        <>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Ordem de Combate:
            </Typography>
            <Stack spacing={0.5}>
                {combat.combatants.map((combatant, index) => (
                    <Row
                        key={combatant.id}
                        combatant={combatant}
                        current={acting && index === combat.currentTurnIndex}
                        viewer={combatant.id === viewerId}
                        showLp={combatant.type === 'player' || showEnemyLp}
                        stats={combatant.type === 'player' ? playerStats(combatant.id, combatant.odacId) : null}
                    />
                ))}
            </Stack>
        </>
    );
}
