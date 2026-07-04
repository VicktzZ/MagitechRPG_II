'use client';

import { useEffect, useState, type ReactElement } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WidgetsIcon from '@mui/icons-material/Widgets';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import { NumberField } from '@components/misc';
import {
    createWidgetFromPreset,
    widgetPresetInfo,
    type CampaignWidget,
    type WidgetAlertSeverity,
    type WidgetPartStatus,
    type WidgetPreset
} from '@models';

interface WidgetManagerDialogProps {
    open: boolean;
    onClose: () => void;
}

const partStatusOptions: Array<{ value: WidgetPartStatus; label: string }> = [
    { value: 'operational', label: 'Operacional' },
    { value: 'damaged', label: 'Avariado' },
    { value: 'critical', label: 'Crítico' },
    { value: 'offline', label: 'Offline' }
];

const alertSeverityOptions: Array<{ value: WidgetAlertSeverity; label: string }> = [
    { value: 'info', label: 'Informação' },
    { value: 'warning', label: 'Aviso' },
    { value: 'danger', label: 'Perigo' }
];

export default function WidgetManagerDialog({ open, onClose }: WidgetManagerDialogProps): ReactElement {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ widget, setWidget ] = useState<CampaignWidget | null>(null);
    const [ saving, setSaving ] = useState(false);
    const [ newLogText, setNewLogText ] = useState('');

    // Sincroniza a cópia local ao abrir
    useEffect(() => {
        if (open) {
            setWidget(campaign.widget ? JSON.parse(JSON.stringify(campaign.widget)) : null);
            setNewLogText('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ open ]);

    const patch = (changes: Partial<CampaignWidget>) => {
        setWidget(prev => prev ? { ...prev, ...changes } : prev);
    };

    const patchLabel = (key: keyof CampaignWidget['labels'], value: string) => {
        setWidget(prev => prev ? { ...prev, labels: { ...prev.labels, [key]: value } } : prev);
    };

    const save = async (widgetToSave: CampaignWidget | null) => {
        setSaving(true);
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/widget`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widget: widgetToSave })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao salvar o widget');
            }
            enqueueSnackbar(widgetToSave ? 'Widget atualizado!' : 'Widget removido da campanha', { variant: 'success' });
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro ao salvar o widget', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!widget) return;
        const toSave = { ...widget };
        if (newLogText.trim()) {
            toSave.log = [
                ...(toSave.log ?? []),
                { id: crypto.randomUUID(), text: newLogText.trim(), timestamp: new Date().toISOString() }
            ];
        }
        await save(toSave);
    };

    // ── Sem widget ainda: escolha de preset ──
    if (!widget) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WidgetsIcon color="primary" /> Widget da Campanha
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Crie um painel compartilhado que aparece flutuando para todos os
                        participantes — escolha um modelo para começar (tudo é personalizável depois):
                    </Typography>
                    <Grid container spacing={1.5}>
                        {(Object.keys(widgetPresetInfo) as WidgetPreset[]).map(preset => {
                            const info = widgetPresetInfo[preset];
                            return (
                                <Grid item xs={12} sm={6} key={preset}>
                                    <Paper
                                        variant="outlined"
                                        onClick={() => setWidget(createWidgetFromPreset(preset))}
                                        sx={{
                                            p: 2,
                                            height: '100%',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            '&:hover': { borderColor: 'primary.main', boxShadow: 2 }
                                        }}
                                    >
                                        <Typography fontSize="1.8rem" lineHeight={1} mb={0.5}>{info.icon}</Typography>
                                        <Typography fontWeight={700} gutterBottom>{info.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {info.description}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WidgetsIcon color="primary" />
                Administrar Widget
                <Box flex={1} />
                <FormControlLabel
                    control={
                        <Switch
                            checked={widget.enabled}
                            onChange={(e) => patch({ enabled: e.target.checked })}
                        />
                    }
                    label="Visível aos jogadores"
                />
            </DialogTitle>

            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={1.5}>
                    {/* ── Identidade e situação ── */}
                    <Accordion defaultExpanded disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>{widget.icon} Identidade e Situação</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={8} sm={5}>
                                    <TextField
                                        fullWidth size="small" label="Nome"
                                        value={widget.name}
                                        onChange={(e) => patch({ name: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={4} sm={2}>
                                    <TextField
                                        fullWidth size="small" label="Ícone"
                                        value={widget.icon ?? ''}
                                        onChange={(e) => patch({ icon: e.target.value })}
                                        placeholder="🚀"
                                        inputProps={{ maxLength: 4 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth size="small" label="Subtítulo"
                                        value={widget.subtitle ?? ''}
                                        onChange={(e) => patch({ subtitle: e.target.value })}
                                        placeholder="Ex: Fragata de Exploração, Hospedaria"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small" label="Status"
                                        value={widget.status}
                                        onChange={(e) => patch({ status: e.target.value })}
                                        placeholder="Ex: Em órbita, Aberto ao público, Sob cerco"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small" label="Localização"
                                        value={widget.location ?? ''}
                                        onChange={(e) => patch({ location: e.target.value })}
                                        placeholder="Ex: Órbita de Kepler-442b, Distrito Portuário"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth size="small" multiline rows={2} label="Descrição"
                                        value={widget.description ?? ''}
                                        onChange={(e) => patch({ description: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Barras principais ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>
                                🛡️ Barras Principais — {widget.labels.integrity} {widget.integrity}/{widget.maxIntegrity}
                                {widget.showSecondary ? ` · ${widget.labels.secondary} ${widget.secondary}/${widget.maxSecondary}` : ''}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={3}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={widget.showIntegrity}
                                                onChange={(e) => patch({ showIntegrity: e.target.checked })}
                                            />
                                        }
                                        label="Barra principal"
                                    />
                                </Grid>
                                {widget.showIntegrity && (
                                    <>
                                        <Grid item xs={4} sm={3}>
                                            <TextField fullWidth size="small" label="Rótulo"
                                                value={widget.labels.integrity}
                                                onChange={(e) => patchLabel('integrity', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={4} sm={3}>
                                            <NumberField fullWidth size="small" label="Atual" min={0} max={widget.maxIntegrity}
                                                value={widget.integrity} onChange={(integrity) => patch({ integrity })} />
                                        </Grid>
                                        <Grid item xs={4} sm={3}>
                                            <NumberField fullWidth size="small" label="Máximo" min={1}
                                                value={widget.maxIntegrity}
                                                onChange={(maxIntegrity) => patch({ maxIntegrity, integrity: Math.min(widget.integrity, maxIntegrity) })} />
                                        </Grid>
                                    </>
                                )}

                                <Grid item xs={12} sm={3}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={widget.showSecondary}
                                                onChange={(e) => patch({ showSecondary: e.target.checked })}
                                            />
                                        }
                                        label="Barra secundária"
                                    />
                                </Grid>
                                {widget.showSecondary && (
                                    <>
                                        <Grid item xs={4} sm={3}>
                                            <TextField fullWidth size="small" label="Rótulo"
                                                value={widget.labels.secondary}
                                                onChange={(e) => patchLabel('secondary', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={4} sm={3}>
                                            <NumberField fullWidth size="small" label="Atual" min={0} max={widget.maxSecondary}
                                                value={widget.secondary} onChange={(secondary) => patch({ secondary })} />
                                        </Grid>
                                        <Grid item xs={4} sm={3}>
                                            <NumberField fullWidth size="small" label="Máximo" min={0}
                                                value={widget.maxSecondary}
                                                onChange={(maxSecondary) => patch({ maxSecondary, secondary: Math.min(widget.secondary, maxSecondary) })} />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Partes ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>⚙️ {widget.labels.parts} ({widget.parts.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
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
                                        <Grid item xs={9} sm={3.5 as any}>
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
                                        <Grid item xs={3} sm={2.5 as any}>
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
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Recursos ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>⛽ {widget.labels.resources} ({widget.resources.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
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
                                        <Grid item xs={2} sm={1.5 as any}>
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
                                                value={resource.color ?? '#1976d2'}
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
                                            { id: crypto.randomUUID(), name: 'Novo Recurso', icon: '📦', value: 0, max: 100, color: '#1976d2' }
                                        ]
                                    })}
                                >
                                    Adicionar
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Estoque ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>📦 {widget.labels.stock} ({widget.stock.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                <TextField
                                    size="small" label="Rótulo da seção" sx={{ maxWidth: 260 }}
                                    value={widget.labels.stock}
                                    onChange={(e) => patchLabel('stock', e.target.value)}
                                    helperText='Ex: "Estoque", "Despensa", "Suprimentos"'
                                />
                                {widget.stock.map((item, idx) => (
                                    <Grid container spacing={1} key={item.id} alignItems="center">
                                        <Grid item xs={5} sm={4}>
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
                                        <Grid item xs={3} sm={5}>
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
                                            { id: crypto.randomUUID(), name: 'Novo Item', quantity: 1 }
                                        ]
                                    })}
                                >
                                    Adicionar
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Alertas ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>🚨 Alertas ({widget.alerts.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
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
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Registro/Diário ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>📖 {widget.labels.log} ({widget.log.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                <TextField
                                    size="small" label="Rótulo da seção" sx={{ maxWidth: 260 }}
                                    value={widget.labels.log}
                                    onChange={(e) => patchLabel('log', e.target.value)}
                                    helperText='Ex: "Diário de Bordo", "Registro"'
                                />
                                <TextField
                                    fullWidth size="small" multiline rows={2}
                                    label="Nova entrada (registrada ao salvar)"
                                    value={newLogText}
                                    onChange={(e) => setNewLogText(e.target.value)}
                                    placeholder="Ex: Dia 47 — atracamos na estação Hyperion para reabastecer."
                                />
                                {widget.log.length > 0 && (
                                    <>
                                        <Divider />
                                        <Box display="flex" flexDirection="column" gap={1} maxHeight={200} overflow="auto">
                                            {[ ...widget.log ]
                                                .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                                                .map(entry => (
                                                    <Box key={entry.id} display="flex" alignItems="flex-start" gap={1}>
                                                        <Box flex={1}>
                                                            <Typography variant="caption" color="text.disabled">
                                                                {new Date(entry.timestamp).toLocaleString('pt-BR')}
                                                            </Typography>
                                                            <Typography variant="body2">{entry.text}</Typography>
                                                        </Box>
                                                        <IconButton size="small" color="error"
                                                            onClick={() => patch({ log: widget.log.filter(l => l.id !== entry.id) })}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Zona de perigo ── */}
                    {campaign.widget && (
                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                disabled={saving}
                                onClick={async () => await save(null)}
                            >
                                Remover widget da campanha
                            </Button>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Chip label="Aparece flutuando para todos, em tempo real" size="small" variant="outlined" />
                <Box flex={1} />
                <Button onClick={onClose} disabled={saving} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || !widget.name.trim()}
                    startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                >
                    {saving ? 'Salvando...' : 'Salvar Widget'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
