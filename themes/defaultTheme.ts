import { createTheme, responsiveFontSizes } from '@mui/material'

const theme = createTheme({
    palette: {
        mode: 'dark',

        // Brand Colors - Base azul para neutros
        brand: {
            100: '#f8fafc',
            200: '#e2e8f0',
            300: '#cbd5e0',
            400: '#a0aec0',
            500: '#718096',
            600: '#4a5568',
            700: '#2d3748',
            800: '#1a2234',
            900: '#0f172a'
        },

        // Cores de fundo - Tons mais suaves de azul-escuro
        background: {
            light: '#f8fafc', // Papel claro para tema light
            dark: '#0f172a',  // Fundo escuro para tema dark
            paper: '#1e293b',  // Principal plano de fundo para cartões em modo dark
            paper2: '#334155', // Secundário para cartões elevados em modo dark
            paper3: '#1a2234', // Para componentes inativos em modo dark
            paper4: '#0f172a'  // Fundo mais profundo em modo dark
        },

        // Cor primária - Azul mais vibrante e acessível
        primary: {
            main: '#3b82f6',  // Azul mais vivo e atraente
            light: '#60a5fa', // Versão mais clara para hover/destaques
            dark: '#2563eb'   // Versão mais escura para estados ativos
        },

        // Cor secundária - Roxo mais harmonioso com o azul
        secondary: {
            main: '#8b5cf6',  // Roxo mais equilibrado
            light: '#a78bfa', // Versão clara para elementos secundários
            dark: '#7c3aed'   // Versão escura para estados ativos
        },
        
        // Cores de apoio
        success: {
            main: '#10b981',  // Verde mais suave e moderno
            light: '#34d399',
            dark: '#059669'
        },
        
        error: {
            main: '#ef4444',  // Vermelho menos agressivo
            light: '#f87171',
            dark: '#dc2626'
        },
        
        warning: {
            main: '#f59e0b',  // Laranja/amarelo mais agradável
            light: '#fbbf24',
            dark: '#d97706'
        },
        
        info: {
            main: '#0ea5e9',  // Azul info mais distinto do primário
            light: '#38bdf8',
            dark: '#0284c7'
        },

        // Cor terciária - Rosa mais suave
        terciary: {
            main: '#ec4899',  // Rosa mais equilibrado com o resto da paleta
            light: '#f472b6',
            dark: '#db2777'
        }
    },

    typography: {
        fontFamily: '\'Inter\', \'Poppins\', sans-serif'
    },

    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    color: 'rgba(0, 0, 0, 0.42)',
                    borderColor: 'black'
                }
            }
        },

        MuiCssBaseline: {
            styleOverrides: {
                scrollBehavior: 'smooth',
                
                // Custom Scrollbar

                body: {
                    backgroundColor: '#fafafa'
                },

                '::-webkit-scrollbar': {
                    width: '10px'
                },

                '::-webkit-scrollbar-track:': {
                    background: '#fafafa'
                },

                '::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '10px'
                },

                '::-webkit-scrollbar-thumb:hover': {
                    background: '#555'
                }
            }
        }
    }
})

export default responsiveFontSizes(theme)