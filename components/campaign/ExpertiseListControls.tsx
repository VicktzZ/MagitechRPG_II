'use client';

import { Close, Search } from '@mui/icons-material';
import { Box, Button, IconButton, InputAdornment, NativeSelect, TextField, Typography } from '@mui/material';
import { DEFAULT_EXPERTISE_SORT, EXPERTISE_SORT_OPTIONS, isExpertiseSort, type ExpertiseSort } from '@utils/expertiseList';
import { useState, type ReactElement } from 'react';

export interface ExpertiseListState {
    query: string;
    setQuery: (query: string) => void;
    sort: ExpertiseSort;
    setSort: (sort: ExpertiseSort) => void;
    /** Há busca ou ordem diferente da inicial (A → Z)? */
    isChanged: boolean;
    reset: () => void;
}

/** Busca e ordem de uma lista de perícias (a ordem inicial é alfabética) */
export function useExpertiseListState(initialSort: ExpertiseSort = DEFAULT_EXPERTISE_SORT): ExpertiseListState {
    const [ query, setQuery ] = useState('');
    const [ sort, setSort ] = useState<ExpertiseSort>(initialSort);

    return {
        query,
        setQuery,
        sort,
        setSort,
        isChanged: query.trim() !== '' || sort !== initialSort,
        reset: () => { setQuery(''); setSort(initialSort) }
    };
}

interface ExpertiseListControlsProps {
    state: ExpertiseListState;
    /** Perícias que passaram na busca e total, para o contador "3 de 24 perícias" */
    shown: number;
    total: number;
}

/** Campo de busca e seletor de ordem (A → Z, Z → A, maior ou menor valor) para listas de perícias */
export default function ExpertiseListControls({ state, shown, total }: ExpertiseListControlsProps): ReactElement {
    const { query, setQuery, sort, setSort } = state;
    const searching = query.trim() !== '';

    return (
        <Box data-testid="expertise-controls" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small"
                    placeholder="Buscar perícia"
                    value={query}
                    onChange={(event) => { setQuery(event.target.value) }}
                    inputProps={{ 'aria-label': 'Buscar perícia' }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                        endAdornment: query ? (
                            <InputAdornment position="end">
                                <IconButton size="small" aria-label="Limpar busca de perícias" onClick={() => { setQuery('') }} edge="end">
                                    <Close fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : undefined
                    }}
                    sx={{ flex: '1 1 160px', minWidth: 140 }}
                />
                <NativeSelect
                    value={sort}
                    onChange={(event) => { if (isExpertiseSort(event.target.value)) setSort(event.target.value) }}
                    inputProps={{ 'aria-label': 'Ordenar perícias' }}
                >
                    {EXPERTISE_SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </NativeSelect>
            </Box>
            {searching && (
                <Typography variant="caption" color="text.secondary" role="status" data-testid="expertise-count">
                    {`${shown} de ${total} ${total === 1 ? 'perícia' : 'perícias'}`}
                </Typography>
            )}
        </Box>
    );
}

/** O que mostrar no lugar da lista quando a busca não acha nada */
export function ExpertiseNoResults({ query, onClear }: { query: string; onClear: () => void }): ReactElement {
    return (
        <Box data-testid="expertise-no-results" sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">{`Nenhuma perícia encontrada para "${query.trim()}".`}</Typography>
            <Button size="small" onClick={onClear} sx={{ mt: 0.5 }}>Limpar busca</Button>
        </Box>
    );
}
