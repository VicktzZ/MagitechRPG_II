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
    ListItemSecondaryAction,
    FormControlLabel,
    Switch,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { v4 as uuidv4 } from 'uuid'
import AddItemModal from '@layout/AddItemModal'
import { defaultWeapons } from '@constants/defaultWeapons'
import { defaultArmors } from '@constants/defaultArmors'
import { defaultItems } from '@constants/defaultItems'
import type { Armor, Item, Weapon } from '@models'
import type { RPGSystem, SystemClass, SystemSubclass, SystemSkill } from '@models/entities'

type GrantCategory = 'weapons' | 'armors' | 'items'

const grantCategoryLabels: Record<GrantCategory, string> = {
    weapons: 'Arma',
    armors: 'Armadura',
    items: 'Item'
}

const emptyGrantedItems = (): NonNullable<SystemClass['grantedItems']> => ({
    weapons: [],
    armors: [],
    items: []
})

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
    const attributes = system.attributes || []
    const expertises = system.expertises || []

    // ── Concessões de itens da classe ──
    const [ grantCategory, setGrantCategory ] = useState<GrantCategory>('weapons')
    const [ grantItemName, setGrantItemName ] = useState<string>('')
    const [ createItemModalOpen, setCreateItemModalOpen ] = useState(false)

    // Catálogo disponível: itens base da aplicação + itens criados para o sistema
    const catalogByCategory: Record<GrantCategory, Array<Partial<Weapon> | Partial<Armor> | Partial<Item>>> = {
        weapons: [ ...Object.values(defaultWeapons).flat(), ...(system.customItems?.weapons ?? []) ],
        armors: [ ...Object.values(defaultArmors).flat(), ...(system.customItems?.armors ?? []) ],
        items: [ ...Object.values(defaultItems).flat(), ...(system.customItems?.items ?? []) ]
    }

    const grantedItems = classFormData.grantedItems ?? emptyGrantedItems()

    const addGrantedItem = () => {
        if (!grantItemName.trim()) return
        const found = catalogByCategory[grantCategory].find(i => i.name === grantItemName)
        if (!found) return
        setClassFormData({
            ...classFormData,
            grantedItems: {
                ...emptyGrantedItems(),
                ...grantedItems,
                [grantCategory]: [ ...grantedItems[grantCategory], found ]
            }
        })
        setGrantItemName('')
    }

    const removeGrantedItem = (category: GrantCategory, idx: number) => {
        setClassFormData({
            ...classFormData,
            grantedItems: {
                ...emptyGrantedItems(),
                ...grantedItems,
                [category]: grantedItems[category].filter((_, i) => i !== idx)
            }
        })
    }

    // Cria um item novo: entra no catálogo do sistema E na concessão da classe
    const handleCreateSystemItem = (created: Weapon | Armor | Item) => {
        const isWeapon = (it: any): it is Weapon => it && 'hit' in it && 'effect' in it && 'ammo' in it
        const isArmor = (it: any): it is Armor => it && 'displacementPenalty' in it && 'value' in it && 'categ' in it
        const category: GrantCategory = isWeapon(created) ? 'weapons' : isArmor(created) ? 'armors' : 'items'

        const customItems = {
            weapons: [ ...(system.customItems?.weapons ?? []) ],
            armors: [ ...(system.customItems?.armors ?? []) ],
            items: [ ...(system.customItems?.items ?? []) ]
        }
        customItems[category] = [ ...customItems[category], created as any ]
        updateSystem('customItems', customItems)

        setClassFormData({
            ...classFormData,
            grantedItems: {
                ...emptyGrantedItems(),
                ...grantedItems,
                [category]: [ ...grantedItems[category], created as any ]
            }
        })
        setCreateItemModalOpen(false)
    }

    const handleGrantBonusChange = (
        field: 'attributeBonus' | 'expertiseBonus',
        key: string,
        rawValue: string
    ) => {
        const numValue = parseInt(rawValue) || 0
        const bonus = Object.fromEntries(
            Object.entries(classFormData[field] ?? {}).filter(([ k ]) => k !== key)
        )
        if (numValue !== 0) bonus[key] = numValue
        setClassFormData({ ...classFormData, [field]: bonus })
    }

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

                        {/* ── Concessões ao escolher a classe ── */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle1" fontWeight={600}>
                                Concessões ao escolher a {conceptNames.class}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Pontos, bônus e itens aplicados automaticamente na criação da ficha.
                                Todos os campos são independentes e opcionais.
                            </Typography>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Pts de Perícia"
                                value={classFormData.expertisePoints ?? 0}
                                onChange={(e) => setClassFormData({
                                    ...classFormData,
                                    expertisePoints: parseInt(e.target.value) || 0
                                })}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Pts de Atributo"
                                value={classFormData.attributePoints ?? 0}
                                onChange={(e) => setClassFormData({
                                    ...classFormData,
                                    attributePoints: parseInt(e.target.value) || 0
                                })}
                                inputProps={{ min: 0 }}
                            />
                        </Grid>

                        {attributes.length > 0 && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">Bônus de Atributos</Typography>
                                </Grid>
                                {attributes.map(attr => (
                                    <Grid item xs={6} sm={4} md={2} key={attr.key}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label={attr.abbreviation}
                                            value={classFormData.attributeBonus?.[attr.key] || ''}
                                            onChange={(e) => handleGrantBonusChange('attributeBonus', attr.key, e.target.value)}
                                            inputProps={{ min: -10, max: 10 }}
                                        />
                                    </Grid>
                                ))}
                            </>
                        )}

                        {expertises.length > 0 && (
                            <>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">Bônus de Perícias</Typography>
                                </Grid>
                                {expertises.map(exp => (
                                    <Grid item xs={6} sm={4} md={2} key={exp.key}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="number"
                                            label={exp.name.substring(0, 12)}
                                            value={classFormData.expertiseBonus?.[exp.key] || ''}
                                            onChange={(e) => handleGrantBonusChange('expertiseBonus', exp.key, e.target.value)}
                                            inputProps={{ min: -10, max: 10 }}
                                        />
                                    </Grid>
                                ))}
                            </>
                        )}

                        {/* Itens concedidos */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Itens Iniciais</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {(Object.keys(grantedItems) as GrantCategory[]).flatMap(cat =>
                                    grantedItems[cat].map((item, idx) => (
                                        <Chip
                                            key={`${cat}-${idx}`}
                                            label={`${grantCategoryLabels[cat]}: ${item.name}`}
                                            size="small"
                                            onDelete={() => removeGrantedItem(cat, idx)}
                                        />
                                    ))
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                    <InputLabel>Categoria</InputLabel>
                                    <Select
                                        value={grantCategory}
                                        label="Categoria"
                                        onChange={(e) => {
                                            setGrantCategory(e.target.value as GrantCategory)
                                            setGrantItemName('')
                                        }}
                                    >
                                        <MenuItem value="weapons">Arma</MenuItem>
                                        <MenuItem value="armors">Armadura</MenuItem>
                                        <MenuItem value="items">Item</MenuItem>
                                    </Select>
                                </FormControl>
                                <Autocomplete
                                    size="small"
                                    sx={{ minWidth: 240, flex: 1 }}
                                    options={catalogByCategory[grantCategory].map(i => i.name ?? '').filter(Boolean)}
                                    value={grantItemName || null}
                                    onChange={(_, value) => setGrantItemName(value ?? '')}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Buscar item existente..." />
                                    )}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={addGrantedItem}
                                    disabled={!grantItemName.trim()}
                                    startIcon={<AddIcon />}
                                >
                                    Adicionar
                                </Button>
                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={() => setCreateItemModalOpen(true)}
                                >
                                    Criar novo item
                                </Button>
                            </Box>
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

            {/* Modal de criação de item customizado do sistema */}
            <AddItemModal
                modalOpen={createItemModalOpen}
                setModalOpen={setCreateItemModalOpen}
                disableDefaultCreate
                title="Criar Item do Sistema"
                onConfirm={handleCreateSystemItem}
            />
        </Box>
    )
}
