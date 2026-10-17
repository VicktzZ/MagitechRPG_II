import '@mui/material/styles'

declare module '@mui/material/styles/createPalette' {
    /** Camadas de superfície além de `default` (canvas) e `paper` (surface) */
    interface TypeBackground {
        /** Cartões, campos e linhas de tabela (surfaceRaised) */
        raised: string
        /** Menus, popovers, tooltips e modais (surfaceOverlay) */
        overlay: string
    }
}
