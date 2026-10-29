import { createTheme, responsiveFontSizes, type Shadows } from '@mui/material/styles'
import { color, duration, font, radius, shadow } from './tokens'

/**
 * Sombra só na camada flutuante: elevação 0 a 6 (cartões e painéis) é plana e a separação vem da borda;
 * 7 a 24 (menus, popovers, drawer e modal) usa `shadow.overlay`.
 */
const shadows = Array.from({ length: 25 }, (_, elevation) => (elevation <= 6 ? shadow.none : shadow.overlay)) as Shadows

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

    shadows,

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
        // Paper: sem a camada de gradiente branco que o MUI aplica no modo escuro; borda de 1px no lugar da sombra
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
                elevation: { border: `1px solid ${color.border}` }
            }
        },
        MuiDialog: {
            styleOverrides: { paper: { backgroundColor: color.surfaceOverlay, borderRadius: radius.lg } }
        },
        MuiMenu: { styleOverrides: { paper: { backgroundColor: color.surfaceOverlay, borderRadius: radius.md } } },
        MuiPopover: { styleOverrides: { paper: { backgroundColor: color.surfaceOverlay, borderRadius: radius.md } } },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: color.surfaceOverlay,
                    color: color.ink,
                    border: `1px solid ${color.border}`,
                    fontSize: 12.5
                },
                arrow: { color: color.surfaceOverlay }
            }
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { transition: `background-color ${duration.fast}ms, border-color ${duration.fast}ms, color ${duration.fast}ms` } }
        },
        MuiButtonBase: {
            styleOverrides: { root: { '&.Mui-focusVisible': { outline: `2px solid ${color.amber}`, outlineOffset: 2 } } }
        },
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
