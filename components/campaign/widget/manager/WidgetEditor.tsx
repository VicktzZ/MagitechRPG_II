import type { ReactElement } from 'react';
import {
    Box,
    Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CampaignWidget } from '@models';
import type { WidgetPatch, WidgetPatchLabel } from './types';
import type { WidgetCatalogs } from './useWidgetCatalogs';
import IdentitySection from './IdentitySection';
import BarsSection from './BarsSection';
import PartsSection from './PartsSection';
import ResourcesSection from './ResourcesSection';
import StockSection from './StockSection';
import PoolsSection from './PoolsSection';
import BountiesSection from './BountiesSection';
import ClocksSection from './ClocksSection';
import CraftingSection from './CraftingSection';
import AlertsSection from './AlertsSection';
import LogSection from './LogSection';

interface WidgetEditorProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    patchLabel: WidgetPatchLabel;
    catalogs: WidgetCatalogs;
    newLogText: string;
    onNewLogTextChange: (text: string) => void;
    saving: boolean;
    onRemove: () => void;
}

/** Editor do widget ativo: todas as seções do diálogo de administração, mais a zona de perigo */
export default function WidgetEditor({ widget, patch, patchLabel, catalogs, newLogText, onNewLogTextChange, saving, onRemove }: WidgetEditorProps): ReactElement {
    return (
        <Box display="flex" flexDirection="column" gap={1.5}>
            {/* ── Identidade e situação ── */}
            <IdentitySection widget={widget} patch={patch} />

            {/* ── Barras principais ── */}
            <BarsSection widget={widget} patch={patch} patchLabel={patchLabel} />

            {/* ── Partes ── */}
            <PartsSection widget={widget} patch={patch} patchLabel={patchLabel} />

            {/* ── Recursos ── */}
            <ResourcesSection widget={widget} patch={patch} patchLabel={patchLabel} />

            {/* ── Estoque ── */}
            <StockSection widget={widget} patch={patch} patchLabel={patchLabel} />

            {/* ── Fundos Comuns (beta) ── */}
            <PoolsSection widget={widget} patch={patch} />

            {/* ── Tarefas / Bounties (beta) ── */}
            <BountiesSection widget={widget} patch={patch} />

            {/* ── Relógios (beta) ── */}
            <ClocksSection widget={widget} patch={patch} />

            {/* ── Crafting (beta) ── */}
            <CraftingSection widget={widget} patch={patch} catalogs={catalogs} />

            {/* ── Alertas ── */}
            <AlertsSection widget={widget} patch={patch} />

            {/* ── Registro/Diário ── */}
            <LogSection
                widget={widget}
                patch={patch}
                patchLabel={patchLabel}
                newLogText={newLogText}
                onNewLogTextChange={onNewLogTextChange}
            />

            {/* ── Zona de perigo ── */}
            <Box display="flex" justifyContent="flex-end">
                <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    disabled={saving}
                    onClick={onRemove}
                >
                    Remover este widget
                </Button>
            </Box>
        </Box>
    );
}
