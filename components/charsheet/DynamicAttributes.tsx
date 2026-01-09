import { Box, TextField, Typography, Grid, Paper } from '@mui/material';
import { type ReactElement, useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { Charsheet, RPGSystem } from '@models/entities';

interface DynamicAttributesProps {
    system: RPGSystem | null;
}

export default function DynamicAttributes({ system }: DynamicAttributesProps): ReactElement {
    const { control, setValue, getValues, formState: { errors } } = useFormContext<Charsheet>();
    const charsheet = getValues();
    const disabled = !!charsheet.id;

    // Se for sistema customizado, usar os atributos do sistema
    const attributes = system?.attributes || [];
    
    // Watch para atributos e perícias para calcular overall
    const attributesValues = useWatch({ control, name: 'attributes' });
    const expertises = useWatch({ control, name: 'expertises' });
    const level = useWatch({ control, name: 'level' });

    useEffect(() => {
        if (system && attributes.length > 0) {
            // Calcular soma dos atributos customizados
            const attributesSum = attributes.reduce((sum, attr) => {
                const value = (attributesValues as any)?.[attr.key] || 0;
                return sum + value;
            }, 0);

            const expertisesSum = Object.values(expertises || {}).reduce(
                (sum, expertise) => sum + (expertise && typeof expertise === 'object' && 'value' in expertise ? (expertise.value || 0) : 0),
                0
            );

            const overallValue = attributesSum + expertisesSum + (level || 0);
            setValue('overall', overallValue);
        } else {
            // Sistema padrão - usar cálculo padrão Magitech
            const attributesSum = (
                (attributesValues?.vig || 0) +
                (attributesValues?.foc || 0) +
                (attributesValues?.des || 0) +
                (attributesValues?.log || 0) +
                (attributesValues?.sab || 0) +
                (attributesValues?.car || 0)
            );

            const expertisesSum = Object.values(expertises || {}).reduce(
                (sum, expertise) => sum + (expertise && typeof expertise === 'object' && 'value' in expertise ? (expertise.value || 0) : 0),
                0
            );

            const overallValue = attributesSum + expertisesSum + (level || 0);
            setValue('overall', overallValue);
        }
    }, [ attributesValues, expertises, level, setValue, system, attributes ]);

    if (system && attributes.length > 0) {
        // Renderizar atributos customizados (sem ícones, só nomes)
        return (
            <Grid container spacing={2}>
                {attributes.map((attribute) => (
                    <Grid item xs={12} sm={6} md={4} key={attribute.key}>
                        <Paper 
                            elevation={1}
                            sx={{ 
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: 2
                                }
                            }}
                        >
                            <Typography 
                                variant="subtitle2" 
                                fontWeight={600}
                                color="primary.main"
                                mb={1}
                            >
                                {attribute.name} ({attribute.abbreviation})
                            </Typography>
                            {attribute.description && (
                                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                    {attribute.description}
                                </Typography>
                            )}
                            <Controller
                                name={`attributes.${attribute.key}` as any}
                                control={control}
                                defaultValue={attribute.defaultValue || 0}
                                render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
                                    <TextField
                                        {...field}
                                        value={value || 0}
                                        onChange={(e) => {
                                            const numValue = parseInt(e.target.value) || 0;
                                            const min = attribute.minValue ?? 0;
                                            const max = attribute.maxValue ?? 999;
                                            const clampedValue = Math.min(max, Math.max(min, numValue));
                                            onChange(clampedValue);
                                        }}
                                        type="number"
                                        size="small"
                                        fullWidth
                                        disabled={disabled}
                                        error={!!error}
                                        helperText={
                                            error?.message || 
                                            (attribute.minValue !== undefined || attribute.maxValue !== undefined 
                                                ? `Min: ${attribute.minValue ?? 0}, Max: ${attribute.maxValue ?? '∞'}`
                                                : undefined
                                            )
                                        }
                                        InputProps={{
                                            inputProps: {
                                                min: attribute.minValue ?? 0,
                                                max: attribute.maxValue ?? 999
                                            }
                                        }}
                                    />
                                )}
                            />
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        );
    }

    // Sistema padrão - importar e usar componente Attributes original
    const OriginalAttributes = require('./Attributes').default;
    return <OriginalAttributes />;
}
