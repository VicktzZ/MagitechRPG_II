import type { ReactElement } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import { color } from '@themes/tokens';
import { widgetPresetInfo, type WidgetPreset } from '@models';

interface WidgetPresetPickerProps {
    onCreate: (preset: WidgetPreset) => void;
}

/** Escolha do modelo (preset) para criar um widget novo */
export default function WidgetPresetPicker({ onCreate }: WidgetPresetPickerProps): ReactElement {
    return (
        <Box>
            <Typography sx={{ mb: 2 }}>
                Crie um painel compartilhado que aparece flutuando para todos os
                participantes — escolha um modelo para começar (tudo é personalizável depois):
            </Typography>
            <Grid container spacing={1.5}>
                {(Object.keys(widgetPresetInfo) as WidgetPreset[]).map(preset => {
                    const info = widgetPresetInfo[preset];
                    return (
                        <Grid item xs={12} sm={6} key={preset}>
                            <Paper
                                variant="outlined"
                                onClick={() => onCreate(preset)}
                                sx={{
                                    p: 2,
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'border-color 120ms, background-color 120ms',
                                    '&:hover': { bgcolor: 'background.raised', borderColor: color.borderStrong }
                                }}
                            >
                                <Typography fontSize="1.8rem" lineHeight={1} mb={0.5}>{info.icon}</Typography>
                                <Typography fontWeight={700} gutterBottom>{info.title}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {info.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
