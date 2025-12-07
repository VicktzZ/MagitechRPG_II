import { Box, CircularProgress, Typography, Button } from '@mui/material'

interface LoadingStateProps {
    loading: boolean
    error: string | null
    onRetry: () => void
}

export function LoadingState({ loading, error, onRetry }: LoadingStateProps) {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={60} sx={{ color: 'white' }} />
                <Typography variant="h6" color="white">
                    Buscando vantagens...
                </Typography>
            </Box>
        )
    }

    if (error) {
        const isNoResults = error.includes('Nenhuma vantagem encontrada')
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" color={isNoResults ? 'warning.main' : 'error'}>
                    {isNoResults ? 'Sem resultados' : 'Erro ao carregar perks'}
                </Typography>
                <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" textAlign="center">
                    {error}
                </Typography>
                {!isNoResults && (
                    <Button
                        variant="outlined"
                        onClick={onRetry}
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.5)',
                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        Tentar novamente
                    </Button>
                )}
            </Box>
        )
    }

    return null
}
