import { createTheme, responsiveFontSizes } from '@mui/material'

const theme = createTheme({
    palette: {
        mode: 'dark',

        brand: {
            100: '#f7fafc',
            200: '#edf2f7',
            300: '#e2e8f0',
            400: '#cbd5e0',
            500: '#a0aec0',
            600: '#718096',
            700: '#4a5568',
            800: '#2d3748',
            900: '#1a202c'
        },

        background: {
            light: '#f4f4f4',
            dark: '#0d0e1b',
            paper: '#2f2f41',
            paper2: '#38384d',
            paper3: '#1f1f2e',
            paper4: '#07070f'
        },

        primary: {
            main: '#6d8dc6',
            light: '#34435f',
            dark: '#263145'
        },

        secondary: {
            main: '#8f61d7',
            light: '#a771fc',
            dark: '#5c3e8a'
        },

        terciary: {
            main: '#ff26b2',
            light: '#ff8fd7',
            dark: '#cc1e8e'
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