/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignCurrentFichaContext } from '@contexts';
import { AmmoType } from '@enums';
import { 
    Add as AddIcon, 
    Remove as RemoveIcon,
    AttachMoney,
    Refresh,
    GpsFixed,
    FlashOn,
    Star,
    FiberManualRecord
} from '@mui/icons-material';
import { 
    Box, 
    Button, 
    Divider, 
    IconButton, 
    LinearProgress, 
    MenuItem, 
    Paper, 
    Select, 
    TextField, 
    Typography,
    Stack,
    Tooltip,
    Chip,
    useTheme
} from '@mui/material';
import { green, orange, blue, purple, red } from '@mui/material/colors';
import type { AmmoControl } from '@types';
import { type ReactElement, useState } from 'react';

export default function MoneyAndAmmo(): ReactElement {
    const { ficha, updateFicha } = useCampaignCurrentFichaContext();
    const theme = useTheme();
    const fichaCopy = { ...ficha };
    
    const [ ammo, setAmmo ] = useState<AmmoControl>({
        type: AmmoType.BULLET,
        current: ficha.ammoCounter.current,
        max: ficha.ammoCounter.max
    });

    const ammoPercent = (ammo.current / ammo.max) * 100;

    const handleAmmoChange = (type: 'increment' | 'decrement') => {
        setAmmo(prev => {
            const current = type === 'increment' 
                ? Math.min(prev.current + 1, prev.max)
                : Math.max(prev.current - 1, 0);
                
            fichaCopy.ammoCounter.current = current;

            return {
                ...prev,
                current
            }
        });

        updateFicha(fichaCopy);
    };

    const handleMaxAmmoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(1, parseInt(event.target.value) || 1);
        setAmmo(prev => {
            const current = Math.min(prev.current, newMax);
            fichaCopy.ammoCounter.max = newMax;
            fichaCopy.ammoCounter.current = current;

            return {
                ...prev,
                max: newMax,
                current
            }
        });

        updateFicha(fichaCopy);
    };

    const handleAmmoTypeChange = (event: any) => {
        setAmmo(prev => ({
            ...prev,
            type: event.target.value
        }));
    };

    const handleReload = () => {
        setAmmo(prev => {
            fichaCopy.ammoCounter.current = prev.max;

            return {
                ...prev,
                current: prev.max
            }
        });

        updateFicha(fichaCopy);
    };

    const getAmmoColor = (type: AmmoType) => {
        switch (type) {
        case AmmoType.BULLET:
            return { color: orange[600], bg: orange[100], icon: FiberManualRecord };
        case AmmoType.ARROW:
            return { color: green[600], bg: green[100], icon: GpsFixed };
        case AmmoType.ENERGY:
            return { color: blue[600], bg: blue[100], icon: FlashOn };
        case AmmoType.SPECIAL:
            return { color: purple[600], bg: purple[100], icon: Star };
        default:
            return { color: orange[600], bg: orange[100], icon: FiberManualRecord };
        }
    };

    const getAmmoTypeLabel = (type: AmmoType): string => {
        switch (type) {
        case AmmoType.BULLET:
            return 'Balas';
        case AmmoType.ARROW:
            return 'Flechas';
        case AmmoType.ENERGY:
            return 'Energia';
        case AmmoType.SPECIAL:
            return 'Especial';
        default:
            return 'Balas';
        }
    };

    const ammoConfig = getAmmoColor(ammo.type as AmmoType);
    const AmmoIcon = ammoConfig.icon;

    return (
        <Box sx={{ width: '100%' }}>
            <Stack spacing={3}>
                {/* Seção de Dinheiro */}
                <Paper 
                    elevation={2}
                    sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                            : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    <Stack spacing={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: green[100],
                                    border: '2px solid',
                                    borderColor: green[200]
                                }}
                            >
                                <AttachMoney sx={{ color: green[700], fontSize: '2rem' }} />
                            </Box>
                            <Box flex={1}>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: 'primary.main',
                                        mb: 0.5
                                    }}
                                >
                                    {ficha.mode === 'Classic' ? '¥ ' : '¢ '}Dinheiro
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Recursos financeiros do personagem
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box 
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <TextField
                                defaultValue={ficha.inventory.money}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    fichaCopy.inventory.money = value;
                                    updateFicha(fichaCopy);
                                }}
                                type="number"
                                variant="outlined"
                                size="medium"
                                inputProps={{ min: 0, step: 0.1 }}
                                sx={{ 
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: green[300]
                                        },
                                        '&:hover fieldset': {
                                            borderColor: green[500]
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: green[600]
                                        }
                                    }
                                }}
                            />
                            <Chip 
                                label="Créditos" 
                                sx={{ 
                                    bgcolor: green[100],
                                    color: green[800],
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </Box>
                    </Stack>
                </Paper>

                {/* Seção de Munição */}
                <Paper 
                    elevation={2}
                    sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                            : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    <Stack spacing={3}>
                        {/* Header da Munição */}
                        <Box display="flex" alignItems="center" gap={2}>
                            <Box 
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: ammoConfig.bg,
                                    border: '2px solid',
                                    borderColor: ammoConfig.color + '40'
                                }}
                            >
                                <AmmoIcon sx={{ color: ammoConfig.color, fontSize: '2rem' }} />
                            </Box>
                            <Box flex={1}>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: ammoConfig.color,
                                        mb: 0.5
                                    }}
                                >
                                    Munição - {getAmmoTypeLabel(ammo.type as AmmoType)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Controle de munição e recarregamento
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Controles de Tipo e Máximo */}
                        <Box 
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                flexWrap: 'wrap'
                            }}
                        >
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Tipo de Munição
                                </Typography>
                                <Select
                                    size="medium"
                                    value={ammo.type}
                                    onChange={handleAmmoTypeChange}
                                    sx={{ 
                                        minWidth: 140,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: ammoConfig.color + '60'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: ammoConfig.color
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: ammoConfig.color
                                        }
                                    }}
                                >
                                    <MenuItem value={AmmoType.BULLET}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <FiberManualRecord sx={{ color: orange[600], fontSize: '1rem' }} />
                                            Balas
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value={AmmoType.ARROW}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <GpsFixed sx={{ color: green[600], fontSize: '1rem' }} />
                                            Flechas
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value={AmmoType.ENERGY}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <FlashOn sx={{ color: blue[600], fontSize: '1rem' }} />
                                            Energia
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value={AmmoType.SPECIAL}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Star sx={{ color: purple[600], fontSize: '1rem' }} />
                                            Especial
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </Box>
                            
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Capacidade Máxima
                                </Typography>
                                <TextField
                                    size="medium"
                                    type="number"
                                    value={ammo.max}
                                    onChange={handleMaxAmmoChange}
                                    sx={{ 
                                        width: 120,
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: ammoConfig.color + '60'
                                            },
                                            '&:hover fieldset': {
                                                borderColor: ammoConfig.color
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: ammoConfig.color
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ ml: 'auto' }}>
                                <Tooltip title="Recarregar munição ao máximo">
                                    <Button
                                        variant="contained"
                                        onClick={handleReload}
                                        disabled={ammo.current >= ammo.max}
                                        startIcon={<Refresh />}
                                        sx={{
                                            bgcolor: ammoConfig.color,
                                            '&:hover': {
                                                bgcolor: ammoConfig.color,
                                                filter: 'brightness(0.9)'
                                            },
                                            '&:disabled': {
                                                bgcolor: 'action.disabledBackground'
                                            }
                                        }}
                                    >
                                        Recarregar
                                    </Button>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* Contador de Munição */}
                        <Box 
                            sx={{
                                p: 2,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" sx={{ color: ammoConfig.color, fontWeight: 600 }}>
                                    Munição Atual
                                </Typography>
                                <Chip 
                                    label={`${ammo.current} / ${ammo.max}`}
                                    sx={{
                                        bgcolor: ammoConfig.bg,
                                        color: ammoConfig.color,
                                        fontWeight: 700,
                                        fontSize: '1rem'
                                    }}
                                />
                            </Box>
                            
                            <LinearProgress
                                variant="determinate"
                                value={ammoPercent}
                                sx={{
                                    height: 16,
                                    borderRadius: 8,
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    mb: 2,
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: ammoConfig.color,
                                        borderRadius: 8,
                                        boxShadow: `0 0 10px ${ammoConfig.color}40`
                                    }
                                }}
                            />
                            
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Tooltip title="Usar 1 munição">
                                    <IconButton 
                                        onClick={() => handleAmmoChange('decrement')}
                                        disabled={ammo.current <= 0}
                                        sx={{
                                            bgcolor: red[50],
                                            color: red[600],
                                            '&:hover': {
                                                bgcolor: red[100]
                                            },
                                            '&:disabled': {
                                                bgcolor: 'action.disabledBackground',
                                                color: 'action.disabled'
                                            }
                                        }}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Adicionar 1 munição">
                                    <IconButton 
                                        onClick={() => handleAmmoChange('increment')}
                                        disabled={ammo.current >= ammo.max}
                                        sx={{
                                            bgcolor: green[50],
                                            color: green[600],
                                            '&:hover': {
                                                bgcolor: green[100]
                                            },
                                            '&:disabled': {
                                                bgcolor: 'action.disabledBackground',
                                                color: 'action.disabled'
                                            }
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Stack>
        </Box>
    );
}
