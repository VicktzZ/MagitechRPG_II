import { Box, Chip, Collapse, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { AutoStories, ExpandMore } from '@mui/icons-material'
import { useState } from 'react'
import { color, font } from '@themes/tokens'
import { rollModifier, rollNumbers, type ActionRoll, type ActionRollSegment } from '@utils/combat/actionRollMessage'
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

function SegmentRow({ segment }: { segment: ActionRollSegment }) {
    const rolls = rollNumbers(segment.display)
    const modifier = rollModifier(segment.display)
    const sides = diceSides(segment.notation)

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
                    color={rollChipColor(value, sides)}
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

/** O conteúdo do dropdown: cada expressão com seus dados, e o subtotal e a média de todos os dados rolados */
export function ActionRollDetails({ action }: { action: ActionRoll }) {
    const allRolls = action.segments.flatMap(segment => rollNumbers(segment.display))
    const subtotal = allRolls.reduce((sum, value) => sum + value, 0)

    return (
        <>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={1}>
                <Typography variant="body2" fontWeight={700}>Rolagens:</Typography>
                {action.segments.map((segment, index) => <SegmentRow key={index} segment={segment} />)}
            </Stack>
            {allRolls.length > 0 && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Chip size="small" label={`Subtotal ${subtotal}`} />
                    <Chip size="small" label={`Média ${(subtotal / allRolls.length).toFixed(2)}`} />
                </Stack>
            )}
        </>
    )
}

/**
 * Cartão do chat para o dano de uma arma ou a conjuração de uma magia (ver `actionRollMessage.ts`).
 * Mesmo desenho dos testes e dos dados personalizados (`DiceMessage`): título, expressão em cinza, total à vista e as
 * rolagens num dropdown. A magia mostra também o custo de MP; a arma, "Crítico" quando é o dano crítico.
 */
export function ActionRollCard({ action }: { action: ActionRoll }) {
    const [ open, setOpen ] = useState(false)
    const Icon = action.kind === 'magia' ? AutoStories : WeaponIcon
    const notations = action.segments.map(segment => segment.notation).join(' · ')
    const hasDetails = action.segments.length > 0

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
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
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
                {action.critical && <Chip size="small" color="warning" label="Crítico" />}
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
