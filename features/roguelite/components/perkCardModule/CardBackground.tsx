import { Box } from '@mui/material'
import { Parallax } from 'react-parallax'

interface CardBackgroundProps {
    borderColor: string
}

export function CardBackground({ borderColor }: CardBackgroundProps) {
    return (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Parallax strength={80} bgImageStyle={{ objectFit: 'cover' }}>
                <Box
                    sx={{
                        height: '100%',
                        width: '100%',
                        filter: 'grayscale(10%) contrast(105%) brightness(0.7)'
                    }}
                />
            </Parallax>
            {/* Gradiente vertical sutil */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(180deg, ${borderColor}18, transparent 18%, transparent 72%, ${borderColor}28)`
                }}
            />
            {/* Vinheta superior */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.06), transparent 40%)'
                }}
            />
            {/* Textura leve (ruído) */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.08,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                    backgroundSize: '3px 3px'
                }}
            />
        </Box>
    )
}

export function CardFrame({ borderColor }: CardBackgroundProps) {
    return (
        <>
            {/* Moldura dupla: brilho externo + borda interna */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    boxShadow: `0 0 0 2px ${borderColor} inset, 0 0 36px ${borderColor}55 inset`
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 6,
                    borderRadius: 2,
                    border: `1px solid ${borderColor}66`,
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.5) inset'
                }}
            />
        </>
    )
}
