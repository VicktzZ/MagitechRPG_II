import type { ReactElement } from 'react';
import {
    Box,
    Chip,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { MAX_CAMPAIGN_WIDGETS, type CampaignWidget } from '@models';

interface WidgetSelectorProps {
    widgets: CampaignWidget[];
    activeId: string | null;
    addingPreset: boolean;
    onSelect: (id: string) => void;
    onAddNew: () => void;
}

/** Chips para escolher o widget ativo ou abrir o seletor de modelos */
export default function WidgetSelector({ widgets, activeId, addingPreset, onSelect, onAddNew }: WidgetSelectorProps): ReactElement {
    return (
        <Box px={3} pt={1.5} display="flex" gap={1} flexWrap="wrap" alignItems="center">
            {widgets.map(w => (
                <Chip
                    key={w.id}
                    icon={w.icon ? <span style={{ marginLeft: 6 }}>{w.icon}</span> : undefined}
                    label={w.name || 'Sem nome'}
                    onClick={() => onSelect(w.id)}
                    color={w.id === activeId && !addingPreset ? 'primary' : 'default'}
                    variant={w.id === activeId && !addingPreset ? 'filled' : 'outlined'}
                />
            ))}
            {widgets.length < MAX_CAMPAIGN_WIDGETS && (
                <Tooltip title="Adicionar outro widget">
                    <Chip
                        icon={<AddIcon />}
                        label="Novo widget"
                        onClick={onAddNew}
                        color={addingPreset ? 'primary' : 'default'}
                        variant={addingPreset ? 'filled' : 'outlined'}
                    />
                </Tooltip>
            )}
        </Box>
    );
}
