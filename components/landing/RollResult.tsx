import { Box, Typography } from '@mui/material'
import { diceFont, font } from '@themes/tokens'

interface RollResultProps {
    /** Lados de cada dado (as fontes dos dados cobrem d4, d6, d8, d10 e d12) */
    sides: 4 | 6 | 8 | 10 | 12
    /** Resultado de cada dado: um glifo por dado */
    dice: number[]
    modifier?: number
    label: string
}

/**
 * Resultado de rolagem como no app: um glifo por dado, na fonte do próprio dado, e a soma em
 * IBM Plex Mono. O d20 e as somas não cabem em um glifo, por isso o total fica na fonte mono.
 */
export default function RollResult({ sides, dice, modifier = 0, label }: RollResultProps) {
    const total = dice.reduce((sum, value) => sum + value, 0) + modifier
    const spoken = `${label}: ${dice.join(' e ')}${modifier ? `, mais ${modifier}` : ''}, total ${total}`

    return (
        <Box role="img" aria-label={spoken} sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box aria-hidden sx={{ display: 'flex', gap: 0.5 }}>
                {dice.map((value, index) => (
                    <Typography key={index} component="span" sx={{ fontFamily: diceFont(sides), fontSize: 48, lineHeight: 1, color: 'primary.main' }}>
                        {value}
                    </Typography>
                ))}
            </Box>
            <Typography aria-hidden component="span" sx={{ fontFamily: font.mono, fontWeight: 500, fontSize: 20, color: 'text.secondary' }}>
                {modifier ? `${modifier > 0 ? '+' : '−'} ${Math.abs(modifier)} ` : ''}={' '}
                <Box component="strong" sx={{ color: 'text.primary', fontWeight: 500, fontSize: 28 }}>{total}</Box>
            </Typography>
        </Box>
    )
}
