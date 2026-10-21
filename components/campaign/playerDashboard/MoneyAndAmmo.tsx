/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignCurrentCharsheetContext } from '@contexts';
import { AmmoType } from '@enums';
import type { AmmoControl } from '@models/types/misc';
import {
    Add as AddIcon,
    AttachMoney,
    FiberManualRecord,
    FlashOn,
    GpsFixed,
    Refresh,
    Remove as RemoveIcon,
    Star
} from '@mui/icons-material';
import {
    alpha,
    Box,
    Button,
    Chip,
    IconButton,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { color } from '@themes/tokens';
import React, { type ReactElement, useState, useEffect } from 'react';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';

export default function MoneyAndAmmo(): ReactElement {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { system: customSystem } = useCharsheetSystem(charsheet?.systemId);
    const showCurrency = !customSystem || customSystem.currency?.enabled !== false;
    const currencyLabel = customSystem?.currency?.name ?? 'Dinheiro';
    const currencyAbbreviation = customSystem?.currency?.abbreviation ?? (charsheet.mode === 'Classic' ? '¥' : '¢');

    const [ ammo, setAmmo ] = useState<AmmoControl>({
        type: AmmoType.BULLET,
        current: charsheet.ammoCounter.current,
        max: charsheet.ammoCounter.max
    });

    // Estado local para dinheiro - sincroniza com charsheet
    const [ money, setMoney ] = useState(charsheet.inventory?.money ?? 0);
    
    // Sincroniza o estado local quando o charsheet muda (atualização externa)
    useEffect(() => {
        setMoney(charsheet.inventory?.money ?? 0);
    }, [ charsheet.inventory?.money ]);

    // Mantém a munição em sincronia com alterações externas (mestre, outra aba/dispositivo)
    useEffect(() => {
        setAmmo(prev => ({
            ...prev,
            current: charsheet.ammoCounter?.current ?? 0,
            max: charsheet.ammoCounter?.max ?? 0
        }));
    }, [ charsheet.ammoCounter?.current, charsheet.ammoCounter?.max ]);

    const ammoPercent = ammo.max > 0 ? (ammo.current / ammo.max) * 100 : 0;

    const handleAmmoChange = (type: 'increment' | 'decrement') => {
        setAmmo(prev => {
            const current = type === 'increment' 
                ? Math.min(prev.current + 1, prev.max)
                : Math.max(prev.current - 1, 0);
                
            // Atualizar no Firestore em tempo real
            updateCharsheet({
                ammoCounter: {
                    current,
                    max: prev.max
                }
            });

            return {
                ...prev,
                current
            }
        });
    };

    const handleMaxAmmoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(1, parseInt(event.target.value) || 1);
        setAmmo(prev => {
            const current = Math.min(prev.current, newMax);

            // Atualizar no Firestore em tempo real
            updateCharsheet({
                ammoCounter: {
                    current,
                    max: newMax
                }
            });

            return {
                ...prev,
                max: newMax,
                current
            }
        });
    };

    const handleReload = () => {
        setAmmo(prev => {
            // Atualizar no Firestore em tempo real
            updateCharsheet({
                ammoCounter: {
                    current: prev.max,
                    max: prev.max
                }
            });

            return {
                ...prev,
                current: prev.max
            }
        });
    };

    const handleAmmoTypeChange = (event: any) => {
        setAmmo(prev => ({
            ...prev,
            type: event.target.value
        }));
    };

    const getAmmoColor = (type: AmmoType) => {
        switch (type) {
        case AmmoType.BULLET:
            return { color: color.warning, bg: alpha(color.warning, 0.14), icon: FiberManualRecord };
        case AmmoType.ARROW:
            return { color: color.success, bg: alpha(color.success, 0.14), icon: GpsFixed };
        case AmmoType.ENERGY:
            return { color: color.cyan, bg: alpha(color.cyan, 0.14), icon: FlashOn };
        case AmmoType.SPECIAL:
            return { color: color.amber, bg: alpha(color.amber, 0.14), icon: Star };
        default:
            return { color: color.warning, bg: alpha(color.warning, 0.14), icon: FiberManualRecord };
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
                {/* Seção de Dinheiro — some quando o sistema desabilita moeda */}
                {showCurrency && (
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                                        border: '2px solid',
                                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.38)
                                    }}
                                >
                                    <AttachMoney sx={{ color: 'primary.main', fontSize: '2rem' }} />
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
                                        {currencyAbbreviation} {currencyLabel}
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
                                    bgcolor: 'background.raised',
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <TextField
                                    value={money}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        setMoney(value);
                                        // Atualizar no Firestore em tempo real — só o dinheiro:
                                        // gravar o inventário inteiro sobrescrevia itens recebidos
                                        // ao mesmo tempo (loja, doação, mestre)
                                        updateCharsheet({
                                            'inventory.money': value
                                        } as any);
                                    }}
                                    type="number"
                                    variant="outlined"
                                    size="medium"
                                    inputProps={{ min: 0, step: 0.1 }}
                                    sx={{
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: color.amberLine
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'primary.main'
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main'
                                            }
                                        }
                                    }}
                                />
                                <Chip
                                    label={currencyAbbreviation}
                                    sx={{
                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Paper>
                )}

                {/* Seção de Munição */}
                <Paper 
                    elevation={2}
                    sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
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
                                    borderColor: alpha(ammoConfig.color, 0.25)
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
                                            borderColor: alpha(ammoConfig.color, 0.38)
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
                                            <FiberManualRecord sx={{ color: 'warning.main', fontSize: '1rem' }} />
                                            Balas
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value={AmmoType.ARROW}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <GpsFixed sx={{ color: 'success.main', fontSize: '1rem' }} />
                                            Flechas
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value={AmmoType.ENERGY}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <FlashOn sx={{ color: 'info.main', fontSize: '1rem' }} />
                                            Energia
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value={AmmoType.SPECIAL}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Star sx={{ color: 'primary.main', fontSize: '1rem' }} />
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
                                                borderColor: alpha(ammoConfig.color, 0.38)
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
                                bgcolor: 'background.raised',
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
                                    bgcolor: 'divider',
                                    mb: 2,
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: ammoConfig.color,
                                        borderRadius: 8
                                    }
                                }}
                            />
                            
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <Tooltip title="Usar 1 munição">
                                    <IconButton 
                                        onClick={() => handleAmmoChange('decrement')}
                                        disabled={ammo.current <= 0}
                                        sx={{
                                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.14),
                                            color: 'error.main',
                                            '&:hover': {
                                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.24)
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
                                            bgcolor: (theme) => alpha(theme.palette.success.main, 0.14),
                                            color: 'success.main',
                                            '&:hover': {
                                                bgcolor: (theme) => alpha(theme.palette.success.main, 0.24)
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
