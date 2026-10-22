import type { ReactElement } from 'react';
import {
    Box,
    Button,
    Chip,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { NumberField } from '@components/misc';
import type { CampaignWidget, WidgetBountyStatus } from '@models';
import SectionAccordion from './SectionAccordion';
import { bountyStatusOptions } from './constants';
import type { WidgetPatch } from './types';

interface BountiesSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
}

/** Seção de tarefas/contratos (beta) do widget */
export default function BountiesSection({ widget, patch }: BountiesSectionProps): ReactElement {
    return (
        <SectionAccordion
            summary={(
                <Typography component="div" fontWeight={700} display="flex" alignItems="center" gap={0.75}>
                    <AssignmentIcon fontSize="small" /> Tarefas ({widget.bounties?.length ?? 0})
                    <Chip label="BETA" size="small" color="secondary" sx={{ height: 18, fontSize: '0.75rem' }} />
                </Typography>
            )}
        >
            <Box display="flex" flexDirection="column" gap={2}>
                {(widget.bounties ?? []).map((bounty, idx) => (
                    <Paper key={bounty.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Grid container spacing={1} alignItems="center">
                            <Grid item xs={11} sm={5}>
                                <TextField fullWidth size="small" label="Título" value={bounty.title}
                                    onChange={(e) => {
                                        const bounties = [ ...widget.bounties ];
                                        bounties[idx] = { ...bounty, title: e.target.value };
                                        patch({ bounties });
                                    }} />
                            </Grid>
                            <Grid item xs={8} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        label="Status"
                                        value={bounty.status}
                                        onChange={(e) => {
                                            const bounties = [ ...widget.bounties ];
                                            bounties[idx] = { ...bounty, status: e.target.value as WidgetBountyStatus };
                                            patch({ bounties });
                                        }}
                                    >
                                        {bountyStatusOptions.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton size="small" color="error"
                                    onClick={() => patch({ bounties: widget.bounties.filter(b => b.id !== bounty.id) })}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth size="small" label="Descrição" value={bounty.description ?? ''}
                                    onChange={(e) => {
                                        const bounties = [ ...widget.bounties ];
                                        bounties[idx] = { ...bounty, description: e.target.value };
                                        patch({ bounties });
                                    }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth size="small" label="Recompensa (texto livre)" value={bounty.rewardText ?? ''}
                                    onChange={(e) => {
                                        const bounties = [ ...widget.bounties ];
                                        bounties[idx] = { ...bounty, rewardText: e.target.value };
                                        patch({ bounties });
                                    }} placeholder="Ex: 50 XP, item raro..." />
                            </Grid>
                            <Grid item xs={7} sm={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Recurso concedido</InputLabel>
                                    <Select
                                        label="Recurso concedido"
                                        value={bounty.rewardResourceId ?? ''}
                                        onChange={(e) => {
                                            const bounties = [ ...widget.bounties ];
                                            bounties[idx] = { ...bounty, rewardResourceId: e.target.value || undefined };
                                            patch({ bounties });
                                        }}
                                    >
                                        <MenuItem value="">Nenhum</MenuItem>
                                        {widget.resources.map(r => (
                                            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={5} sm={2}>
                                <NumberField fullWidth size="small" label="Qtd" min={0}
                                    value={bounty.rewardAmount ?? 0}
                                    onChange={(rewardAmount) => {
                                        const bounties = [ ...widget.bounties ];
                                        bounties[idx] = { ...bounty, rewardAmount };
                                        patch({ bounties });
                                    }} />
                            </Grid>
                        </Grid>
                    </Paper>
                ))}
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                    onClick={() => patch({
                        bounties: [
                            ...(widget.bounties ?? []),
                            { id: crypto.randomUUID(), title: 'Nova Tarefa', status: 'open', createdAt: new Date().toISOString() }
                        ]
                    })}
                >
                    Adicionar tarefa
                </Button>
            </Box>
        </SectionAccordion>
    );
}
