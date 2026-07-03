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
import type { RPGSystem, SystemExpertise } from '@models/entities'

interface ExpertisesTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptyExpertise: SystemExpertise = {
    key: '',
    name: '',
    defaultAttribute: null,
    description: ''
}

export function ExpertisesTab({ system, updateSystem }: ExpertisesTabProps) {
    const [ dialogOpen, setDialogOpen ] = useState(false)
    const [ editingExpertise, setEditingExpertise ] = useState<SystemExpertise | null>(null)
    const [ formData, setFormData ] = useState<SystemExpertise>(emptyExpertise)

    const expertises = system.expertises || []
    const attributes = system.attributes || []

    const handleOpenDialog = (expertise?: SystemExpertise) => {
        if (expertise) {
            setEditingExpertise(expertise)
            setFormData(expertise)
        } else {
            setEditingExpertise(null)
            setFormData({ ...emptyExpertise, key: uuidv4() })
        }
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setEditingExpertise(null)
        setFormData(emptyExpertise)
    }

    const handleSave = () => {
        if (!formData.name.trim()) return

        let newExpertises: SystemExpertise[]
        
        if (editingExpertise) {
            newExpertises = expertises.map(exp => 
                exp.key === editingExpertise.key ? formData : exp
            )
        } else {
            newExpertises = [ ...expertises, formData ]
        }

        updateSystem('expertises', newExpertises)
        handleCloseDialog()
    }

    const handleDelete = (key: string) => {
        const newExpertises = expertises.filter(exp => exp.key !== key)
        updateSystem('expertises', newExpertises)
    }

    const getAttributeName = (key: string | null) => {
        if (!key) return 'Nenhum'
        const attr = attributes.find(a => a.key === key)
        return attr ? attr.abbreviation : key
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Perícias
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure as perícias do sistema, vinculando-as aos atributos correspondentes.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nova Perícia
                </Button>
            </Box>

            {attributes.length === 0 && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
                    <Typography variant="body2">
                        ⚠️ Recomendamos criar atributos antes de adicionar perícias para poder vinculá-los.
                    </Typography>
                </Paper>
            )}

            {expertises.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Nenhuma perícia configurada. Clique em &quot;Nova Perícia&quot; para adicionar.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2}>
                    {expertises.map((exp) => (
                        <Grid item xs={12} sm={6} md={4} key={exp.key}>
                            <Paper sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {exp.name}
                                        </Typography>
                                        <Chip 
                                            label={getAttributeName(exp.defaultAttribute)} 
                                            size="small" 
                                            variant="outlined"
                                            sx={{ mt: 0.5 }}
                                        />
                                        {exp.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {exp.description}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box>
                                        <Tooltip title="Editar">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => handleOpenDialog(exp)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Excluir">
                                            <IconButton 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleDelete(exp.key)}
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
                    {editingExpertise ? 'Editar Perícia' : 'Nova Perícia'}
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
                                placeholder="Ex: Atletismo, Percepção, Persuasão"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Atributo Vinculado</InputLabel>
                                <Select
                                    value={formData.defaultAttribute || ''}
                                    label="Atributo Vinculado"
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        defaultAttribute: e.target.value || null 
                                    })}
                                >
                                    <MenuItem value="">
                                        <em>Nenhum</em>
                                    </MenuItem>
                                    {attributes.map((attr) => (
                                        <MenuItem key={attr.key} value={attr.key}>
                                            {attr.abbreviation} - {attr.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Descrição"
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva quando esta perícia é usada..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSave}
                        disabled={!formData.name.trim()}
                    >
                        {editingExpertise ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
