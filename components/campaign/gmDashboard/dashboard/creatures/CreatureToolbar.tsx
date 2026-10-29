'use client';

import { Clear, Search, UnfoldLess, UnfoldMore } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { CREATURE_SORT_OPTIONS, isCreatureSort, type CreatureTypeCount } from '@utils/creatureList';
import type { ReactElement } from 'react';
import type { CreatureListState } from './useCreatureListState';

interface CreatureToolbarProps {
    state: CreatureListState;
    types: CreatureTypeCount[];
    total: number;
    shown: number;
    /** Ids das criaturas que estão na lista agora (para "Expandir todas") */
    visibleIds: string[];
}

/**
 * Busca, filtro de tipo (chips com a contagem), ordem e "Expandir/Recolher todas" da lista de criaturas. O texto de resultado ("Mostrando 3 de 12") é uma região
 * `role="status"` para o leitor de tela avisar quando a busca muda a lista.
 */
export default function CreatureToolbar({ state, types, total, shown, visibleIds }: CreatureToolbarProps): ReactElement {
    const allExpanded = visibleIds.length > 0 && visibleIds.every(id => state.expanded.has(id));

    return (
        <Stack spacing={1.5} data-testid="creature-toolbar">
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small"
                    value={state.query}
                    onChange={event => { state.setQuery(event.target.value); }}
                    placeholder="Buscar por nome, tipo, habilidade, magia ou dado"
                    sx={{ flex: 1, minWidth: 220 }}
                    inputProps={{ 'aria-label': 'Buscar criaturas' }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                        endAdornment: state.query ? (
                            <InputAdornment position="end">
                                <IconButton size="small" aria-label="Limpar a busca" onClick={() => { state.setQuery(''); }}><Clear fontSize="small" /></IconButton>
                            </InputAdornment>
                        ) : undefined
                    }}
                />
                <TextField
                    select
                    size="small"
                    label="Ordenar"
                    value={state.sort}
                    SelectProps={{ native: true }}
                    onChange={event => { if (isCreatureSort(event.target.value)) state.setSort(event.target.value); }}
                    sx={{ width: 170 }}
                >
                    {CREATURE_SORT_OPTIONS.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </TextField>
                <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    disabled={visibleIds.length === 0}
                    startIcon={allExpanded ? <UnfoldLess fontSize="small" /> : <UnfoldMore fontSize="small" />}
                    onClick={() => { if (allExpanded) state.collapseAll(); else state.expandAll(visibleIds); }}
                    sx={{ textTransform: 'none' }}
                >
                    {allExpanded ? 'Recolher todas' : 'Expandir todas'}
                </Button>
            </Box>

            {types.length > 1 && (
                <Box role="group" aria-label="Filtrar pelo tipo" sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }} data-testid="creature-type-filter">
                    <Chip
                        label={`Todas (${total})`}
                        size="small"
                        clickable
                        color={state.type === null ? 'primary' : 'default'}
                        variant={state.type === null ? 'filled' : 'outlined'}
                        aria-pressed={state.type === null}
                        onClick={() => { state.setType(null); }}
                    />
                    {types.map(entry => {
                        const selected = state.type === entry.type;
                        return (
                            <Chip
                                key={entry.type}
                                label={`${entry.label} (${entry.count})`}
                                size="small"
                                clickable
                                color={selected ? 'primary' : 'default'}
                                variant={selected ? 'filled' : 'outlined'}
                                aria-pressed={selected}
                                onClick={() => { state.setType(selected ? null : entry.type); }}
                            />
                        );
                    })}
                </Box>
            )}

            <Typography role="status" aria-live="polite" sx={{ fontSize: 12, color: 'text.secondary', fontFamily: font.mono }}>
                {shown === total ? `${total} ${total === 1 ? 'criatura' : 'criaturas'}` : `Mostrando ${shown} de ${total}`}
            </Typography>
        </Stack>
    );
}
