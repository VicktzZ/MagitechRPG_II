import { alpha, Box, Button, Typography } from '@mui/material';
import { color as tokenColor } from '@themes/tokens';
import { type ReactNode, useState } from 'react';

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
    icon: ReactNode,
    onIncrease: (value: number) => void,
    onDecrease: (value: number) => void
}) {
    const isOverhealed = current > max;
    const overValue = Math.max(0, current - max);

    const overPercentage = (overValue / max) * 100; // Percentual do overheal
    const normalPercentage = (current / max) * 100; // Percentual normal quando não tem overheal

    const [ inputValue, setInputValue ] = useState(1);

    const handleInputChange = (e: any) => {
        const value = parseInt(e.target.value) || 1;
        setInputValue(Math.max(1, value));
    };

    // O overheal é sempre âmbar: destaca-se de LP (vermelho), MP (ciano) e AP (cinza) e combina com o "(+N)" do texto
    const overhealColor = tokenColor.amber;

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: '16px', display: 'inline-flex', color }}>{icon}</span>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: { xs: '10px', sm: '12px' } }}>
                        {label}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            ml: 0.5,
                            color: 'text.primary' // Texto principal para boa legibilidade
                        }}
                    >
                        {current}/{max}
                        {isOverhealed && (
                            <span style={{
                                fontSize: '10px',
                                marginLeft: '4px',
                                color: tokenColor.amber, // Âmbar para destacar o overheal
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
                                bgcolor: alpha(tokenColor.danger, 0.16),
                                color: 'text.primary',
                                border: `1px solid ${alpha(tokenColor.danger, 0.4)}`,
                                '&:hover': {
                                    bgcolor: alpha(tokenColor.danger, 0.28)
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
                            backgroundColor: tokenColor.surfaceRaised,
                            border: `1px solid ${tokenColor.borderControl}`,
                            borderRadius: '4px',
                            color: tokenColor.ink,
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
                            bgcolor: alpha(tokenColor.success, 0.16),
                            color: 'text.primary',
                            border: `1px solid ${alpha(tokenColor.success, 0.4)}`,
                            '&:hover': {
                                bgcolor: alpha(tokenColor.success, 0.28)
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

            <Box sx={{ position: 'relative', height: '6px', bgcolor: 'divider', borderRadius: '3px', overflow: 'hidden' }}>
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
                            zIndex: 2
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
                        color: 'text.secondary', // Mais visível
                        zIndex: 3
                    }}
                >
                    {isOverhealed ? `${Math.round((current / max) * 100)}%` : `${Math.round(normalPercentage)}%`}
                </Typography>
            </Box>
        </Box>
    );
};