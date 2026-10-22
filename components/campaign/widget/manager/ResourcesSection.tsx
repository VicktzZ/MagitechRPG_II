import type { ReactElement } from 'react';
import {
    Box,
    Button,
    Grid,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NumberField } from '@components/misc';
import type { CampaignWidget } from '@models';
import SectionAccordion from './SectionAccordion';
import { DEFAULT_RESOURCE_COLOR } from './constants';
import type { WidgetPatch, WidgetPatchLabel } from './types';

interface ResourcesSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    patchLabel: WidgetPatchLabel;
}

/** Seção de recursos (contadores) do widget */
export default function ResourcesSection({ widget, patch, patchLabel }: ResourcesSectionProps): ReactElement {
    return (
        <SectionAccordion summary={<Typography fontWeight={700}>{widget.labels.resources} ({widget.resources.length})</Typography>}>
            <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField
                    size="small" label="Rótulo da seção" sx={{ maxWidth: 260 }}
                    value={widget.labels.resources}
                    onChange={(e) => patchLabel('resources', e.target.value)}
                    helperText='Ex: "Recursos", "Suprimentos"'
                />
                {widget.resources.map((resource, idx) => (
                    <Grid container spacing={1} key={resource.id} alignItems="center">
                        <Grid item xs={3} sm={1}>
                            <TextField fullWidth size="small" label="Ícone" value={resource.icon ?? ''}
                                onChange={(e) => {
                                    const resources = [ ...widget.resources ];
                                    resources[idx] = { ...resource, icon: e.target.value };
                                    patch({ resources });
                                }} inputProps={{ maxLength: 4 }} />
                        </Grid>
                        <Grid item xs={9} sm={3}>
                            <TextField fullWidth size="small" label="Nome" value={resource.name}
                                onChange={(e) => {
                                    const resources = [ ...widget.resources ];
                                    resources[idx] = { ...resource, name: e.target.value };
                                    patch({ resources });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                            <NumberField fullWidth size="small" label="Valor" min={0}
                                value={resource.value}
                                onChange={(value) => {
                                    const resources = [ ...widget.resources ];
                                    resources[idx] = { ...resource, value };
                                    patch({ resources });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                            <NumberField fullWidth size="small" label="Máx (0=∞)" min={0}
                                value={resource.max ?? 0}
                                onChange={(max) => {
                                    const resources = [ ...widget.resources ];
                                    resources[idx] = { ...resource, max: max > 0 ? max : undefined };
                                    patch({ resources });
                                }} />
                        </Grid>
                        <Grid item xs={2} sm={1.5}>
                            <TextField fullWidth size="small" label="Unid." value={resource.unit ?? ''}
                                onChange={(e) => {
                                    const resources = [ ...widget.resources ];
                                    resources[idx] = { ...resource, unit: e.target.value };
                                    patch({ resources });
                                }} inputProps={{ maxLength: 8 }} />
                        </Grid>
                        <Grid item xs={1} sm={1}>
                            <input
                                type="color"
                                value={resource.color ?? DEFAULT_RESOURCE_COLOR}
                                onChange={(e) => {
                                    const resources = [ ...widget.resources ];
                                    resources[idx] = { ...resource, color: e.target.value };
                                    patch({ resources });
                                }}
                                style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', borderRadius: 6, padding: 2 }}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton size="small" color="error"
                                onClick={() => patch({ resources: widget.resources.filter(r => r.id !== resource.id) })}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                    onClick={() => patch({
                        resources: [
                            ...widget.resources,
                            { id: crypto.randomUUID(), name: 'Novo Recurso', icon: '📦', value: 0, max: 100, color: DEFAULT_RESOURCE_COLOR }
                        ]
                    })}
                >
                    Adicionar
                </Button>
            </Box>
        </SectionAccordion>
    );
}
