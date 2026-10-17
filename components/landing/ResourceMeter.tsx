import { Box, Typography } from '@mui/material'
import { font } from '@themes/tokens'

interface ResourceMeterProps {
    label: string
    value: number
    max: number
    /** Cor da barra (token lp, mp ou ap) */
    barColor: string
}

/** Barra de recurso (LP, MP, AP): rótulo, valor em mono e uma barra plana de 8px */
export default function ResourceMeter({ label, value, max, barColor }: ResourceMeterProps) {
    const percent = Math.max(0, Math.min(100, Math.round((value / max) * 100)))

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
                <Typography component="span" sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em' }}>
                    {label}
                </Typography>
                <Typography component="span" sx={{ fontFamily: font.mono, fontWeight: 500, fontSize: 16 }}>
                    {value}/{max}
                </Typography>
            </Box>
            <Box
                role="meter"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={value}
                sx={{ height: 8, borderRadius: 999, bgcolor: 'background.overlay', overflow: 'hidden' }}
            >
                <Box sx={{ height: '100%', width: `${percent}%`, borderRadius: 999, bgcolor: barColor }} />
            </Box>
        </Box>
    )
}
