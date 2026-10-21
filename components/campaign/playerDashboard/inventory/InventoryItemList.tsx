import { Inventory2 } from '@mui/icons-material';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import InventoryItemCard, { type InventoryItemCardActions } from './InventoryItemCard';
import type { InventoryEntry } from './inventoryTypes';

interface InventoryItemListProps extends InventoryItemCardActions {
    entries: InventoryEntry[];
    /** Busca ativa: muda o texto do estado vazio */
    searchQuery: string;
    weightUnitSuffix: string;
}

/** Lista de itens do inventário, ou o estado vazio (inventário vazio ou busca sem resultado) */
export default function InventoryItemList({ entries, searchQuery, weightUnitSuffix, ...actions }: InventoryItemListProps): ReactElement {
    return (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {entries.length === 0 ? (
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'divider',
                        bgcolor: 'transparent',
                        borderRadius: 2
                    }}
                >
                    <Inventory2 sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        {searchQuery ? 'Nenhum item encontrado' : 'Inventário vazio'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchQuery 
                            ? 'Tente buscar com outros termos'
                            : 'Os itens do personagem aparecerão aqui'
                        }
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={0}>
                    {entries.map(({ item, type }, idx) => (
                        <Box key={`${type}-${item?.name}-${idx}`}>
                            <InventoryItemCard
                                item={item}
                                type={type}
                                weightUnitSuffix={weightUnitSuffix}
                                {...actions}
                            />
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
