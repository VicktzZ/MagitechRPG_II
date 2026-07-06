'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
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
    Tooltip,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WidgetsIcon from '@mui/icons-material/Widgets';
import SaveIcon from '@mui/icons-material/Save';
import ScienceIcon from '@mui/icons-material/Science';
import SavingsIcon from '@mui/icons-material/Savings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimerIcon from '@mui/icons-material/Timer';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import { NumberField } from '@components/misc';
import {
    createWidgetFromPreset,
    widgetPresetInfo,
    MAX_CAMPAIGN_WIDGETS,
    type CampaignWidget,
    type WidgetAlertSeverity,
    type WidgetBountyStatus,
    type WidgetPartStatus,
    type WidgetPreset,
    type Item,
    type Weapon,
    type Armor
} from '@models';
import type { RPGSystem } from '@models/entities';
import { defaultItems } from '@constants/defaultItems';
import { defaultWeapons } from '@constants/defaultWeapons';
import { defaultArmors } from '@constants/defaultArmors';

interface WidgetManagerDialogProps {
    open: boolean;
    onClose: () => void;
    /** Widget que deve ficar ativo ao abrir (ex: o painel que originou a abertura) */
    initialWidgetId?: string;
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

const bountyStatusOptions: Array<{ value: WidgetBountyStatus; label: string }> = [
    { value: 'open', label: 'Aberta' },
    { value: 'pending', label: 'Pendente' },
    { value: 'done', label: 'Concluída' }
];

export default function WidgetManagerDialog({ open, onClose, initialWidgetId }: WidgetManagerDialogProps): ReactElement {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const [ widgets, setWidgets ] = useState<CampaignWidget[]>([]);
    const [ activeId, setActiveId ] = useState<string | null>(null);
    const [ addingPreset, setAddingPreset ] = useState(false);
    const [ saving, setSaving ] = useState(false);
    const [ newLogText, setNewLogText ] = useState('');
    const [ systemCustomItems, setSystemCustomItems ] = useState<Array<Partial<Item>>>([]);
    const [ systemCustomWeapons, setSystemCustomWeapons ] = useState<Array<Partial<Weapon>>>([]);
    const [ systemCustomArmors, setSystemCustomArmors ] = useState<Array<Partial<Armor>>>([]);

    // Sincroniza a cópia local ao abrir
    useEffect(() => {
        if (open) {
            const clone: CampaignWidget[] = campaign.widgets ? JSON.parse(JSON.stringify(campaign.widgets)) : [];
            setWidgets(clone);
            setActiveId(initialWidgetId && clone.some(w => w.id === initialWidgetId) ? initialWidgetId : (clone[0]?.id ?? null));
            setAddingPreset(clone.length === 0);
            setNewLogText('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ open ]);

    // Catálogo de itens/armas/armaduras já estabelecidos (do sistema customizado +
    // criados na campanha), usados como atalho para preencher o crafting sem digitar tudo.
    useEffect(() => {
        if (!open || !campaign.systemId) {
            setSystemCustomItems([]);
            setSystemCustomWeapons([]);
            setSystemCustomArmors([]);
            return;
        }
        fetch(`/api/rpg-system/${campaign.systemId}`)
            .then(async res => await res.json())
            .then((data: RPGSystem) => {
                setSystemCustomItems(data.customItems?.items ?? []);
                setSystemCustomWeapons(data.customItems?.weapons ?? []);
                setSystemCustomArmors(data.customItems?.armors ?? []);
            })
            .catch(() => {
                setSystemCustomItems([]);
                setSystemCustomWeapons([]);
                setSystemCustomArmors([]);
            });
    }, [ open, campaign.systemId ]);

    // Catálogo combinado: itens padrão da aplicação + do sistema customizado + criados na campanha
    const catalogItems = useMemo(() => {
        const fromCampaign = campaign.custom?.items?.item ?? [];
        const fromDefaults = [ ...defaultItems.scientific, ...defaultItems.magical ];
        const combined = [ ...fromCampaign, ...systemCustomItems, ...fromDefaults ];
        const seen = new Set<string>();
        const result: Array<{ name: string; weight?: number; description?: string }> = [];
        combined.forEach(item => {
            const name = item?.name?.trim();
            if (!name || seen.has(name.toLowerCase())) return;
            seen.add(name.toLowerCase());
            result.push({ name, weight: item.weight, description: item.description });
        });
        return result.sort((a, b) => a.name.localeCompare(b.name));
    }, [ campaign.custom?.items?.item, systemCustomItems ]);

    const catalogItemNames = useMemo(() => catalogItems.map(i => i.name), [ catalogItems ]);
    const findCatalogItem = (name: string) => catalogItems.find(i => i.name.toLowerCase() === name.trim().toLowerCase());

    // Catálogos de armas e armaduras (mesmas três fontes), para receitas que produzem equipamento
    const catalogWeapons = useMemo(() => {
        const fromCampaign = campaign.custom?.items?.weapon ?? [];
        const fromDefaults = Object.values(defaultWeapons).flat();
        const combined = [ ...fromCampaign, ...systemCustomWeapons, ...fromDefaults ];
        const seen = new Set<string>();
        const result: Array<Partial<Weapon>> = [];
        combined.forEach(w => {
            const name = w?.name?.trim();
            if (!name || seen.has(name.toLowerCase())) return;
            seen.add(name.toLowerCase());
            result.push(w);
        });
        return result.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }, [ campaign.custom?.items?.weapon, systemCustomWeapons ]);

    const catalogArmors = useMemo(() => {
        const fromCampaign = campaign.custom?.items?.armor ?? [];
        const fromDefaults = Object.values(defaultArmors).flat();
        const combined = [ ...fromCampaign, ...systemCustomArmors, ...fromDefaults ];
        const seen = new Set<string>();
        const result: Array<Partial<Armor>> = [];
        combined.forEach(a => {
            const name = a?.name?.trim();
            if (!name || seen.has(name.toLowerCase())) return;
            seen.add(name.toLowerCase());
            result.push(a);
        });
        return result.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }, [ campaign.custom?.items?.armor, systemCustomArmors ]);

    const widget = widgets.find(w => w.id === activeId) ?? null;

    const patch = (changes: Partial<CampaignWidget>) => {
        if (!activeId) return;
        setWidgets(prev => prev.map(w => w.id === activeId ? { ...w, ...changes } : w));
    };

    const patchLabel = (key: keyof CampaignWidget['labels'], value: string) => {
        if (!widget) return;
        patch({ labels: { ...widget.labels, [key]: value } });
    };

    const handleCreate = (preset: WidgetPreset) => {
        const created = createWidgetFromPreset(preset);
        setWidgets(prev => [ ...prev, created ]);
        setActiveId(created.id);
        setAddingPreset(false);
    };

    const persistWidgets = async (list: CampaignWidget[]): Promise<boolean> => {
        setSaving(true);
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/widget`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgets: list })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao salvar os widgets');
            }
            return true;
        } catch (error: any) {
            enqueueSnackbar(error.message || 'Erro ao salvar os widgets', { variant: 'error' });
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveActive = async () => {
        if (!activeId) return;
        const remaining = widgets.filter(w => w.id !== activeId);
        const ok = await persistWidgets(remaining);
        if (!ok) return;
        setWidgets(remaining);
        setActiveId(remaining[0]?.id ?? null);
        setAddingPreset(remaining.length === 0);
        enqueueSnackbar('Widget removido da campanha', { variant: 'success' });
    };

    const save = async () => {
        let toSave = widgets;
        if (widget && newLogText.trim()) {
            toSave = widgets.map(w => w.id === widget.id ? {
                ...w,
                log: [ ...(w.log ?? []), { id: crypto.randomUUID(), text: newLogText.trim(), timestamp: new Date().toISOString() } ]
            } : w);
        }
        const ok = await persistWidgets(toSave);
        if (!ok) return;
        enqueueSnackbar('Widgets atualizados!', { variant: 'success' });
        onClose();
    };

    const presetPicker = (
        <Box>
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
                                onClick={() => handleCreate(preset)}
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
        </Box>
    );

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WidgetsIcon color="primary" />
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
            <Box px={3} pt={1.5} display="flex" gap={1} flexWrap="wrap" alignItems="center">
                {widgets.map(w => (
                    <Chip
                        key={w.id}
                        icon={<span style={{ marginLeft: 6 }}>{w.icon || '📋'}</span>}
                        label={w.name || 'Sem nome'}
                        onClick={() => { setActiveId(w.id); setAddingPreset(false); }}
                        color={w.id === activeId && !addingPreset ? 'primary' : 'default'}
                        variant={w.id === activeId && !addingPreset ? 'filled' : 'outlined'}
                    />
                ))}
                {widgets.length < MAX_CAMPAIGN_WIDGETS && (
                    <Tooltip title="Adicionar outro widget">
                        <Chip
                            icon={<AddIcon />}
                            label="Novo widget"
                            onClick={() => setAddingPreset(true)}
                            color={addingPreset ? 'primary' : 'default'}
                            variant={addingPreset ? 'filled' : 'outlined'}
                        />
                    </Tooltip>
                )}
            </Box>

            <DialogContent dividers>
                {addingPreset || !widget ? presetPicker : (
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
                                        <Grid item xs={6} sm={3.5 as any}>
                                            <NumberField
                                                fullWidth size="small" label="Peso máximo (0=∞)" min={0}
                                                value={widget.stockMaxWeight ?? 0}
                                                onChange={(v) => patch({ stockMaxWeight: v > 0 ? v : undefined })}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3.5 as any}>
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
                            </AccordionDetails>
                        </Accordion>

                        {/* ── Fundos Comuns (beta) ── */}
                        <Accordion disableGutters>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={700} display="flex" alignItems="center" gap={0.75}>
                                    <SavingsIcon fontSize="small" /> Fundos Comuns ({widget.pools?.length ?? 0})
                                    <Chip label="BETA" size="small" color="secondary" sx={{ height: 18, fontSize: '0.6rem' }} />
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
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
                            </AccordionDetails>
                        </Accordion>

                        {/* ── Tarefas / Bounties (beta) ── */}
                        <Accordion disableGutters>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={700} display="flex" alignItems="center" gap={0.75}>
                                    <AssignmentIcon fontSize="small" /> Tarefas ({widget.bounties?.length ?? 0})
                                    <Chip label="BETA" size="small" color="secondary" sx={{ height: 18, fontSize: '0.6rem' }} />
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
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
                            </AccordionDetails>
                        </Accordion>

                        {/* ── Relógios (beta) ── */}
                        <Accordion disableGutters>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={700} display="flex" alignItems="center" gap={0.75}>
                                    <TimerIcon fontSize="small" /> Relógios ({widget.clocks?.length ?? 0})
                                    <Chip label="BETA" size="small" color="secondary" sx={{ height: 18, fontSize: '0.6rem' }} />
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
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
                            </AccordionDetails>
                        </Accordion>

                        {/* ── Crafting (beta) ── */}
                        <Accordion disableGutters>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography fontWeight={700} display="flex" alignItems="center" gap={0.75}>
                                    <ScienceIcon fontSize="small" /> Crafting ({widget.recipes?.length ?? 0})
                                    <Chip label="BETA" size="small" color="secondary" sx={{ height: 18, fontSize: '0.6rem' }} />
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box display="flex" flexDirection="column" gap={2}>
                                    {(widget.recipes ?? []).map((recipe, rIdx) => (
                                        <Paper key={recipe.id} variant="outlined" sx={{ p: 1.5 }}>
                                            <Grid container spacing={1} alignItems="center">
                                                <Grid item xs={10} sm={5}>
                                                    <TextField fullWidth size="small" label="Nome da receita" value={recipe.name}
                                                        onChange={(e) => {
                                                            const recipes = [ ...widget.recipes ];
                                                            recipes[rIdx] = { ...recipe, name: e.target.value };
                                                            patch({ recipes });
                                                        }} />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField fullWidth size="small" label="Descrição" value={recipe.description ?? ''}
                                                        onChange={(e) => {
                                                            const recipes = [ ...widget.recipes ];
                                                            recipes[rIdx] = { ...recipe, description: e.target.value };
                                                            patch({ recipes });
                                                        }} />
                                                </Grid>
                                                <Grid item xs={2} sm={1}>
                                                    <IconButton size="small" color="error"
                                                        onClick={() => patch({ recipes: widget.recipes.filter(r => r.id !== recipe.id) })}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>

                                            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mt={1.5}>
                                                Ingredientes (do estoque, por nome — digite livre ou escolha um item já estabelecido)
                                            </Typography>
                                            {recipe.inputs.map((input, iIdx) => (
                                                <Grid container spacing={1} key={input.id} alignItems="center" mt={0.25}>
                                                    <Grid item xs={7} sm={5}>
                                                        <Autocomplete
                                                            freeSolo
                                                            size="small"
                                                            options={catalogItemNames}
                                                            value={input.stockName}
                                                            onChange={(_, newValue) => {
                                                                const inputs = [ ...recipe.inputs ];
                                                                inputs[iIdx] = { ...input, stockName: newValue ?? '' };
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, inputs };
                                                                patch({ recipes });
                                                            }}
                                                            onInputChange={(_, newValue) => {
                                                                const inputs = [ ...recipe.inputs ];
                                                                inputs[iIdx] = { ...input, stockName: newValue };
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, inputs };
                                                                patch({ recipes });
                                                            }}
                                                            renderInput={(params) => <TextField {...params} label="Nome do item" />}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3} sm={2}>
                                                        <NumberField fullWidth size="small" label="Qtd" min={1} value={input.quantity}
                                                            onChange={(quantity) => {
                                                                const inputs = [ ...recipe.inputs ];
                                                                inputs[iIdx] = { ...input, quantity };
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, inputs };
                                                                patch({ recipes });
                                                            }} />
                                                    </Grid>
                                                    <Grid item xs={2} sm={1}>
                                                        <IconButton size="small" color="error"
                                                            onClick={() => {
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, inputs: recipe.inputs.filter(i => i.id !== input.id) };
                                                                patch({ recipes });
                                                            }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            ))}
                                            <Button
                                                size="small" startIcon={<AddIcon />} sx={{ mt: 0.5 }}
                                                onClick={() => {
                                                    const recipes = [ ...widget.recipes ];
                                                    recipes[rIdx] = { ...recipe, inputs: [ ...recipe.inputs, { id: crypto.randomUUID(), stockName: '', quantity: 1 } ] };
                                                    patch({ recipes });
                                                }}
                                            >
                                                Adicionar ingrediente
                                            </Button>

                                            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mt={1.5}>
                                                Custo em recursos (opcional)
                                            </Typography>
                                            {(recipe.resourceCosts ?? []).map((cost, cIdx) => (
                                                <Grid container spacing={1} key={cost.id} alignItems="center" mt={0.25}>
                                                    <Grid item xs={7} sm={5}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Recurso</InputLabel>
                                                            <Select
                                                                label="Recurso"
                                                                value={cost.resourceId}
                                                                onChange={(e) => {
                                                                    const resourceCosts = [ ...(recipe.resourceCosts ?? []) ];
                                                                    resourceCosts[cIdx] = { ...cost, resourceId: e.target.value };
                                                                    const recipes = [ ...widget.recipes ];
                                                                    recipes[rIdx] = { ...recipe, resourceCosts };
                                                                    patch({ recipes });
                                                                }}
                                                            >
                                                                {widget.resources.map(r => (
                                                                    <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={3} sm={2}>
                                                        <NumberField fullWidth size="small" label="Custo" min={1} value={cost.amount}
                                                            onChange={(amount) => {
                                                                const resourceCosts = [ ...(recipe.resourceCosts ?? []) ];
                                                                resourceCosts[cIdx] = { ...cost, amount };
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, resourceCosts };
                                                                patch({ recipes });
                                                            }} />
                                                    </Grid>
                                                    <Grid item xs={2} sm={1}>
                                                        <IconButton size="small" color="error"
                                                            onClick={() => {
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, resourceCosts: (recipe.resourceCosts ?? []).filter(c => c.id !== cost.id) };
                                                                patch({ recipes });
                                                            }}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            ))}
                                            {widget.resources.length > 0 && (
                                                <Button
                                                    size="small" startIcon={<AddIcon />} sx={{ mt: 0.5 }}
                                                    onClick={() => {
                                                        const recipes = [ ...widget.recipes ];
                                                        recipes[rIdx] = {
                                                            ...recipe,
                                                            resourceCosts: [ ...(recipe.resourceCosts ?? []), { id: crypto.randomUUID(), resourceId: widget.resources[0].id, amount: 1 } ]
                                                        };
                                                        patch({ recipes });
                                                    }}
                                                >
                                                    Adicionar custo
                                                </Button>
                                            )}

                                            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mt={1.5}>
                                                Item produzido
                                            </Typography>
                                            <Grid container spacing={1} mt={0.25} alignItems="center">
                                                <Grid item xs={12} sm={3}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Tipo</InputLabel>
                                                        <Select
                                                            label="Tipo"
                                                            value={recipe.output.kind ?? 'item'}
                                                            onChange={(e) => {
                                                                const kind = e.target.value as 'item' | 'weapon' | 'armor';
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = {
                                                                    ...recipe,
                                                                    output: { name: '', quantity: 1, kind: kind === 'item' ? undefined : kind }
                                                                };
                                                                patch({ recipes });
                                                            }}
                                                        >
                                                            <MenuItem value="item">Item genérico</MenuItem>
                                                            <MenuItem value="weapon">Arma</MenuItem>
                                                            <MenuItem value="armor">Armadura</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            {(recipe.output.kind ?? 'item') === 'item' ? (
                                                <Grid container spacing={1} mt={0.25}>
                                                    <Grid item xs={6} sm={4}>
                                                        <Autocomplete
                                                            freeSolo
                                                            size="small"
                                                            options={catalogItemNames}
                                                            value={recipe.output.name}
                                                            onChange={(_, newValue) => {
                                                                const name = newValue ?? '';
                                                                const matched = findCatalogItem(name);
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = {
                                                                    ...recipe,
                                                                    output: {
                                                                        ...recipe.output,
                                                                        name,
                                                                        weight: matched?.weight ?? recipe.output.weight,
                                                                        description: matched?.description ?? recipe.output.description
                                                                    }
                                                                };
                                                                patch({ recipes });
                                                            }}
                                                            onInputChange={(_, newValue) => {
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, name: newValue } };
                                                                patch({ recipes });
                                                            }}
                                                            renderInput={(params) => <TextField {...params} label="Nome" />}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3} sm={2}>
                                                        <NumberField fullWidth size="small" label="Qtd" min={1} value={recipe.output.quantity}
                                                            onChange={(quantity) => {
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, quantity } };
                                                                patch({ recipes });
                                                            }} />
                                                    </Grid>
                                                    <Grid item xs={3} sm={2}>
                                                        <NumberField fullWidth size="small" label="Peso" min={0} allowDecimal value={recipe.output.weight ?? 0}
                                                            onChange={(weight) => {
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, weight } };
                                                                patch({ recipes });
                                                            }} />
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <TextField fullWidth size="small" label="Descrição" value={recipe.output.description ?? ''}
                                                            onChange={(e) => {
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, description: e.target.value } };
                                                                patch({ recipes });
                                                            }} />
                                                    </Grid>
                                                </Grid>
                                            ) : (
                                                <Grid container spacing={1} mt={0.25}>
                                                    <Grid item xs={9} sm={9}>
                                                        {(() => {
                                                            const catalogOptions: Array<Partial<Weapon> | Partial<Armor>> =
                                                                recipe.output.kind === 'weapon' ? catalogWeapons : catalogArmors;
                                                            return (
                                                                <Autocomplete
                                                                    size="small"
                                                                    options={catalogOptions}
                                                                    getOptionLabel={(opt) => opt?.name ?? ''}
                                                                    isOptionEqualToValue={(opt, val) => opt.name === val.name}
                                                                    value={catalogOptions.find(opt => opt.name === recipe.output.name) ?? null}
                                                                    onChange={(_, selected) => {
                                                                        const recipes = [ ...widget.recipes ];
                                                                        recipes[rIdx] = {
                                                                            ...recipe,
                                                                            output: {
                                                                                ...recipe.output,
                                                                                name: selected?.name ?? '',
                                                                                weight: selected?.weight,
                                                                                description: selected?.description,
                                                                                itemData: selected ?? undefined
                                                                            }
                                                                        };
                                                                        patch({ recipes });
                                                                    }}
                                                                    renderInput={(params) => (
                                                                        <TextField {...params} label={recipe.output.kind === 'weapon' ? 'Arma (catálogo)' : 'Armadura (catálogo)'} />
                                                                    )}
                                                                />
                                                            );
                                                        })()}
                                                    </Grid>
                                                    <Grid item xs={3} sm={3}>
                                                        <NumberField fullWidth size="small" label="Qtd" min={1} value={recipe.output.quantity}
                                                            onChange={(quantity) => {
                                                                const recipes = [ ...widget.recipes ];
                                                                recipes[rIdx] = { ...recipe, output: { ...recipe.output, quantity } };
                                                                patch({ recipes });
                                                            }} />
                                                    </Grid>
                                                    {!recipe.output.name && (
                                                        <Grid item xs={12}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Armas/armaduras precisam ser escolhidas de um item já cadastrado (não é possível digitar livremente,
                                                                pois carregam estatísticas de combate completas).
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            )}
                                        </Paper>
                                    ))}
                                    <Button
                                        size="small" startIcon={<AddIcon />} sx={{ alignSelf: 'flex-start' }}
                                        onClick={() => patch({
                                            recipes: [
                                                ...(widget.recipes ?? []),
                                                {
                                                    id: crypto.randomUUID(),
                                                    name: 'Nova Receita',
                                                    inputs: [],
                                                    resourceCosts: [],
                                                    output: { name: 'Novo Item', quantity: 1 }
                                                }
                                            ]
                                        })}
                                    >
                                        Adicionar receita
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
                        <Box display="flex" justifyContent="flex-end">
                            <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                disabled={saving}
                                onClick={handleRemoveActive}
                            >
                                Remover este widget
                            </Button>
                        </Box>
                    </Box>
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
