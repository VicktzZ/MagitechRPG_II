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
import type { RPGSystem, SystemOccupation, SystemSkill } from '@models/entities'

interface OccupationsTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptyOccupation: SystemOccupation = {
    key: '',
    name: '',
    conceptName: 'Profissão',
    description: '',
    skills: [],
    expertiseBonus: {},
    startingItems: [],
    startingMoney: 0,
    proficiencies: []
}

const emptySkill: SystemSkill = {
    id: '',
    name: '',
    description: '',
    type: 'Profissão',
    origin: ''
}

export function OccupationsTab({ system, updateSystem }: OccupationsTabProps) {
    const [ occupationDialogOpen, setOccupationDialogOpen ] = useState(false)
    const [ skillDialogOpen, setSkillDialogOpen ] = useState(false)
    const [ editingOccupation, setEditingOccupation ] = useState<SystemOccupation | null>(null)
    const [ editingSkill, setEditingSkill ] = useState<{ skill: SystemSkill, occupationKey: string } | null>(null)
    const [ occupationFormData, setOccupationFormData ] = useState<SystemOccupation>(emptyOccupation)
    const [ skillFormData, setSkillFormData ] = useState<SystemSkill>(emptySkill)
    const [ skillOccupationKey, setSkillOccupationKey ] = useState<string>('')
    const [ newItem, setNewItem ] = useState('')
    const [ newProficiency, setNewProficiency ] = useState('')

    const occupations = system.occupations || []
    const expertises = system.expertises || []
    const conceptNames = system.conceptNames || { occupation: 'Profissão', skill: 'Habilidade' }
    const occupationLabel = conceptNames.occupation || 'Profissão'
    const skillLabel = conceptNames.skill || 'Habilidade'

    const handleOpenOccupationDialog = (occupation?: SystemOccupation) => {
        if (occupation) {
            setEditingOccupation(occupation)
            setOccupationFormData(occupation)
        } else {
            setEditingOccupation(null)
            setOccupationFormData({ ...emptyOccupation, key: uuidv4(), conceptName: occupationLabel })
        }
        setOccupationDialogOpen(true)
    }

    const handleSaveOccupation = () => {
        if (!occupationFormData.name.trim()) return

        let newOccupations: SystemOccupation[]

        if (editingOccupation) {
            newOccupations = occupations.map(occ =>
                occ.key === editingOccupation.key ? occupationFormData : occ
            )
        } else {
            newOccupations = [ ...occupations, occupationFormData ]
        }

        updateSystem('occupations', newOccupations)
        setOccupationDialogOpen(false)
        setEditingOccupation(null)
        setOccupationFormData(emptyOccupation)
    }

    const handleDeleteOccupation = (key: string) => {
        const newOccupations = occupations.filter(occ => occ.key !== key)
        updateSystem('occupations', newOccupations)
    }

    const handleOpenSkillDialog = (occupationKey: string, skill?: SystemSkill) => {
        setSkillOccupationKey(occupationKey)

        if (skill) {
            setEditingSkill({ skill, occupationKey })
            setSkillFormData(skill)
        } else {
            setEditingSkill(null)
            const occupationName = occupations.find(o => o.key === occupationKey)?.name
            setSkillFormData({
                ...emptySkill,
                id: uuidv4(),
                origin: occupationName || '',
                type: occupationLabel
            })
        }
        setSkillDialogOpen(true)
    }

    const handleSaveSkill = () => {
        if (!skillFormData.name.trim()) return

        const newOccupations = occupations.map(occ => {
            if (occ.key === skillOccupationKey) {
                let newSkills: SystemSkill[]
                if (editingSkill) {
                    newSkills = occ.skills.map(s => s.id === editingSkill.skill.id ? skillFormData : s)
                } else {
                    newSkills = [ ...occ.skills, skillFormData ]
                }
                return { ...occ, skills: newSkills }
            }
            return occ
        })

        updateSystem('occupations', newOccupations)
        setSkillDialogOpen(false)
        setEditingSkill(null)
        setSkillFormData(emptySkill)
    }

    const handleDeleteSkill = (occupationKey: string, skillId: string) => {
        const newOccupations = occupations.map(occ => {
            if (occ.key === occupationKey) {
                return { ...occ, skills: occ.skills.filter(s => s.id !== skillId) }
            }
            return occ
        })
        updateSystem('occupations', newOccupations)
    }

    const handleExpertiseBonusChange = (expKey: string, value: string) => {
        const numValue = parseInt(value) || 0
        const newBonus = Object.fromEntries(
            Object.entries(occupationFormData.expertiseBonus ?? {}).filter(([ key ]) => key !== expKey)
        )

        if (numValue !== 0) {
            newBonus[expKey] = numValue
        }

        setOccupationFormData({ ...occupationFormData, expertiseBonus: newBonus })
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        {occupationLabel}s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure as {occupationLabel.toLowerCase()}s/ocupações disponíveis com bônus de perícias, itens iniciais, dinheiro inicial e {skillLabel.toLowerCase()}s.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenOccupationDialog()}
                >
                    Nova {occupationLabel}
                </Button>
            </Box>

            {occupations.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Nenhuma {occupationLabel.toLowerCase()} configurada. Clique em &quot;Nova {occupationLabel}&quot; para adicionar.
                    </Typography>
                </Paper>
            ) : (
                occupations.map((occupation) => (
                    <Accordion key={occupation.key} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                                <Typography variant="h6">{occupation.name}</Typography>
                                <Chip label={`${occupation.skills.length} ${skillLabel.toLowerCase()}s`} size="small" />
                                {Object.keys(occupation.expertiseBonus || {}).length > 0 && (
                                    <Chip
                                        label={`+${Object.keys(occupation.expertiseBonus || {}).length} perícias`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                )}
                                {(occupation.startingMoney ?? 0) > 0 && (
                                    <Chip
                                        label={`$ ${occupation.startingMoney}`}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                    />
                                )}
                                <Box sx={{ flexGrow: 1 }} />
                                <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); handleOpenOccupationDialog(occupation) }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteOccupation(occupation.key) }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            {occupation.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {occupation.description}
                                </Typography>
                            )}

                            {/* Bônus de Perícias */}
                            {Object.keys(occupation.expertiseBonus || {}).length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                        Bônus de Perícias:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {Object.entries(occupation.expertiseBonus || {}).map(([ key, value ]) => {
                                            const exp = expertises.find(e => e.key === key)
                                            return (
                                                <Chip
                                                    key={key}
                                                    label={`${exp?.name || key}: ${value > 0 ? '+' : ''}${value}`}
                                                    size="small"
                                                    color="primary"
                                                />
                                            )
                                        })}
                                    </Box>
                                </Box>
                            )}

                            {/* Itens Iniciais */}
                            {(occupation.startingItems || []).length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                        Itens Iniciais:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {(occupation.startingItems || []).map((item, idx) => (
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
                                        {skillLabel}s
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleOpenSkillDialog(occupation.key)}
                                    >
                                        Adicionar
                                    </Button>
                                </Box>
                                <List dense>
                                    {occupation.skills.map((skill) => (
                                        <ListItem key={skill.id}>
                                            <ListItemText
                                                primary={skill.name}
                                                secondary={skill.description}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton size="small" onClick={() => handleOpenSkillDialog(occupation.key, skill)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteSkill(occupation.key, skill.id!)}>
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

            {/* Occupation Dialog */}
            <Dialog open={occupationDialogOpen} onClose={() => setOccupationDialogOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>{editingOccupation ? `Editar ${occupationLabel}` : `Nova ${occupationLabel}`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={occupationFormData.name}
                                onChange={(e) => setOccupationFormData({ ...occupationFormData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label={`Nome do Conceito (ex: ${occupationLabel}, Ocupação, Background)`}
                                value={occupationFormData.conceptName}
                                onChange={(e) => setOccupationFormData({ ...occupationFormData, conceptName: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Descrição"
                                value={occupationFormData.description || ''}
                                onChange={(e) => setOccupationFormData({ ...occupationFormData, description: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Dinheiro Inicial"
                                value={occupationFormData.startingMoney ?? 0}
                                onChange={(e) => setOccupationFormData({
                                    ...occupationFormData,
                                    startingMoney: Math.max(0, parseInt(e.target.value) || 0)
                                })}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

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
                                            value={occupationFormData.expertiseBonus?.[exp.key] || ''}
                                            onChange={(e) => handleExpertiseBonusChange(exp.key, e.target.value)}
                                            inputProps={{ min: -10, max: 10 }}
                                        />
                                    </Grid>
                                ))}
                            </>
                        )}

                        {/* Itens Iniciais */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                                Itens Iniciais
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(occupationFormData.startingItems || []).map((item, idx) => (
                                    <Chip
                                        key={idx}
                                        label={item}
                                        size="small"
                                        onDelete={() => {
                                            setOccupationFormData({
                                                ...occupationFormData,
                                                startingItems: (occupationFormData.startingItems || []).filter((_, i) => i !== idx)
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
                                            setOccupationFormData({
                                                ...occupationFormData,
                                                startingItems: [ ...(occupationFormData.startingItems || []), newItem.trim() ]
                                            })
                                            setNewItem('')
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={() => {
                                        if (newItem.trim()) {
                                            setOccupationFormData({
                                                ...occupationFormData,
                                                startingItems: [ ...(occupationFormData.startingItems || []), newItem.trim() ]
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
                                {(occupationFormData.proficiencies || []).map((prof, idx) => (
                                    <Chip
                                        key={idx}
                                        label={prof}
                                        size="small"
                                        onDelete={() => {
                                            setOccupationFormData({
                                                ...occupationFormData,
                                                proficiencies: (occupationFormData.proficiencies || []).filter((_, i) => i !== idx)
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
                                            setOccupationFormData({
                                                ...occupationFormData,
                                                proficiencies: [ ...(occupationFormData.proficiencies || []), newProficiency.trim() ]
                                            })
                                            setNewProficiency('')
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={() => {
                                        if (newProficiency.trim()) {
                                            setOccupationFormData({
                                                ...occupationFormData,
                                                proficiencies: [ ...(occupationFormData.proficiencies || []), newProficiency.trim() ]
                                            })
                                            setNewProficiency('')
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
                    <Button onClick={() => setOccupationDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveOccupation} disabled={!occupationFormData.name.trim()}>
                        {editingOccupation ? 'Salvar' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Skill Dialog */}
            <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSkill ? `Editar ${skillLabel}` : `Nova ${skillLabel}`}</DialogTitle>
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
