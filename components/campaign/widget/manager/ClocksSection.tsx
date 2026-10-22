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
import TimerIcon from '@mui/icons-material/Timer';
import { NumberField } from '@components/misc';
import type { CampaignWidget } from '@models';
import SectionAccordion from './SectionAccordion';
import type { WidgetPatch } from './types';

interface ClocksSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
}

/** Seção de relógios (beta) do widget */
export default function ClocksSection({ widget, patch }: ClocksSectionProps): ReactElement {
    return (
        <SectionAccordion
            summary={(
                <Typography component="div" fontWeight={700} display="flex" alignItems="center" gap={0.75}>
                    <TimerIcon fontSize="small" /> Relógios ({widget.clocks?.length ?? 0})
                    <Chip label="BETA" size="small" color="secondary" sx={{ height: 18, fontSize: '0.75rem' }} />
                </Typography>
            )}
        >
            <Box display="flex" flexDirection="column" gap={1.5}>
                <Typography variant="caption" color="text.secondary">
                    Marcador segmentado para tensão narrativa (ex: Reforços chegam em..., Estrutura cede em...).
                </Typography>
                {(widget.clocks ?? []).map((clock, idx) => (
                    <Grid container spacing={1} key={clock.id} alignItems="center">
                        <Grid item xs={3} sm={1}>
                            <TextField fullWidth size="small" label="Ícone" value={clock.icon ?? ''}
                                onChange={(e) => {
                                    const clocks = [ ...widget.clocks ];
                                    clocks[idx] = { ...clock, icon: e.target.value };
                                    patch({ clocks });
                                }} inputProps={{ maxLength: 4 }} />
                        </Grid>
                        <Grid item xs={9} sm={3}>
                            <TextField fullWidth size="small" label="Nome" value={clock.name}
                                onChange={(e) => {
                                    const clocks = [ ...widget.clocks ];
                                    clocks[idx] = { ...clock, name: e.target.value };
                                    patch({ clocks });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                            <NumberField fullWidth size="small" label="Atual" min={0} max={clock.max}
                                value={clock.current}
                                onChange={(current) => {
                                    const clocks = [ ...widget.clocks ];
                                    clocks[idx] = { ...clock, current };
                                    patch({ clocks });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                            <NumberField fullWidth size="small" label="Máx" min={1}
                                value={clock.max}
                                onChange={(max) => {
                                    const clocks = [ ...widget.clocks ];
                                    clocks[idx] = { ...clock, max, current: Math.min(clock.current, max) };
                                    patch({ clocks });
                                }} />
                        </Grid>
                        <Grid item xs={3} sm={2}>
                            <TextField fullWidth size="small" label="Unid." value={clock.unit ?? ''}
                                onChange={(e) => {
                                    const clocks = [ ...widget.clocks ];
                                    clocks[idx] = { ...clock, unit: e.target.value };
                                    patch({ clocks });
                                }} inputProps={{ maxLength: 8 }} />
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton size="small" color="error"
                                onClick={() => patch({ clocks: widget.clocks.filter(c => c.id !== clock.id) })}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth size="small" label="Mensagem ao completar" value={clock.triggeredMessage ?? ''}
                                onChange={(e) => {
                                    const clocks = [ ...widget.clocks ];
                                    clocks[idx] = { ...clock, triggeredMessage: e.target.value };
                                    patch({ clocks });
                                }} placeholder="Ex: Os reforços chegaram!" />
                        </Grid>
                    </Grid>
                ))}
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                    onClick={() => patch({
                        clocks: [
                            ...(widget.clocks ?? []),
                            { id: crypto.randomUUID(), name: 'Novo Relógio', icon: '⏱️', current: 0, max: 6 }
                        ]
                    })}
                >
                    Adicionar relógio
                </Button>
            </Box>
        </SectionAccordion>
    );
}
