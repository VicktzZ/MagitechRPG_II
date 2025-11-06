import { Box, Button, Typography } from '@mui/material';
import { indigo, lime, orange } from '@mui/material/colors';
import { useState } from 'react';

export function StatusBar({
    label,
    current,
    max,
    color,
    icon,
    onIncrease,
    onDecrease
}: {
    label: string,
    current: number,
    max: number,
    color: string,
    icon: string,
    onIncrease: (value: number) => void,
    onDecrease: (value: number) => void
}) {
    const isOverhealed = current > max;
    const overValue = Math.max(0, current - max);

    const overPercentage = (overValue / max) * 100; // Percentual do overheal
    const normalPercentage = (current / max) * 100; // Percentual normal quando não tem overheal

    const [inputValue, setInputValue] = useState(1);

    const handleInputChange = (e: any) => {
        const value = parseInt(e.target.value) || 1;
        setInputValue(Math.max(1, value));
    };

    const getOverhealColor = (baseColor: string) => {
        const colorMap: Record<string, string> = {
            '#ef4444': orange['A700'],
            '#3b82f6': indigo['A700'],
            '#eab308': lime['A700']
        };
        return colorMap[baseColor] || baseColor;
    };

    const overhealColor = getOverhealColor(color);

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '16px' }}>{icon}</span>
                    <Typography variant="caption" sx={{ color: '#d1d5db', fontWeight: 500, fontSize: { xs: '10px', sm: '12px' } }}>
                        {label}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            ml: 0.5,
                            color: 'white' // Sempre branco para boa legibilidade
                        }}
                    >
                        {current}/{max}
                        {isOverhealed && (
                            <span style={{
                                fontSize: '10px',
                                marginLeft: '4px',
                                color: '#fbbf24', // Amarelo para destacar o overheal
                                fontWeight: 600
                            }}>
                                (+{overValue})
                            </span>
                        )}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Box>
                        <Button
                            onClick={() => onDecrease(inputValue)}
                            disabled={current <= 0}
                            sx={{
                                width: '40px',
                                height: '24px',
                                minWidth: 'unset',
                                bgcolor: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                '&:hover': {
                                    bgcolor: 'rgba(239, 68, 68, 0.3)'
                                },
                                '&:disabled': {
                                    opacity: 0.3
                                }
                            }}
                        >
                            −
                        </Button>
                    </Box>
                    <input
                        type="number"
                        min="1"
                        value={inputValue}
                        onChange={handleInputChange}
                        style={{
                            width: '40px',
                            height: '24px',
                            textAlign: 'center',
                            backgroundColor: 'rgba(71, 85, 105, 0.3)',
                            border: '1px solid rgba(71, 85, 105, 0.5)',
                            borderRadius: '4px',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 600
                        }}
                    />
                    <Button
                        onClick={() => onIncrease(inputValue)}
                        disabled={current >= max * 2}
                        sx={{
                            width: '40px',
                            height: '24px',
                            minWidth: 'unset',
                            bgcolor: 'rgba(34, 197, 94, 0.2)',
                            color: '#4ade80',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            '&:hover': {
                                bgcolor: 'rgba(34, 197, 94, 0.3)'
                            },
                            '&:disabled': {
                                opacity: 0.3
                            }
                        }}
                    >
                        +
                    </Button>
                </Box>
            </Box>

            <Box sx={{ position: 'relative', height: '6px', bgcolor: 'rgba(71, 85, 105, 0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                {isOverhealed ? (
                    <>
                        {/* Barra base completa (100%) */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: '100%',
                            bgcolor: color,
                            zIndex: 1
                        }} />

                        {/* Barra de overheal por cima (começa do 0 novamente) */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${Math.min(overPercentage, 100)}%`,
                            bgcolor: overhealColor,
                            transition: 'width 0.3s ease',
                            zIndex: 2,
                            boxShadow: `0 0 8px ${overhealColor}`
                        }} />
                    </>
                ) : (
                    /* Barra normal (0-100%) */
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${Math.min(normalPercentage, 100)}%`,
                        bgcolor: color,
                        transition: 'width 0.3s ease',
                        zIndex: 1
                    }} />
                )}
            </Box>
            <Box display='flex' justifyContent='flex-end'>
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.7)', // Mais visível
                        zIndex: 3
                    }}
                >
                    {isOverhealed ? `${Math.round((current / max) * 100)}%` : `${Math.round(normalPercentage)}%`}
                </Typography>
            </Box>
        </Box>
    );
};