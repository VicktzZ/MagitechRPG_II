import type { SxProps, Theme } from '@mui/material'

/**
 * Cartão plano: superfície `raised`, borda de 1px na cor da raridade (ou neutra) e nenhum brilho.
 * No hover só o fundo muda (a borda carrega a raridade, então não pode trocar de cor).
 */
export const getCardSx = (borderColor: string, clickable = true): SxProps<Theme> => ({
    position: 'relative',
    overflow: 'hidden',
    width: { xs: 280, sm: 300, md: 330 },
    height: { xs: 420, sm: 450, md: 480 },
    borderRadius: 2,
    border: '1px solid',
    borderColor,
    boxShadow: 'none',
    bgcolor: 'background.raised',
    cursor: 'pointer',
    transition: 'border-color 120ms, background-color 120ms',
    ...(clickable && { '&:hover': { bgcolor: 'background.overlay' } })
})

export const attributeBoxSx: SxProps<Theme> = {
    px: 0.75,
    py: 0.5,
    borderRadius: 1,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper'
}

export const attributeLabelSx: SxProps<Theme> = {
    color: 'text.secondary',
    fontWeight: 700,
    letterSpacing: 0.3,
    fontSize: '0.65rem'
}

export const attributeValueSx: SxProps<Theme> = {
    color: 'text.primary',
    fontWeight: 600,
    fontSize: '0.8rem'
}

export const attributeValueBoldSx: SxProps<Theme> = {
    color: 'text.primary',
    fontWeight: 700,
    fontSize: '0.8rem'
}

export const chipSx: SxProps<Theme> = {
    borderColor: 'divider',
    color: 'text.secondary',
    fontSize: '0.7rem',
    height: 24
}

/** Nome da raridade (ou do elemento) em texto, com contorno de 1px na mesma cor */
export const getRarityChipSx = (markColor: string): SxProps<Theme> => ({
    bgcolor: 'transparent',
    color: markColor,
    border: '1px solid',
    borderColor: markColor,
    textTransform: 'uppercase',
    fontWeight: 800,
    letterSpacing: 1
})

export const descriptionSx: SxProps<Theme> = {
    color: 'text.primary',
    flexGrow: 1,
    lineHeight: 1.35,
    overflow: 'auto',
    maxHeight: { xs: 120, sm: 140, md: 160 },
    pr: 1,
    '&::-webkit-scrollbar': { width: '4px' },
    '&::-webkit-scrollbar-track': {
        bgcolor: 'transparent',
        borderRadius: '2px'
    },
    '&::-webkit-scrollbar-thumb': {
        bgcolor: 'divider',
        borderRadius: '2px'
    }
}

export const titleSx: SxProps<Theme> = {
    fontWeight: 900,
    color: 'text.primary',
    letterSpacing: 0.2
}

export const subtitleSx: SxProps<Theme> = {
    color: 'text.secondary'
}
