import { Search } from '@mui/icons-material';
import { Badge, Box, InputAdornment, Stack, Tab, Tabs, TextField } from '@mui/material';
import type { ReactElement } from 'react';
import type { InventoryTab } from './inventoryTypes';

interface InventoryTabsBarProps {
    activeTab: InventoryTab;
    onTabChange: (tab: InventoryTab) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    /** Contagem mostrada no selo de cada aba */
    counts: { all: number; weapons: number; armors: number; items: number };
}

/** Abas (Todos, Armas, Armaduras, Itens) com contagem e o campo de busca por nome */
export default function InventoryTabsBar({ activeTab, onTabChange, searchQuery, onSearchChange, counts }: InventoryTabsBarProps): ReactElement {
    return (
        <Box sx={{ px: 3, pt: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} sx={{ display: 'flex', alignItems: 'center' }} spacing={2} mb={2}>
                <Tabs 
                    value={activeTab} 
                    onChange={(_, value) => onTabChange(value)}
                    sx={{ flex: 1 }}
                >
                    <Tab 
                        label="Todos" 
                        value="all"
                        icon={<Badge sx={{ position: 'relative', left: 5 }} badgeContent={counts.all} color="primary" />}
                        iconPosition="end"
                    />
                    <Tab 
                        label="Armas" 
                        value="weapons"
                        icon={<Badge sx={{ position: 'relative', left: 5 }} badgeContent={counts.weapons} color="error" />}
                        iconPosition="end"
                    />
                    <Tab 
                        label="Armaduras" 
                        value="armors"
                        icon={<Badge sx={{ position: 'relative', left: 5 }} badgeContent={counts.armors} color="info" />}
                        iconPosition="end"
                    />
                    <Tab 
                        label="Itens" 
                        value="items"
                        icon={<Badge sx={{ position: 'relative', left: 5 }} badgeContent={counts.items} color="success" />}
                        iconPosition="end"
                    />
                </Tabs>
                
                <TextField
                    size="small"
                    placeholder="Buscar item..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        )
                    }}
                    sx={{ minWidth: { xs: '100%', md: 250 } }}
                />
            </Stack>
        </Box>
    );
}
