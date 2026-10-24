'use client';

import { Add, Remove } from '@mui/icons-material';
import { Box, IconButton, Stack, TextField, Typography } from '@mui/material';
import { parseVitalAmount, type VitalKey } from '@utils/vitals';
import { useState, type ReactElement } from 'react';
import StatMeter from '../StatMeter';

export interface VitalRow {
    key: VitalKey;
    /** Rótulo curto visível (LP, MP, AP ou o nome do sistema customizado) */
    label: string;
    /** Nome completo do ponto vital, ex.: "Vida" */
    name: string;
    value: number;
    max: number;
    barColor: string;
}

interface VitalsPanelProps {
    charsheetName: string;
    rows: VitalRow[];
    /** Aplica a variação (negativa = dano ou gasto, positiva = cura ou recuperação) a um ponto vital */
    onAdjust: (key: VitalKey, delta: number) => void;
}

/**
 * Pontos vitais com dano e cura rápidos: o mestre digita um valor e usa − ou + em cada barra. O servidor soma a
 * variação ao que está gravado (de 0 até o máximo), então vários cliques seguidos, ou o jogador mexendo ao mesmo
 * tempo, não se perdem; a barra se atualiza sozinha quando a ficha muda.
 */
export default function VitalsPanel({ charsheetName, rows, onAdjust }: VitalsPanelProps): ReactElement {
    const [ amountText, setAmountText ] = useState('1');
    const amount = parseVitalAmount(amountText);

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
                <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    Pontos vitais
                </Typography>
                <TextField
                    size="small"
                    label="Valor"
                    value={amountText}
                    onChange={event => setAmountText(event.target.value)}
                    error={amount === null}
                    helperText={amount === null ? 'Use um inteiro de 1 a 9999' : undefined}
                    inputProps={{ inputMode: 'numeric', 'aria-label': `Valor a aplicar em ${charsheetName}`, maxLength: 4 }}
                    sx={{ width: 96 }}
                />
            </Stack>

            <Stack spacing={1.25}>
                {rows.map(row => {
                    const hint = amount === null ? ' (informe um valor)' : ` em ${amount}`;
                    return (
                        <Stack key={row.key} direction="row" alignItems="center" spacing={1} data-vital-row={row.key}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <StatMeter
                                    label={row.label}
                                    ariaLabel={`${row.name} de ${charsheetName}`}
                                    value={row.value}
                                    max={row.max}
                                    barColor={row.barColor}
                                />
                            </Box>
                            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                <IconButton
                                    size="small"
                                    aria-label={`Reduzir ${row.name} de ${charsheetName}${hint}`}
                                    title={`Reduzir ${row.name}${hint}`}
                                    disabled={amount === null}
                                    onClick={() => { if (amount !== null) onAdjust(row.key, -amount); }}
                                >
                                    <Remove fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    aria-label={`Aumentar ${row.name} de ${charsheetName}${hint}`}
                                    title={`Aumentar ${row.name}${hint}`}
                                    disabled={amount === null}
                                    onClick={() => { if (amount !== null) onAdjust(row.key, amount); }}
                                >
                                    <Add fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Stack>
                    );
                })}
            </Stack>
        </Box>
    );
}
