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
import { useMemo } from 'react';
import { StatusBar } from './StatusBar';
import { AttributeCard } from './AttributeCard';
import type { Stats } from '@models';

const attributeConfig = {
    vig: { icon: '💪', color: { bgcolor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)' } },
    foc: { icon: '🎯', color: { bgcolor: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)' } },
    des: { icon: '⚡', color: { bgcolor: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.4)' } },
    log: { icon: '🧠', color: { bgcolor: 'rgba(6, 182, 212, 0.2)', border: '1px solid rgba(6, 182, 212, 0.4)' } },
    sab: { icon: '🔮', color: { bgcolor: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)' } },
    car: { icon: '🌟', color: { bgcolor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)' } }
};

export default function PlayerHeader({ avatar }: { avatar: string | undefined }) {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { campaign: { campaignCode } } = useCampaignContext()
    const session = useMemo(() => charsheet.session.find(s => s.campaignCode === campaignCode), [ charsheet.session, campaignCode ]);

    if (!session) return null;

    const updateStat = (stat: keyof Stats, delta: number) => {
        updateCharsheet({
            session: [
                ...charsheet.session.filter(s => s.campaignCode !== campaignCode),
                {
                    ...session,
                    stats: {
                        ...session.stats,
                        [stat]: Math.max(0, Math.min(session.stats[stat] + delta, session.stats[`max${stat.charAt(0).toUpperCase() + stat.slice(1)}`] * 2))
                    }
                }
            ]
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
                            {charsheet.lineage} • {charsheet.gender} • {charsheet.age} anos
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Segunda linha: Atributos */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{
                    color: '#9ca3af',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '11px',
                    mb: 1
                }}>
                    Atributos Principais
                </Typography>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <Grid item xs={6} sm={4} md={2}>
                        <AttributeCard
                            label="VIG"
                            value={charsheet.attributes.vig}
                            icon={attributeConfig.vig.icon}
                            iconColor={attributeConfig.vig.color}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <AttributeCard
                            label="FOC"
                            value={charsheet.attributes.foc}
                            icon={attributeConfig.foc.icon}
                            iconColor={attributeConfig.foc.color}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <AttributeCard
                            label="DES"
                            value={charsheet.attributes.des}
                            icon={attributeConfig.des.icon}
                            iconColor={attributeConfig.des.color}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <AttributeCard
                            label="LOG"
                            value={charsheet.attributes.log}
                            icon={attributeConfig.log.icon}
                            iconColor={attributeConfig.log.color}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <AttributeCard
                            label="SAB"
                            value={charsheet.attributes.sab}
                            icon={attributeConfig.sab.icon}
                            iconColor={attributeConfig.sab.color}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4} md={2}>
                        <AttributeCard
                            label="CAR"
                            value={charsheet.attributes.car}
                            icon={attributeConfig.car.icon}
                            iconColor={attributeConfig.car.color}
                        />
                    </Grid>
                </Grid>
                
                <Grid container spacing={1} sx={{ mt: 1.5 }}>
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
                    <StatusBar
                        label="Pontos de Vida (LP)"
                        current={session.stats.lp}
                        max={session.stats.maxLp}
                        color="#ef4444"
                        icon="❤️"
                        onIncrease={(value) => updateStat('lp', value)}
                        onDecrease={(value) => updateStat('lp', -value)}
                    />
                    
                    <StatusBar
                        label="Pontos de Mana (MP)"
                        current={session.stats.mp}
                        max={session.stats.maxMp}
                        color="#3b82f6"
                        icon="✨"
                        onIncrease={(value) => updateStat('mp', value)}
                        onDecrease={(value) => updateStat('mp', -value)}
                    />
                    
                    <StatusBar
                        label="Pontos de Armadura (AP)"
                        current={session.stats.ap}
                        max={session.stats.maxAp}
                        color="#eab308"
                        icon="🛡️"
                        onIncrease={(value) => updateStat('ap', value)}
                        onDecrease={(value) => updateStat('ap', -value)}
                    />
                </Box>
            </Box>
        </Paper>
    );
}