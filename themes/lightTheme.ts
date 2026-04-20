import { createTheme, responsiveFontSizes } from '@mui/material'

const theme = createTheme({
    palette: {
        mode: 'light',

        // Brand Colors - Base azul para neutros
        brand: {
            100: '#0f172a',
            200: '#1a2234',
            300: '#2d3748',
            400: '#4a5568',
            500: '#718096',
            600: '#a0aec0',
            700: '#cbd5e0',
            800: '#e2e8f0',
            900: '#f8fafc'
        },

        // Cores de fundo - Tons mais suaves de azul-claro
        background: {
            light: '#f8fafc', // Papel claro para tema light
            dark: '#0f172a',  // Fundo escuro para tema dark
            paper: '#ffffff',  // Principal plano de fundo para cartões em modo light
            paper2: '#f1f5f9', // Secundário para cartões elevados em modo light
            paper3: '#e2e8f0', // Para componentes inativos em modo light
            paper4: '#cbd5e0'  // Fundo mais profundo em modo light
        },

        // Cor primária - Azul mais vibrante e acessível
        primary: {
            main: '#2563eb',  // Azul mais vivo e atraente
            light: '#3b82f6', // Versão mais clara para hover/destaques
            dark: '#1d4ed8'   // Versão mais escura para estados ativos
        },

        // Cor secundária - Roxo mais harmonioso com o azul
        secondary: {
            main: '#7c3aed',  // Roxo mais equilibrado
            light: '#8b5cf6', // Versão clara para elementos secundários
            dark: '#6d28d9'   // Versão escura para estados ativos
        },
        
        // Cores de apoio
        success: {
            main: '#059669',  // Verde mais suave e moderno
            light: '#10b981',
            dark: '#047857'
        },
        
        error: {
            main: '#dc2626',  // Vermelho menos agressivo
            light: '#ef4444',
            dark: '#b91c1c'
        },
        
        warning: {
            main: '#d97706',  // Laranja/amarelo mais agradável
            light: '#f59e0b',
            dark: '#b45309'
        },
        
        info: {
            main: '#0284c7',  // Azul info mais distinto do primário
            light: '#0ea5e9',
            dark: '#0369a1'
        },

        // Cor terciária - Rosa mais suave
        terciary: {
            main: '#db2777',  // Rosa mais equilibrado com o resto da paleta
            light: '#ec4899',
            dark: '#be185d'
        }
    },

    typography: {
        fontFamily: '\'Inter\', \'Poppins\', sans-serif'
    },

    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    color: 'rgba(0, 0, 0, 0.87)',
                    borderColor: '#e2e8f0'
                }
            }
        },

        MuiCssBaseline: {
            styleOverrides: {
                scrollBehavior: 'smooth',
                
                // Custom Scrollbar

                body: {
                    backgroundColor: '#f8fafc'
                },

                '::-webkit-scrollbar': {
                    width: '10px'
                },

                '::-webkit-scrollbar-track:': {
                    background: '#f8fafc'
                },

                '::-webkit-scrollbar-thumb': {
                    background: '#cbd5e0',
                    borderRadius: '10px'
                },

                '::-webkit-scrollbar-thumb:hover': {
                    background: '#a0aec0'
                }
            }
        }
    }
})

export default responsiveFontSizes(theme)
