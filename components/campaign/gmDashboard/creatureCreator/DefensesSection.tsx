import type { Dispatch, SetStateAction } from 'react';
import { Autocomplete, Box, Button, IconButton, MenuItem, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { Add, DeleteOutline } from '@mui/icons-material';
import { parseAmount } from '@utils/combat/engine/modifiers';
import { MAX_DEFENSE_ENTRIES, type DamageModifierData } from '@utils/combat/creatureDefense';
import { CREATURE_ELEMENT_OPTIONS, DAMAGE_MODIFIER_TARGETS, WEAKNESS_OPTIONS } from './constants';
import type { CreatureData } from './types';

interface DefensesSectionProps {
    creatureData: CreatureData;
    setCreatureData: Dispatch<SetStateAction<CreatureData>>;
    isReadOnly: boolean;
}

const KIND_LABEL: Record<DamageModifierData['kind'], string> = { resistance: 'Resistência', vulnerability: 'Vulnerabilidade' };

/** O valor é percentual ("25%") ou fixo ("3") e maior que zero? */
const validValue = (value: string): boolean => {
    const amount = parseAmount(value);
    return Boolean(amount && (amount.pct > 0 || amount.flat > 0));
};

/**
 * Defesas da criatura para o combate automatizado: o elemento dela, as fraquezas declaradas e as resistências e vulnerabilidades ao dano.
 * Só o mestre vê. O elemento e as fraquezas dão ao atacante +1d20 e dobram o dano; resistência e vulnerabilidade diminuem ou aumentam o dano recebido.
 */
export default function DefensesSection({ creatureData, setCreatureData, isReadOnly }: DefensesSectionProps) {
    const modifiers = creatureData.damageModifiers ?? [];

    const setModifier = (index: number, patch: Partial<DamageModifierData>): void => {
        setCreatureData(prev => ({
            ...prev,
            damageModifiers: (prev.damageModifiers ?? []).map((modifier, position) => (position === index ? { ...modifier, ...patch } : modifier))
        }));
    };

    const removeModifier = (index: number): void => {
        setCreatureData(prev => ({ ...prev, damageModifiers: (prev.damageModifiers ?? []).filter((_, position) => position !== index) }));
    };

    const addModifier = (): void => {
        setCreatureData(prev => ({
            ...prev,
            damageModifiers: [ ...(prev.damageModifiers ?? []), { kind: 'resistance', element: '', value: '25%' } ]
        }));
    };

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700}>Defesas</Typography>
            <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mb: 1.5 }}>
                Só o mestre vê. Atacar uma fraqueza dá +1d20 no acerto e dobra o dano; resistência e vulnerabilidade diminuem ou aumentam o dano recebido.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <TextField
                    select
                    label="Elemento"
                    value={creatureData.elementalMastery ?? ''}
                    onChange={(event) => setCreatureData(prev => ({ ...prev, elementalMastery: event.target.value }))}
                    disabled={isReadOnly}
                    helperText="Dá a fraqueza do elemento que vence este"
                    sx={{ width: 220 }}
                >
                    <MenuItem value="">Nenhum</MenuItem>
                    {CREATURE_ELEMENT_OPTIONS.map(element => <MenuItem key={element} value={element}>{element}</MenuItem>)}
                </TextField>

                <Autocomplete
                    multiple
                    freeSolo
                    options={WEAKNESS_OPTIONS}
                    value={creatureData.weaknesses ?? []}
                    onChange={(_, value) => setCreatureData(prev => ({ ...prev, weaknesses: value.map(entry => entry.trim()).filter(Boolean).slice(0, MAX_DEFENSE_ENTRIES) }))}
                    disabled={isReadOnly}
                    sx={{ flex: 1, minWidth: 260 }}
                    renderInput={(params) => <TextField {...params} label="Fraquezas declaradas" placeholder="Elemento ou tipo (Cortante...)" />}
                />
            </Box>

            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Resistências e vulnerabilidades</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {modifiers.length === 0 && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Nenhuma. Sem elas o dano recebido não muda.</Typography>
                )}
                {modifiers.map((modifier, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }} data-testid={`damage-modifier-${index}`}>
                        <TextField
                            select
                            size="small"
                            label="Tipo"
                            value={modifier.kind}
                            onChange={(event) => setModifier(index, { kind: event.target.value as DamageModifierData['kind'] })}
                            disabled={isReadOnly}
                            sx={{ width: 160 }}
                        >
                            {(Object.keys(KIND_LABEL) as Array<DamageModifierData['kind']>).map(kind => <MenuItem key={kind} value={kind}>{KIND_LABEL[kind]}</MenuItem>)}
                        </TextField>
                        <TextField
                            select
                            size="small"
                            label="A que dano"
                            value={modifier.element ?? ''}
                            onChange={(event) => setModifier(index, { element: event.target.value })}
                            disabled={isReadOnly}
                            sx={{ width: 180 }}
                        >
                            <MenuItem value="">Todo dano</MenuItem>
                            {DAMAGE_MODIFIER_TARGETS.map(target => <MenuItem key={target} value={target}>{target}</MenuItem>)}
                        </TextField>
                        <TextField
                            size="small"
                            label="Valor"
                            value={modifier.value}
                            onChange={(event) => setModifier(index, { value: event.target.value })}
                            error={!validValue(modifier.value)}
                            helperText={validValue(modifier.value) ? ' ' : 'Use 25% ou 3'}
                            disabled={isReadOnly}
                            sx={{ width: 110 }}
                        />
                        {!isReadOnly && (
                            <Tooltip title="Remover">
                                <IconButton size="small" aria-label="Remover resistência ou vulnerabilidade" onClick={() => { removeModifier(index); }} sx={{ mt: 0.5 }}>
                                    <DeleteOutline fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                ))}
            </Box>
            {!isReadOnly && modifiers.length < MAX_DEFENSE_ENTRIES && (
                <Button size="small" startIcon={<Add />} onClick={addModifier} sx={{ mt: 1, textTransform: 'none' }}>
                    Adicionar resistência ou vulnerabilidade
                </Button>
            )}
        </Paper>
    );
}
