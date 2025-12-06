import type { SxProps, Theme } from '@mui/material'

export const getCardSx = (borderColor: string): SxProps<Theme> => ({
    position: 'relative',
    overflow: 'hidden',
    width: { xs: 280, sm: 300, md: 330 },
    height: { xs: 420, sm: 450, md: 480 },
    borderRadius: 3,
    border: `2px solid ${borderColor}`,
    boxShadow: `0 10px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 24px ${borderColor}33 inset`,
    transition: 'transform 120ms ease-out, box-shadow 200ms ease, scale 150ms ease-out',
    cursor: 'pointer',
    bgcolor: 'rgba(10,10,14,0.9)',
    '&:hover': {
        scale: '1.1',
        boxShadow: `0 15px 35px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 30px ${borderColor}44 inset`,
        transform: 'perspective(900px) rotateX(0) rotateY(0) translateZ(0) scale(1.1)',
        zIndex: 10
    }
})

export const getAttributeBoxSx = (borderColor: string): SxProps<Theme> => ({
    px: 0.75,
    py: 0.5,
    borderRadius: 1,
    border: `1px solid ${borderColor}55`,
    bgcolor: `${borderColor}12`
})

export const getAttributeLabelSx = (borderColor: string): SxProps<Theme> => ({
    color: borderColor,
    fontWeight: 700,
    letterSpacing: 0.3,
    fontSize: '0.65rem'
})

export const attributeValueSx: SxProps<Theme> = {
    color: '#e8e8e8',
    fontWeight: 600,
    fontSize: '0.8rem'
}

export const attributeValueBoldSx: SxProps<Theme> = {
    color: '#e8e8e8',
    fontWeight: 700,
    fontSize: '0.8rem'
}

export const getChipSx = (borderColor: string): SxProps<Theme> => ({
    borderColor: `${borderColor}99`,
    color: borderColor,
    bgcolor: `${borderColor}14`,
    fontSize: '0.7rem',
    height: 24
})

export const getRarityChipSx = (borderColor: string): SxProps<Theme> => ({
    bgcolor: `${borderColor}26`,
    color: borderColor,
    border: `1px solid ${borderColor}66`,
    textTransform: 'uppercase',
    fontWeight: 800,
    letterSpacing: 1,
    backdropFilter: 'blur(6px)'
})

export const descriptionSx = (borderColor: string): SxProps<Theme> => ({
    color: '#d9d9d9',
    flexGrow: 1,
    lineHeight: 1.35,
    overflow: 'auto',
    maxHeight: { xs: 120, sm: 140, md: 160 },
    pr: 1,
    '&::-webkit-scrollbar': { width: '4px' },
    '&::-webkit-scrollbar-track': {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px'
    },
    '&::-webkit-scrollbar-thumb': {
        background: `${borderColor}66`,
        borderRadius: '2px',
        '&:hover': { background: `${borderColor}99` }
    }
})

export const titleSx: SxProps<Theme> = {
    fontWeight: 900,
    color: '#fafafa',
    textShadow: '0 2px 6px rgba(0,0,0,0.45)',
    letterSpacing: 0.2
}

export const subtitleSx: SxProps<Theme> = {
    color: '#e0e0e0',
    opacity: 0.9
}
