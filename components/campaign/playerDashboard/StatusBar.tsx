import { Add, Remove } from '@mui/icons-material';
import { alpha, Box, IconButton, Stack, Typography, type Theme } from '@mui/material';
import { NumberField } from '@components/misc';
import { color as tokenColor, font } from '@themes/tokens';
import { type ReactNode, useState } from 'react';

interface StatusBarProps {
    label: string;
    current: number;
    max: number;
    color: string;
    icon: ReactNode;
    onIncrease: (value: number) => void;
    onDecrease: (value: number) => void;
}

/** Lado do botão de − e +: alvo de toque confortável durante o combate */
const BUTTON_SIZE = 36;

/**
 * Medidor de um ponto vital (vida, mana, armadura) com os controles de dano e cura. A barra é um
 * `meter` acessível (valor, mínimo e máximo anunciados) e a quantidade usa o campo numérico do app
 * (dá para apagar e digitar um valor novo; o foco seleciona o que já está lá).
 */
export function StatusBar({ label, current, max, color, icon, onIncrease, onDecrease }: StatusBarProps) {
    const [ amount, setAmount ] = useState(1);

    const isOverhealed = current > max;
    const overValue = Math.max(0, current - max);
    // Máximo zero (ex.: sistema customizado sem armadura) não pode dividir por zero
    const safeMax = Math.max(max, 1);
    const normalPercentage = Math.min((current / safeMax) * 100, 100);
    const overPercentage = Math.min((overValue / safeMax) * 100, 100);

    const tint = (role: 'error' | 'success', opacity: number) => (theme: Theme) => alpha(theme.palette[role].main, opacity);

    const stepButton = (role: 'error' | 'success') => ({
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: 1,
        color: 'text.primary',
        border: '1px solid',
        borderColor: tint(role, 0.4),
        bgcolor: tint(role, 0.16),
        '&:hover': { bgcolor: tint(role, 0.28) },
        '&.Mui-disabled': { opacity: 0.35, color: 'text.primary' }
    });

    return (
        <Box sx={{ mb: 2.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" columnGap={2} rowGap={1} sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                    <Box component="span" aria-hidden sx={{ display: 'inline-flex', fontSize: 18, color }}>{icon}</Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
                    <Typography variant="body2" sx={{ fontFamily: font.mono, fontWeight: 700 }}>
                        {current}/{max}
                        {isOverhealed && (
                            <Box component="span" sx={{ ml: 0.5, color: 'primary.main', fontWeight: 600 }}>
                                (+{overValue})
                            </Box>
                        )}
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <IconButton
                        aria-label={`Diminuir ${label} em ${amount}`}
                        onClick={() => { onDecrease(amount); }}
                        disabled={current <= 0}
                        sx={stepButton('error')}
                    >
                        <Remove fontSize="small" />
                    </IconButton>
                    <NumberField
                        value={amount}
                        onChange={setAmount}
                        min={1}
                        size="small"
                        onFocus={(event) => { event.target.select(); }}
                        inputProps={{ 'aria-label': `Quantidade de ${label} a somar ou tirar`, style: { textAlign: 'center' } }}
                        sx={{
                            width: 60,
                            '& .MuiInputBase-root': { height: BUTTON_SIZE, bgcolor: 'background.raised', fontFamily: font.mono, fontWeight: 600 },
                            '& .MuiInputBase-input': { py: 0, px: 0.5 }
                        }}
                    />
                    <IconButton
                        aria-label={`Aumentar ${label} em ${amount}`}
                        onClick={() => { onIncrease(amount); }}
                        disabled={current >= max * 2}
                        sx={stepButton('success')}
                    >
                        <Add fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            <Box
                role="meter"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={current}
                aria-valuetext={`${current} de ${max}${isOverhealed ? `, ${overValue} acima do máximo` : ''}`}
                sx={{ position: 'relative', height: 8, bgcolor: 'divider', borderRadius: '4px', overflow: 'hidden' }}
            >
                {/* Acima do máximo: a barra fica cheia na cor do ponto e o excesso é desenhado por cima, em âmbar */}
                <Box sx={{ position: 'absolute', inset: 0, right: 'auto', width: `${isOverhealed ? 100 : normalPercentage}%`, bgcolor: color, transition: 'width 0.3s ease' }} />
                {isOverhealed && (
                    <Box sx={{ position: 'absolute', inset: 0, right: 'auto', width: `${overPercentage}%`, bgcolor: tokenColor.amber, transition: 'width 0.3s ease' }} />
                )}
            </Box>
        </Box>
    );
}
