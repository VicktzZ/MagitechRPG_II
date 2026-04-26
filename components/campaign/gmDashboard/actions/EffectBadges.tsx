'use client'

import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import type { AppliedEffect, CombatEffectModifier } from '@models'
import { getCategoryLabel, getEffectDisplayName } from '@utils/combatEffectLabels'

interface EffectBadgesProps {
    effects?: AppliedEffect[]
    canRemove?: boolean
    onRemove?: (appliedEffectId: string) => void
    size?: 'small' | 'medium'
    dense?: boolean
}

function formatModifier(mod: CombatEffectModifier): string {
    const val = mod.value !== undefined && mod.value !== null ? String(mod.value) : ''
    const tgt = mod.target ? ` ${mod.target}` : ''
    const ele = mod.element ? ` [${mod.element}]` : ''

    switch (mod.kind) {
    case 'stat_bonus':            return `⬆️${tgt}${val ? ` ${val}` : ''}`
    case 'stat_penalty':          return `⬇️${tgt}${val ? ` ${val}` : ''}`
    case 'damage_resistance':     return `🛡️ resiste${ele}${val ? ` ${val}` : ''}`
    case 'damage_vulnerability':  return `💥 vulnerável${ele}${val ? ` ${val}` : ''}`
    case 'damage_dealt_bonus':    return `⚔️ dano causado ${val || '+'}`
    case 'damage_dealt_penalty':  return `⚔️ dano causado ${val || '-'}`
    case 'advantage':             return `✨ vantagem${tgt}`
    case 'disadvantage':          return `⚠️ desvantagem${tgt}`
    case 'skip_turn':             return '⏭️ pula turno'
    case 'no_healing':            return '🚫 cura bloqueada'
    case 'no_actions':            return '🚫 não pode agir'
    case 'no_spells':             return '🚫 sem magias'
    case 'overflow_stat':         return `💗${tgt} pode ultrapassar${val ? ` ${val}` : ''}`
    case 'flag':                  return `🏷️${tgt}${val ? ` (${val})` : ''}`
    default:                      return `${mod.kind}${tgt}${val ? ` ${val}` : ''}`
    }
}

export default function EffectBadges({
    effects,
    canRemove = false,
    onRemove,
    size = 'small',
    dense = false
}: EffectBadgesProps) {
    if (!effects || effects.length === 0) return null

    return (
        <Stack direction="row" spacing={dense ? 0.25 : 0.5} flexWrap="wrap" sx={{ rowGap: dense ? 0.25 : 0.5 }}>
            {effects.map(applied => {
                const effect = applied.snapshot
                if (!effect) return null

                const fullName = effect.usesLevels === false
                    ? effect.name
                    : getEffectDisplayName(effect, applied.level)
                const level = effect.levels?.[applied.level - 1]
                const formula = level?.formula ?? '0'
                const modifiers = level?.modifiers ?? []
                const totalDuration = level?.duration ?? 0
                const timingLabel = effect.timing === 'turn' ? 'turno(s)' : 'rodada(s)'
                const hasFormula = formula && formula !== '0'
                const isIndefinite = applied.indefinite === true

                const tooltipContent = (
                    <Box sx={{ p: 0.5, maxWidth: 300 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {effect.icon} {fullName}
                        </Typography>
                        {effect.description && (
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                {effect.description}
                            </Typography>
                        )}
                        {hasFormula && (
                            <Typography variant="caption" sx={{ display: 'block' }}>
                                <strong>Fórmula:</strong> {formula}
                            </Typography>
                        )}
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            <strong>Categoria:</strong> {getCategoryLabel(effect.category)}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            <strong>Gatilho:</strong> {effect.timing === 'turn' ? 'Turno' : 'Rodada'}
                        </Typography>
                        {effect.element && (
                            <Typography variant="caption" sx={{ display: 'block' }}>
                                <strong>Elemento:</strong> {effect.element}
                            </Typography>
                        )}
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            <strong>Restante:</strong>{' '}
                            {isIndefinite
                                ? '∞ (indefinido)'
                                : `${applied.remaining} / ${totalDuration} ${timingLabel}`
                            }
                        </Typography>

                        {modifiers.length > 0 && (
                            <Box sx={{ mt: 0.75, pt: 0.5, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.25 }}>
                                    Modificadores
                                </Typography>
                                {modifiers.map((mod, i) => (
                                    <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                                        • {formatModifier(mod)}
                                        {mod.note ? ` — ${mod.note}` : ''}
                                    </Typography>
                                ))}
                            </Box>
                        )}

                        {applied.appliedByName && (
                            <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, mt: 0.5 }}>
                                Aplicado por: {applied.appliedByName}
                            </Typography>
                        )}
                    </Box>
                )

                const label = isIndefinite
                    ? `${effect.icon} ${fullName} · ∞`
                    : `${effect.icon} ${fullName} · ${applied.remaining}${effect.timing === 'turn' ? 't' : 'r'}`

                return (
                    <Tooltip
                        key={applied.id}
                        title={tooltipContent}
                        arrow
                        placement="top"
                    >
                        <Chip
                            size={size}
                            label={label}
                            onDelete={canRemove && onRemove ? () => onRemove(applied.id) : undefined}
                            deleteIcon={canRemove ? <CloseIcon fontSize="small" /> : undefined}
                            sx={{
                                bgcolor: effect.color,
                                color: '#fff',
                                fontWeight: 600,
                                height: size === 'small' ? 22 : 28,
                                '& .MuiChip-deleteIcon': {
                                    color: 'rgba(255,255,255,0.85)',
                                    '&:hover': { color: '#fff' }
                                }
                            }}
                        />
                    </Tooltip>
                )
            })}
        </Stack>
    )
}
