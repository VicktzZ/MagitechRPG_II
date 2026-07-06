'use client'

import { useState } from 'react'
import {
    Box,
    Typography,
    Button,
    TextField,
    IconButton,
    Paper,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { v4 as uuidv4 } from 'uuid'
import type { RPGSystem, SystemAttribute } from '@models/entities'
import { evaluateFormula } from '@utils/formulaEvaluator'

interface AttributesTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptyAttribute: SystemAttribute = {
    key: '',
    name: '',
    abbreviation: '',
    description: '',
    defaultValue: 0
}

export function AttributesTab({ system, updateSystem }: AttributesTabProps) {
    const [ dialogOpen, setDialogOpen ] = useState(false)
    const [ editingAttribute, setEditingAttribute ] = useState<SystemAttribute | null>(null)
    const [ formData, setFormData ] = useState<SystemAttribute>(emptyAttribute)

    const attributes = system.attributes || []

    const handleOpenDialog = (attribute?: SystemAttribute) => {
        if (attribute) {
            setEditingAttribute(attribute)
            setFormData(attribute)
        } else {
            setEditingAttribute(null)
            setFormData({ ...emptyAttribute, key: uuidv4() })
        }
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setEditingAttribute(null)
        setFormData(emptyAttribute)
    }

    const handleSave = () => {
        if (!formData.name.trim() || !formData.abbreviation.trim()) return

        let newAttributes: SystemAttribute[]
        
        if (editingAttribute) {
            newAttributes = attributes.map(attr => 
                attr.key === editingAttribute.key ? formData : attr
            )
        } else {
            newAttributes = [ ...attributes, formData ]
        }

        updateSystem('attributes', newAttributes)
        handleCloseDialog()
    }

    const handleDelete = (key: string) => {
        const newAttributes = attributes.filter(attr => attr.key !== key)
        updateSystem('attributes', newAttributes)
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Atributos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure os atributos base do personagem (ex: Força, Destreza, Inteligência).
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Novo Atributo
                </Button>
            </Box>

            {/* Pontos iniciais e limites de atributos */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Pontos de Atributo Iniciais"
                            value={system.initialAttributePoints ?? ''}
                            onChange={(e) => {
                                const raw = e.target.value
                                updateSystem(
                                    'initialAttributePoints',
                                    raw === '' ? (undefined as any) : Math.max(0, parseInt(raw) || 0)
                                )
                            }}
                            inputProps={{ min: 0 }}
                            helperText="Pontos para distribuir na criação da ficha. Vazio = padrão da aplicação."
                        />
                    </Grid>
                    <Grid item xs={12} sm={5} md={4}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Fórmula — Limite por Atributo"
                            value={system.attributeCapFormula ?? ''}
                            onChange={(e) => updateSystem('attributeCapFormula', e.target.value.trim() || (undefined as any))}
                            placeholder="level"
                            helperText='Máximo de pontos por atributo com "level" como variável (ex: level, level * 2). Vazio = sem limite por nível.'
                        />
                    </Grid>
                    <Grid item xs={12} sm={3} md={2}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Limite Absoluto"
                            value={system.attributeCapAbsoluteLimit ?? ''}
                            onChange={(e) => {
                                const raw = e.target.value
                                updateSystem(
                                    'attributeCapAbsoluteLimit',
                                    raw === '' ? (undefined as any) : Math.max(0, parseInt(raw) || 0)
                                )
                            }}
                            inputProps={{ min: 0 }}
                            helperText="Teto que a fórmula nunca ultrapassa. Vazio = sem teto global."
                        />
                    </Grid>
                    {system.attributeCapFormula?.trim() && (
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Prévia do limite por nível (1 a 10):
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(lvl => {
                                    const raw = evaluateFormula(system.attributeCapFormula!, { level: lvl }, 0)
                                    const capped = system.attributeCapAbsoluteLimit != null
                                        ? Math.min(raw, system.attributeCapAbsoluteLimit)
                                        : raw
                                    return (
                                        <Chip
                                            key={lvl}
                                            size="small"
                                            variant="outlined"
                                            label={`Nv${lvl}: ${capped}`}
                                        />
                                    )
                                })}
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {attributes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Nenhum atributo configurado. Clique em &quot;Novo Atributo&quot; para adicionar.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {attributes.map((attr) => (
                        <Grid item xs={12} sm={6} md={4} key={attr.key}>
                            <Paper sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Chip 
                                                label={attr.abbreviation} 
                                                size="small" 
                                                color="primary"
                                                sx={{ fontWeight: 700 }}
                                            />
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {attr.name}
                                            </Typography>
                                        </Box>
                                        {attr.description && (
                                            <Typography variant="body2" color="text.secondary">
                                                {attr.description}
                                            </Typography>
                                        )}
                                        {attr.defaultValue !== undefined && (
                                            <Chip 
                                                label={`Padrão: ${attr.defaultValue}`} 
                                                size="small" 
                                                variant="outlined"
                                                sx={{ mt: 1 }}
                                            />
                                        )}
                                    </Box>
                                    <Box>
                                        <Tooltip title="Editar">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleOpenDialog(attr)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleDelete(attr.key)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Dialog para adicionar/editar */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingAttribute ? 'Editar Atributo' : 'Novo Atributo'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Força, Destreza, Inteligência"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                required
                                label="Abreviação"
                                value={formData.abbreviation}
                                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value.toUpperCase() })}
                                placeholder="Ex: FOR, DES, INT"
                                inputProps={{ maxLength: 5 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Valor Padrão"
                                value={formData.defaultValue || 0}
                                onChange={(e) => setFormData({ ...formData, defaultValue: parseInt(e.target.value) || 0 })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Descrição"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva o que este atributo representa..."
                            />
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Valor Mínimo"
                                value={formData.minValue ?? ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    minValue: e.target.value === '' ? undefined : parseInt(e.target.value) || 0
                                })}
                                helperText="Vazio = 0"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Valor Máximo"
                                value={formData.maxValue ?? ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    maxValue: e.target.value === '' ? undefined : parseInt(e.target.value) || 0
                                })}
                                helperText="Vazio = sem limite"
                            />
                        </Grid>

                        {/* ── Influência nos testes de perícias vinculadas ── */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>
                                Influência nos Testes
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Como o valor deste atributo afeta TODOS os testes de perícias vinculadas a ele.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Modo</InputLabel>
                                <Select
                                    value={formData.testInfluence?.mode ?? 'none'}
                                    label="Modo"
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        testInfluence: {
                                            ...formData.testInfluence,
                                            mode: e.target.value as 'none' | 'advantage' | 'sum'
                                        }
                                    })}
                                >
                                    <MenuItem value="none">Nenhuma</MenuItem>
                                    <MenuItem value="advantage">Vantagem — mais dados (pega o melhor)</MenuItem>
                                    <MenuItem value="sum">Soma — bônus fixo no resultado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {(formData.testInfluence?.mode ?? 'none') !== 'none' && (
                            <Grid item xs={12} sm={7}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Fórmula"
                                    value={formData.testInfluence?.formula ?? ''}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        testInfluence: {
                                            mode: formData.testInfluence?.mode ?? 'sum',
                                            ...formData.testInfluence,
                                            formula: e.target.value
                                        }
                                    })}
                                    placeholder="attr / 2"
                                    helperText='Variáveis: "attr" (valor do atributo) e "level". Vazio = attr (1 para 1). Ex: attr / 5 = +1 a cada 5 pontos.'
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={(formData.testInfluence?.mode ?? 'none') === 'none' ? 12 : 5}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Vantagem extra a cada N pontos"
                                value={formData.testInfluence?.advantageEveryNPoints ?? ''}
                                onChange={(e) => {
                                    const raw = e.target.value
                                    setFormData({
                                        ...formData,
                                        testInfluence: {
                                            mode: formData.testInfluence?.mode ?? 'none',
                                            ...formData.testInfluence,
                                            advantageEveryNPoints: raw === '' ? undefined : Math.max(1, parseInt(raw) || 1)
                                        }
                                    })
                                }}
                                inputProps={{ min: 1 }}
                                helperText="Empilha com o modo acima. Ex: 5 = +1 dado extra a cada 5 pontos do atributo. Vazio = nenhuma."
                            />
                        </Grid>
                        {(formData.testInfluence?.mode ?? 'none') !== 'none' &&
                            formData.maxValue !== undefined && formData.maxValue > 0 && formData.maxValue <= 30 && (
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Ajuste manual por ponto (opcional — sobrepõe a fórmula no valor correspondente; vazio = usa a fórmula):
                                </Typography>
                                <Grid container spacing={1}>
                                    {Array.from({ length: formData.maxValue + 1 }, (_, i) => i).map(point => (
                                        <Grid item xs={3} sm={2} md={1.5 as any} key={point}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                label={`${point} pt`}
                                                value={formData.testInfluence?.manualMap?.[String(point)] ?? ''}
                                                onChange={(e) => {
                                                    const raw = e.target.value
                                                    const manualMap = Object.fromEntries(
                                                        Object.entries(formData.testInfluence?.manualMap ?? {})
                                                            .filter(([ k ]) => k !== String(point))
                                                    )
                                                    if (raw !== '') manualMap[String(point)] = parseInt(raw) || 0
                                                    setFormData({
                                                        ...formData,
                                                        testInfluence: {
                                                            mode: formData.testInfluence?.mode ?? 'sum',
                                                            ...formData.testInfluence,
                                                            manualMap
                                                        }
                                                    })
                                                }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSave}
                        disabled={!formData.name.trim() || !formData.abbreviation.trim()}
                    >
                        {editingAttribute ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
