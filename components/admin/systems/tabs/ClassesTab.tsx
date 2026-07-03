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
    ListItemSecondaryAction,
    FormControlLabel,
    Switch
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { v4 as uuidv4 } from 'uuid'
import type { RPGSystem, SystemClass, SystemSubclass, SystemSkill } from '@models/entities'

interface ClassesTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptyClass: SystemClass = {
    key: '',
    name: '',
    description: '',
    skills: [],
    hitDice: '1d10',
    baseHealth: 10,
    healthPerLevel: 5,
    proficiencies: [],
    savingThrows: [],
    startingEquipment: [],
    spellcasting: { enabled: false }
}

const emptySubclass: SystemSubclass = {
    key: '',
    name: '',
    parentClass: '',
    description: '',
    skills: [],
    unlockLevel: 3
}

const emptySkill: SystemSkill = {
    id: '',
    name: '',
    description: '',
    type: 'Classe',
    origin: '',
    level: 0
}

export function ClassesTab({ system, updateSystem }: ClassesTabProps) {
    const [ classDialogOpen, setClassDialogOpen ] = useState(false)
    const [ subclassDialogOpen, setSubclassDialogOpen ] = useState(false)
    const [ skillDialogOpen, setSkillDialogOpen ] = useState(false)
    const [ editingClass, setEditingClass ] = useState<SystemClass | null>(null)
    const [ editingSubclass, setEditingSubclass ] = useState<SystemSubclass | null>(null)
    const [ editingSkill, setEditingSkill ] = useState<{ skill: SystemSkill, parentKey: string, isSubclass: boolean } | null>(null)
    const [ classFormData, setClassFormData ] = useState<SystemClass>(emptyClass)
    const [ subclassFormData, setSubclassFormData ] = useState<SystemSubclass>(emptySubclass)
    const [ skillFormData, setSkillFormData ] = useState<SystemSkill>(emptySkill)
    const [ skillParentKey, setSkillParentKey ] = useState<string>('')
    const [ skillIsSubclass, setSkillIsSubclass ] = useState<boolean>(false)

    const classes = system.classes || []
    const subclasses = system.subclasses || []
    const conceptNames = system.conceptNames || { class: 'Classe', subclass: 'Subclasse', skill: 'Habilidade' }

    // Class handlers
    const handleOpenClassDialog = (cls?: SystemClass) => {
        if (cls) {
            setEditingClass(cls)
            setClassFormData(cls)
        } else {
            setEditingClass(null)
            setClassFormData({ ...emptyClass, key: uuidv4() })
        }
        setClassDialogOpen(true)
    }

    const handleSaveClass = () => {
        if (!classFormData.name.trim()) return

        let newClasses: SystemClass[]
        
        if (editingClass) {
            newClasses = classes.map(cls => 
                cls.key === editingClass.key ? classFormData : cls
            )
        } else {
            newClasses = [ ...classes, classFormData ]
        }

        updateSystem('classes', newClasses)
        setClassDialogOpen(false)
        setEditingClass(null)
        setClassFormData(emptyClass)
    }

    const handleDeleteClass = (key: string) => {
        const newClasses = classes.filter(cls => cls.key !== key)
        const newSubclasses = subclasses.filter(sub => sub.parentClass !== key)
        updateSystem('classes', newClasses)
        updateSystem('subclasses', newSubclasses)
    }

    // Subclass handlers
    const handleOpenSubclassDialog = (parentClassKey: string, sub?: SystemSubclass) => {
        if (sub) {
            setEditingSubclass(sub)
            setSubclassFormData(sub)
        } else {
            setEditingSubclass(null)
            setSubclassFormData({ ...emptySubclass, key: uuidv4(), parentClass: parentClassKey })
        }
        setSubclassDialogOpen(true)
    }

    const handleSaveSubclass = () => {
        if (!subclassFormData.name.trim()) return

        let newSubclasses: SystemSubclass[]
        
        if (editingSubclass) {
            newSubclasses = subclasses.map(sub => 
                sub.key === editingSubclass.key ? subclassFormData : sub
            )
        } else {
            newSubclasses = [ ...subclasses, subclassFormData ]
        }

        updateSystem('subclasses', newSubclasses)
        setSubclassDialogOpen(false)
        setEditingSubclass(null)
        setSubclassFormData(emptySubclass)
    }

    const handleDeleteSubclass = (key: string) => {
        const newSubclasses = subclasses.filter(sub => sub.key !== key)
        updateSystem('subclasses', newSubclasses)
    }

    // Skill handlers
    const handleOpenSkillDialog = (parentKey: string, isSubclass: boolean, skill?: SystemSkill) => {
        setSkillParentKey(parentKey)
        setSkillIsSubclass(isSubclass)
        
        if (skill) {
            setEditingSkill({ skill, parentKey, isSubclass })
            setSkillFormData(skill)
        } else {
            setEditingSkill(null)
            const parentName = isSubclass 
                ? subclasses.find(s => s.key === parentKey)?.name 
                : classes.find(c => c.key === parentKey)?.name
            setSkillFormData({ 
                ...emptySkill, 
                id: uuidv4(), 
                origin: parentName || '',
                type: isSubclass ? conceptNames.subclass : conceptNames.class
            })
        }
        setSkillDialogOpen(true)
    }

    const handleSaveSkill = () => {
        if (!skillFormData.name.trim()) return

        if (skillIsSubclass) {
            const newSubclasses = subclasses.map(sub => {
                if (sub.key === skillParentKey) {
                    let newSkills: SystemSkill[]
                    if (editingSkill) {
                        newSkills = sub.skills.map(s => s.id === editingSkill.skill.id ? skillFormData : s)
                    } else {
                        newSkills = [ ...sub.skills, skillFormData ]
                    }
                    return { ...sub, skills: newSkills }
                }
                return sub
            })
            updateSystem('subclasses', newSubclasses)
        } else {
            const newClasses = classes.map(cls => {
                if (cls.key === skillParentKey) {
                    let newSkills: SystemSkill[]
                    if (editingSkill) {
                        newSkills = cls.skills.map(s => s.id === editingSkill.skill.id ? skillFormData : s)
                    } else {
                        newSkills = [ ...cls.skills, skillFormData ]
                    }
                    return { ...cls, skills: newSkills }
                }
                return cls
            })
            updateSystem('classes', newClasses)
        }

        setSkillDialogOpen(false)
        setEditingSkill(null)
        setSkillFormData(emptySkill)
    }

    const handleDeleteSkill = (parentKey: string, isSubclass: boolean, skillId: string) => {
        if (isSubclass) {
            const newSubclasses = subclasses.map(sub => {
                if (sub.key === parentKey) {
                    return { ...sub, skills: sub.skills.filter(s => s.id !== skillId) }
                }
                return sub
            })
            updateSystem('subclasses', newSubclasses)
        } else {
            const newClasses = classes.map(cls => {
                if (cls.key === parentKey) {
                    return { ...cls, skills: cls.skills.filter(s => s.id !== skillId) }
                }
                return cls
            })
            updateSystem('classes', newClasses)
        }
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        {conceptNames.class}s e {conceptNames.subclass}s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure as {conceptNames.class.toLowerCase()}s disponíveis e suas {conceptNames.subclass.toLowerCase()}s, com {conceptNames.skill.toLowerCase()}s por nível.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenClassDialog()}
                >
                    Nova {conceptNames.class}
                </Button>
            </Box>

            {classes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Nenhuma {conceptNames.class.toLowerCase()} configurada. Clique em &quot;Nova {conceptNames.class}&quot; para adicionar.
                    </Typography>
                </Paper>
            ) : (
                classes.map((cls) => {
                    const classSubclasses = subclasses.filter(sub => sub.parentClass === cls.key)
                    
                    return (
                        <Accordion key={cls.key} sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                                    <Typography variant="h6">{cls.name}</Typography>
                                    <Chip label={`${cls.skills.length} ${conceptNames.skill.toLowerCase()}s`} size="small" />
                                    <Chip label={`${classSubclasses.length} ${conceptNames.subclass.toLowerCase()}s`} size="small" variant="outlined" />
                                    {cls.spellcasting?.enabled && <Chip label="Conjurador" size="small" color="secondary" />}
                                    <Box sx={{ flexGrow: 1 }} />
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => { e.stopPropagation(); handleOpenClassDialog(cls) }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.key) }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {cls.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {cls.description}
                                    </Typography>
                                )}

                                {/* Detalhes da Classe */}
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    {cls.hitDice && <Chip label={`Dado de Vida: ${cls.hitDice}`} size="small" variant="outlined" />}
                                    {cls.baseHealth && <Chip label={`Vida Base: ${cls.baseHealth}`} size="small" variant="outlined" />}
                                    {cls.healthPerLevel && <Chip label={`Vida/Nível: +${cls.healthPerLevel}`} size="small" variant="outlined" />}
                                </Box>

                                {/* Habilidades da Classe */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {conceptNames.skill}s
                                        </Typography>
                                        <Button 
                                            size="small" 
                                            startIcon={<AddIcon />}
                                            onClick={() => handleOpenSkillDialog(cls.key, false)}
                                        >
                                            Adicionar
                                        </Button>
                                    </Box>
                                    <List dense>
                                        {cls.skills.map((skill) => (
                                            <ListItem key={skill.id}>
                                                <ListItemText 
                                                    primary={`Nv.${skill.level || 0}: ${skill.name}`}
                                                    secondary={skill.description}
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton size="small" onClick={() => handleOpenSkillDialog(cls.key, false, skill)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteSkill(cls.key, false, skill.id!)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Subclasses */}
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {conceptNames.subclass}s
                                        </Typography>
                                        <Button 
                                            size="small" 
                                            startIcon={<AddIcon />}
                                            onClick={() => handleOpenSubclassDialog(cls.key)}
                                        >
                                            Adicionar {conceptNames.subclass}
                                        </Button>
                                    </Box>
                                    <Grid container spacing={2}>
                                        {classSubclasses.map((sub) => (
                                            <Grid item xs={12} md={6} key={sub.key}>
                                                <Paper sx={{ p: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={600}>
                                                                {sub.name}
                                                            </Typography>
                                                            {sub.unlockLevel && (
                                                                <Chip label={`Nível ${sub.unlockLevel}`} size="small" sx={{ mt: 0.5 }} />
                                                            )}
                                                        </Box>
                                                        <Box>
                                                            <IconButton size="small" onClick={() => handleOpenSubclassDialog(cls.key, sub)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" color="error" onClick={() => handleDeleteSubclass(sub.key)}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                    <Button 
                                                        size="small" 
                                                        startIcon={<AddIcon />}
                                                        onClick={() => handleOpenSkillDialog(sub.key, true)}
                                                    >
                                                        Add {conceptNames.skill} ({sub.skills.length})
                                                    </Button>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    )
                })
            )}

            {/* Class Dialog */}
            <Dialog open={classDialogOpen} onClose={() => setClassDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingClass ? `Editar ${conceptNames.class}` : `Nova ${conceptNames.class}`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={classFormData.name}
                                onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Dado de Vida"
                                value={classFormData.hitDice || ''}
                                onChange={(e) => setClassFormData({ ...classFormData, hitDice: e.target.value })}
                                placeholder="Ex: 1d10"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Descrição"
                                value={classFormData.description}
                                onChange={(e) => setClassFormData({ ...classFormData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Vida Base"
                                value={classFormData.baseHealth || 10}
                                onChange={(e) => setClassFormData({ ...classFormData, baseHealth: parseInt(e.target.value) || 10 })}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Vida por Nível"
                                value={classFormData.healthPerLevel || 5}
                                onChange={(e) => setClassFormData({ ...classFormData, healthPerLevel: parseInt(e.target.value) || 5 })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={classFormData.spellcasting?.enabled || false}
                                        onChange={(e) => setClassFormData({ 
                                            ...classFormData, 
                                            spellcasting: { ...classFormData.spellcasting, enabled: e.target.checked } 
                                        })}
                                    />
                                }
                                label="É Conjurador"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClassDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveClass} disabled={!classFormData.name.trim()}>
                        {editingClass ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Subclass Dialog */}
            <Dialog open={subclassDialogOpen} onClose={() => setSubclassDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSubclass ? `Editar ${conceptNames.subclass}` : `Nova ${conceptNames.subclass}`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={subclassFormData.name}
                                onChange={(e) => setSubclassFormData({ ...subclassFormData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Nível de Desbloqueio"
                                value={subclassFormData.unlockLevel || 3}
                                onChange={(e) => setSubclassFormData({ ...subclassFormData, unlockLevel: parseInt(e.target.value) || 3 })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Descrição"
                                value={subclassFormData.description || ''}
                                onChange={(e) => setSubclassFormData({ ...subclassFormData, description: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSubclassDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveSubclass} disabled={!subclassFormData.name.trim()}>
                        {editingSubclass ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Skill Dialog */}
            <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSkill ? `Editar ${conceptNames.skill}` : `Nova ${conceptNames.skill}`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={skillFormData.name}
                                onChange={(e) => setSkillFormData({ ...skillFormData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Nível"
                                value={skillFormData.level || 0}
                                onChange={(e) => setSkillFormData({ ...skillFormData, level: parseInt(e.target.value) || 0 })}
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
