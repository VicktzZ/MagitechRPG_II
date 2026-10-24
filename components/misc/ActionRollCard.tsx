import { Box, Chip, Collapse, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { AutoStories, ExpandMore } from '@mui/icons-material'
import { useState } from 'react'
import { color, font } from '@themes/tokens'
import { rollModifier, rollNumbers, type ActionRoll, type ActionRollSegment } from '@utils/combat/actionRollMessage'
import { STEALTH_DAMAGE_MULTIPLIER } from '@utils/combat/stealth'
import WeaponIcon from './WeaponIcon'

/** Faces do dado de uma expressão simples ("3d12+6" → 12); com mais de um tipo de dado não dá para saber qual é qual */
function diceSides(notation: string): number | null {
    const sides = Array.from(notation.matchAll(/\d*d(\d+)/gi), match => Number(match[1]))
    return sides.length === 1 ? sides[0]! : null
}

function rollChipColor(value: number, sides: number | null): 'success' | 'error' | 'default' {
    if (sides !== null && sides > 1 && value === sides) return 'success'
    if (sides !== null && value === 1) return 'error'
    return 'default'
}

/** `isTest`: teste de magia (vale o maior d20), então o dado que vale vem destacado em vez das faces máxima e mínima */
function SegmentRow({ segment, isTest }: { segment: ActionRollSegment; isTest: boolean }) {
    const rolls = rollNumbers(segment.display)
    const modifier = rollModifier(segment.display)
    const sides = diceSides(segment.notation)
    const best = rolls.length > 0 ? Math.max(...rolls) : null

    return (
        <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} data-testid="action-roll-segment">
            <Typography component="span" variant="body2" color="text.secondary" sx={{ fontFamily: font.mono }}>
                {segment.notation}
            </Typography>
            {rolls.map((value, index) => (
                <Chip
                    key={index}
                    size="small"
                    label={value}
                    color={isTest ? (value === best ? 'primary' : 'default') : rollChipColor(value, sides)}
                    sx={{ fontFamily: font.mono }}
                />
            ))}
            {!!modifier && (
                <Typography component="span" variant="body2" sx={{ fontFamily: font.mono }}>
                    {modifier}
                </Typography>
            )}
            <Typography component="span" variant="body2" sx={{ fontFamily: font.mono, fontWeight: 700 }}>
                = {segment.total}
            </Typography>
        </Stack>
    )
}

/** "Total 17 contra DT 18: falhou por 1": o resultado do teste de magia contra a dificuldade, dito em texto também */
export function castOutcomeText(total: number, dt: number): string {
    const margin = total - dt
    if (margin < 0) return `Total ${total} contra DT ${dt}: falhou por ${-margin}`
    return margin === 0 ? `Total ${total} contra DT ${dt}: passou na DT exata` : `Total ${total} contra DT ${dt}: passou por ${margin}`
}

/** "Furtivo: dano dobrado (9 × 2 = 18)": a regra do efeito Furtivo dita em texto, com a soma rolada e o total que foi para o chat */
export function stealthDamageText(rolled: number, total: number): string {
    return `Furtivo: dano dobrado (${rolled} × ${STEALTH_DAMAGE_MULTIPLIER} = ${total})`
}

/** O conteúdo do dropdown: cada expressão com seus dados e, fora do teste de magia, o subtotal e a média de todos os dados rolados */
export function ActionRollDetails({ action }: { action: ActionRoll }) {
    const isTest = action.kind === 'conjuração'
    const allRolls = action.segments.flatMap(segment => rollNumbers(segment.display))
    const subtotal = allRolls.reduce((sum, value) => sum + value, 0)

    return (
        <>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={1}>
                <Typography variant="body2" fontWeight={700}>{isTest ? 'Teste de magia (vale o maior dado):' : 'Rolagens:'}</Typography>
                {action.segments.map((segment, index) => <SegmentRow key={index} segment={segment} isTest={isTest} />)}
                {action.stealth && action.total !== null && (
                    <Typography variant="body2" color="text.secondary" data-testid="action-roll-stealth">
                        {stealthDamageText(action.segments.reduce((sum, segment) => sum + segment.total, 0), action.total)}
                    </Typography>
                )}
                {isTest && action.dt !== null && action.total !== null && (
                    <Typography variant="body2" color="text.secondary" data-testid="action-roll-outcome">
                        {castOutcomeText(action.total, action.dt)}
                    </Typography>
                )}
            </Stack>
            {!isTest && allRolls.length > 0 && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Chip size="small" label={`Subtotal ${subtotal}`} />
                    <Chip size="small" label={`Média ${(subtotal / allRolls.length).toFixed(2)}`} />
                </Stack>
            )}
        </>
    )
}

/**
 * Cartão do chat para o dano de uma arma ou os dois tempos de uma magia (ver `actionRollMessage.ts`).
 * Mesmo desenho dos testes e dos dados personalizados (`DiceMessage`): título, expressão em cinza, total à vista e as
 * rolagens num dropdown. A conjuração mostra o custo de MP e se o teste passou na DT; o efeito, o total do dano/cura/duração;
 * a arma, "Crítico" quando é o dano crítico e "Furtivo ×2" quando o ataque foi dado com o efeito Furtivo (dano dobrado).
 */
export function ActionRollCard({ action }: { action: ActionRoll }) {
    const [ open, setOpen ] = useState(false)
    const Icon = action.kind === 'arma' ? WeaponIcon : AutoStories
    const notations = action.segments.map(segment => segment.notation).join(' · ')
    const hasDetails = action.segments.length > 0
    const passed = action.dt === null || action.total === null || action.total >= action.dt

    return (
        <Box sx={{ wordBreak: 'break-word' }} data-testid="action-roll-card">
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
                <Icon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="subtitle2" fontWeight={700}>
                    {action.player ? `[${action.player}] ${action.title}` : action.title}
                </Typography>
            </Stack>
            {!!action.detail && (
                <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
                    {action.detail}
                </Typography>
            )}
            <Stack direction="row" alignItems="center" flexWrap="wrap" columnGap={1} rowGap={0.5} sx={{ minWidth: 0 }}>
                {!!notations && (
                    <Typography
                        component="span"
                        color="text.secondary"
                        noWrap
                        sx={{ minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '50%', fontFamily: font.mono, fontSize: 13 }}
                    >
                        ({notations})
                    </Typography>
                )}
                <Box flex={1} />
                {action.cost !== null && (
                    <Chip
                        size="small"
                        label={`Custo ${action.cost} MP`}
                        sx={{ bgcolor: alpha(color.mp, 0.14), color: color.mp, fontFamily: font.mono }}
                    />
                )}
                {action.dt !== null && <Chip size="small" variant="outlined" label={`DT ${action.dt}`} sx={{ fontFamily: font.mono }} />}
                {action.dt !== null && (
                    <Chip size="small" color={passed ? 'success' : 'error'} label={passed ? 'Sucesso' : 'Falhou'} data-testid="action-roll-result" />
                )}
                {action.critical && <Chip size="small" color="warning" label="Crítico" />}
                {action.stealth && <Chip size="small" variant="outlined" label={`Furtivo ×${STEALTH_DAMAGE_MULTIPLIER}`} data-testid="action-roll-stealth-chip" />}
                {action.total !== null && <Chip size="small" color="primary" label={`Total ${action.total}`} />}
                {hasDetails && (
                    <Tooltip title={open ? 'Ocultar detalhes' : 'Ver detalhes'}>
                        <IconButton size="small" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? 'Ocultar detalhes' : 'Ver detalhes'}>
                            <ExpandMore sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
            {hasDetails && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <ActionRollDetails action={action} />
                </Collapse>
            )}
        </Box>
    )
}
