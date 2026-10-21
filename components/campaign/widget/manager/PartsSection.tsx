import type { ReactElement } from 'react';
import {
    Box,
    Button,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NumberField } from '@components/misc';
import type { CampaignWidget, WidgetPartStatus } from '@models';
import SectionAccordion from './SectionAccordion';
import { partStatusOptions } from './constants';
import type { WidgetPatch, WidgetPatchLabel } from './types';

interface PartsSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    patchLabel: WidgetPatchLabel;
}

/** Seção de partes/subsistemas do widget */
export default function PartsSection({ widget, patch, patchLabel }: PartsSectionProps): ReactElement {
    return (
        <SectionAccordion summary={<Typography fontWeight={700}>{widget.labels.parts} ({widget.parts.length})</Typography>}>
            <Box display="flex" flexDirection="column" gap={1.5}>
                <TextField
                    size="small" label="Rótulo da seção" sx={{ maxWidth: 260 }}
                    value={widget.labels.parts}
                    onChange={(e) => patchLabel('parts', e.target.value)}
                    helperText='Ex: "Sistemas", "Cômodos", "Defesas"'
                />
                {widget.parts.map((part, idx) => (
                    <Grid container spacing={1} key={part.id} alignItems="center">
                        <Grid item xs={3} sm={1}>
                            <TextField fullWidth size="small" label="Ícone" value={part.icon ?? ''}
                                onChange={(e) => {
                                    const parts = [ ...widget.parts ];
                                    parts[idx] = { ...part, icon: e.target.value };
                                    patch({ parts });
                                }} inputProps={{ maxLength: 4 }} />
                        </Grid>
                        <Grid item xs={9} sm={3.5}>
                            <TextField fullWidth size="small" label="Nome" value={part.name}
                                onChange={(e) => {
                                    const parts = [ ...widget.parts ];
                                    parts[idx] = { ...part, name: e.target.value };
                                    patch({ parts });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                            <NumberField fullWidth size="small" label="HP" min={0} max={part.maxHp}
                                value={part.hp}
                                onChange={(hp) => {
                                    const parts = [ ...widget.parts ];
                                    parts[idx] = { ...part, hp };
                                    patch({ parts });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                            <NumberField fullWidth size="small" label="HP Máx" min={1}
                                value={part.maxHp}
                                onChange={(maxHp) => {
                                    const parts = [ ...widget.parts ];
                                    parts[idx] = { ...part, maxHp, hp: Math.min(part.hp, maxHp) };
                                    patch({ parts });
                                }} />
                        </Grid>
                        <Grid item xs={3} sm={2.5}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={part.status}
                                    label="Status"
                                    onChange={(e) => {
                                        const parts = [ ...widget.parts ];
                                        parts[idx] = { ...part, status: e.target.value as WidgetPartStatus };
                                        patch({ parts });
                                    }}
                                >
                                    {partStatusOptions.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton size="small" color="error"
                                onClick={() => patch({ parts: widget.parts.filter(p => p.id !== part.id) })}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                    onClick={() => patch({
                        parts: [
                            ...widget.parts,
                            { id: crypto.randomUUID(), name: 'Nova Parte', icon: '🔧', hp: 10, maxHp: 10, status: 'operational' }
                        ]
                    })}
                >
                    Adicionar
                </Button>
            </Box>
        </SectionAccordion>
    );
}
