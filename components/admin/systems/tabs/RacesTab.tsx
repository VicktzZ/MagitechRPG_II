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
import type { RPGSystem, SystemRace, SystemSkill } from '@models/entities'

interface RacesTabProps {
    system: Partial<RPGSystem>
    updateSystem: <K extends keyof RPGSystem>(key: K, value: RPGSystem[K]) => void
}

const emptyRace: SystemRace = {
    key: '',
    name: '',
    description: '',
    skills: [],
    attributeModifiers: {},
    size: 'Médio',
    speed: 30,
    darkvision: 0,
    languages: [],
    traits: []
}

const emptySkill: SystemSkill = {
    id: '',
    name: '',
    description: '',
    type: 'Raça',
    origin: ''
}

export function RacesTab({ system, updateSystem }: RacesTabProps) {
    const [ raceDialogOpen, setRaceDialogOpen ] = useState(false)
    const [ skillDialogOpen, setSkillDialogOpen ] = useState(false)
    const [ editingRace, setEditingRace ] = useState<SystemRace | null>(null)
    const [ editingSkill, setEditingSkill ] = useState<{ skill: SystemSkill, raceKey: string } | null>(null)
    const [ raceFormData, setRaceFormData ] = useState<SystemRace>(emptyRace)
    const [ skillFormData, setSkillFormData ] = useState<SystemSkill>(emptySkill)
    const [ skillRaceKey, setSkillRaceKey ] = useState<string>('')
    const [ newLanguage, setNewLanguage ] = useState('')
    const [ newTrait, setNewTrait ] = useState('')

    const races = system.races || []
    const attributes = system.attributes || []
    const conceptNames = system.conceptNames || { race: 'Raça', skill: 'Habilidade' }

    const handleOpenRaceDialog = (race?: SystemRace) => {
        if (race) {
            setEditingRace(race)
            setRaceFormData(race)
        } else {
            setEditingRace(null)
            setRaceFormData({ ...emptyRace, key: uuidv4() })
        }
        setRaceDialogOpen(true)
    }

    const handleSaveRace = () => {
        if (!raceFormData.name.trim()) return

        let newRaces: SystemRace[]
        
        if (editingRace) {
            newRaces = races.map(race => 
                race.key === editingRace.key ? raceFormData : race
            )
        } else {
            newRaces = [ ...races, raceFormData ]
        }

        updateSystem('races', newRaces)
        setRaceDialogOpen(false)
        setEditingRace(null)
        setRaceFormData(emptyRace)
    }

    const handleDeleteRace = (key: string) => {
        const newRaces = races.filter(race => race.key !== key)
        updateSystem('races', newRaces)
    }

    const handleOpenSkillDialog = (raceKey: string, skill?: SystemSkill) => {
        setSkillRaceKey(raceKey)
        
        if (skill) {
            setEditingSkill({ skill, raceKey })
            setSkillFormData(skill)
        } else {
            setEditingSkill(null)
            const raceName = races.find(r => r.key === raceKey)?.name
            setSkillFormData({ 
                ...emptySkill, 
                id: uuidv4(), 
                origin: raceName || '',
                type: conceptNames.race
            })
        }
        setSkillDialogOpen(true)
    }

    const handleSaveSkill = () => {
        if (!skillFormData.name.trim()) return

        const newRaces = races.map(race => {
            if (race.key === skillRaceKey) {
                let newSkills: SystemSkill[]
                if (editingSkill) {
                    newSkills = race.skills.map(s => s.id === editingSkill.skill.id ? skillFormData : s)
                } else {
                    newSkills = [ ...race.skills, skillFormData ]
                }
                return { ...race, skills: newSkills }
            }
            return race
        })
        
        updateSystem('races', newRaces)
        setSkillDialogOpen(false)
        setEditingSkill(null)
        setSkillFormData(emptySkill)
    }

    const handleDeleteSkill = (raceKey: string, skillId: string) => {
        const newRaces = races.map(race => {
            if (race.key === raceKey) {
                return { ...race, skills: race.skills.filter(s => s.id !== skillId) }
            }
            return race
        })
        updateSystem('races', newRaces)
    }

    const handleAttributeModifierChange = (attrKey: string, value: string) => {
        const numValue = parseInt(value) || 0
        const newModifiers = { ...raceFormData.attributeModifiers }
        
        if (numValue === 0) {
            delete newModifiers[attrKey]
        } else {
            newModifiers[attrKey] = numValue
        }
        
        setRaceFormData({ ...raceFormData, attributeModifiers: newModifiers })
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" gutterBottom>
                        {conceptNames.race}s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure as {conceptNames.race.toLowerCase()}s/espécies disponíveis com modificadores, traços e {conceptNames.skill.toLowerCase()}s.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenRaceDialog()}
                >
                    Nova {conceptNames.race}
                </Button>
            </Box>

            {races.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                        Nenhuma {conceptNames.race.toLowerCase()} configurada.
                    </Typography>
                </Paper>
            ) : (
                races.map((race) => (
                    <Accordion key={race.key} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                                <Typography variant="h6">{race.name}</Typography>
                                <Chip label={`${race.skills.length} ${conceptNames.skill.toLowerCase()}s`} size="small" />
                                {race.size && <Chip label={race.size} size="small" variant="outlined" />}
                                {race.speed && <Chip label={`${race.speed}m`} size="small" variant="outlined" />}
                                <Box sx={{ flexGrow: 1 }} />
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => { e.stopPropagation(); handleOpenRaceDialog(race) }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteRace(race.key) }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            {race.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {race.description}
                                </Typography>
                            )}

                            {/* Modificadores de Atributos */}
                            {Object.keys(race.attributeModifiers || {}).length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                        Modificadores de Atributos:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {Object.entries(race.attributeModifiers || {}).map(([ key, value ]) => {
                                            const attr = attributes.find(a => a.key === key)
                                            return (
                                                <Chip 
                                                    key={key}
                                                    label={`${attr?.abbreviation || key}: ${value > 0 ? '+' : ''}${value}`}
                                                    size="small"
                                                    color={value > 0 ? 'success' : 'error'}
                                                />
                                            )
                                        })}
                                    </Box>
                                </Box>
                            )}

                            {/* Traços */}
                            {(race.traits || []).length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                        Traços:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {(race.traits || []).map((trait, idx) => (
                                            <Chip key={idx} label={trait} size="small" variant="outlined" />
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
                                        onClick={() => handleOpenSkillDialog(race.key)}
                                    >
                                        Adicionar
                                    </Button>
                                </Box>
                                <List dense>
                                    {race.skills.map((skill) => (
                                        <ListItem key={skill.id}>
                                            <ListItemText 
                                                primary={skill.name}
                                                secondary={skill.description}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton size="small" onClick={() => handleOpenSkillDialog(race.key, skill)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteSkill(race.key, skill.id!)}>
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

            {/* Race Dialog */}
            <Dialog open={raceDialogOpen} onClose={() => setRaceDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingRace ? `Editar ${conceptNames.race}` : `Nova ${conceptNames.race}`}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Nome"
                                value={raceFormData.name}
                                onChange={(e) => setRaceFormData({ ...raceFormData, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Tamanho"
                                value={raceFormData.size || ''}
                                onChange={(e) => setRaceFormData({ ...raceFormData, size: e.target.value })}
                                placeholder="Médio"
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Velocidade"
                                value={raceFormData.speed || 30}
                                onChange={(e) => setRaceFormData({ ...raceFormData, speed: parseInt(e.target.value) || 30 })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Descrição"
                                value={raceFormData.description}
                                onChange={(e) => setRaceFormData({ ...raceFormData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Visão no Escuro (metros)"
                                value={raceFormData.darkvision || 0}
                                onChange={(e) => setRaceFormData({ ...raceFormData, darkvision: parseInt(e.target.value) || 0 })}
                            />
                        </Grid>

                        {/* Modificadores de Atributos */}
                        {attributes.length > 0 && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Modificadores de Atributos
                                    </Typography>
                                </Grid>
                                {attributes.map((attr) => (
                                    <Grid item xs={6} sm={4} md={2} key={attr.key}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label={attr.abbreviation}
                                            value={raceFormData.attributeModifiers?.[attr.key] || ''}
                                            onChange={(e) => handleAttributeModifierChange(attr.key, e.target.value)}
                                            inputProps={{ min: -10, max: 10 }}
                                        />
                                    </Grid>
                                ))}
                            </>
                        )}

                        {/* Idiomas */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                Idiomas
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(raceFormData.languages || []).map((lang, idx) => (
                                    <Chip
                                        key={idx}
                                        label={lang}
                                        size="small"
                                        onDelete={() => {
                                            setRaceFormData({
                                                ...raceFormData,
                                                languages: (raceFormData.languages || []).filter((_, i) => i !== idx)
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
                                            setRaceFormData({
                                                ...raceFormData,
                                                languages: [ ...(raceFormData.languages || []), newLanguage.trim() ]
                                            })
                                            setNewLanguage('')
                                        }
                                    }}
                                />
                                <IconButton onClick={() => {
                                    if (newLanguage.trim()) {
                                        setRaceFormData({
                                            ...raceFormData,
                                            languages: [ ...(raceFormData.languages || []), newLanguage.trim() ]
                                        })
                                        setNewLanguage('')
                                    }
                                }}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </Grid>

                        {/* Traços */}
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                Traços Raciais
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(raceFormData.traits || []).map((trait, idx) => (
                                    <Chip
                                        key={idx}
                                        label={trait}
                                        size="small"
                                        onDelete={() => {
                                            setRaceFormData({
                                                ...raceFormData,
                                                traits: (raceFormData.traits || []).filter((_, i) => i !== idx)
                                            })
                                        }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Novo traço..."
                                    value={newTrait}
                                    onChange={(e) => setNewTrait(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newTrait.trim()) {
                                            setRaceFormData({
                                                ...raceFormData,
                                                traits: [ ...(raceFormData.traits || []), newTrait.trim() ]
                                            })
                                            setNewTrait('')
                                        }
                                    }}
                                />
                                <IconButton onClick={() => {
                                    if (newTrait.trim()) {
                                        setRaceFormData({
                                            ...raceFormData,
                                            traits: [ ...(raceFormData.traits || []), newTrait.trim() ]
                                        })
                                        setNewTrait('')
                                    }
                                }}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRaceDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveRace} disabled={!raceFormData.name.trim()}>
                        {editingRace ? 'Salvar' : 'Adicionar'}
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
