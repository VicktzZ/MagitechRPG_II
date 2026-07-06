import { Add, Remove } from '@mui/icons-material';
import { Box, Chip, IconButton, Typography, Grid, Paper } from '@mui/material';
import { type ReactElement, useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { Charsheet, RPGSystem } from '@models/entities';
import { LinearProgressWithLabel } from '@layout';
import { NumberField } from '@components/misc';
import { evaluateFormula } from '@utils/formulaEvaluator';

interface DynamicAttributesProps {
    system: RPGSystem | null;
}

export default function DynamicAttributes({ system }: DynamicAttributesProps): ReactElement {
    const { control, setValue, getValues } = useFormContext<Charsheet>();
    const charsheet = getValues();
    const disabled = !!charsheet.id;

    // Se for sistema customizado, usar os atributos do sistema
    const attributes = system?.attributes || [];
    
    // Watch para atributos e perícias para calcular overall
    const attributesValues = useWatch({ control, name: 'attributes' });
    const expertises = useWatch({ control, name: 'expertises' });
    const level = useWatch({ control, name: 'level' });
    const attributePoints = useWatch({ control, name: 'points.attributes' });

    /**
     * Altera um atributo gastando/devolvendo pontos de atributo.
     * O aumento é limitado pelos pontos disponíveis; a redução devolve pontos.
     */
    const changeAttribute = (attrKey: string, requested: number, min: number, max: number) => {
        const current = (getValues(`attributes.${attrKey}` as any) as unknown as number) || 0;
        const clamped = Math.min(max, Math.max(min, requested));
        const available = getValues('points.attributes') || 0;

        let next = clamped;
        const delta = clamped - current;
        if (delta > available) {
            // Não há pontos suficientes — sobe só o que dá
            next = current + available;
        }

        const spent = next - current;
        if (spent === 0) return;

        setValue(`attributes.${attrKey}` as any, next as any);
        setValue('points.attributes', available - spent);
    };

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

    // Inicializa os pontos de atributo/perícia do sistema na criação da ficha.
    // Só aplica se nada foi gasto ainda, para não sobrescrever progresso
    // restaurado do autosave nem bônus concedidos por classe.
    useEffect(() => {
        if (!system || disabled) return;

        if (system.startingLevel != null && (getValues('level') || 0) === 0) {
            setValue('level', system.startingLevel);
        }

        if (system.initialAttributePoints != null) {
            const untouched = attributes.every(attr =>
                (((getValues(`attributes.${attr.key}` as any) as unknown as number) || 0) === (attr.defaultValue || 0))
            );
            if (untouched && getValues('points.attributes') !== system.initialAttributePoints) {
                setValue('points.attributes', system.initialAttributePoints);
            }
        }

        if (system.initialExpertisePoints != null) {
            const expertisesUntouched = (system.expertises ?? []).every(exp =>
                (((getValues(`expertises.${exp.key}` as any) )?.value) || 0) === 0
            );
            const noClassChosen = !getValues('class');
            if (expertisesUntouched && noClassChosen && getValues('points.expertises') !== system.initialExpertisePoints) {
                setValue('points.expertises', system.initialExpertisePoints);
            }
        }

        // Peso/carga inicial do sistema — aplica só com inventário intocado
        if (system.weightConfig) {
            const inventory = getValues('inventory');
            const inventoryEmpty =
                (inventory?.items?.length ?? 0) === 0 &&
                (inventory?.weapons?.length ?? 0) === 0 &&
                (inventory?.armors?.length ?? 0) === 0;
            const targetMax = system.weightConfig.initialMax;
            const targetCargo = system.weightConfig.initialCargo ?? 0;
            if (inventoryEmpty && getValues('capacity.max') !== targetMax) {
                setValue('capacity', { cargo: targetCargo, max: targetMax });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ system, disabled ]);

    /**
     * Limite efetivo de um atributo: o menor entre o max estático do
     * atributo, a fórmula por nível do sistema (ex: "level * 2") e o
     * teto absoluto global (attributeCapAbsoluteLimit), que a fórmula
     * nunca ultrapassa independente do nível.
     */
    const effectiveAttributeMax = (staticMax: number): number => {
        const formula = system?.attributeCapFormula?.trim();
        const absoluteLimit = system?.attributeCapAbsoluteLimit;
        let max = staticMax;
        if (formula) {
            const levelCap = evaluateFormula(formula, { level: Math.max(1, level || 1) }, staticMax);
            max = Math.min(max, Math.max(0, levelCap));
        }
        if (absoluteLimit != null) max = Math.min(max, absoluteLimit);
        return max;
    };

    // Avalia fórmulas de stats iniciais (Vida/Mana/Armadura) na CRIAÇÃO da ficha.
    // Fichas salvas (disabled) nunca são recalculadas.
    useEffect(() => {
        if (!system || disabled || !system.initialFields) return;

        const vars: Record<string, number> = { level: level || 1 };
        attributes.forEach(attr => {
            const value = (attributesValues as any)?.[attr.key] || 0;
            vars[attr.abbreviation] = value;
            vars[attr.key] = value;
        });

        const applyStat = (
            cfg: { enabled: boolean; defaultValue: number; formula?: string } | undefined,
            currentKey: 'stats.lp' | 'stats.mp' | 'stats.ap',
            maxKey: 'stats.maxLp' | 'stats.maxMp' | 'stats.maxAp'
        ) => {
            if (!cfg) return;
            if (!cfg.enabled) {
                setValue(maxKey, 0);
                setValue(currentKey, 0);
                return;
            }
            const result = cfg.formula
                ? Math.max(0, evaluateFormula(cfg.formula, vars, cfg.defaultValue ?? 0))
                : (cfg.defaultValue ?? 0);
            setValue(maxKey, result);
            setValue(currentKey, result);
        };

        applyStat(system.initialFields.life, 'stats.lp', 'stats.maxLp');
        applyStat(system.initialFields.mana, 'stats.mp', 'stats.maxMp');
        applyStat(system.initialFields.armor, 'stats.ap', 'stats.maxAp');
    }, [ attributesValues, level, system, disabled ]);

    if (system && attributes.length > 0) {
        // Labels e visibilidade das barras de stats guiadas pelo sistema
        // (pointsConfig consolidado; fallback para initialFields em sistemas antigos)
        const statBars: Array<{ label: string; currentKey: 'stats.lp' | 'stats.mp' | 'stats.ap'; maxKey: 'stats.maxLp' | 'stats.maxMp' | 'stats.maxAp'; color: 'error' | 'info' | 'warning' }> = [];
        const hasLP = system.pointsConfig?.hasLP ?? system.initialFields?.life?.enabled ?? true;
        const hasMP = system.pointsConfig?.hasMP ?? system.initialFields?.mana?.enabled ?? true;
        const hasAP = system.pointsConfig?.hasAP ?? system.initialFields?.armor?.enabled ?? true;
        if (hasLP) statBars.push({ label: system.pointsConfig?.lpName || system.initialFields?.life?.label || 'LP', currentKey: 'stats.lp', maxKey: 'stats.maxLp', color: 'error' });
        if (hasMP) statBars.push({ label: system.pointsConfig?.mpName || system.initialFields?.mana?.label || 'MP', currentKey: 'stats.mp', maxKey: 'stats.maxMp', color: 'info' });
        if (hasAP) statBars.push({ label: system.pointsConfig?.apName || system.initialFields?.armor?.label || 'AP', currentKey: 'stats.ap', maxKey: 'stats.maxAp', color: 'warning' });

        // Renderizar atributos customizados (sem ícones, só nomes)
        return (
            <Box display="flex" flexDirection="column" gap={2}>
                {statBars.length > 0 && (
                    <Box display="flex" flexDirection="column" gap={1.5}>
                        {statBars.map(bar => (
                            <Controller
                                key={bar.currentKey}
                                name={bar.currentKey}
                                control={control}
                                render={({ field }) => (
                                    <LinearProgressWithLabel
                                        label={bar.label}
                                        minvalue={field.value || 0}
                                        maxvalue={getValues(bar.maxKey) || 0}
                                        color={bar.color}
                                    />
                                )}
                            />
                        ))}
                    </Box>
                )}
                {/* Pontos de atributo disponíveis — na criação, ou após ganhar pontos em level-up */}
                {(!disabled || (attributePoints ?? 0) > 0) && (
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                            Pontos de Atributo:
                        </Typography>
                        <Chip
                            label={attributePoints ?? 0}
                            color={(attributePoints ?? 0) > 0 ? 'warning' : 'success'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                )}

                <Grid container spacing={2}>
                    {attributes.map((attribute) => {
                        const min = attribute.minValue ?? 0;
                        const max = effectiveAttributeMax(attribute.maxValue ?? 999);
                        // Trava a edição só quando a ficha já existe E não há pontos de
                        // atributo disponíveis (ex: ganhos num level-up) para gastar.
                        const attributesLocked = disabled && (attributePoints ?? 0) <= 0;

                        return (
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
                                        render={({ field: { value }, fieldState: { error } }) => {
                                            const current = (value as unknown as number) || 0;
                                            return (
                                                <Box display="flex" alignItems="flex-start" gap={0.5}>
                                                    <IconButton
                                                        size="small"
                                                        disabled={attributesLocked || current <= min}
                                                        onClick={() => changeAttribute(attribute.key, current - 1, min, max)}
                                                        sx={{ mt: 0.5 }}
                                                    >
                                                        <Remove fontSize="small" />
                                                    </IconButton>
                                                    <NumberField
                                                        value={current}
                                                        onChange={(newValue) => changeAttribute(attribute.key, newValue, min, max)}
                                                        min={min}
                                                        max={max}
                                                        size="small"
                                                        fullWidth
                                                        disabled={attributesLocked}
                                                        error={!!error}
                                                        helperText={
                                                            error?.message ||
                                                            `Min: ${min}, Max: ${max >= 999 ? '∞' : max}`
                                                        }
                                                        inputProps={{ style: { textAlign: 'center' } }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        disabled={attributesLocked || current >= max || (attributePoints ?? 0) <= 0}
                                                        onClick={() => changeAttribute(attribute.key, current + 1, min, max)}
                                                        sx={{ mt: 0.5 }}
                                                    >
                                                        <Add fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            );
                                        }}
                                    />
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        );
    }

    // Sistema padrão - importar e usar componente Attributes original
    const OriginalAttributes = require('./Attributes').default;
    return <OriginalAttributes />;
}
