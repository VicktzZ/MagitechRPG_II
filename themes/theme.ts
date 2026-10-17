import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { color, font } from './tokens'

/**
 * Tema do MUI gerado dos tokens (`themes/tokens.ts`). Só existe o tema escuro.
 *
 * `primary` é o âmbar (a única cor de ação). `secondary` é neutro: ação secundária é contorno cinza,
 * não uma segunda cor. `info` é o ciano do logo.
 */
const theme = createTheme({
    palette: {
        mode: 'dark',

        primary: {
            main: color.amber,
            light: color.amberHover,
            dark: color.amberPressed,
            contrastText: color.onAmber
        },
        secondary: {
            main: color.inkMuted,
            light: color.ink,
            dark: color.inkFaint,
            contrastText: color.canvas
        },
        success: { main: color.success, contrastText: color.canvas },
        warning: { main: color.warning, contrastText: color.canvas },
        error: { main: color.danger, contrastText: color.canvas },
        info: { main: color.cyan, contrastText: color.canvas },

        text: {
            primary: color.ink,
            secondary: color.inkMuted,
            disabled: color.inkFaint
        },
        divider: color.border,
        background: {
            default: color.canvas,
            paper: color.surface,
            raised: color.surfaceRaised,
            overlay: color.surfaceOverlay
        },
        action: {
            hover: 'rgba(236, 231, 220, 0.06)',
            selected: 'rgba(232, 163, 61, 0.16)',
            disabled: color.inkFaint,
            disabledBackground: color.surfaceOverlay,
            focus: 'rgba(232, 163, 61, 0.24)'
        }
    },

    // Raio base de 4px: `borderRadius: 1` = sm (4px), `2` = md (8px), `3` = lg (12px)
    shape: { borderRadius: 4 },

    // Títulos de página, modal e seção (h1 a h4) em Chakra Petch; h5 e h6 seguem o texto, em 600
    typography: {
        fontFamily: font.text,
        h1: { fontFamily: font.display, fontWeight: 600 },
        h2: { fontFamily: font.display, fontWeight: 600 },
        h3: { fontFamily: font.display, fontWeight: 600 },
        h4: { fontFamily: font.display, fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 }
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: { scrollBehavior: 'smooth' },
                body: { backgroundColor: color.canvas },

                '::-webkit-scrollbar': { width: '10px', height: '10px' },
                '::-webkit-scrollbar-track': { background: color.canvas },
                '::-webkit-scrollbar-thumb': { background: color.borderStrong, borderRadius: '10px' },
                '::-webkit-scrollbar-thumb:hover': { background: color.inkFaint }
            }
        }
    }
})

export default responsiveFontSizes(theme)
