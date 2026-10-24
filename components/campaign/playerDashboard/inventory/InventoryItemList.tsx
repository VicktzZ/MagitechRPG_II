import { Inventory2 } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import InventoryItemCard, { type InventoryItemCardActions } from './InventoryItemCard';
import type { InventoryEntry } from './inventoryTypes';

interface InventoryItemListProps extends InventoryItemCardActions {
    entries: InventoryEntry[];
    /** Há busca ou filtro de tipo ativos: muda o texto do estado vazio e oferece limpar */
    isFiltering: boolean;
    onClearFilters: () => void;
    weightUnitSuffix: string;
}

/** Lista de itens do inventário, ou o estado vazio (inventário vazio ou filtro sem resultado) */
export default function InventoryItemList({ entries, isFiltering, onClearFilters, weightUnitSuffix, ...actions }: InventoryItemListProps): ReactElement {
    if (entries.length === 0) {
        return (
            <Box data-testid="inventory-empty" sx={{ textAlign: 'center', py: 5, px: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Inventory2 aria-hidden sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{isFiltering ? 'Nenhum item encontrado' : 'Inventário vazio'}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {isFiltering ? 'Tente outro nome ou outro tipo.' : 'Os itens do personagem aparecem aqui.'}
                </Typography>
                {isFiltering && <Button size="small" onClick={onClearFilters} sx={{ mt: 1 }}>Limpar busca e filtros</Button>}
            </Box>
        );
    }

    return (
        <Box component="ul" aria-label="Itens do inventário" sx={{ m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {entries.map(({ item, type, key }) => (
                <InventoryItemCard key={key} item={item} type={type} weightUnitSuffix={weightUnitSuffix} {...actions} />
            ))}
        </Box>
    );
}
