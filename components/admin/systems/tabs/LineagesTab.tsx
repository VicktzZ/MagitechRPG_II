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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { v4 as uuidv4 } from 'uuid'
import type { RPGSystem, SystemLineage, SystemSkill } from '@models/entities'

interface LineagesTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptyLineage: SystemLineage = {
    key: '',
    name: '',
    conceptName: 'Linhagem',
    description: '',
    skills: [],
    attributeBonus: {},
    expertiseBonus: {},
    startingItems: [],
    proficiencies: [],
    languages: []
}

const emptySkill: SystemSkill = {
    id: '',
    name: '',
    description: '',
    type: 'Linhagem',
    origin: ''
}

export function LineagesTab({ system, updateSystem }: LineagesTabProps) {
    const [ lineageDialogOpen, setLineageDialogOpen ] = useState(false)
    const [ skillDialogOpen, setSkillDialogOpen ] = useState(false)
    const [ editingLineage, setEditingLineage ] = useState<SystemLineage | null>(null)
    const [ editingSkill, setEditingSkill ] = useState<{ skill: SystemSkill, lineageKey: string } | null>(null)
    const [ lineageFormData, setLineageFormData ] = useState<SystemLineage>(emptyLineage)
    const [ skillFormData, setSkillFormData ] = useState<SystemSkill>(emptySkill)
    const [ skillLineageKey, setSkillLineageKey ] = useState<string>('')
    const [ newItem, setNewItem ] = useState('')
    const [ newProficiency, setNewProficiency ] = useState('')
    const [ newLanguage, setNewLanguage ] = useState('')

    const lineages = system.lineages || []
    const attributes = system.attributes || []
    const expertises = system.expertises || []
    const conceptNames = system.conceptNames || { lineage: 'Linhagem', skill: 'Habilidade' }

    const handleOpenLineageDialog = (lineage?: SystemLineage) => {
        if (lineage) {
            setEditingLineage(lineage)
            setLineageFormData(lineage)
        } else {
            setEditingLineage(null)
            setLineageFormData({ ...emptyLineage, key: uuidv4(), conceptName: conceptNames.lineage })
        }
        setLineageDialogOpen(true)
    }

    const handleSaveLineage = () => {
        if (!lineageFormData.name.trim()) return

        let newLineages: SystemLineage[]
        
        if (editingLineage) {
            newLineages = lineages.map(lin => 
                lin.key === editingLineage.key ? lineageFormData : lin
            )
        } else {
            newLineages = [ ...lineages, lineageFormData ]
        }

        updateSystem('lineages', newLineages)
        setLineageDialogOpen(false)
        setEditingLineage(null)
        setLineageFormData(emptyLineage)
    }

    const handleDeleteLineage = (key: string) => {
        const newLineages = lineages.filter(lin => lin.key !== key)
        updateSystem('lineages', newLineages)
    }

    const handleOpenSkillDialog = (lineageKey: string, skill?: SystemSkill) => {
        setSkillLineageKey(lineageKey)
        
        if (skill) {
            setEditingSkill({ skill, lineageKey })
            setSkillFormData(skill)
        } else {
            setEditingSkill(null)
            const lineageName = lineages.find(l => l.key === lineageKey)?.name
            setSkillFormData({ 
                ...emptySkill, 
                id: uuidv4(), 
                origin: lineageName || '',
                type: conceptNames.lineage
            })
        }
        setSkillDialogOpen(true)
    }

    const handleSaveSkill = () => {
        if (!skillFormData.name.trim()) return

        const newLineages = lineages.map(lin => {
            if (lin.key === skillLineageKey) {
                let newSkills: SystemSkill[]
                if (editingSkill) {
                    newSkills = lin.skills.map(s => s.id === editingSkill.skill.id ? skillFormData : s)
                } else {
                    newSkills = [ ...lin.skills, skillFormData ]
                }
                return { ...lin, skills: newSkills }
            }
            return lin
        })
        
        updateSystem('lineages', newLineages)
        setSkillDialogOpen(false)
        setEditingSkill(null)
        setSkillFormData(emptySkill)
    }

    const handleDeleteSkill = (lineageKey: string, skillId: string) => {
        const newLineages = lineages.map(lin => {
            if (lin.key === lineageKey) {
                return { ...lin, skills: lin.skills.filter(s => s.id !== skillId) }
            }
            return lin
        })
        updateSystem('lineages', newLineages)
    }

    const handleAttributeBonusChange = (attrKey: string, value: string) => {
        const numValue = parseInt(value) || 0
        const newBonus = { ...lineageFormData.attributeBonus }
        
        if (numValue === 0) {
            delete newBonus[attrKey]
        } else {
            newBonus[attrKey] = numValue
        }
        
        setLineageFormData({ ...lineageFormData, attributeBonus: newBonus })
    }

    const handleExpertiseBonusChange = (expKey: string, value: string) => {
        const numValue = parseInt(value) || 0
        const newBonus = { ...lineageFormData.expertiseBonus }
        
        if (numValue === 0) {
            delete newBonus[expKey]
        } else {
            newBonus[expKey] = numValue
        }
        
        setLineageFormData({ ...lineageFormData, expertiseBonus: newBonus })
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        {conceptNames.lineage}s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure as {conceptNames.lineage.toLowerCase()}s/origens disponíveis com bônus de atributos, perícias, itens iniciais e {conceptNames.skill.toLowerCase()}s.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenLineageDialog()}
                >
                    Nova {conceptNames.lineage}
                </Button>
            </Box>

            {lineages.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Nenhuma {conceptNames.lineage.toLowerCase()} configurada. Clique em &quot;Nova {conceptNames.lineage}&quot; para adicionar.
                    </Typography>
                </Paper>
            ) : (
                lineages.map((lineage) => (
                    <Accordion key={lineage.key} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                                <Typography variant="h6">{lineage.name}</Typography>
                                <Chip label={`${lineage.skills.length} ${conceptNames.skill.toLowerCase()}s`} size="small" />
                                {Object.keys(lineage.attributeBonus || {}).length > 0 && (
                                    <Chip 
                                        label={`+${Object.keys(lineage.attributeBonus || {}).length} atributos`} 
                                        size="small" 
                                        color="primary"
                                        variant="outlined" 
                                    />
                                )}
                                {(lineage.startingItems || []).length > 0 && (
                                    <Chip 
                                        label={`${(lineage.startingItems || []).length} itens`} 
                                        size="small" 
                                        variant="outlined" 
                                    />
                                )}
                                <Box sx={{ flexGrow: 1 }} />
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => { e.stopPropagation(); handleOpenLineageDialog(lineage) }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteLineage(lineage.key) }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            {lineage.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {lineage.description}
                                </Typography>
                            )}

                            {/* Bônus de Atributos */}
                            {Object.keys(lineage.attributeBonus || {}).length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                        Bônus de Atributos:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {Object.entries(lineage.attributeBonus || {}).map(([ key, value ]) => {
                                            const attr = attributes.find(a => a.key === key)
                                            return (
                                                <Chip 
                                                    key={key}
                                                    label={`${attr?.abbreviation || key}: ${value > 0 ? '+' : ''}${value}`}
                                                    size="small"
                                                    color="primary"
                                                />
                                            )
                                        })}
                                    </Box>
                                </Box>
                            )}

                            {/* Itens Iniciais */}
                            {(lineage.startingItems || []).length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                        Itens Iniciais:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {(lineage.startingItems || []).map((item, idx) => (
                                            <Chip key={idx} label={item} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* Habilidades */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {conceptNames.skill}s
                                    </Typography>
                                    <Button 
                                        size="small" 
                                        startIcon={<AddIcon />}
                                        onClick={() => handleOpenSkillDialog(lineage.key)}
                                    >
                                        Adicionar
                                    </Button>
                                </Box>
                                <List dense>
                                    {lineage.skills.map((skill) => (
                                        <ListItem key={skill.id}>
                                            <ListItemText 
                                                primary={skill.name}
                                                secondary={skill.description}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton size="small" onClick={() => handleOpenSkillDialog(lineage.key, skill)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteSkill(lineage.key, skill.id!)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                ))
            )}

            {/* Lineage Dialog */}
            <Dialog open={lineageDialogOpen} onClose={() => setLineageDialogOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>{editingLineage ? `Editar ${conceptNames.lineage}` : `Nova ${conceptNames.lineage}`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={lineageFormData.name}
                                onChange={(e) => setLineageFormData({ ...lineageFormData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={`Nome do Conceito (ex: ${conceptNames.lineage}, Ancestral, Origem)`}
                                value={lineageFormData.conceptName}
                                onChange={(e) => setLineageFormData({ ...lineageFormData, conceptName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Descrição"
                                value={lineageFormData.description || ''}
                                onChange={(e) => setLineageFormData({ ...lineageFormData, description: e.target.value })}
                            />
                        </Grid>

                        {/* Bônus de Atributos */}
                        {attributes.length > 0 && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Bônus de Atributos
                                    </Typography>
                                </Grid>
                                {attributes.map((attr) => (
                                    <Grid item xs={6} sm={4} md={2} key={attr.key}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label={attr.abbreviation}
                                            value={lineageFormData.attributeBonus?.[attr.key] || ''}
                                            onChange={(e) => handleAttributeBonusChange(attr.key, e.target.value)}
                                            inputProps={{ min: -10, max: 10 }}
                                        />
                                    </Grid>
                                ))}
                            </>
                        )}

                        {/* Bônus de Perícias */}
                        {expertises.length > 0 && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2 }}>
                                        Bônus de Perícias
                                    </Typography>
                                </Grid>
                                {expertises.slice(0, 12).map((exp) => (
                                    <Grid item xs={6} sm={4} md={2} key={exp.key}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label={exp.name.substring(0, 10)}
                                            value={lineageFormData.expertiseBonus?.[exp.key] || ''}
                                            onChange={(e) => handleExpertiseBonusChange(exp.key, e.target.value)}
                                            inputProps={{ min: -10, max: 10 }}
                                        />
                                    </Grid>
                                ))}
                            </>
                        )}

                        {/* Itens Iniciais */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                                Itens Iniciais
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(lineageFormData.startingItems || []).map((item, idx) => (
                                    <Chip
                                        key={idx}
                                        label={item}
                                        size="small"
                                        onDelete={() => {
                                            setLineageFormData({
                                                ...lineageFormData,
                                                startingItems: (lineageFormData.startingItems || []).filter((_, i) => i !== idx)
                                            })
                                        }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Novo item..."
                                    value={newItem}
                                    onChange={(e) => setNewItem(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newItem.trim()) {
                                            setLineageFormData({
                                                ...lineageFormData,
                                                startingItems: [ ...(lineageFormData.startingItems || []), newItem.trim() ]
                                            })
                                            setNewItem('')
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={() => {
                                        if (newItem.trim()) {
                                            setLineageFormData({
                                                ...lineageFormData,
                                                startingItems: [ ...(lineageFormData.startingItems || []), newItem.trim() ]
                                            })
                                            setNewItem('')
                                        }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </Grid>

                        {/* Proficiências */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                                Proficiências
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(lineageFormData.proficiencies || []).map((prof, idx) => (
                                    <Chip
                                        key={idx}
                                        label={prof}
                                        size="small"
                                        onDelete={() => {
                                            setLineageFormData({
                                                ...lineageFormData,
                                                proficiencies: (lineageFormData.proficiencies || []).filter((_, i) => i !== idx)
                                            })
                                        }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Nova proficiência..."
                                    value={newProficiency}
                                    onChange={(e) => setNewProficiency(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newProficiency.trim()) {
                                            setLineageFormData({
                                                ...lineageFormData,
                                                proficiencies: [ ...(lineageFormData.proficiencies || []), newProficiency.trim() ]
                                            })
                                            setNewProficiency('')
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={() => {
                                        if (newProficiency.trim()) {
                                            setLineageFormData({
                                                ...lineageFormData,
                                                proficiencies: [ ...(lineageFormData.proficiencies || []), newProficiency.trim() ]
                                            })
                                            setNewProficiency('')
                                        }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </Grid>

                        {/* Idiomas */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                                Idiomas
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(lineageFormData.languages || []).map((lang, idx) => (
                                    <Chip
                                        key={idx}
                                        label={lang}
                                        size="small"
                                        onDelete={() => {
                                            setLineageFormData({
                                                ...lineageFormData,
                                                languages: (lineageFormData.languages || []).filter((_, i) => i !== idx)
                                            })
                                        }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Novo idioma..."
                                    value={newLanguage}
                                    onChange={(e) => setNewLanguage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newLanguage.trim()) {
                                            setLineageFormData({
                                                ...lineageFormData,
                                                languages: [ ...(lineageFormData.languages || []), newLanguage.trim() ]
                                            })
                                            setNewLanguage('')
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={() => {
                                        if (newLanguage.trim()) {
                                            setLineageFormData({
                                                ...lineageFormData,
                                                languages: [ ...(lineageFormData.languages || []), newLanguage.trim() ]
                                            })
                                            setNewLanguage('')
                                        }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLineageDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveLineage} disabled={!lineageFormData.name.trim()}>
                        {editingLineage ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Skill Dialog */}
            <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSkill ? `Editar ${conceptNames.skill}` : `Nova ${conceptNames.skill}`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={skillFormData.name}
                                onChange={(e) => setSkillFormData({ ...skillFormData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Descrição"
                                value={skillFormData.description}
                                onChange={(e) => setSkillFormData({ ...skillFormData, description: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSkillDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveSkill} disabled={!skillFormData.name.trim()}>
                        {editingSkill ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
