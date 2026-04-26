'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    LinearProgress,
    List,
    ListItemButton,
    ListItemText,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SaveIcon from '@mui/icons-material/Save'
import CasinoIcon from '@mui/icons-material/Casino'
import { useSnackbar } from 'notistack'
import type { CombatEffect, CombatEffectCategory, CombatEffectTiming, CombatEffectElement, CombatEffectLevel } from '@models'
import { campaignService, combatEffectService } from '@services'
import type { CreateCombatEffectPayload } from '@services/combatEffectService'
import { getCategoryLabel, getLevelLabel } from '@utils/combatEffectLabels'

interface CombatEffectsCatalogDialogProps {
    open: boolean
    onClose: () => void
    campaignId: string
}

const CATEGORY_OPTIONS: Array<{ value: CombatEffectCategory; label: string }> = [
    { value: 'damage', label: 'Dano' },
    { value: 'heal', label: 'Cura' },
    { value: 'buff', label: 'Buff' },
    { value: 'debuff', label: 'Debuff' },
    { value: 'info', label: 'Informativo' }
]

const TIMING_OPTIONS: Array<{ value: CombatEffectTiming; label: string }> = [
    { value: 'turn', label: 'Por turno' },
    { value: 'round', label: 'Por rodada' }
]

const ELEMENT_OPTIONS: Array<{ value: CombatEffectElement | ''; label: string }> = [
    { value: '', label: 'Nenhum' },
    { value: 'fogo', label: 'Fogo' },
    { value: 'agua', label: 'Água' },
    { value: 'terra', label: 'Terra' },
    { value: 'vento', label: 'Vento' },
    { value: 'luz', label: 'Luz' },
    { value: 'trevas', label: 'Trevas' },
    { value: 'fisico', label: 'Físico' },
    { value: 'veneno', label: 'Veneno' },
    { value: 'energia', label: 'Energia' },
    { value: 'neutro', label: 'Neutro' }
]

const EMPTY_FORM: CreateCombatEffectPayload = {
    name: '',
    description: '',
    category: 'damage',
    timing: 'turn',
    element: '',
    color: '#ff5722',
    icon: '💥',
    usesLevels: true,
    levels: [ { level: 1, formula: '1d6', duration: 2, description: '' } ]
}

export default function CombatEffectsCatalogDialog({
    open,
    onClose,
    campaignId
}: CombatEffectsCatalogDialogProps) {
    const { enqueueSnackbar } = useSnackbar()

    const [ tab, setTab ] = useState<'campaign' | 'global'>('campaign')
    const [ campaignEffects, setCampaignEffects ] = useState<CombatEffect[]>([])
    const [ globalEffects, setGlobalEffects ] = useState<CombatEffect[]>([])
    const [ loading, setLoading ] = useState(false)
    const [ saving, setSaving ] = useState(false)

    const [ selectedId, setSelectedId ] = useState<string | null>(null)
    const [ form, setForm ] = useState<CreateCombatEffectPayload>(EMPTY_FORM)
    const [ editingScope, setEditingScope ] = useState<'new-campaign' | 'existing-campaign' | 'global-readonly'>('new-campaign')

    const list = tab === 'campaign' ? campaignEffects : globalEffects

    const load = useCallback(async () => {
        if (!campaignId) return
        setLoading(true)
        try {
            const res = await campaignService.listEffects(campaignId, true)
            setCampaignEffects(res.campaignEffects || [])
            setGlobalEffects(res.globalEffects || [])
        } catch (err) {
            console.error('Erro ao carregar catálogo de efeitos:', err)
            enqueueSnackbar('Erro ao carregar efeitos', { variant: 'error' })
        } finally {
            setLoading(false)
        }
    }, [ campaignId, enqueueSnackbar ])

    useEffect(() => {
        if (open) void load()
    }, [ open, load ])

    const resetForm = () => {
        setSelectedId(null)
        setForm({ ...EMPTY_FORM, levels: [ { level: 1, formula: '1d6', duration: 2, description: '' } ] })
        setEditingScope('new-campaign')
    }

    const handleSelect = (effect: CombatEffect) => {
        setSelectedId(effect.id)
        setForm({
            name: effect.name,
            description: effect.description,
            category: effect.category,
            timing: effect.timing,
            element: (effect.element as any) ?? '',
            color: effect.color,
            icon: effect.icon,
            levels: effect.levels?.map(l => ({ ...l })) ?? [],
            usesLevels: effect.usesLevels !== false,
            customLabels: effect.customLabels ? { ...effect.customLabels } : undefined
        })
        setEditingScope(effect.scope === 'global' ? 'global-readonly' : 'existing-campaign')
    }

    const isReadOnly = editingScope === 'global-readonly'

    // Dano e cura fazem sentido com fórmula (dados + constantes).
    // Buff, debuff e informativos geralmente não têm fórmula — o campo fica opcional/escondido.
    const needsFormula = form.category === 'damage' || form.category === 'heal'

    // Quando `usesLevels` é false, o efeito tem apenas um único conjunto de parâmetros.
    const usesLevels = form.usesLevels !== false

    const levelPreview = useMemo(
        () => form.levels.map((l, i) => ({
            ...l,
            displayLabel: getLevelLabel((form.category ?? 'damage'), i + 1, form.customLabels)
        })),
        [ form.levels, form.category, form.customLabels ]
    )

    const handleLevelChange = (idx: number, patch: Partial<CombatEffectLevel>) => {
        setForm(f => ({
            ...f,
            levels: f.levels.map((l, i) => i === idx ? { ...l, ...patch } : l)
        }))
    }

    const handleAddLevel = () => {
        setForm(f => ({
            ...f,
            levels: [
                ...f.levels,
                { level: f.levels.length + 1, formula: needsFormula ? '1d6' : '0', duration: 2 }
            ]
        }))
    }

    const handleRemoveLevel = (idx: number) => {
        setForm(f => ({
            ...f,
            levels: f.levels
                .filter((_, i) => i !== idx)
                .map((l, i) => ({ ...l, level: i + 1 }))
        }))
    }

    const handleToggleUsesLevels = (next: boolean) => {
        setForm(f => ({
            ...f,
            usesLevels: next,
            // Quando desliga, reduz para um único nível mantendo os valores do primeiro.
            levels: next
                ? f.levels
                : [ f.levels[0] ?? { level: 1, formula: needsFormula ? '1d6' : '0', duration: 2 } ]
        }))
    }

    const handleSave = async () => {
        if (!form.name?.trim()) {
            enqueueSnackbar('Informe um nome para o efeito', { variant: 'warning' })
            return
        }
        if (form.levels.length === 0) {
            enqueueSnackbar('Adicione ao menos um nível', { variant: 'warning' })
            return
        }
        setSaving(true)
        try {
            const payload: CreateCombatEffectPayload = {
                ...form,
                element: form.element || undefined,
                usesLevels: form.usesLevels !== false,
                levels: form.levels.map((l, i) => ({
                    level: i + 1,
                    // Quando a categoria não precisa de fórmula (info/buff/debuff), usamos '0' como placeholder.
                    formula: needsFormula ? (l.formula || '0') : (l.formula || '0'),
                    duration: l.indefinite ? 1 : l.duration,
                    description: l.description,
                    indefinite: l.indefinite,
                    modifiers: l.modifiers
                }))
            }

            if (editingScope === 'existing-campaign' && selectedId) {
                await campaignService.updateCampaignEffect(campaignId, selectedId, payload)
                enqueueSnackbar('Efeito atualizado', { variant: 'success' })
            } else {
                await campaignService.createCampaignEffect(campaignId, payload)
                enqueueSnackbar('Efeito criado', { variant: 'success' })
            }
            resetForm()
            await load()
        } catch (err: any) {
            console.error('Erro ao salvar efeito:', err)
            enqueueSnackbar(err?.response?.data?.error ?? 'Erro ao salvar efeito', { variant: 'error' })
        } finally {
            setSaving(false)
        }
    }

    const handleClone = async () => {
        if (!selectedId) return
        setSaving(true)
        try {
            await campaignService.createCampaignEffect(campaignId, {
                cloneFromId: selectedId,
                name: form.name,
                usesLevels: form.usesLevels !== false,
                levels: form.levels.map((l, i) => ({
                    level: i + 1,
                    formula: l.formula || '0',
                    duration: l.indefinite ? 1 : l.duration,
                    description: l.description,
                    indefinite: l.indefinite,
                    modifiers: l.modifiers
                }))
            })
            enqueueSnackbar('Efeito clonado para esta campanha', { variant: 'success' })
            resetForm()
            setTab('campaign')
            await load()
        } catch (err: any) {
            console.error('Erro ao clonar efeito:', err)
            enqueueSnackbar(err?.response?.data?.error ?? 'Erro ao clonar efeito', { variant: 'error' })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedId) return
        if (editingScope === 'global-readonly') {
            // Admin global delete
            try {
                await combatEffectService.deleteEffect(selectedId)
                enqueueSnackbar('Efeito global removido', { variant: 'success' })
                resetForm()
                await load()
            } catch (err: any) {
                enqueueSnackbar(err?.response?.data?.error ?? 'Falha ao remover efeito global', { variant: 'error' })
            }
            return
        }

        try {
            await campaignService.deleteCampaignEffect(campaignId, selectedId)
            enqueueSnackbar('Efeito removido', { variant: 'success' })
            resetForm()
            await load()
        } catch (err: any) {
            enqueueSnackbar(err?.response?.data?.error ?? 'Falha ao remover efeito', { variant: 'error' })
        }
    }

    return (
        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CasinoIcon color="secondary" />
                Catálogo de Efeitos de Combate
            </DialogTitle>
            <DialogContent dividers>
                {loading && <LinearProgress sx={{ mb: 2 }} />}

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    {/* Coluna esquerda: listagem */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Tabs
                            value={tab}
                            onChange={(_, v) => { setTab(v); resetForm() }}
                            sx={{ mb: 1 }}
                            variant="fullWidth"
                        >
                            <Tab value="campaign" label={`Esta campanha (${campaignEffects.length})`} />
                            <Tab value="global" label={`Globais (${globalEffects.length})`} />
                        </Tabs>

                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: 460, overflow: 'auto' }}>
                            <List dense>
                                {list.length === 0 && (
                                    <ListItemButton disabled>
                                        <ListItemText secondary="Nenhum efeito" />
                                    </ListItemButton>
                                )}
                                {list.map(eff => (
                                    <ListItemButton
                                        key={eff.id}
                                        selected={selectedId === eff.id}
                                        onClick={() => handleSelect(eff)}
                                    >
                                        <Chip
                                            label={eff.icon}
                                            size="small"
                                            sx={{ bgcolor: eff.color, color: '#fff', mr: 1 }}
                                        />
                                        <ListItemText
                                            primary={eff.name}
                                            secondary={`${getCategoryLabel(eff.category)} · ${eff.timing === 'turn' ? 'turno' : 'rodada'} · ${eff.levels.length} nível(is)`}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Box>

                        <Button
                            sx={{ mt: 1 }}
                            startIcon={<AddIcon />}
                            onClick={resetForm}
                            fullWidth
                            variant="outlined"
                        >
                            Novo efeito (nesta campanha)
                        </Button>
                    </Box>

                    {/* Coluna direita: form */}
                    <Box sx={{ flex: 2, minWidth: 0 }}>
                        {isReadOnly && (
                            <Alert severity="info" sx={{ mb: 1 }}>
                                Efeito global, somente leitura. Clone para editar nesta campanha.
                            </Alert>
                        )}
                        <Stack spacing={1.25}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <TextField
                                    label="Nome"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    fullWidth
                                    disabled={isReadOnly}
                                />
                                <TextField
                                    label="Ícone"
                                    value={form.icon}
                                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                                    sx={{ width: { xs: '100%', sm: 110 } }}
                                    helperText="Emoji"
                                    disabled={isReadOnly}
                                />
                                <TextField
                                    label="Cor"
                                    type="color"
                                    value={form.color}
                                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                                    sx={{ width: { xs: '100%', sm: 90 } }}
                                    disabled={isReadOnly}
                                />
                            </Stack>

                            <TextField
                                label="Descrição"
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                multiline
                                minRows={2}
                                disabled={isReadOnly}
                            />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Categoria</InputLabel>
                                    <Select
                                        label="Categoria"
                                        value={form.category}
                                        onChange={e => setForm(f => ({ ...f, category: e.target.value as CombatEffectCategory }))}
                                        disabled={isReadOnly}
                                    >
                                        {CATEGORY_OPTIONS.map(o => (
                                            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Gatilho</InputLabel>
                                    <Select
                                        label="Gatilho"
                                        value={form.timing}
                                        onChange={e => setForm(f => ({ ...f, timing: e.target.value as CombatEffectTiming }))}
                                        disabled={isReadOnly}
                                    >
                                        {TIMING_OPTIONS.map(o => (
                                            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Elemento</InputLabel>
                                    <Select
                                        label="Elemento"
                                        value={form.element ?? ''}
                                        onChange={e => setForm(f => ({ ...f, element: e.target.value as any }))}
                                        disabled={isReadOnly}
                                    >
                                        {ELEMENT_OPTIONS.map(o => (
                                            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Divider sx={{ my: 1 }}>
                                <Typography variant="caption">{usesLevels ? 'Níveis' : 'Parâmetros do efeito'}</Typography>
                            </Divider>

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={usesLevels}
                                        onChange={e => handleToggleUsesLevels(e.target.checked)}
                                        disabled={isReadOnly}
                                    />
                                }
                                label={
                                    <Typography variant="caption">
                                        Usar sistema de níveis (Simples/Grave/Mortal...)
                                    </Typography>
                                }
                            />

                            <Stack spacing={1}>
                                {levelPreview.map((l, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            p: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1
                                        }}
                                    >
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            {usesLevels && (
                                                <Chip
                                                    label={`${i + 1} · ${l.displayLabel}`}
                                                    size="small"
                                                    sx={{ minWidth: 100 }}
                                                />
                                            )}
                                            {needsFormula && (
                                                <TextField
                                                    label="Fórmula"
                                                    size="small"
                                                    value={l.formula}
                                                    onChange={e => handleLevelChange(i, { formula: e.target.value })}
                                                    fullWidth
                                                    helperText="Ex: 2d6 · 1d4+2 · 5"
                                                    disabled={isReadOnly}
                                                />
                                            )}
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                                                <TextField
                                                    label="Duração"
                                                    size="small"
                                                    type="number"
                                                    value={l.indefinite ? '' : l.duration}
                                                    onChange={e => handleLevelChange(i, { duration: Math.max(1, parseInt(e.target.value || '1', 10)) })}
                                                    sx={{ width: { xs: '100%', sm: 120 } }}
                                                    inputProps={{ min: 1, max: 99 }}
                                                    disabled={isReadOnly || l.indefinite === true}
                                                    placeholder={l.indefinite ? '∞' : ''}
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            size="small"
                                                            checked={l.indefinite === true}
                                                            onChange={e => handleLevelChange(i, { indefinite: e.target.checked })}
                                                            disabled={isReadOnly}
                                                        />
                                                    }
                                                    label={<Typography variant="caption">Indefinido</Typography>}
                                                    sx={{ mr: 0, ml: 0 }}
                                                />
                                            </Box>
                                            {usesLevels && (
                                                <Tooltip title="Remover nível">
                                                    <span>
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleRemoveLevel(i)}
                                                            disabled={isReadOnly || form.levels.length <= 1}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                        {l.modifiers && l.modifiers.length > 0 && (
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.75, rowGap: 0.5 }}>
                                                {l.modifiers.map((mod, mi) => (
                                                    <Chip
                                                        key={mi}
                                                        size="small"
                                                        variant="outlined"
                                                        label={[
                                                            mod.kind,
                                                            mod.target ? `→ ${mod.target}` : '',
                                                            mod.value !== undefined ? `= ${mod.value}` : '',
                                                            mod.element ? `[${mod.element}]` : ''
                                                        ].filter(Boolean).join(' ')}
                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                    />
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                ))}

                                {usesLevels && (
                                    <Button
                                        onClick={handleAddLevel}
                                        startIcon={<AddIcon />}
                                        variant="text"
                                        size="small"
                                        disabled={isReadOnly}
                                    >
                                        Adicionar nível
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} variant="outlined" disabled={saving}>
                    Fechar
                </Button>
                {selectedId && (
                    <Button
                        onClick={handleDelete}
                        color="error"
                        startIcon={<DeleteIcon />}
                        disabled={saving}
                    >
                        Excluir
                    </Button>
                )}
                {isReadOnly && selectedId && (
                    <Button
                        onClick={handleClone}
                        color="info"
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        disabled={saving}
                    >
                        Clonar p/ campanha
                    </Button>
                )}
                {!isReadOnly && (
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="secondary"
                        startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                        disabled={saving}
                    >
                        {selectedId ? 'Salvar alterações' : 'Criar efeito'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}
