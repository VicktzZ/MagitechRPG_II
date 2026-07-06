'use client'

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import {
    Avatar,
    Box,

    Chip,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import Image from 'next/image';
import { StatusBar } from './StatusBar';
import type { Stats } from '@models';
import EffectBadges from '@components/campaign/gmDashboard/actions/EffectBadges';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';

export default function PlayerHeader({ avatar }: { avatar: string | undefined }) {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { campaign } = useCampaignContext();
    const { system: customSystem } = useCharsheetSystem(charsheet?.systemId);

    const stats = charsheet.stats;

    const hasLP = !customSystem || (customSystem.pointsConfig?.hasLP ?? customSystem.initialFields?.life?.enabled ?? true);
    const hasMP = !customSystem || (customSystem.pointsConfig?.hasMP ?? customSystem.initialFields?.mana?.enabled ?? true);
    const hasAP = !customSystem || (customSystem.pointsConfig?.hasAP ?? customSystem.initialFields?.armor?.enabled ?? true);
    const lpLabel = customSystem?.pointsConfig?.lpName || customSystem?.initialFields?.life?.label || 'Vida';
    const mpLabel = customSystem?.pointsConfig?.mpName || customSystem?.initialFields?.mana?.label || 'Mana';
    const apLabel = customSystem?.pointsConfig?.apName || customSystem?.initialFields?.armor?.label || 'Armadura';

    const showLineage = !customSystem || customSystem.enabledFields?.lineage;
    const infoLineParts = [
        showLineage ? charsheet.lineage : null,
        charsheet.gender,
        `${charsheet.age} anos`
    ].filter(Boolean);

    const combat = campaign?.session?.combat;
    const myCombatant = combat?.isActive
        ? combat.combatants?.find(c => c.id === charsheet.id || (c as any).odacId === charsheet.id)
        : undefined;
    const myEffects = myCombatant?.effects;
    const isMyTurn = combat?.isActive && combat.phase === 'ACTION'
        && combat.combatants?.[combat.currentTurnIndex]?.id === myCombatant?.id;

    const updateStat = (stat: keyof Stats, delta: number) => {
        const maxKey = `max${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof Stats;
        updateCharsheet({
            stats: {
                ...stats,
                [stat]: Math.max(0, Math.min((stats[stat] as number) + delta, (stats[maxKey] as number) * 2))
            }
        });
    };

    return (
        <Paper sx={{
            bgcolor: '#1e293b',
            border: '1px solid #475569',
            borderRadius: 3,
            p: 2,
            mb: 2
        }}>
            {/* Primeira linha: Avatar + Info Básica */}
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar sx={{ width: { xs: '56px', sm: '64px' }, height: { xs: '56px', sm: '64px' } }}>
                        {avatar ? (
                            <Image
                                src={avatar}
                                alt={charsheet.name}
                                width={64}
                                height={64}
                            />
                        ) : (
                            charsheet.name.charAt(0)
                        )}
                    </Avatar>
                    <Box sx={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        bgcolor: '#3b82f6',
                        color: 'white',
                        px: 0.75,
                        py: 0.25,
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 700,
                        border: '2px solid #1e293b'
                    }}>
                        {charsheet.level}
                    </Box>
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h6" sx={{ truncate: true, fontSize: { xs: '16px', sm: '18px' } }}>
                        {charsheet.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af', truncate: true, mb: 1, fontSize: { xs: '10px', sm: '12px' } }}>
                        {charsheet.playerName}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                        <Chip
                            label={`♟️ ${charsheet.class}`}
                            sx={{
                                bgcolor: 'rgba(59, 130, 246, 0.2)',
                                color: '#93c5fd',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}
                        />
                        {charsheet.subclass && (
                            <Chip
                                label={`✨ ${charsheet.subclass}`}
                                sx={{
                                    bgcolor: 'rgba(168, 85, 247, 0.2)',
                                    color: '#c4b5fd',
                                    border: '1px solid rgba(168, 85, 247, 0.3)'
                                }}
                            />
                        )}
                    </Box>
                    <Box sx={{
                        mt: 1,
                        pt: 1,
                        borderTop: '1px solid rgba(71, 85, 105, 0.5)'
                    }}>
                        <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: { xs: '10px', sm: '11px' } }}>
                            {infoLineParts.join(' • ')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Segunda linha: Atributos */}
            <Box sx={{ mb: 2 }}>
                <Grid container spacing={1}>
                    {!customSystem && (
                        <Grid item xs={12} sm={4}>
                            <Paper sx={{
                                bgcolor: 'rgba(71, 85, 105, 0.3)',
                                border: '1px solid rgba(71, 85, 105, 0.3)',
                                borderRadius: 1,
                                p: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography sx={{ fontSize: { xs: '9px', sm: '10px' }, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                                    Limite MP
                                </Typography>
                                <Typography sx={{ fontSize: { xs: '12px', sm: '14px' }, fontWeight: 700, color: '#22d3ee' }}>
                                    {charsheet.mpLimit}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{
                            bgcolor: 'rgba(71, 85, 105, 0.3)',
                            border: '1px solid rgba(71, 85, 105, 0.3)',
                            borderRadius: 1,
                            p: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography sx={{ fontSize: { xs: '9px', sm: '10px' }, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                                Overall
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '12px', sm: '14px' }, fontWeight: 700, color: '#60a5fa' }}>
                                {charsheet.overall}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{
                            bgcolor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: 1,
                            p: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography sx={{ fontSize: { xs: '9px', sm: '10px' }, color: '#d1d5db', textTransform: 'uppercase', fontWeight: 600 }}>
                                🚀 Desloc.
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '12px', sm: '14px' }, fontWeight: 700, color: '#4ade80' }}>
                                {charsheet.displacement}m
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Efeitos de combate ativos */}
            {myEffects && myEffects.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" sx={{
                            color: '#9ca3af',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontSize: '11px'
                        }}>
                            Efeitos Ativos
                        </Typography>
                        {isMyTurn && (
                            <Chip
                                label="Seu turno"
                                size="small"
                                sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    bgcolor: 'rgba(59, 130, 246, 0.25)',
                                    color: '#93c5fd',
                                    border: '1px solid rgba(59, 130, 246, 0.5)'
                                }}
                            />
                        )}
                    </Box>
                    <EffectBadges effects={myEffects} />
                </Box>
            )}

            {/* Terceira linha: Status */}
            <Box>
                <Typography variant="caption" sx={{
                    color: '#9ca3af',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '11px',
                    mb: 1
                }}>
                    Status
                </Typography>
                <Box sx={{ mt: 1 }}>
                    {hasLP && (
                        <StatusBar
                            label={customSystem ? lpLabel : 'Pontos de Vida (LP)'}
                            current={stats.lp}
                            max={stats.maxLp}
                            color="#ef4444"
                            icon="❤️"
                            onIncrease={(value) => updateStat('lp', value)}
                            onDecrease={(value) => updateStat('lp', -value)}
                        />
                    )}

                    {hasMP && (
                        <StatusBar
                            label={customSystem ? mpLabel : 'Pontos de Mana (MP)'}
                            current={stats.mp}
                            max={stats.maxMp}
                            color="#3b82f6"
                            icon="✨"
                            onIncrease={(value) => updateStat('mp', value)}
                            onDecrease={(value) => updateStat('mp', -value)}
                        />
                    )}

                    {hasAP && (
                        <StatusBar
                            label={customSystem ? apLabel : 'Pontos de Armadura (AP)'}
                            current={stats.ap}
                            max={stats.maxAp}
                            color="#eab308"
                            icon="🛡️"
                            onIncrease={(value) => updateStat('ap', value)}
                            onDecrease={(value) => updateStat('ap', -value)}
                        />
                    )}
                </Box>
            </Box>
        </Paper>
    );
}