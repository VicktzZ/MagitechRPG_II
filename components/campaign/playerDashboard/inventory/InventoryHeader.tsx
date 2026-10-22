import { CheckCircle, Inventory2, Warning } from '@mui/icons-material';
import { Box, LinearProgress, Stack, Tooltip, Typography, alpha } from '@mui/material';
import { color } from '@themes/tokens';
import type { ReactElement } from 'react';

interface InventoryHeaderProps {
    totalItems: number;
    totalWeight: number;
    /** Capacidade máxima da ficha (`capacity.max`) */
    maxCapacity: number;
    weightUnitSuffix: string;
    capacityPercent: number;
    isOverloaded: boolean;
    isNearLimit: boolean;
    /** Papel de cor do medidor de capacidade: erro na sobrecarga, alerta perto do limite, sucesso no resto */
    capacityRole: 'error' | 'warning' | 'success';
}

/** Cabeçalho do inventário: título com a contagem de itens, peso carregado/capacidade e a barra de capacidade */
export default function InventoryHeader({
    totalItems,
    totalWeight,
    maxCapacity,
    weightUnitSuffix,
    capacityPercent,
    isOverloaded,
    isNearLimit,
    capacityRole
}: InventoryHeaderProps): ReactElement {
    return (
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} mb={2}>
                <Box display="flex" alignItems="center" gap={2} flex={1}>
                    <Box 
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: alpha(color.amber, 0.08),
                            border: `2px solid ${alpha(color.amber, 0.19)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Inventory2 sx={{ color: 'primary.main', fontSize: '1.75rem' }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Inventário
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                        </Typography>
                    </Box>
                </Box>
                
                {/* Status de Capacidade */}
                <Tooltip title={isOverloaded ? 'Sobrecarga!' : isNearLimit ? 'Próximo do limite' : 'Capacidade OK'}>
                    <Box 
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: (theme) => alpha(theme.palette[capacityRole].main, 0.08),
                            border: '1px solid',
                            borderColor: (theme) => alpha(theme.palette[capacityRole].main, 0.19)
                        }}
                    >
                        {isOverloaded ? (
                            <Warning sx={{ color: 'error.main', fontSize: '1.2rem' }} />
                        ) : isNearLimit ? (
                            <Warning sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                        ) : (
                            <CheckCircle sx={{ color: 'success.main', fontSize: '1.2rem' }} />
                        )}
                        <Typography variant="body2" fontWeight={600}>
                            {totalWeight.toFixed(1)}/{maxCapacity}{weightUnitSuffix}
                        </Typography>
                    </Box>
                </Tooltip>
            </Stack>
            
            {/* Barra de Capacidade */}
            <Box sx={{ position: 'relative' }}>
                <LinearProgress
                    variant="determinate"
                    value={Math.min(capacityPercent, 100)}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'divider',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: `${capacityRole}.main`,
                            borderRadius: 4
                        }
                    }}
                />
                {isOverloaded && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '100%',
                            bgcolor: alpha(color.danger, 0.19),
                            borderRadius: 4
                        }}
                    />
                )}
            </Box>
        </Box>
    );
}
