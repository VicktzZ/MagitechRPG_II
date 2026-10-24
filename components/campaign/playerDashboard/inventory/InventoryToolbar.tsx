import { Close, Search } from '@mui/icons-material';
import { Box, IconButton, InputAdornment, NativeSelect, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import type { ReactElement } from 'react';
import { INVENTORY_SORT_OPTIONS, isInventorySort } from './inventoryList';
import type { InventorySort, InventoryTab } from './inventoryTypes';

interface InventoryToolbarProps {
    activeTab: InventoryTab;
    onTabChange: (tab: InventoryTab) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sort: InventorySort;
    onSortChange: (sort: InventorySort) => void;
    /** Contagem mostrada em cada aba */
    counts: { all: number; weapons: number; armors: number; items: number };
    /** Quantos itens a lista mostra agora (para "3 de 14") */
    shown: number;
    isFiltering: boolean;
}

const TABS: Array<{ value: InventoryTab; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'weapons', label: 'Armas' },
    { value: 'armors', label: 'Armaduras' },
    { value: 'items', label: 'Itens' }
];

/** Filtro por tipo (com contagem), busca por nome e ordem da lista. Em tela estreita o filtro rola na horizontal em vez de quebrar */
export default function InventoryToolbar({ activeTab, onTabChange, searchQuery, onSearchChange, sort, onSortChange, counts, shown, isFiltering }: InventoryToolbarProps): ReactElement {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={activeTab}
                    aria-label="Filtrar por tipo de item"
                    onChange={(_, value: InventoryTab | null) => { if (value) onTabChange(value) }}
                    sx={{ flexWrap: 'nowrap' }}
                >
                    {TABS.map(tab => (
                        <ToggleButton key={tab.value} value={tab.value} data-testid={`inventory-tab-${tab.value}`} sx={{ textTransform: 'none', gap: 0.75, whiteSpace: 'nowrap', px: 1.5 }}>
                            {tab.label}
                            <Typography component="span" sx={{ fontFamily: font.mono, fontSize: 12, color: 'text.secondary' }}>{counts[tab.value]}</Typography>
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small"
                    placeholder="Buscar item"
                    value={searchQuery}
                    onChange={(event) => { onSearchChange(event.target.value) }}
                    inputProps={{ 'aria-label': 'Buscar item' }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                        endAdornment: searchQuery ? (
                            <InputAdornment position="end">
                                <IconButton size="small" edge="end" aria-label="Limpar busca de itens" onClick={() => { onSearchChange('') }}>
                                    <Close fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : undefined
                    }}
                    sx={{ flex: '1 1 200px', minWidth: 160 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Typography component="label" htmlFor="inventory-sort" variant="caption" color="text.secondary">Ordenar</Typography>
                    <NativeSelect
                        value={sort}
                        onChange={(event) => { if (isInventorySort(event.target.value)) onSortChange(event.target.value) }}
                        inputProps={{ id: 'inventory-sort', 'aria-label': 'Ordenar inventário' }}
                    >
                        {INVENTORY_SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </NativeSelect>
                </Box>
            </Box>

            {isFiltering && (
                <Typography variant="caption" color="text.secondary" role="status" data-testid="inventory-shown">
                    {`${shown} de ${counts.all} ${counts.all === 1 ? 'item' : 'itens'}`}
                </Typography>
            )}
        </Box>
    );
}
