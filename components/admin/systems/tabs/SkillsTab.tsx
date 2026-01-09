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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Autocomplete
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { v4 as uuidv4 } from 'uuid'
import type { RPGSystem, SystemSkill } from '@models/entities'

interface SkillsTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptySkill: SystemSkill = {
    id: '',
    name: '',
    description: '',
    type: 'Geral',
    origin: '',
    level: 0,
    cost: 0,
    cooldown: '',
    duration: '',
    range: '',
    prerequisites: []
}

export function SkillsTab({ system, updateSystem }: SkillsTabProps) {
    const [ dialogOpen, setDialogOpen ] = useState(false)
    const [ editingSkill, setEditingSkill ] = useState<SystemSkill | null>(null)
    const [ formData, setFormData ] = useState<SystemSkill>(emptySkill)
    const [ searchTerm, setSearchTerm ] = useState('')
    const [ filterType, setFilterType ] = useState<string>('')
    const [ page, setPage ] = useState(0)
    const [ rowsPerPage, setRowsPerPage ] = useState(10)
    const [ newPrerequisite, setNewPrerequisite ] = useState('')

    const skills = system.skills || []
    const conceptNames = system.conceptNames || { skill: 'Habilidade' }

    // Tipos únicos de habilidades
    const skillTypes = [ ...new Set(skills.map(s => s.type)) ].sort()
    const defaultTypes = [ 'Geral', 'Passiva', 'Ativa', 'Reação', 'Especial' ]
    const allTypes = [ ...new Set([ ...defaultTypes, ...skillTypes ]) ]

    const handleOpenDialog = (skill?: SystemSkill) => {
        if (skill) {
            setEditingSkill(skill)
            setFormData(skill)
        } else {
            setEditingSkill(null)
            setFormData({ ...emptySkill, id: uuidv4() })
        }
        setDialogOpen(true)
    }

    const handleSave = () => {
        if (!formData.name.trim()) return

        let newSkills: SystemSkill[]
        
        if (editingSkill) {
            newSkills = skills.map(skill => 
                skill.id === editingSkill.id ? formData : skill
            )
        } else {
            newSkills = [ ...skills, formData ]
        }

        updateSystem('skills', newSkills)
        setDialogOpen(false)
        setEditingSkill(null)
        setFormData(emptySkill)
    }

    const handleDelete = (id: string) => {
        const newSkills = skills.filter(skill => skill.id !== id)
        updateSystem('skills', newSkills)
    }

    // Filtragem
    const filteredSkills = skills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            skill.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = !filterType || skill.type === filterType
        return matchesSearch && matchesType
    })

    const paginatedSkills = filteredSkills.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        {conceptNames.skill}s Gerais
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure as {conceptNames.skill.toLowerCase()}s genéricas que não estão vinculadas a classes, raças ou linhagens.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nova {conceptNames.skill}
                </Button>
            </Box>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={filterType}
                                label="Tipo"
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {allTypes.map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Chip label={`${filteredSkills.length} ${conceptNames.skill.toLowerCase()}s`} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabela */}
            {skills.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Nenhuma {conceptNames.skill.toLowerCase()} geral configurada.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Nome</strong></TableCell>
                                <TableCell><strong>Tipo</strong></TableCell>
                                <TableCell><strong>Nível</strong></TableCell>
                                <TableCell><strong>Custo</strong></TableCell>
                                <TableCell><strong>Cooldown</strong></TableCell>
                                <TableCell align="center"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedSkills.map((skill) => (
                                <TableRow key={skill.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2">{skill.name}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ 
                                            display: '-webkit-box',
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {skill.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={skill.type} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        {skill.level ? <Chip label={skill.level} size="small" /> : '-'}
                                    </TableCell>
                                    <TableCell>{skill.cost || '-'}</TableCell>
                                    <TableCell>{skill.cooldown || '-'}</TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleOpenDialog(skill)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(skill.id!)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[ 5, 10, 25, 50 ]}
                        component="div"
                        count={filteredSkills.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10))
                            setPage(0)
                        }}
                        labelRowsPerPage="Por página:"
                    />
                </TableContainer>
            )}

            {/* Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingSkill ? `Editar ${conceptNames.skill}` : `Nova ${conceptNames.skill}`}
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
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Autocomplete
                                freeSolo
                                options={allTypes}
                                value={formData.type}
                                onChange={(_, newValue) => setFormData({ ...formData, type: newValue || 'Geral' })}
                                renderInput={(params) => (
                                    <TextField {...params} label="Tipo" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Nível Requerido"
                                value={formData.level || 0}
                                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Descrição"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Custo"
                                value={formData.cost || 0}
                                onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Cooldown"
                                value={formData.cooldown || ''}
                                onChange={(e) => setFormData({ ...formData, cooldown: e.target.value })}
                                placeholder="Ex: 1 rodada"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Duração"
                                value={formData.duration || ''}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="Ex: 1 minuto"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Alcance"
                                value={formData.range || ''}
                                onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                                placeholder="Ex: 10 metros"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Pré-requisitos</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(formData.prerequisites || []).map((prereq, idx) => (
                                    <Chip
                                        key={idx}
                                        label={prereq}
                                        size="small"
                                        onDelete={() => {
                                            setFormData({
                                                ...formData,
                                                prerequisites: (formData.prerequisites || []).filter((_, i) => i !== idx)
                                            })
                                        }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Habilidade ou requisito..."
                                    value={newPrerequisite}
                                    onChange={(e) => setNewPrerequisite(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newPrerequisite.trim()) {
                                            setFormData({
                                                ...formData,
                                                prerequisites: [ ...(formData.prerequisites || []), newPrerequisite.trim() ]
                                            })
                                            setNewPrerequisite('')
                                        }
                                    }}
                                />
                                <IconButton onClick={() => {
                                    if (newPrerequisite.trim()) {
                                        setFormData({
                                            ...formData,
                                            prerequisites: [ ...(formData.prerequisites || []), newPrerequisite.trim() ]
                                        })
                                        setNewPrerequisite('')
                                    }
                                }}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave} disabled={!formData.name.trim()}>
                        {editingSkill ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
