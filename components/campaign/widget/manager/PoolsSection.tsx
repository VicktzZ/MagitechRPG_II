import type { ReactElement } from 'react';
import {
    Box,
    Button,
    Chip,
    Grid,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SavingsIcon from '@mui/icons-material/Savings';
import { NumberField } from '@components/misc';
import type { CampaignWidget } from '@models';
import SectionAccordion from './SectionAccordion';
import type { WidgetPatch } from './types';

interface PoolsSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
}

/** Seção de fundos comuns (beta) do widget */
export default function PoolsSection({ widget, patch }: PoolsSectionProps): ReactElement {
    return (
        <SectionAccordion
            summary={(
                <Typography component="div" fontWeight={700} display="flex" alignItems="center" gap={0.75}>
                    <SavingsIcon fontSize="small" /> Fundos Comuns ({widget.pools?.length ?? 0})
                    <Chip label="BETA" size="small" color="secondary" sx={{ height: 18, fontSize: '0.75rem' }} />
                </Typography>
            )}
        >
            <Box display="flex" flexDirection="column" gap={1.5}>
                <Typography variant="caption" color="text.secondary">
                    Um fundo que qualquer jogador pode depositar ou retirar — cada transação fica registrada com o nome de quem fez.
                </Typography>
                {(widget.pools ?? []).map((pool, idx) => (
                    <Grid container spacing={1} key={pool.id} alignItems="center">
                        <Grid item xs={3} sm={1}>
                            <TextField fullWidth size="small" label="Ícone" value={pool.icon ?? ''}
                                onChange={(e) => {
                                    const pools = [ ...widget.pools ];
                                    pools[idx] = { ...pool, icon: e.target.value };
                                    patch({ pools });
                                }} inputProps={{ maxLength: 4 }} />
                        </Grid>
                        <Grid item xs={9} sm={3}>
                            <TextField fullWidth size="small" label="Nome" value={pool.name}
                                onChange={(e) => {
                                    const pools = [ ...widget.pools ];
                                    pools[idx] = { ...pool, name: e.target.value };
                                    patch({ pools });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                            <NumberField fullWidth size="small" label="Saldo" min={0}
                                value={pool.value}
                                onChange={(value) => {
                                    const pools = [ ...widget.pools ];
                                    pools[idx] = { ...pool, value };
                                    patch({ pools });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                            <NumberField fullWidth size="small" label="Máx (0=∞)" min={0}
                                value={pool.max ?? 0}
                                onChange={(max) => {
                                    const pools = [ ...widget.pools ];
                                    pools[idx] = { ...pool, max: max > 0 ? max : undefined };
                                    patch({ pools });
                                }} />
                        </Grid>
                        <Grid item xs={3} sm={2}>
                            <TextField fullWidth size="small" label="Unid." value={pool.unit ?? ''}
                                onChange={(e) => {
                                    const pools = [ ...widget.pools ];
                                    pools[idx] = { ...pool, unit: e.target.value };
                                    patch({ pools });
                                }} inputProps={{ maxLength: 8 }} />
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton size="small" color="error"
                                onClick={() => patch({ pools: widget.pools.filter(p => p.id !== pool.id) })}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                    onClick={() => patch({
                        pools: [
                            ...(widget.pools ?? []),
                            { id: crypto.randomUUID(), name: 'Novo Fundo', icon: '💰', value: 0, history: [] }
                        ]
                    })}
                >
                    Adicionar
                </Button>
            </Box>
        </SectionAccordion>
    );
}
