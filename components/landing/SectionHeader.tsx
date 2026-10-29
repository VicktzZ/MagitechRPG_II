import { Box, Typography } from '@mui/material'
import { font } from '@themes/tokens'
import type { ReactNode } from 'react'

interface SectionHeaderProps {
    /** Rótulo curto acima do título (ex.: "Sobre") */
    eyebrow?: string
    title: string
    description?: ReactNode
    align?: 'left' | 'center'
    /** Menos espaço abaixo, quando o texto vem logo em seguida */
    dense?: boolean
}

/** Cabeçalho de seção da landing: rótulo em âmbar, título em Chakra Petch e texto de apoio */
export default function SectionHeader({ eyebrow, title, description, align = 'left', dense = false }: SectionHeaderProps) {
    return (
        <Box sx={{ mb: dense ? 3 : { xs: 4, md: 6 }, maxWidth: 720, textAlign: align, mx: align === 'center' ? 'auto' : 0 }}>
            {eyebrow && (
                <Typography
                    component="p"
                    sx={{ mb: 1.5, color: 'primary.main', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                >
                    {eyebrow}
                </Typography>
            )}
            <Typography variant="h3" component="h2" sx={{ fontFamily: font.display, fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1.15 }}>
                {title}
            </Typography>
            {description && (
                <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.0625rem' }, lineHeight: 1.6 }}>
                    {description}
                </Typography>
            )}
        </Box>
    )
}
