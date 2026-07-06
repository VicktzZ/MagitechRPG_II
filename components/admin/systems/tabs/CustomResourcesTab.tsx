'use client'

import { useState } from 'react'
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { CustomResource, ResourceThreshold, RPGSystem, SymbolicResource } from '@models/entities'

interface CustomResourcesTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptyResource = (): CustomResource => ({
    key: '',
    name: '',
    abbreviation: '',
    type: 'percentage',
    min: 0,
    max: 100,
    defaultValue: 100,
    color: '#1976d2',
    thresholds: []
})

/** Transforma "Bateria do Traje" → "bateria_do_traje" */
function toKey(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
}

export function CustomResourcesTab({ system, updateSystem }: CustomResourcesTabProps) {
    const resources = system.customResources ?? []

    const [ dialogOpen, setDialogOpen ] = useState(false)
    const [ editingIdx, setEditingIdx ] = useState<number | null>(null)
    const [ formData, setFormData ] = useState<CustomResource>(emptyResource())
    const [ newThreshold, setNewThreshold ] = useState<ResourceThreshold>({ value: 0, label: '', color: '#f44336', mode: 'constant' })

    // ── Recursos simbólicos (contadores em "Informações Gerais") ──
    const symbolicResources = system.symbolicResources ?? []
    const [ newSymbolic, setNewSymbolic ] = useState<SymbolicResource>({ key: '', name: '', abbreviation: '', defaultValue: 0 })

    const addSymbolic = () => {
        if (!newSymbolic.name.trim()) return
        const key = toKey(newSymbolic.name)
        if (symbolicResources.some(r => r.key === key)) return
        updateSystem('symbolicResources', [
            ...symbolicResources,
            { ...newSymbolic, key, name: newSymbolic.name.trim() }
        ])
        setNewSymbolic({ key: '', name: '', abbreviation: '', defaultValue: 0 })
    }

    const removeSymbolic = (key: string) => {
        updateSystem('symbolicResources', symbolicResources.filter(r => r.key !== key))
    }

    // ── Handlers de lista ──────────────────────────────────────
    const openCreate = () => {
        setEditingIdx(null)
        setFormData(emptyResource())
        setNewThreshold({ value: 0, label: '', color: '#f44336', mode: 'constant' })
        setDialogOpen(true)
    }

    const openEdit = (idx: number) => {
        setEditingIdx(idx)
        setFormData({ ...resources[idx], thresholds: [ ...(resources[idx].thresholds ?? []) ] })
        setNewThreshold({ value: 0, label: '', color: '#f44336', mode: 'constant' })
        setDialogOpen(true)
    }

    const handleDelete = (idx: number) => {
        updateSystem('customResources', resources.filter((_, i) => i !== idx))
    }

    const handleSave = () => {
        if (!formData.key.trim() || !formData.name.trim()) return
        const updated = [ ...resources ]
        if (editingIdx !== null) {
            updated[editingIdx] = formData
        } else {
            // Verifica key duplicada
            if (updated.some(r => r.key === formData.key)) {
                formData.key = formData.key + '_' + Date.now()
            }
            updated.push(formData)
        }
        updateSystem('customResources', updated)
        setDialogOpen(false)
    }

    // ── Helpers do formulário ──────────────────────────────────
    const setField = <K extends keyof CustomResource>(key: K, value: CustomResource[K]) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const addThreshold = () => {
        if (!newThreshold.label.trim()) return
        setFormData(prev => ({
            ...prev,
            thresholds: [ ...(prev.thresholds ?? []), { ...newThreshold } ]
                .sort((a, b) => a.value - b.value)
        }))
        setNewThreshold(prev => ({ ...prev, value: 0, label: '' }))
    }

    const removeThreshold = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            thresholds: prev.thresholds?.filter((_, i) => i !== idx) ?? []
        }))
    }

    // ── Render ─────────────────────────────────────────────────
    return (
        <Box>
            <Typography variant="h6" gutterBottom>Recursos Customizados</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Crie recursos especiais além de LP/MP — como <strong>Bateria</strong>, <strong>Oxigênio (O2)</strong> e{' '}
                <strong>Estresse</strong> do Cosmos RPG. Eles aparecem na ficha como barras coloridas com
                marcadores de limiar.
            </Typography>

            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ mb: 3 }}>
                Adicionar Recurso
            </Button>

            {resources.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Nenhum recurso customizado configurado. Clique em &ldquo;Adicionar Recurso&rdquo; para criar o primeiro.
                    </Typography>
                </Paper>
            ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                    {resources.map((res, idx) => (
                        <Paper key={res.key} variant="outlined" sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                                <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
                                    {/* Bolinha de cor */}
                                    <Box
                                        flexShrink={0}
                                        sx={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: '50%',
                                            bgcolor: res.color ?? '#1976d2',
                                            border: '1px solid rgba(0,0,0,0.15)'
                                        }}
                                    />
                                    <Box minWidth={0}>
                                        <Typography fontWeight="bold" noWrap>
                                            {res.name}
                                            {res.abbreviation && (
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.secondary"
                                                    ml={0.5}
                                                >
                                                    ({res.abbreviation})
                                                </Typography>
                                            )}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            key: <code>{res.key}</code>
                                            {' · '}tipo: {res.type}
                                            {' · '}{res.min}–{res.max}
                                            {res.defaultValue !== undefined && ` · padrão: ${res.defaultValue}`}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
                                    {(res.thresholds ?? []).length > 0 && (
                                        <Chip
                                            label={`${res.thresholds!.length} limiar${res.thresholds!.length > 1 ? 'es' : ''}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                    <Tooltip title="Editar">
                                        <IconButton size="small" onClick={() => openEdit(idx)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Remover">
                                        <IconButton size="small" color="error" onClick={() => handleDelete(idx)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}

            {/* ── Recursos Simbólicos ── */}
            <Divider sx={{ my: 4 }} />
            <Typography variant="h6" gutterBottom>Recursos Simbólicos</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Contadores simples exibidos em <strong>Informações Gerais</strong> da ficha, junto do dinheiro
                (ex: &ldquo;Pedras do Nexus&rdquo;). Sem barra — apenas quantidade.
            </Typography>

            {symbolicResources.length > 0 && (
                <Box display="flex" flexDirection="column" gap={1} mb={2}>
                    {symbolicResources.map(res => (
                        <Paper key={res.key} variant="outlined" sx={{ p: 1.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                                <Box>
                                    <Typography fontWeight="bold">
                                        {res.name}
                                        {res.abbreviation && (
                                            <Typography component="span" variant="body2" color="text.secondary" ml={0.5}>
                                                ({res.abbreviation})
                                            </Typography>
                                        )}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        key: <code>{res.key}</code> · inicial: {res.defaultValue ?? 0}
                                    </Typography>
                                </Box>
                                <Tooltip title="Remover">
                                    <IconButton size="small" color="error" onClick={() => removeSymbolic(res.key)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}

            <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={4}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Nome"
                        value={newSymbolic.name}
                        onChange={e => setNewSymbolic(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Pedras do Nexus"
                        onKeyDown={e => e.key === 'Enter' && addSymbolic()}
                    />
                </Grid>
                <Grid item xs={5} sm={2}>
                    <TextField
                        size="small"
                        fullWidth
                        label="Abreviação"
                        value={newSymbolic.abbreviation ?? ''}
                        onChange={e => setNewSymbolic(prev => ({ ...prev, abbreviation: e.target.value }))}
                        placeholder="PDN"
                    />
                </Grid>
                <Grid item xs={4} sm={2}>
                    <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Qtd. inicial"
                        value={newSymbolic.defaultValue ?? 0}
                        onChange={e => setNewSymbolic(prev => ({ ...prev, defaultValue: parseInt(e.target.value) || 0 }))}
                    />
                </Grid>
                <Grid item xs={3} sm={2}>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={addSymbolic}
                        disabled={!newSymbolic.name.trim()}
                    >
                        <AddIcon />
                    </Button>
                </Grid>
            </Grid>

            {/* ── Dialog criar / editar ── */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingIdx !== null ? 'Editar Recurso' : 'Novo Recurso'}</DialogTitle>

                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
                        {/* Identificação */}
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Nome"
                                    value={formData.name}
                                    onChange={e => {
                                        const name = e.target.value
                                        setFormData(prev => ({
                                            ...prev,
                                            name,
                                            // Gera key automaticamente se ainda não foi editada manualmente
                                            key: editingIdx === null && !prev.key ? toKey(name) : prev.key
                                        }))
                                    }}
                                    placeholder="Ex: Bateria do Traje"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Abreviação"
                                    value={formData.abbreviation ?? ''}
                                    onChange={e => setField('abbreviation', e.target.value)}
                                    placeholder="BAT"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Chave (key)"
                                    value={formData.key}
                                    onChange={e => setField('key', e.target.value)}
                                    placeholder="bateria_do_traje"
                                    helperText="Identificador único sem espaços — gerado automaticamente a partir do nome."
                                />
                            </Grid>
                        </Grid>

                        <Divider />

                        {/* Tipo e faixas */}
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={5}>
                                <FormControl fullWidth>
                                    <InputLabel>Tipo</InputLabel>
                                    <Select
                                        value={formData.type}
                                        label="Tipo"
                                        onChange={e => setField('type', e.target.value as CustomResource['type'])}
                                    >
                                        <MenuItem value="percentage">percentage — valor%</MenuItem>
                                        <MenuItem value="gauge">gauge — valor / máx</MenuItem>
                                        <MenuItem value="counter">counter — valor / máx</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4} sm={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Mín"
                                    value={formData.min}
                                    onChange={e => setField('min', parseInt(e.target.value) || 0)}
                                />
                            </Grid>
                            <Grid item xs={4} sm={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Máx"
                                    value={formData.max}
                                    onChange={e => setField('max', parseInt(e.target.value) || 100)}
                                />
                            </Grid>
                            <Grid item xs={4} sm={3}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Valor padrão"
                                    value={formData.defaultValue ?? ''}
                                    onChange={e => setField('defaultValue', parseInt(e.target.value) || 0)}
                                    helperText="Inicial na ficha (usado se não houver fórmula)"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Fórmula (opcional)"
                                    value={formData.formula ?? ''}
                                    onChange={e => setField('formula', e.target.value || undefined)}
                                    placeholder="Ex: EST / 2 + 10"
                                    helperText={
                                        'Calcula o valor máximo/inicial na criação, usando abreviações dos atributos e "level" ' +
                                        'como variáveis. Recalcula ao vivo enquanto a ficha está sendo criada; vazio = usa "Valor padrão".'
                                    }
                                />
                            </Grid>
                        </Grid>

                        {/* Cor */}
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs="auto">
                                <Tooltip title="Clique para escolher a cor">
                                    <Box
                                        component="label"
                                        sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}
                                    >
                                        <input
                                            type="color"
                                            value={formData.color ?? '#1976d2'}
                                            onChange={e => setField('color', e.target.value)}
                                            style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', borderRadius: 8, padding: 2 }}
                                        />
                                        <Typography variant="body2">Cor da barra</Typography>
                                    </Box>
                                </Tooltip>
                            </Grid>
                            <Grid item xs>
                                <TextField
                                    size="small"
                                    label="Hex"
                                    value={formData.color ?? '#1976d2'}
                                    onChange={e => setField('color', e.target.value)}
                                    sx={{ width: 140 }}
                                    placeholder="#1976d2"
                                />
                            </Grid>
                        </Grid>

                        <Divider />

                        {/* Limiares */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Limiares (Thresholds)</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                Pontos críticos que exibem um rótulo colorido na ficha quando o valor os cruza
                                (ex: O2 ≤ 30 → &ldquo;Hipóxia&rdquo;, Estresse ≥ 7 → &ldquo;Pânico&rdquo;).
                            </Typography>

                            {(formData.thresholds ?? []).length > 0 && (
                                <Table size="small" sx={{ mb: 2 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Valor</TableCell>
                                            <TableCell>Rótulo</TableCell>
                                            <TableCell>Cor</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {(formData.thresholds ?? []).map((t, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    {t.mode === 'max'
                                                        ? `Máx${t.value !== 0 ? (t.value > 0 ? ` +${t.value}` : ` ${t.value}`) : ''}`
                                                        : t.mode === 'min'
                                                            ? `Mín${t.value !== 0 ? (t.value > 0 ? ` +${t.value}` : ` ${t.value}`) : ''}`
                                                            : t.value}
                                                </TableCell>
                                                <TableCell>{t.label}</TableCell>
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            width: 22,
                                                            height: 22,
                                                            borderRadius: 1,
                                                            bgcolor: t.color,
                                                            border: '1px solid rgba(0,0,0,0.2)'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell padding="none">
                                                    <IconButton size="small" color="error" onClick={() => removeThreshold(i)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {/* Linha de adição de limiar */}
                            <Grid container spacing={1} alignItems="center">
                                <Grid item xs={6} sm={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Base</InputLabel>
                                        <Select
                                            value={newThreshold.mode ?? 'constant'}
                                            label="Base"
                                            onChange={e => setNewThreshold(prev => ({
                                                ...prev,
                                                mode: e.target.value as ResourceThreshold['mode'],
                                                value: 0
                                            }))}
                                        >
                                            <MenuItem value="constant">Constante</MenuItem>
                                            <MenuItem value="max">Máximo do personagem</MenuItem>
                                            <MenuItem value="min">Mínimo do personagem</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        label={newThreshold.mode === 'constant' || !newThreshold.mode ? 'Valor' : 'Ajuste (±)'}
                                        value={newThreshold.value}
                                        onChange={e => setNewThreshold(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                                        helperText={newThreshold.mode === 'max' ? 'Ex: -2 = máx−2' : undefined}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        label="Rótulo"
                                        value={newThreshold.label}
                                        onChange={e => setNewThreshold(prev => ({ ...prev, label: e.target.value }))}
                                        placeholder="Ex: Hipóxia"
                                        onKeyDown={e => e.key === 'Enter' && addThreshold()}
                                    />
                                </Grid>
                                <Grid item xs={3} sm={2}>
                                    <Tooltip title="Cor do limiar">
                                        <input
                                            type="color"
                                            value={newThreshold.color}
                                            onChange={e => setNewThreshold(prev => ({ ...prev, color: e.target.value }))}
                                            style={{ width: '100%', height: 40, border: 'none', cursor: 'pointer', borderRadius: 6, padding: 2 }}
                                        />
                                    </Tooltip>
                                </Grid>
                                <Grid item xs={3} sm={2}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        onClick={addThreshold}
                                        disabled={!newThreshold.label.trim()}
                                    >
                                        <AddIcon fontSize="small" />
                                    </Button>
                                </Grid>
                            </Grid>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Limiares com base no <strong>máximo/mínimo do personagem</strong> acompanham a progressão
                                (ex: pânico no Estresse máximo, que cresce de 10 para 12 com level-ups).
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={!formData.key.trim() || !formData.name.trim()}
                    >
                        {editingIdx !== null ? 'Salvar' : 'Criar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
