'use client'

import { useCampaignContext } from '@contexts';
import {
    alpha,
    Avatar,
    Box,
    Chip,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import { color, font } from '@themes/tokens';
import Image from 'next/image';
import { StatusBar } from './StatusBar';
import { usePlayerVitals } from './usePlayerVitals';
import EffectBadges from '@components/campaign/gmDashboard/actions/EffectBadges';
import EffectStatsNotice from '@components/campaign/EffectStatsNotice';
import { displacementWithEffects } from '@utils/combat/effectStats';
import { collectModifiers } from '@utils/combat/engine/modifiers';
import { getMpLimit, isMpLimitEnforced } from '@utils/mpLimit';

/** Etiqueta pequena (≥ 12px) de um dado da ficha */
const tileLabelSx = { fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 } as const;
const tileValueSx = { fontSize: 14, fontWeight: 700, fontFamily: font.mono } as const;
const tileSx = {
    bgcolor: 'background.raised',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    p: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
} as const;

/**
 * Cabeçalho do jogador: quem é o personagem, os números principais, os efeitos de combate e os pontos
 * vitais com os controles de dano e cura. `rootRef` entrega o elemento à barra fixa, que sabe assim
 * quando mostrar os pontos vitais de forma compacta (quando este cabeçalho sai da tela).
 */
export default function PlayerHeader({ avatar, rootRef }: { avatar: string | undefined; rootRef?: (element: HTMLElement | null) => void }) {
    const { charsheet, customSystem, vitals, update } = usePlayerVitals();
    const { campaign } = useCampaignContext();

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
    // Deslocamento de agora (Velocidade, Congelamento...): a ficha guarda o base, os efeitos só valem em combate
    const displacement = displacementWithEffects(charsheet.displacement, collectModifiers(myEffects));
    const displacementChanged = displacement !== Number(charsheet.displacement);
    const isMyTurn = combat?.isActive && combat.phase === 'ACTION'
        && combat.combatants?.[combat.currentTurnIndex]?.id === myCombatant?.id;

    // Limite de MP por turno (utils/mpLimit.ts): em combate mostra o gasto do turno / limite
    const mpLimitEnforced = isMpLimitEnforced(charsheet, campaign?.mode);
    const mpLimit = getMpLimit(charsheet);
    const mpSpentThisTurn = myCombatant?.mpSpentThisTurn ?? 0;
    const mpLimitReleased = Boolean(myCombatant?.mpLimitOverride);

    return (
        <Paper
            ref={rootRef}
            sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                p: 2,
                mb: 2
            }}
        >
            {/* Primeira linha: avatar e informações básicas */}
            <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar sx={{ width: { xs: 56, sm: 64 }, height: { xs: 56, sm: 64 } }}>
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
                    <Box
                        aria-label={`Nível ${charsheet.level}`}
                        sx={{
                            position: 'absolute',
                            bottom: -4,
                            right: -4,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            px: 0.75,
                            py: 0.25,
                            borderRadius: '12px',
                            fontSize: 12,
                            fontWeight: 700,
                            border: '2px solid',
                            borderColor: 'background.paper'
                        }}
                    >
                        {charsheet.level}
                    </Box>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h6" noWrap sx={{ fontSize: { xs: 16, sm: 18 } }}>
                        {charsheet.name}
                    </Typography>
                    <Typography variant="caption" noWrap component="div" sx={{ color: 'text.secondary', mb: 1, fontSize: 12 }}>
                        {charsheet.playerName}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                        <Chip
                            label={charsheet.class}
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
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 12 }}>
                            {infoLineParts.join(' • ')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Segunda linha: números principais */}
            <Box sx={{ mb: 2 }}>
                <Grid container spacing={1}>
                    {!customSystem && mpLimitEnforced && (
                        <Grid item xs={12} sm={4}>
                            <Paper sx={tileSx}>
                                <Typography sx={tileLabelSx}>Limite MP/turno</Typography>
                                <Typography
                                    title={mpLimitReleased ? 'Liberado pelo mestre até a rodada virar' : 'MP gasto nesta rodada / limite por turno (zera quando a rodada vira)'}
                                    sx={{
                                        ...tileValueSx,
                                        color: mpLimitReleased ? 'success.main' : (myCombatant && mpSpentThisTurn >= mpLimit ? 'error.main' : 'info.main')
                                    }}
                                >
                                    {myCombatant ? `${mpSpentThisTurn}/${mpLimit}${mpLimitReleased ? ' (liberado)' : ''}` : mpLimit}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                    <Grid item xs={12} sm={4}>
                        <Paper sx={tileSx}>
                            <Typography sx={tileLabelSx}>Overall</Typography>
                            <Typography sx={{ ...tileValueSx, color: 'primary.main' }}>{charsheet.overall}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ ...tileSx, bgcolor: alpha(color.success, 0.1), borderColor: alpha(color.success, 0.4) }}>
                            <Typography sx={tileLabelSx}>Deslocamento</Typography>
                            <Typography
                                title={displacementChanged ? `Base ${charsheet.displacement}m, mudado pelos efeitos ativos` : undefined}
                                sx={{ ...tileValueSx, color: 'success.main' }}
                            >
                                {displacement}m
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Efeitos de combate ativos */}
            {myEffects && myEffects.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12 }}>
                            Efeitos Ativos
                        </Typography>
                        {isMyTurn && (
                            <Chip
                                label="Seu turno"
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: 12,
                                    bgcolor: alpha(color.amber, 0.2),
                                    color: 'primary.main',
                                    border: `1px solid ${alpha(color.amber, 0.5)}`
                                }}
                            />
                        )}
                    </Box>
                    <EffectBadges effects={myEffects} />
                    <Box sx={{ mt: 1 }}>
                        <EffectStatsNotice
                            effects={myEffects}
                            heading={null}
                            bases={{ displacement: charsheet.displacement, ap: charsheet.stats?.ap, maxLp: charsheet.stats?.maxLp, maxMp: charsheet.stats?.maxMp }}
                        />
                    </Box>
                </Box>
            )}

            {/* Terceira linha: pontos vitais */}
            <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12 }}>
                    Status
                </Typography>
                <Box sx={{ mt: 1 }}>
                    {vitals.map(vital => (
                        <StatusBar
                            key={vital.key}
                            label={vital.label}
                            current={vital.current}
                            max={vital.max}
                            color={vital.color}
                            icon={vital.icon}
                            onIncrease={(value) => { update(vital.key, value); }}
                            onDecrease={(value) => { update(vital.key, -value); }}
                        />
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}
