import { Box, CircularProgress, Typography, Button } from '@mui/material'
import { color } from '@themes/tokens'

interface LoadingStateProps {
    loading: boolean
    error: string | null
    onRetry: () => void
}

export function LoadingState({ loading, error, onRetry }: LoadingStateProps) {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={60} sx={{ color: 'text.primary' }} />
                <Typography variant="h6" color="text.primary">
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
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    {error}
                </Typography>
                {!isNoResults && (
                    <Button
                        variant="outlined"
                        onClick={onRetry}
                        sx={{
                            color: 'text.primary',
                            borderColor: 'divider',
                            '&:hover': {
                                borderColor: color.borderStrong,
                                bgcolor: 'action.hover'
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
