'use client';

import { useEffect, useState, type ReactElement } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
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
    Select,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import { NumberField } from '@components/misc';
import {
    createDefaultShip,
    type CampaignShip,
    type ShipAlertSeverity,
    type ShipComponentStatus
} from '@models';

interface ShipManagerDialogProps {
    open: boolean;
    onClose: () => void;
}

const componentStatusOptions: Array<{ value: ShipComponentStatus; label: string }> = [
    { value: 'operational', label: 'Operacional' },
    { value: 'damaged', label: 'Avariado' },
    { value: 'critical', label: 'Crítico' },
    { value: 'offline', label: 'Offline' }
];

const alertSeverityOptions: Array<{ value: ShipAlertSeverity; label: string }> = [
    { value: 'info', label: 'Informação' },
    { value: 'warning', label: 'Aviso' },
    { value: 'danger', label: 'Perigo' }
];

export default function ShipManagerDialog({ open, onClose }: ShipManagerDialogProps): ReactElement {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ ship, setShip ] = useState<CampaignShip | null>(null);
    const [ saving, setSaving ] = useState(false);
    const [ newLogText, setNewLogText ] = useState('');

    // Sincroniza a cópia local ao abrir
    useEffect(() => {
        if (open) {
            setShip(campaign.ship ? JSON.parse(JSON.stringify(campaign.ship)) : null);
            setNewLogText('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ open ]);

    const patch = (changes: Partial<CampaignShip>) => {
        setShip(prev => prev ? { ...prev, ...changes } : prev);
    };

    const save = async (shipToSave: CampaignShip | null) => {
        setSaving(true);
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/ship`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ship: shipToSave })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao salvar a nave');
            }
            enqueueSnackbar(shipToSave ? 'Nave atualizada!' : 'Nave removida da campanha', { variant: 'success' });
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro ao salvar a nave', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!ship) return;
        const toSave = { ...ship };
        if (newLogText.trim()) {
            toSave.log = [
                ...(toSave.log ?? []),
                { id: crypto.randomUUID(), text: newLogText.trim(), timestamp: new Date().toISOString() }
            ];
        }
        await save(toSave);
    };

    // ── Sem nave ainda: tela de criação ──
    if (!ship) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RocketLaunchIcon color="primary" /> Nave da Campanha
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Esta campanha ainda não possui uma nave. Crie uma para que todos os
                        jogadores vejam o painel compartilhado com casco, sistemas, recursos,
                        estoque e alertas.
                    </Typography>
                    <Alert severity="info">
                        A nave vem pré-configurada com sistemas e recursos básicos — tudo pode
                        ser editado depois.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button
                        variant="contained"
                        startIcon={<RocketLaunchIcon />}
                        onClick={() => setShip(createDefaultShip())}
                    >
                        Criar Nave
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RocketLaunchIcon color="primary" />
                Administrar Nave
                <Box flex={1} />
                <FormControlLabel
                    control={
                        <Switch
                            checked={ship.enabled}
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
                            <Typography fontWeight={700}>🛰️ Identidade e Situação</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={8} sm={5}>
                                    <TextField
                                        fullWidth size="small" label="Nome da Nave"
                                        value={ship.name}
                                        onChange={(e) => patch({ name: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={4} sm={2}>
                                    <TextField
                                        fullWidth size="small" label="Ícone"
                                        value={ship.icon ?? ''}
                                        onChange={(e) => patch({ icon: e.target.value })}
                                        placeholder="🚀"
                                        inputProps={{ maxLength: 4 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <TextField
                                        fullWidth size="small" label="Classe"
                                        value={ship.shipClass ?? ''}
                                        onChange={(e) => patch({ shipClass: e.target.value })}
                                        placeholder="Ex: Fragata de Exploração"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small" label="Status"
                                        value={ship.status}
                                        onChange={(e) => patch({ status: e.target.value })}
                                        placeholder="Ex: Em órbita, Atracada, Em combate"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth size="small" label="Localização"
                                        value={ship.location ?? ''}
                                        onChange={(e) => patch({ location: e.target.value })}
                                        placeholder="Ex: Órbita de Kepler-442b"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth size="small" multiline rows={2} label="Descrição"
                                        value={ship.description ?? ''}
                                        onChange={(e) => patch({ description: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Integridade ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>🛡️ Integridade — Casco {ship.hull}/{ship.maxHull} · Escudos {ship.shield}/{ship.maxShield}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <NumberField fullWidth size="small" label="Casco" min={0} max={ship.maxHull}
                                        value={ship.hull} onChange={(hull) => patch({ hull })} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <NumberField fullWidth size="small" label="Casco Máx" min={1}
                                        value={ship.maxHull} onChange={(maxHull) => patch({ maxHull, hull: Math.min(ship.hull, maxHull) })} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <NumberField fullWidth size="small" label="Escudos" min={0} max={ship.maxShield}
                                        value={ship.shield} onChange={(shield) => patch({ shield })} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <NumberField fullWidth size="small" label="Escudos Máx" min={0}
                                        value={ship.maxShield} onChange={(maxShield) => patch({ maxShield, shield: Math.min(ship.shield, maxShield) })} />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Sistemas/Componentes ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>⚙️ Sistemas ({ship.components.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                {ship.components.map((component, idx) => (
                                    <Grid container spacing={1} key={component.id} alignItems="center">
                                        <Grid item xs={3} sm={1}>
                                            <TextField fullWidth size="small" label="Ícone" value={component.icon ?? ''}
                                                onChange={(e) => {
                                                    const components = [ ...ship.components ];
                                                    components[idx] = { ...component, icon: e.target.value };
                                                    patch({ components });
                                                }} inputProps={{ maxLength: 4 }} />
                                        </Grid>
                                        <Grid item xs={9} sm={3.5 as any}>
                                            <TextField fullWidth size="small" label="Nome" value={component.name}
                                                onChange={(e) => {
                                                    const components = [ ...ship.components ];
                                                    components[idx] = { ...component, name: e.target.value };
                                                    patch({ components });
                                                }} />
                                        </Grid>
                                        <Grid item xs={4} sm={2}>
                                            <NumberField fullWidth size="small" label="HP" min={0} max={component.maxHp}
                                                value={component.hp}
                                                onChange={(hp) => {
                                                    const components = [ ...ship.components ];
                                                    components[idx] = { ...component, hp };
                                                    patch({ components });
                                                }} />
                                        </Grid>
                                        <Grid item xs={4} sm={2}>
                                            <NumberField fullWidth size="small" label="HP Máx" min={1}
                                                value={component.maxHp}
                                                onChange={(maxHp) => {
                                                    const components = [ ...ship.components ];
                                                    components[idx] = { ...component, maxHp, hp: Math.min(component.hp, maxHp) };
                                                    patch({ components });
                                                }} />
                                        </Grid>
                                        <Grid item xs={3} sm={2.5 as any}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    value={component.status}
                                                    label="Status"
                                                    onChange={(e) => {
                                                        const components = [ ...ship.components ];
                                                        components[idx] = { ...component, status: e.target.value as ShipComponentStatus };
                                                        patch({ components });
                                                    }}
                                                >
                                                    {componentStatusOptions.map(opt => (
                                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <IconButton size="small" color="error"
                                                onClick={() => patch({ components: ship.components.filter(c => c.id !== component.id) })}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button
                                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                                    onClick={() => patch({
                                        components: [
                                            ...ship.components,
                                            { id: crypto.randomUUID(), name: 'Novo Sistema', icon: '🔧', hp: 10, maxHp: 10, status: 'operational' }
                                        ]
                                    })}
                                >
                                    Adicionar Sistema
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Recursos ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>⛽ Recursos ({ship.resources.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                {ship.resources.map((resource, idx) => (
                                    <Grid container spacing={1} key={resource.id} alignItems="center">
                                        <Grid item xs={3} sm={1}>
                                            <TextField fullWidth size="small" label="Ícone" value={resource.icon ?? ''}
                                                onChange={(e) => {
                                                    const resources = [ ...ship.resources ];
                                                    resources[idx] = { ...resource, icon: e.target.value };
                                                    patch({ resources });
                                                }} inputProps={{ maxLength: 4 }} />
                                        </Grid>
                                        <Grid item xs={9} sm={3}>
                                            <TextField fullWidth size="small" label="Nome" value={resource.name}
                                                onChange={(e) => {
                                                    const resources = [ ...ship.resources ];
                                                    resources[idx] = { ...resource, name: e.target.value };
                                                    patch({ resources });
                                                }} />
                                        </Grid>
                                        <Grid item xs={4} sm={2}>
                                            <NumberField fullWidth size="small" label="Valor" min={0}
                                                value={resource.value}
                                                onChange={(value) => {
                                                    const resources = [ ...ship.resources ];
                                                    resources[idx] = { ...resource, value };
                                                    patch({ resources });
                                                }} />
                                        </Grid>
                                        <Grid item xs={4} sm={2}>
                                            <NumberField fullWidth size="small" label="Máx (0=∞)" min={0}
                                                value={resource.max ?? 0}
                                                onChange={(max) => {
                                                    const resources = [ ...ship.resources ];
                                                    resources[idx] = { ...resource, max: max > 0 ? max : undefined };
                                                    patch({ resources });
                                                }} />
                                        </Grid>
                                        <Grid item xs={2} sm={1.5 as any}>
                                            <TextField fullWidth size="small" label="Unid." value={resource.unit ?? ''}
                                                onChange={(e) => {
                                                    const resources = [ ...ship.resources ];
                                                    resources[idx] = { ...resource, unit: e.target.value };
                                                    patch({ resources });
                                                }} inputProps={{ maxLength: 8 }} />
                                        </Grid>
                                        <Grid item xs={1} sm={1}>
                                            <input
                                                type="color"
                                                value={resource.color ?? '#1976d2'}
                                                onChange={(e) => {
                                                    const resources = [ ...ship.resources ];
                                                    resources[idx] = { ...resource, color: e.target.value };
                                                    patch({ resources });
                                                }}
                                                style={{ width: 36, height: 36, border: 'none', cursor: 'pointer', borderRadius: 6, padding: 2 }}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <IconButton size="small" color="error"
                                                onClick={() => patch({ resources: ship.resources.filter(r => r.id !== resource.id) })}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button
                                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                                    onClick={() => patch({
                                        resources: [
                                            ...ship.resources,
                                            { id: crypto.randomUUID(), name: 'Novo Recurso', icon: '📦', value: 0, max: 100, color: '#1976d2' }
                                        ]
                                    })}
                                >
                                    Adicionar Recurso
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Estoque ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>📦 Estoque Compartilhado ({ship.cargo.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                {ship.cargo.map((item, idx) => (
                                    <Grid container spacing={1} key={item.id} alignItems="center">
                                        <Grid item xs={5} sm={4}>
                                            <TextField fullWidth size="small" label="Item" value={item.name}
                                                onChange={(e) => {
                                                    const cargo = [ ...ship.cargo ];
                                                    cargo[idx] = { ...item, name: e.target.value };
                                                    patch({ cargo });
                                                }} />
                                        </Grid>
                                        <Grid item xs={3} sm={2}>
                                            <NumberField fullWidth size="small" label="Qtd" min={0}
                                                value={item.quantity}
                                                onChange={(quantity) => {
                                                    const cargo = [ ...ship.cargo ];
                                                    cargo[idx] = { ...item, quantity };
                                                    patch({ cargo });
                                                }} />
                                        </Grid>
                                        <Grid item xs={3} sm={5}>
                                            <TextField fullWidth size="small" label="Descrição" value={item.description ?? ''}
                                                onChange={(e) => {
                                                    const cargo = [ ...ship.cargo ];
                                                    cargo[idx] = { ...item, description: e.target.value };
                                                    patch({ cargo });
                                                }} />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <IconButton size="small" color="error"
                                                onClick={() => patch({ cargo: ship.cargo.filter(c => c.id !== item.id) })}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button
                                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                                    onClick={() => patch({
                                        cargo: [
                                            ...ship.cargo,
                                            { id: crypto.randomUUID(), name: 'Novo Item', quantity: 1 }
                                        ]
                                    })}
                                >
                                    Adicionar Item
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Alertas ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>🚨 Alertas ({ship.alerts.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box display="flex" flexDirection="column" gap={1.5}>
                                {ship.alerts.map((alert, idx) => (
                                    <Grid container spacing={1} key={alert.id} alignItems="center">
                                        <Grid item xs={7} sm={8}>
                                            <TextField fullWidth size="small" label="Texto do alerta" value={alert.text}
                                                onChange={(e) => {
                                                    const alerts = [ ...ship.alerts ];
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
                                                        const alerts = [ ...ship.alerts ];
                                                        alerts[idx] = { ...alert, severity: e.target.value as ShipAlertSeverity };
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
                                                onClick={() => patch({ alerts: ship.alerts.filter(a => a.id !== alert.id) })}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                ))}
                                <Button
                                    size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                                    onClick={() => patch({
                                        alerts: [
                                            ...ship.alerts,
                                            { id: crypto.randomUUID(), text: 'Novo alerta', severity: 'warning', createdAt: new Date().toISOString() }
                                        ]
                                    })}
                                >
                                    Adicionar Alerta
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Diário de bordo ── */}
                    <Accordion disableGutters>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={700}>📖 Diário de Bordo ({ship.log.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                fullWidth size="small" multiline rows={2}
                                label="Nova entrada (registrada ao salvar)"
                                value={newLogText}
                                onChange={(e) => setNewLogText(e.target.value)}
                                placeholder="Ex: Dia 47 — atracamos na estação Hyperion para reabastecer."
                            />
                            {ship.log.length > 0 && (
                                <>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box display="flex" flexDirection="column" gap={1} maxHeight={200} overflow="auto">
                                        {[ ...ship.log ]
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
                                                        onClick={() => patch({ log: ship.log.filter(l => l.id !== entry.id) })}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                    </Box>
                                </>
                            )}
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Zona de perigo ── */}
                    {campaign.ship && (
                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                disabled={saving}
                                onClick={async () => await save(null)}
                            >
                                Remover nave da campanha
                            </Button>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Chip label="Visível a todos os jogadores em tempo real" size="small" variant="outlined" />
                <Box flex={1} />
                <Button onClick={onClose} disabled={saving} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || !ship.name.trim()}
                    startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                >
                    {saving ? 'Salvando...' : 'Salvar Nave'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
