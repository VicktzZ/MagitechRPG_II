'use client'

import { useState } from 'react'
import {
    Box,
    Typography,
    Grid,
    Paper,
    TextField,
    FormControlLabel,
    Switch,
    Divider,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import type { RPGSystem, InitialFields } from '@models/entities'

interface InitialFieldsTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

interface CustomFieldForm {
    key: string
    label: string
    type: 'text' | 'number' | 'select' | 'boolean'
    required: boolean
    defaultValue?: string | number | boolean
    options?: string[]
    min?: number
    max?: number
}

const defaultInitialFields: InitialFields = {
    life: { enabled: true, label: 'Vida', required: true, defaultValue: 10, formula: 'VIG * 2 + 10' },
    mana: { enabled: true, label: 'Mana', required: true, defaultValue: 10, formula: 'FOC * 2 + 10' },
    armor: { enabled: true, label: 'Armadura', required: false, defaultValue: 0 },
    age: { enabled: true, label: 'Idade', required: true, min: 1, max: 999 },
    gender: { 
        enabled: true, 
        label: 'Gênero', 
        required: true, 
        options: ['Masculino', 'Feminino', 'Não-binário', 'Outro', 'Não definido'] 
    },
    financialCondition: { 
        enabled: true, 
        label: 'Condição Financeira', 
        required: false, 
        options: ['Miserável', 'Pobre', 'Estável', 'Rico'] 
    },
    customInitialFields: []
}

export function InitialFieldsTab({ system, updateSystem }: InitialFieldsTabProps) {
    const [ customFieldDialogOpen, setCustomFieldDialogOpen ] = useState(false)
    const [ editingCustomField, setEditingCustomField ] = useState<CustomFieldForm | null>(null)
    const [ customFieldForm, setCustomFieldForm ] = useState<CustomFieldForm>({
        key: '',
        label: '',
        type: 'text',
        required: false
    })
    const [ newOption, setNewOption ] = useState('')

    const initialFields = system.initialFields || defaultInitialFields

    const updateInitialField = <K extends keyof InitialFields>(
        fieldKey: K, 
        updates: Partial<InitialFields[K]>
    ) => {
        updateSystem('initialFields', {
            ...initialFields,
            [fieldKey]: { ...initialFields[fieldKey], ...updates }
        })
    }

    const handleSaveCustomField = () => {
        if (!customFieldForm.label.trim()) return

        const newField: CustomFieldForm = {
            ...customFieldForm,
            key: customFieldForm.key || customFieldForm.label.toLowerCase().replace(/\s/g, '_')
        }

        let updatedCustomFields: CustomFieldForm[]

        if (editingCustomField) {
            updatedCustomFields = (initialFields.customInitialFields || []).map(f => 
                f.key === editingCustomField.key ? newField : f
            )
        } else {
            updatedCustomFields = [ ...(initialFields.customInitialFields || []), newField ]
        }

        updateSystem('initialFields', {
            ...initialFields,
            customInitialFields: updatedCustomFields
        })

        setCustomFieldDialogOpen(false)
        setEditingCustomField(null)
        setCustomFieldForm({ key: '', label: '', type: 'text', required: false })
    }

    const handleDeleteCustomField = (key: string) => {
        updateSystem('initialFields', {
            ...initialFields,
            customInitialFields: (initialFields.customInitialFields || []).filter(f => f.key !== key)
        })
    }

    const handleOpenCustomFieldDialog = (field?: CustomFieldForm) => {
        if (field) {
            setEditingCustomField(field)
            setCustomFieldForm(field)
        } else {
            setEditingCustomField(null)
            setCustomFieldForm({ key: '', label: '', type: 'text', required: false })
        }
        setCustomFieldDialogOpen(true)
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Campos Iniciais do Personagem
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure os campos básicos que aparecem na criação de personagem (vida, idade, gênero, etc.)
            </Typography>

            <Grid container spacing={3}>
                {/* Vida */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600}>❤️ {initialFields.life?.label || 'Vida'}</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={initialFields.life?.enabled ?? true}
                                        onChange={(e) => updateInitialField('life', { enabled: e.target.checked })}
                                    />
                                }
                                label="Ativo"
                            />
                        </Box>
                        {initialFields.life?.enabled && (
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Nome do Campo"
                                        value={initialFields.life?.label || 'Vida'}
                                        onChange={(e) => updateInitialField('life', { label: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Valor Padrão"
                                        value={initialFields.life?.defaultValue || 10}
                                        onChange={(e) => updateInitialField('life', { defaultValue: parseInt(e.target.value) || 10 })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Fórmula"
                                        value={initialFields.life?.formula || ''}
                                        onChange={(e) => updateInitialField('life', { formula: e.target.value })}
                                        placeholder="Ex: VIG * 2 + 10"
                                        helperText="Use abreviações de atributos na fórmula"
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                {/* Mana */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600}>💧 {initialFields.mana?.label || 'Mana'}</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={initialFields.mana?.enabled ?? true}
                                        onChange={(e) => updateInitialField('mana', { enabled: e.target.checked })}
                                    />
                                }
                                label="Ativo"
                            />
                        </Box>
                        {initialFields.mana?.enabled && (
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Nome do Campo"
                                        value={initialFields.mana?.label || 'Mana'}
                                        onChange={(e) => updateInitialField('mana', { label: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Valor Padrão"
                                        value={initialFields.mana?.defaultValue || 10}
                                        onChange={(e) => updateInitialField('mana', { defaultValue: parseInt(e.target.value) || 10 })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Fórmula"
                                        value={initialFields.mana?.formula || ''}
                                        onChange={(e) => updateInitialField('mana', { formula: e.target.value })}
                                        placeholder="Ex: FOC * 2 + 10"
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                {/* Armadura */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600}>🛡️ {initialFields.armor?.label || 'Armadura'}</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={initialFields.armor?.enabled ?? true}
                                        onChange={(e) => updateInitialField('armor', { enabled: e.target.checked })}
                                    />
                                }
                                label="Ativo"
                            />
                        </Box>
                        {initialFields.armor?.enabled && (
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Nome do Campo"
                                        value={initialFields.armor?.label || 'Armadura'}
                                        onChange={(e) => updateInitialField('armor', { label: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Valor Padrão"
                                        value={initialFields.armor?.defaultValue || 0}
                                        onChange={(e) => updateInitialField('armor', { defaultValue: parseInt(e.target.value) || 0 })}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                {/* Idade */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600}>🎂 {initialFields.age?.label || 'Idade'}</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={initialFields.age?.enabled ?? true}
                                        onChange={(e) => updateInitialField('age', { enabled: e.target.checked })}
                                    />
                                }
                                label="Ativo"
                            />
                        </Box>
                        {initialFields.age?.enabled && (
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Nome"
                                        value={initialFields.age?.label || 'Idade'}
                                        onChange={(e) => updateInitialField('age', { label: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Mínimo"
                                        value={initialFields.age?.min || 1}
                                        onChange={(e) => updateInitialField('age', { min: parseInt(e.target.value) || 1 })}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Máximo"
                                        value={initialFields.age?.max || 999}
                                        onChange={(e) => updateInitialField('age', { max: parseInt(e.target.value) || 999 })}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                {/* Gênero */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600}>👤 {initialFields.gender?.label || 'Gênero'}</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={initialFields.gender?.enabled ?? true}
                                        onChange={(e) => updateInitialField('gender', { enabled: e.target.checked })}
                                    />
                                }
                                label="Ativo"
                            />
                        </Box>
                        {initialFields.gender?.enabled && (
                            <Box>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Nome do Campo"
                                    value={initialFields.gender?.label || 'Gênero'}
                                    onChange={(e) => updateInitialField('gender', { label: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <Typography variant="caption" color="text.secondary">Opções:</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                    {(initialFields.gender?.options || []).map((opt, idx) => (
                                        <Chip
                                            key={idx}
                                            label={opt}
                                            size="small"
                                            onDelete={() => {
                                                const newOptions = (initialFields.gender?.options || []).filter((_, i) => i !== idx)
                                                updateInitialField('gender', { options: newOptions })
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Condição Financeira */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600}>💰 {initialFields.financialCondition?.label || 'Condição Financeira'}</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={initialFields.financialCondition?.enabled ?? true}
                                        onChange={(e) => updateInitialField('financialCondition', { enabled: e.target.checked })}
                                    />
                                }
                                label="Ativo"
                            />
                        </Box>
                        {initialFields.financialCondition?.enabled && (
                            <Box>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Nome do Campo"
                                    value={initialFields.financialCondition?.label || 'Condição Financeira'}
                                    onChange={(e) => updateInitialField('financialCondition', { label: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <Typography variant="caption" color="text.secondary">Opções:</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                    {(initialFields.financialCondition?.options || []).map((opt, idx) => (
                                        <Chip
                                            key={idx}
                                            label={opt}
                                            size="small"
                                            onDelete={() => {
                                                const newOptions = (initialFields.financialCondition?.options || []).filter((_, i) => i !== idx)
                                                updateInitialField('financialCondition', { options: newOptions })
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Campos Customizados */}
                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Typography variant="h6">Campos Customizados</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Adicione campos personalizados para o seu sistema.
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenCustomFieldDialog()}
                        >
                            Novo Campo
                        </Button>
                    </Box>

                    <Grid container spacing={2}>
                        {(initialFields.customInitialFields || []).map((field) => (
                            <Grid item xs={12} sm={6} md={4} key={field.key}>
                                <Paper sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>{field.label}</Typography>
                                            <Chip label={field.type} size="small" sx={{ mr: 0.5 }} />
                                            {field.required && <Chip label="Obrigatório" size="small" color="warning" />}
                                        </Box>
                                        <Box>
                                            <IconButton size="small" onClick={() => handleOpenCustomFieldDialog(field)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDeleteCustomField(field.key)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            {/* Dialog para campo customizado */}
            <Dialog open={customFieldDialogOpen} onClose={() => setCustomFieldDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCustomField ? 'Editar Campo' : 'Novo Campo Customizado'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nome do Campo"
                                value={customFieldForm.label}
                                onChange={(e) => setCustomFieldForm({ ...customFieldForm, label: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={customFieldForm.type}
                                    label="Tipo"
                                    onChange={(e) => setCustomFieldForm({ ...customFieldForm, type: e.target.value as any })}
                                >
                                    <MenuItem value="text">Texto</MenuItem>
                                    <MenuItem value="number">Número</MenuItem>
                                    <MenuItem value="select">Seleção</MenuItem>
                                    <MenuItem value="boolean">Sim/Não</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={customFieldForm.required}
                                        onChange={(e) => setCustomFieldForm({ ...customFieldForm, required: e.target.checked })}
                                    />
                                }
                                label="Obrigatório"
                            />
                        </Grid>
                        {customFieldForm.type === 'select' && (
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ mb: 1 }}>Opções:</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                    {(customFieldForm.options || []).map((opt, idx) => (
                                        <Chip
                                            key={idx}
                                            label={opt}
                                            size="small"
                                            onDelete={() => {
                                                setCustomFieldForm({
                                                    ...customFieldForm,
                                                    options: (customFieldForm.options || []).filter((_, i) => i !== idx)
                                                })
                                            }}
                                        />
                                    ))}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        size="small"
                                        placeholder="Nova opção..."
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newOption.trim()) {
                                                setCustomFieldForm({
                                                    ...customFieldForm,
                                                    options: [ ...(customFieldForm.options || []), newOption.trim() ]
                                                })
                                                setNewOption('')
                                            }
                                        }}
                                    />
                                    <IconButton
                                        onClick={() => {
                                            if (newOption.trim()) {
                                                setCustomFieldForm({
                                                    ...customFieldForm,
                                                    options: [ ...(customFieldForm.options || []), newOption.trim() ]
                                                })
                                                setNewOption('')
                                            }
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                        )}
                        {customFieldForm.type === 'number' && (
                            <>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Valor Mínimo"
                                        value={customFieldForm.min || ''}
                                        onChange={(e) => setCustomFieldForm({ ...customFieldForm, min: parseInt(e.target.value) || undefined })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Valor Máximo"
                                        value={customFieldForm.max || ''}
                                        onChange={(e) => setCustomFieldForm({ ...customFieldForm, max: parseInt(e.target.value) || undefined })}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCustomFieldDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveCustomField} disabled={!customFieldForm.label.trim()}>
                        {editingCustomField ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
