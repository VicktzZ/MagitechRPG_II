'use client';

import { Add, Remove, Tune } from '@mui/icons-material';
import {
    alpha,
    Box,
    Chip,
    Divider,
    IconButton,
    LinearProgress,
    Paper,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { Charsheet, CustomResource, RPGSystem } from '@models/entities';
import { getActiveResolvedThreshold, resolveThresholds } from '@utils/resourceThresholds';

export default function CustomResources(): ReactElement | null {
    const { control, setValue, getValues } = useFormContext<Charsheet>();
    const charsheet = getValues();
    const [ resourceDefs, setResourceDefs ] = useState<CustomResource[]>([]);

    useEffect(() => {
        if (!charsheet.systemId) return;
        fetch(`/api/rpg-system/${charsheet.systemId}`)
            .then(async res => await res.json())
            .then((data: RPGSystem) => {
                if (data.customResources && data.customResources.length > 0) {
                    setResourceDefs(data.customResources);
                    const current = getValues('customResources') ?? {};
                    const updated = { ...current };
                    let changed = false;
                    data.customResources.forEach(r => {
                        if (updated[r.key] === undefined) {
                            updated[r.key] = r.defaultValue ?? r.max;
                            changed = true;
                        }
                    });
                    if (changed) setValue('customResources', updated);
                }
            })
            .catch(err => console.error('Erro ao carregar recursos do sistema:', err));
    }, [ charsheet.systemId ]);

    const customResources = useWatch<Charsheet, 'customResources'>({
        control,
        name: 'customResources',
        defaultValue: {}
    });

    const customResourceMaxes = useWatch<Charsheet, 'customResourceMaxes'>({
        control,
        name: 'customResourceMaxes',
        defaultValue: {}
    });

    const personalMaxOf = (def: CustomResource): number =>
        customResourceMaxes?.[def.key] ?? def.max;

    const handleChange = (key: string, rawValue: number, def: CustomResource) => {
        const maxVal = personalMaxOf(def);
        const clamped = Math.max(def.min, Math.min(maxVal, isNaN(rawValue) ? def.min : rawValue));
        const current = { ...(getValues('customResources') ?? {}) };
        current[key] = clamped;
        setValue('customResources', current, { shouldValidate: true });
    };

    if (!charsheet.systemId || resourceDefs.length === 0) return null;

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 4 }
            }}
        >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Tune sx={{ color: 'warning.main' }} />
                <Typography variant="h6" fontFamily="Sakana">Recursos</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box display="flex" flexDirection="column" gap={2.5}>
                {resourceDefs.map(def => {
                    const personalMax = personalMaxOf(def);
                    const value = customResources?.[def.key] ?? def.defaultValue ?? personalMax;
                    const range = personalMax - def.min;
                    const pct = range > 0 ? ((value - def.min) / range) * 100 : 0;
                    const resolvedThresholds = resolveThresholds(def, personalMax);
                    const activeThreshold = getActiveResolvedThreshold(def, value, personalMax);
                    const barColor = activeThreshold?.color ?? def.color ?? '#1976d2';

                    return (
                        <Box key={def.key}>
                            {/* Header row */}
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap="wrap"
                                gap={1}
                                mb={1}
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography fontWeight="bold" variant="subtitle1">
                                        {def.name}
                                    </Typography>
                                    {def.abbreviation && (
                                        <Chip
                                            label={def.abbreviation}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontSize: '0.65rem',
                                                height: 20,
                                                borderColor: barColor,
                                                color: barColor
                                            }}
                                        />
                                    )}
                                    {activeThreshold && (
                                        <Chip
                                            label={activeThreshold.label}
                                            size="small"
                                            sx={{
                                                bgcolor: activeThreshold.color,
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.65rem',
                                                height: 20
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* ± controls */}
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleChange(def.key, value - 1, def)}
                                        sx={{ width: 28, height: 28 }}
                                    >
                                        <Remove fontSize="small" />
                                    </IconButton>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={value}
                                        onChange={e => handleChange(def.key, parseInt(e.target.value), def)}
                                        inputProps={{
                                            min: def.min,
                                            max: personalMax,
                                            style: { textAlign: 'center', padding: '4px 0', width: '52px' }
                                        }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        / {personalMax}{def.type === 'percentage' ? '%' : ''}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleChange(def.key, value + 1, def)}
                                        sx={{ width: 28, height: 28 }}
                                    >
                                        <Add fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            {/* Progress bar with threshold tick marks */}
                            <Box position="relative">
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.max(0, Math.min(100, pct))}
                                    sx={{
                                        height: 14,
                                        borderRadius: 7,
                                        bgcolor: 'action.disabledBackground',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: barColor,
                                            borderRadius: 7,
                                            transition: 'width 0.3s ease, background-color 0.3s ease'
                                        }
                                    }}
                                />
                                {resolvedThresholds.map(t => {
                                    const tPct = range > 0 ? ((t.value - def.min) / range) * 100 : 0;
                                    return (
                                        <Tooltip key={`${t.label}-${t.value}`} title={`${t.label}: ${t.value}`} arrow>
                                            <Box
                                                position="absolute"
                                                top={0}
                                                left={`${tPct}%`}
                                                sx={{
                                                    width: 3,
                                                    height: 14,
                                                    bgcolor: alpha(t.color, 0.9),
                                                    transform: 'translateX(-50%)',
                                                    cursor: 'help',
                                                    borderRadius: 1,
                                                    zIndex: 1
                                                }}
                                            />
                                        </Tooltip>
                                    );
                                })}
                            </Box>

                            {/* Threshold value labels below bar */}
                            {resolvedThresholds.length > 0 && (
                                <Box position="relative" height={18} mt={0.5}>
                                    {resolvedThresholds.map(t => {
                                        const tPct = range > 0 ? ((t.value - def.min) / range) * 100 : 0;
                                        return (
                                            <Typography
                                                key={`${t.label}-${t.value}`}
                                                variant="caption"
                                                position="absolute"
                                                left={`${tPct}%`}
                                                sx={{
                                                    transform: 'translateX(-50%)',
                                                    color: t.color,
                                                    fontWeight: activeThreshold?.value === t.value ? 'bold' : 'normal',
                                                    fontSize: '0.6rem',
                                                    lineHeight: 1,
                                                    whiteSpace: 'nowrap',
                                                    userSelect: 'none'
                                                }}
                                            >
                                                {t.value}
                                            </Typography>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}
