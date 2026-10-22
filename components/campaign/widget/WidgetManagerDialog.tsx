'use client';

import { type ReactElement } from 'react';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Switch
} from '@mui/material';
import WidgetsIcon from '@mui/icons-material/Widgets';
import SaveIcon from '@mui/icons-material/Save';
import { MAX_CAMPAIGN_WIDGETS } from '@models';
import WidgetPresetPicker from './manager/WidgetPresetPicker';
import WidgetSelector from './manager/WidgetSelector';
import WidgetEditor from './manager/WidgetEditor';
import { useWidgetCatalogs } from './manager/useWidgetCatalogs';
import { useWidgetManagerState } from './manager/useWidgetManagerState';

interface WidgetManagerDialogProps {
    open: boolean;
    onClose: () => void;
    /** Widget que deve ficar ativo ao abrir (ex: o painel que originou a abertura) */
    initialWidgetId?: string;
}

export default function WidgetManagerDialog({ open, onClose, initialWidgetId }: WidgetManagerDialogProps): ReactElement {
    const {
        widgets,
        widget,
        activeId,
        setActiveId,
        addingPreset,
        setAddingPreset,
        saving,
        newLogText,
        setNewLogText,
        patch,
        patchLabel,
        handleCreate,
        handleRemoveActive,
        save
    } = useWidgetManagerState({ open, onClose, initialWidgetId });
    const catalogs = useWidgetCatalogs(open);

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WidgetsIcon sx={{ color: 'text.secondary' }} />
                Administrar Widgets
                <Box flex={1} />
                {widget && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={widget.enabled}
                                onChange={(e) => patch({ enabled: e.target.checked })}
                            />
                        }
                        label="Visível aos jogadores"
                    />
                )}
            </DialogTitle>

            {/* ── Seletor de widgets ── */}
            <WidgetSelector
                widgets={widgets}
                activeId={activeId}
                addingPreset={addingPreset}
                onSelect={(id) => { setActiveId(id); setAddingPreset(false); }}
                onAddNew={() => setAddingPreset(true)}
            />

            <DialogContent dividers>
                {addingPreset || !widget ? <WidgetPresetPicker onCreate={handleCreate} /> : (
                    <WidgetEditor
                        widget={widget}
                        patch={patch}
                        patchLabel={patchLabel}
                        catalogs={catalogs}
                        newLogText={newLogText}
                        onNewLogTextChange={setNewLogText}
                        saving={saving}
                        onRemove={handleRemoveActive}
                    />
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Chip label="Aparece flutuando para todos, em tempo real" size="small" variant="outlined" />
                <Chip label={`${widgets.length}/${MAX_CAMPAIGN_WIDGETS} widgets`} size="small" variant="outlined" />
                <Box flex={1} />
                <Button onClick={onClose} disabled={saving} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={save}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                >
                    {saving ? 'Salvando...' : 'Salvar Widgets'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
