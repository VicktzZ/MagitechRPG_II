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
import type { CampaignWidget, WidgetAlertSeverity } from '@models';
import SectionAccordion from './SectionAccordion';
import { alertSeverityOptions } from './constants';
import type { WidgetPatch } from './types';

interface AlertsSectionProps {
    widget: CampaignWidget;
    patch: WidgetPatch;
}

/** Seção de alertas do widget */
export default function AlertsSection({ widget, patch }: AlertsSectionProps): ReactElement {
    return (
        <SectionAccordion summary={<Typography fontWeight={700}>Alertas ({widget.alerts.length})</Typography>}>
            <Box display="flex" flexDirection="column" gap={1.5}>
                {widget.alerts.map((alert, idx) => (
                    <Grid container spacing={1} key={alert.id} alignItems="center">
                        <Grid item xs={7} sm={8}>
                            <TextField fullWidth size="small" label="Texto do alerta" value={alert.text}
                                onChange={(e) => {
                                    const alerts = [ ...widget.alerts ];
                                    alerts[idx] = { ...alert, text: e.target.value };
                                    patch({ alerts });
                                }} />
                        </Grid>
                        <Grid item xs={4} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Severidade</InputLabel>
                                <Select
                                    value={alert.severity}
                                    label="Severidade"
                                    onChange={(e) => {
                                        const alerts = [ ...widget.alerts ];
                                        alerts[idx] = { ...alert, severity: e.target.value as WidgetAlertSeverity };
                                        patch({ alerts });
                                    }}
                                >
                                    {alertSeverityOptions.map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton size="small" color="error"
                                onClick={() => patch({ alerts: widget.alerts.filter(a => a.id !== alert.id) })}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                    onClick={() => patch({
                        alerts: [
                            ...widget.alerts,
                            { id: crypto.randomUUID(), text: 'Novo alerta', severity: 'warning', createdAt: new Date().toISOString() }
                        ]
                    })}
                >
                    Adicionar Alerta
                </Button>
            </Box>
        </SectionAccordion>
    );
}
