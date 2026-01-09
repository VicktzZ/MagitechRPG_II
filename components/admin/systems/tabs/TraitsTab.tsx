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
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { RPGSystem, SystemTrait } from '@models/entities'

interface TraitsTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptyTrait: SystemTrait = {
    name: '',
    description: '',
    value: 0,
    target: {
        kind: 'attribute',
        name: ''
    }
}

export function TraitsTab({ system, updateSystem }: TraitsTabProps) {
    const [ tabValue, setTabValue ] = useState(0)
    const [ dialogOpen, setDialogOpen ] = useState(false)
    const [ editingTrait, setEditingTrait ] = useState<{ trait: SystemTrait, type: 'positive' | 'negative', index: number } | null>(null)
    const [ formData, setFormData ] = useState<SystemTrait>(emptyTrait)
    const [ traitType, setTraitType ] = useState<'positive' | 'negative'>('positive')

    const traits = system.traits || { positive: [], negative: [] }
    const attributes = system.attributes || []
    const expertises = system.expertises || []
    const conceptNames = system.conceptNames || { trait: 'Traço' }

    const handleOpenDialog = (type: 'positive' | 'negative', trait?: SystemTrait, index?: number) => {
        setTraitType(type)
        if (trait && index !== undefined) {
            setEditingTrait({ trait, type, index })
            setFormData(trait)
        } else {
            setEditingTrait(null)
            setFormData({ ...emptyTrait, value: type === 'positive' ? 1 : -1 })
        }
        setDialogOpen(true)
    }

    const handleSave = () => {
        if (!formData.name.trim()) return

        const newTraits = { ...traits }
        
        if (editingTrait) {
            newTraits[editingTrait.type][editingTrait.index] = formData
        } else {
            newTraits[traitType] = [ ...newTraits[traitType], formData ]
        }

        updateSystem('traits', newTraits)
        setDialogOpen(false)
        setEditingTrait(null)
        setFormData(emptyTrait)
    }

    const handleDelete = (type: 'positive' | 'negative', index: number) => {
        const newTraits = { ...traits }
        newTraits[type] = newTraits[type].filter((_, i) => i !== index)
        updateSystem('traits', newTraits)
    }

    const getTargetOptions = () => {
        const options: { value: string; label: string; kind: 'attribute' | 'expertise' | 'custom' }[] = []
        
        attributes.forEach(attr => {
            options.push({ value: attr.key, label: `${attr.abbreviation} - ${attr.name}`, kind: 'attribute' })
        })
        
        expertises.forEach(exp => {
            options.push({ value: exp.key, label: exp.name, kind: 'expertise' })
        })

        return options
    }

    const targetOptions = getTargetOptions()

    const renderTraitsList = (traitsList: SystemTrait[], type: 'positive' | 'negative') => (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    {type === 'positive' ? '✅ Traços Positivos' : '❌ Traços Negativos'}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    color={type === 'positive' ? 'success' : 'error'}
                    onClick={() => handleOpenDialog(type)}
                >
                    Novo {conceptNames.trait}
                </Button>
            </Box>

            {traitsList.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: type === 'positive' ? 'success.dark' : 'error.dark', opacity: 0.2 }}>
                    <Typography color="text.secondary">
                        Nenhum {conceptNames.trait.toLowerCase()} {type === 'positive' ? 'positivo' : 'negativo'} configurado.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {traitsList.map((trait, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Paper 
                                sx={{ 
                                    p: 2, 
                                    border: '1px solid',
                                    borderColor: type === 'positive' ? 'success.main' : 'error.main',
                                    borderLeft: '4px solid',
                                    borderLeftColor: type === 'positive' ? 'success.main' : 'error.main'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {trait.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                            <Chip 
                                                label={`${trait.value > 0 ? '+' : ''}${trait.value}`}
                                                size="small"
                                                color={trait.value > 0 ? 'success' : 'error'}
                                            />
                                            <Chip 
                                                label={trait.target.name || 'Custom'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                        {trait.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {trait.description}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleOpenDialog(type, trait, index)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(type, index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    )

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {conceptNames.trait}s
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Configure os {conceptNames.trait.toLowerCase()}s positivos e negativos que os jogadores podem escolher.
                </Typography>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={(_, newValue) => setTabValue(newValue)}
                    variant="fullWidth"
                >
                    <Tab label={`Positivos (${traits.positive.length})`} />
                    <Tab label={`Negativos (${traits.negative.length})`} />
                </Tabs>
            </Paper>

            {tabValue === 0 && renderTraitsList(traits.positive, 'positive')}
            {tabValue === 1 && renderTraitsList(traits.negative, 'negative')}

            {/* Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingTrait ? `Editar ${conceptNames.trait}` : `Novo ${conceptNames.trait} ${traitType === 'positive' ? 'Positivo' : 'Negativo'}`}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={`Ex: ${traitType === 'positive' ? 'Forte, Ágil, Perspicaz' : 'Fraco, Lento, Distraído'}`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Valor"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                                helperText="Positivo para bônus, negativo para penalidade"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Tipo de Alvo</InputLabel>
                                <Select
                                    value={formData.target.kind}
                                    label="Tipo de Alvo"
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        target: { ...formData.target, kind: e.target.value as 'attribute' | 'expertise' | 'custom' } 
                                    })}
                                >
                                    <MenuItem value="attribute">Atributo</MenuItem>
                                    <MenuItem value="expertise">Perícia</MenuItem>
                                    <MenuItem value="custom">Customizado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            {formData.target.kind === 'custom' ? (
                                <TextField
                                    fullWidth
                                    label="Nome do Alvo"
                                    value={formData.target.name}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        target: { ...formData.target, name: e.target.value } 
                                    })}
                                    placeholder="Ex: Vida, Iniciativa, etc."
                                />
                            ) : (
                                <FormControl fullWidth>
                                    <InputLabel>Alvo</InputLabel>
                                    <Select
                                        value={formData.target.name}
                                        label="Alvo"
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            target: { ...formData.target, name: e.target.value } 
                                        })}
                                    >
                                        {targetOptions
                                            .filter(opt => opt.kind === formData.target.kind)
                                            .map(opt => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Descrição"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva o efeito deste traço..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSave}
                        disabled={!formData.name.trim()}
                        color={traitType === 'positive' ? 'success' : 'error'}
                    >
                        {editingTrait ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
