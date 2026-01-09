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
    Autocomplete,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import { v4 as uuidv4 } from 'uuid'
import type { RPGSystem, SystemSpell } from '@models/entities'

interface SpellsTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptySpell: SystemSpell = {
    id: '',
    name: '',
    description: '',
    level: 0,
    element: '',
    cost: 0,
    damage: '',
    duration: '',
    range: '',
    castingTime: '',
    components: [],
    school: ''
}

export function SpellsTab({ system, updateSystem }: SpellsTabProps) {
    const [ dialogOpen, setDialogOpen ] = useState(false)
    const [ editingSpell, setEditingSpell ] = useState<SystemSpell | null>(null)
    const [ formData, setFormData ] = useState<SystemSpell>(emptySpell)
    const [ searchTerm, setSearchTerm ] = useState('')
    const [ filterElement, setFilterElement ] = useState<string>('')
    const [ filterLevel, setFilterLevel ] = useState<number | ''>('')
    const [ page, setPage ] = useState(0)
    const [ rowsPerPage, setRowsPerPage ] = useState(10)
    const [ newComponent, setNewComponent ] = useState('')

    const spells = system.spells || []
    const elements = system.elements || ['Fogo', 'Água', 'Ar', 'Terra', 'Luz', 'Trevas', 'Arcano']
    const conceptNames = system.conceptNames || { spell: 'Magia' }

    const handleOpenDialog = (spell?: SystemSpell) => {
        if (spell) {
            setEditingSpell(spell)
            setFormData(spell)
        } else {
            setEditingSpell(null)
            setFormData({ ...emptySpell, id: uuidv4() })
        }
        setDialogOpen(true)
    }

    const handleSave = () => {
        if (!formData.name.trim()) return

        let newSpells: SystemSpell[]
        
        if (editingSpell) {
            newSpells = spells.map(spell => 
                spell.id === editingSpell.id ? formData : spell
            )
        } else {
            newSpells = [ ...spells, formData ]
        }

        updateSystem('spells', newSpells)
        setDialogOpen(false)
        setEditingSpell(null)
        setFormData(emptySpell)
    }

    const handleDelete = (id: string) => {
        const newSpells = spells.filter(spell => spell.id !== id)
        updateSystem('spells', newSpells)
    }

    // Filtragem
    const filteredSpells = spells.filter(spell => {
        const matchesSearch = spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            spell.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesElement = !filterElement || spell.element === filterElement
        const matchesLevel = filterLevel === '' || spell.level === filterLevel
        return matchesSearch && matchesElement && matchesLevel
    })

    const paginatedSpells = filteredSpells.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

    const uniqueLevels = [ ...new Set(spells.map(s => s.level)) ].sort((a, b) => a - b)

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        {conceptNames.spell}s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure as {conceptNames.spell.toLowerCase()}s disponíveis no sistema.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nova {conceptNames.spell}
                </Button>
            </Box>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
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
                    <Grid item xs={6} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Elemento</InputLabel>
                            <Select
                                value={filterElement}
                                label="Elemento"
                                onChange={(e) => setFilterElement(e.target.value)}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {elements.map(elem => (
                                    <MenuItem key={elem} value={elem}>{elem}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Nível</InputLabel>
                            <Select
                                value={filterLevel}
                                label="Nível"
                                onChange={(e) => setFilterLevel(e.target.value as number | '')}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {uniqueLevels.map(level => (
                                    <MenuItem key={level} value={level}>Nível {level}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Chip label={`${filteredSpells.length} ${conceptNames.spell.toLowerCase()}s`} />
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabela de Magias */}
            {spells.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Nenhuma {conceptNames.spell.toLowerCase()} configurada.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Nome</strong></TableCell>
                                <TableCell><strong>Nível</strong></TableCell>
                                <TableCell><strong>Elemento</strong></TableCell>
                                <TableCell><strong>Custo</strong></TableCell>
                                <TableCell><strong>Dano</strong></TableCell>
                                <TableCell><strong>Alcance</strong></TableCell>
                                <TableCell align="center"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedSpells.map((spell) => (
                                <TableRow key={spell.id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2">{spell.name}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ 
                                            display: '-webkit-box',
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {spell.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={spell.level} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={spell.element || '-'} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{spell.cost || '-'}</TableCell>
                                    <TableCell>{spell.damage || '-'}</TableCell>
                                    <TableCell>{spell.range || '-'}</TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleOpenDialog(spell)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(spell.id!)}>
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
                        count={filteredSpells.length}
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
                    {editingSpell ? `Editar ${conceptNames.spell}` : `Nova ${conceptNames.spell}`}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Nível"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
                                inputProps={{ min: 0, max: 20 }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Custo"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                freeSolo
                                options={elements}
                                value={formData.element}
                                onChange={(_, newValue) => setFormData({ ...formData, element: newValue || '' })}
                                renderInput={(params) => (
                                    <TextField {...params} label="Elemento" />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Escola"
                                value={formData.school || ''}
                                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                placeholder="Ex: Evocação, Transmutação, etc."
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
                                label="Dano"
                                value={formData.damage || ''}
                                onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
                                placeholder="Ex: 2d6"
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
                                placeholder="Ex: 30 metros"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Tempo de Conjuração"
                                value={formData.castingTime || ''}
                                onChange={(e) => setFormData({ ...formData, castingTime: e.target.value })}
                                placeholder="Ex: 1 ação"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Componentes</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(formData.components || []).map((comp, idx) => (
                                    <Chip
                                        key={idx}
                                        label={comp}
                                        size="small"
                                        onDelete={() => {
                                            setFormData({
                                                ...formData,
                                                components: (formData.components || []).filter((_, i) => i !== idx)
                                            })
                                        }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Verbal, Somático, Material..."
                                    value={newComponent}
                                    onChange={(e) => setNewComponent(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newComponent.trim()) {
                                            setFormData({
                                                ...formData,
                                                components: [ ...(formData.components || []), newComponent.trim() ]
                                            })
                                            setNewComponent('')
                                        }
                                    }}
                                />
                                <IconButton onClick={() => {
                                    if (newComponent.trim()) {
                                        setFormData({
                                            ...formData,
                                            components: [ ...(formData.components || []), newComponent.trim() ]
                                        })
                                        setNewComponent('')
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
                        {editingSpell ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
