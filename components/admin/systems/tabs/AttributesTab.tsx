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
    Chip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { v4 as uuidv4 } from 'uuid'
import type { RPGSystem, SystemAttribute } from '@models/entities'

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
