'use client'

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import {
    alpha,
    Avatar,
    Box,

    Chip,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import { Favorite, Shield, WaterDrop } from '@mui/icons-material';
import { color } from '@themes/tokens';
import Image from 'next/image';
import { StatusBar } from './StatusBar';
import type { Stats } from '@models';
import EffectBadges from '@components/campaign/gmDashboard/actions/EffectBadges';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';
import { getMpLimit, isMpLimitEnforced } from '@utils/mpLimit';

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

    // Limite de MP por turno (utils/mpLimit.ts): em combate mostra o gasto do turno / limite
    const mpLimitEnforced = isMpLimitEnforced(charsheet, campaign?.mode);
    const mpLimit = getMpLimit(charsheet);
    const mpSpentThisTurn = myCombatant?.mpSpentThisTurn ?? 0;
    const mpLimitReleased = Boolean(myCombatant?.mpLimitOverride);

    const updateStat = (stat: keyof Stats, delta: number) => {
        const maxKey = `max${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof Stats;
        // Atualiza só o campo alterado: gravar o objeto `stats` inteiro sobrescrevia
        // alterações simultâneas do mestre (ex: dano aplicado no LP enquanto o jogador gasta MP)
        updateCharsheet({
            [`stats.${stat}`]: Math.max(0, Math.min(stats[stat] + delta, stats[maxKey] * 2))
        } as any);
    };

    return (
        <Paper sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
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
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 0.75,
                        py: 0.25,
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 700,
                        border: '2px solid',
                        borderColor: 'background.paper'
                    }}>
                        {charsheet.level}
                    </Box>
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h6" sx={{ truncate: true, fontSize: { xs: '16px', sm: '18px' } }}>
                        {charsheet.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', truncate: true, mb: 1, fontSize: { xs: '10px', sm: '12px' } }}>
                        {charsheet.playerName}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                        <Chip
                            label={`♟️ ${charsheet.class}`}
                            sx={{
                                bgcolor: alpha(color.amber, 0.16),
                                color: 'primary.main',
                                border: `1px solid ${alpha(color.amber, 0.4)}`
                            }}
                        />
                        {charsheet.subclass && (
                            <Chip
                                label={charsheet.subclass}
                                sx={{
                                    bgcolor: 'background.raised',
                                    color: 'text.secondary',
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            />
                        )}
                    </Box>
                    <Box sx={{
                        mt: 1,
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '10px', sm: '11px' } }}>
                            {infoLineParts.join(' • ')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Segunda linha: Atributos */}
            <Box sx={{ mb: 2 }}>
                <Grid container spacing={1}>
                    {!customSystem && mpLimitEnforced && (
                        <Grid item xs={12} sm={4}>
                            <Paper sx={{
                                bgcolor: 'background.raised',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                p: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography sx={{ fontSize: { xs: '9px', sm: '10px' }, color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                                    Limite MP/turno
                                </Typography>
                                <Typography
                                    title={mpLimitReleased ? 'Liberado pelo mestre até o início do seu próximo turno' : 'MP gasto neste turno / limite por turno'}
                                    sx={{
                                        fontSize: { xs: '12px', sm: '14px' },
                                        fontWeight: 700,
                                        color: mpLimitReleased ? 'success.main' : (myCombatant && mpSpentThisTurn >= mpLimit ? 'error.main' : 'info.main')
                                    }}
                                >
                                    {myCombatant ? `${mpLimitReleased ? '🔓 ' : ''}${mpSpentThisTurn}/${mpLimit}` : mpLimit}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{
                            bgcolor: 'background.raised',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography sx={{ fontSize: { xs: '9px', sm: '10px' }, color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                                Overall
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '12px', sm: '14px' }, fontWeight: 700, color: 'primary.main' }}>
                                {charsheet.overall}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{
                            bgcolor: alpha(color.success, 0.1),
                            border: `1px solid ${alpha(color.success, 0.4)}`,
                            borderRadius: 1,
                            p: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Typography sx={{ fontSize: { xs: '9px', sm: '10px' }, color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                                🚀 Desloc.
                            </Typography>
                            <Typography sx={{ fontSize: { xs: '12px', sm: '14px' }, fontWeight: 700, color: 'success.main' }}>
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
                            color: 'text.secondary',
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
                                    bgcolor: alpha(color.amber, 0.2),
                                    color: 'primary.main',
                                    border: `1px solid ${alpha(color.amber, 0.5)}`
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
                    color: 'text.secondary',
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
                            color={color.lp}
                            icon={<Favorite fontSize="inherit" />}
                            onIncrease={(value) => updateStat('lp', value)}
                            onDecrease={(value) => updateStat('lp', -value)}
                        />
                    )}

                    {hasMP && (
                        <StatusBar
                            label={customSystem ? mpLabel : 'Pontos de Mana (MP)'}
                            current={stats.mp}
                            max={stats.maxMp}
                            color={color.mp}
                            icon={<WaterDrop fontSize="inherit" />}
                            onIncrease={(value) => updateStat('mp', value)}
                            onDecrease={(value) => updateStat('mp', -value)}
                        />
                    )}

                    {hasAP && (
                        <StatusBar
                            label={customSystem ? apLabel : 'Pontos de Armadura (AP)'}
                            current={stats.ap}
                            max={stats.maxAp}
                            color={color.ap}
                            icon={<Shield fontSize="inherit" />}
                            onIncrease={(value) => updateStat('ap', value)}
                            onDecrease={(value) => updateStat('ap', -value)}
                        />
                    )}
                </Box>
            </Box>
        </Paper>
    );
}