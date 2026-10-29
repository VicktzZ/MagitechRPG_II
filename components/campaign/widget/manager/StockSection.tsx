import type { ReactElement } from 'react';
import {
    Box,
    Button,
    FormControlLabel,
    Grid,
    IconButton,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NumberField } from '@components/misc';
import type { CampaignWidget } from '@models';
import SectionAccordion from './SectionAccordion';
import type { WidgetPatch, WidgetPatchLabel } from './types';

interface StockSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
    patchLabel: WidgetPatchLabel;
}

/** Seção de estoque compartilhado do widget */
export default function StockSection({ widget, patch, patchLabel }: StockSectionProps): ReactElement {
    return (
        <SectionAccordion summary={<Typography fontWeight={700}>{widget.labels.stock} ({widget.stock.length})</Typography>}>
            <Box display="flex" flexDirection="column" gap={1.5}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={widget.showStock !== false}
                            onChange={(e) => patch({ showStock: e.target.checked })}
                        />
                    }
                    label="Este widget possui estoque próprio"
                />
                {widget.showStock === false && (
                    <Typography variant="caption" color="text.secondary">
                        Sem estoque próprio, itens fabricados via crafting vão direto para a ficha de quem fabricou.
                    </Typography>
                )}
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                        <TextField
                            fullWidth size="small" label="Rótulo da seção"
                            value={widget.labels.stock}
                            onChange={(e) => patchLabel('stock', e.target.value)}
                            helperText='Ex: "Estoque", "Despensa", "Suprimentos"'
                        />
                    </Grid>
                    <Grid item xs={6} sm={3.5}>
                        <NumberField
                            fullWidth size="small" label="Peso máximo (0=∞)" min={0}
                            value={widget.stockMaxWeight ?? 0}
                            onChange={(v) => patch({ stockMaxWeight: v > 0 ? v : undefined })}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3.5}>
                        <TextField
                            fullWidth size="small" label="Unidade"
                            value={widget.stockWeightUnit ?? 'kg'}
                            onChange={(e) => patch({ stockWeightUnit: e.target.value })}
                        />
                    </Grid>
                </Grid>
                {widget.stock.map((item, idx) => (
                    <Grid container spacing={1} key={item.id} alignItems="center">
                        <Grid item xs={5} sm={3}>
                            <TextField fullWidth size="small" label="Item" value={item.name}
                                onChange={(e) => {
                                    const stock = [ ...widget.stock ];
                                    stock[idx] = { ...item, name: e.target.value };
                                    patch({ stock });
                                }} />
                        </Grid>
                        <Grid item xs={3} sm={2}>
                            <NumberField fullWidth size="small" label="Qtd" min={0}
                                value={item.quantity}
                                onChange={(quantity) => {
                                    const stock = [ ...widget.stock ];
                                    stock[idx] = { ...item, quantity };
                                    patch({ stock });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                            <NumberField fullWidth size="small" label="Peso" min={0} allowDecimal
                                value={item.weight ?? 0}
                                onChange={(weight) => {
                                    const stock = [ ...widget.stock ];
                                    stock[idx] = { ...item, weight };
                                    patch({ stock });
                                }} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth size="small" label="Descrição" value={item.description ?? ''}
                                onChange={(e) => {
                                    const stock = [ ...widget.stock ];
                                    stock[idx] = { ...item, description: e.target.value };
                                    patch({ stock });
                                }} />
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton size="small" color="error"
                                onClick={() => patch({ stock: widget.stock.filter(s => s.id !== item.id) })}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                    onClick={() => patch({
                        stock: [
                            ...widget.stock,
                            { id: crypto.randomUUID(), name: 'Novo Item', quantity: 1, weight: 0 }
                        ]
                    })}
                >
                    Adicionar
                </Button>
            </Box>
        </SectionAccordion>
    );
}
