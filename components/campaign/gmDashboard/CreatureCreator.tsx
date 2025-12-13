'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import {
    Add,
    Delete,
    Pets as PetsIcon,
    Psychology,
    AutoFixHigh,
    Stars
} from '@mui/icons-material';
import { orange, blue, purple } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import { Expertises, Expertise as ExpertiseModel } from '@models';
import { ResourceListModal } from '@components/utils';
import Magic from '@components/charsheet/subcomponents/Magic';
import { poderService, magiaService } from '@services';
import { elements, specialElements } from '@constants';
import type { Power, Spell } from '@models/entities';

interface CreatureData {
    id?: string;
    name: string;
    description: string;
    level: number;
    attributes: {
        vig: number;
        des: number;
        log: number;
        car: number;
        sab: number;
        foc: number;
    };
    stats: {
        lp: number;
        maxLp: number;
        mp: number;
        maxMp: number;
        ap: number;
    };
    skills: SkillData[];
    spells: SpellData[];
    expertises: Record<string, { value: number; mod: number }>;
}

interface SkillData {
    id: string;
    name: string;
    description: string;
    type: string;
}

interface SpellData {
    id: string;
    name: string;
    description: string;
    level: number;
    element: string;
    cost: number;
}

interface CreatureCreatorProps {
    open: boolean;
    onClose: () => void;
    onSave?: (creature: CreatureData) => void;
    editingCreature?: CreatureData | null;
    readOnly?: boolean;
}

const defaultCreature: CreatureData = {
    name: '',
    description: '',
    level: 1,
    attributes: { vig: 0, des: 0, log: 0, car: 0, sab: 0, foc: 0 },
    stats: { lp: 10, maxLp: 10, mp: 5, maxMp: 5, ap: 0 },
    skills: [],
    spells: [],
    expertises: {}
};

// Lista de perícias baseada diretamente no modelo Expertises,
// garantindo que seja sempre a mesma usada nas fichas
const expertiseList = (() => {
    const expertises = new Expertises();
    return Object.entries(expertises).map(([ name, value ]) => {
        const exp = value as ExpertiseModel;
        return {
            key: name,
            name,
            attr: exp.defaultAttribute ? exp.defaultAttribute.toUpperCase() : '-'
        };
    });
})();

const skillTypes = [
    'Poder Mágico',
    'Classe',
    'Linhagem',
    'Subclasse',
    'Bônus',
    'Profissão',
    'Exclusivo',
    'Raça',
    'Talento'
];

export default function CreatureCreator({ open, onClose, onSave, editingCreature, readOnly }: CreatureCreatorProps) {
    const { campaign } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const isReadOnly = !!readOnly;
    
    const [ creatureData, setCreatureData ] = useState<CreatureData>(editingCreature || defaultCreature);
    const [ activeTab, setActiveTab ] = useState(0);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ baseCreature, setBaseCreature ] = useState<CreatureData | null>(editingCreature || null);
    const [ scalingLevel, setScalingLevel ] = useState<number>(editingCreature?.level || 1);
    const [ scalingPlayers, setScalingPlayers ] = useState<number>(campaign.players?.length || 4);
    const [ skillsModalOpen, setSkillsModalOpen ] = useState(false);
    const [ spellsModalOpen, setSpellsModalOpen ] = useState(false);
    
    // Estados para adicionar skills/spells
    const [ newSkill, setNewSkill ] = useState<Partial<SkillData>>({ name: '', description: '', type: 'Classe' });
    const [ newSpell, setNewSpell ] = useState<Partial<SpellData>>({ name: '', description: '', level: 1, element: 'Arcano', cost: 1 });

    useEffect(() => {
        if (editingCreature) {
            setBaseCreature(editingCreature);
            setCreatureData(editingCreature);
            setScalingLevel(editingCreature.level);
        } else {
            setBaseCreature(null);
            setCreatureData(defaultCreature);
            setScalingLevel(1);
        }

        const defaultPlayers = campaign.players?.length || 4;
        setScalingPlayers(defaultPlayers || 4);
    }, [ editingCreature, open, campaign.id ]);

    const handleSave = async () => {
        if (!creatureData.name.trim()) {
            enqueueSnackbar('Nome da criatura é obrigatório', { variant: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/campaign/${campaign.id}/custom/creatures`, {
                method: creatureData.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creatureData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao salvar criatura');
            }

            enqueueSnackbar(`Criatura "${creatureData.name}" salva com sucesso!`, { variant: 'success' });
            onSave?.(creatureData);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar criatura:', error);
            enqueueSnackbar('Erro ao salvar criatura', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const addSkill = () => {
        if (!newSkill.name?.trim()) return;
        
        const skill: SkillData = {
            id: crypto.randomUUID(),
            name: newSkill.name,
            description: newSkill.description || '',
            type: newSkill.type || 'Classe'
        };
        
        setCreatureData(prev => ({
            ...prev,
            skills: [ ...prev.skills, skill ]
        }));
        setNewSkill({ name: '', description: '', type: 'Classe' });
    };

    const removeSkill = (id: string) => {
        setCreatureData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s.id !== id)
        }));
    };

    const addSpell = () => {
        if (!newSpell.name?.trim()) return;
        
        const spell: SpellData = {
            id: crypto.randomUUID(),
            name: newSpell.name,
            description: newSpell.description || '',
            level: newSpell.level || 1,
            element: newSpell.element || 'Arcano',
            cost: newSpell.cost || 1
        };
        
        setCreatureData(prev => ({
            ...prev,
            spells: [ ...prev.spells, spell ]
        }));
        setNewSpell({ name: '', description: '', level: 1, element: 'Arcano', cost: 1 });
    };

    const removeSpell = (id: string) => {
        setCreatureData(prev => ({
            ...prev,
            spells: prev.spells.filter(s => s.id !== id)
        }));
    };

    const validateAddPowerForCreature = (_power: Power) => ({ isValid: true });

    const handleAddPowerToCreature = async (power: Power) => {
        const skill: SkillData = {
            id: power.id ?? crypto.randomUUID(),
            name: power.name,
            description: power.description || '',
            type: power.type || 'Poder Mágico'
        };

        setCreatureData(prev => {
            const existing = prev.skills.filter(s => s.id !== skill.id);
            return {
                ...prev,
                skills: [ ...existing, skill ]
            };
        });

        return skill;
    };

    const validateAddSpellForCreature = (_spell: Spell) => ({ isValid: true });

    const handleAddSpellToCreature = async (spell: Spell) => {
        const mapped: SpellData = {
            id: spell.id ?? crypto.randomUUID(),
            name: spell.name,
            description: Array.isArray(spell.stages) && spell.stages.length > 0 ? spell.stages[0] : '',
            level: spell.level ?? 1,
            element: spell.element as string,
            cost: spell.mpCost ?? 0
        };

        setCreatureData(prev => {
            const existing = prev.spells.filter(s => s.id !== mapped.id);
            return {
                ...prev,
                spells: [ ...existing, mapped ]
            };
        });

        return mapped;
    };

    const handleApplyScaling = () => {
        if (!baseCreature) return;

        const levelBase = baseCreature.level || 1;
        const levelTarget = Math.max(1, Math.min(30, scalingLevel || levelBase));
        const playersBase = 4;
        const playersTarget = Math.max(1, scalingPlayers || playersBase);

        const levelFactor = levelTarget / levelBase;
        const playersFactor = playersTarget / playersBase;
        let scale = levelFactor * playersFactor;
        scale = Math.max(0.5, Math.min(3, scale));

        const scaleNumber = (value: number, min: number, max: number) => {
            const scaled = Math.round(value * scale);
            return Math.max(min, Math.min(max, scaled));
        };

        const scaledAttributes = Object.entries(baseCreature.attributes).reduce((acc, [ key, value ]) => {
            acc[key as keyof CreatureData['attributes']] = scaleNumber(value, 0, 30);
            return acc;
        }, { ...baseCreature.attributes } as CreatureData['attributes']);

        const scaledStats = {
            lp: scaleNumber(baseCreature.stats.lp, 1, Number.MAX_SAFE_INTEGER),
            maxLp: scaleNumber(baseCreature.stats.maxLp, 1, Number.MAX_SAFE_INTEGER),
            mp: scaleNumber(baseCreature.stats.mp, 0, Number.MAX_SAFE_INTEGER),
            maxMp: scaleNumber(baseCreature.stats.maxMp, 0, Number.MAX_SAFE_INTEGER),
            ap: scaleNumber(baseCreature.stats.ap, 0, Number.MAX_SAFE_INTEGER)
        };

        const scaledExpertises: CreatureData['expertises'] = {};
        Object.entries(baseCreature.expertises || {}).forEach(([ key, value ]) => {
            const baseValue = value?.value ?? 0;
            scaledExpertises[key] = {
                ...value,
                value: scaleNumber(baseValue, 0, 20)
            };
        });

        setCreatureData(prev => ({
            ...prev,
            level: levelTarget,
            attributes: scaledAttributes,
            stats: scaledStats,
            expertises: scaledExpertises
        }));
    };

    const updateExpertise = (key: string, value: number) => {
        setCreatureData(prev => ({
            ...prev,
            expertises: {
                ...prev.expertises,
                [key]: { value, mod: 0 }
            }
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PetsIcon sx={{ color: orange[600] }} />
                {editingCreature ? 'Editar Criatura' : 'Criar Criatura'}
            </DialogTitle>
            
            <Tabs 
                value={activeTab} 
                onChange={(_, v) => setActiveTab(v)}
                sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Básico" icon={<PetsIcon />} iconPosition="start" />
                <Tab label="Habilidades" icon={<Psychology />} iconPosition="start" />
                <Tab label="Magias" icon={<AutoFixHigh />} iconPosition="start" />
                <Tab label="Perícias" icon={<Stars />} iconPosition="start" />
            </Tabs>

            <DialogContent sx={{ minHeight: 400 }}>
                {/* Tab: Informações Básicas */}
                {activeTab === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Nome da Criatura"
                                value={creatureData.name}
                                onChange={(e) => setCreatureData(prev => ({ ...prev, name: e.target.value }))}
                                fullWidth
                                required
                                disabled={isReadOnly}
                            />
                            <TextField
                                label="Nível"
                                type="number"
                                value={creatureData.level}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    const num = Number(raw);
                                    const clamped = Math.min(30, Math.max(1, isNaN(num) ? 1 : num));
                                    setCreatureData(prev => ({ ...prev, level: clamped }));
                                }}
                                inputProps={{ min: 1, max: 30 }}
                                sx={{ width: 100 }}
                                disabled={isReadOnly}
                            />
                        </Box>

                        <TextField
                            label="Descrição"
                            value={creatureData.description}
                            onChange={(e) => setCreatureData(prev => ({ ...prev, description: e.target.value }))}
                            multiline
                            rows={3}
                            fullWidth
                            disabled={isReadOnly}
                        />

                        {/* Atributos */}
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                Atributos
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {Object.entries(creatureData.attributes).map(([ attr, value ]) => (
                                    <TextField
                                        key={attr}
                                        label={attr.toUpperCase()}
                                        type="number"
                                        value={value}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            const num = Number(raw);
                                            const clamped = Math.min(30, Math.max(0, isNaN(num) ? 0 : num));
                                            setCreatureData(prev => ({
                                                ...prev,
                                                attributes: { ...prev.attributes, [attr]: clamped }
                                            }));
                                        }}
                                        inputProps={{ min: 0, max: 30 }}
                                        disabled={isReadOnly}
                                        sx={{ width: 80 }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Stats */}
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                Status
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <TextField
                                    label="LP"
                                    type="number"
                                    value={creatureData.stats.lp}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setCreatureData(prev => ({
                                            ...prev,
                                            stats: { ...prev.stats, lp: val, maxLp: val }
                                        }));
                                    }}
                                    inputProps={{ min: 1 }}
                                    disabled={isReadOnly}
                                    sx={{ width: 100 }}
                                />
                                <TextField
                                    label="MP"
                                    type="number"
                                    value={creatureData.stats.mp}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        setCreatureData(prev => ({
                                            ...prev,
                                            stats: { ...prev.stats, mp: val, maxMp: val }
                                        }));
                                    }}
                                    inputProps={{ min: 0 }}
                                    disabled={isReadOnly}
                                    sx={{ width: 100 }}
                                />
                                <TextField
                                    label="AP"
                                    type="number"
                                    value={creatureData.stats.ap}
                                    onChange={(e) => setCreatureData(prev => ({
                                        ...prev,
                                        stats: { ...prev.stats, ap: parseInt(e.target.value) || 0 }
                                    }))}
                                    inputProps={{ min: 0 }}
                                    disabled={isReadOnly}
                                    sx={{ width: 100 }}
                                />
                            </Box>
                        </Box>

                        {editingCreature && (
                            <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, mt: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                    Ajuste por nível e jogadores
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                    <TextField
                                        label="Nível alvo"
                                        type="number"
                                        value={scalingLevel}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            const num = Number(raw);
                                            const clamped = Math.min(30, Math.max(1, isNaN(num) ? 1 : num));
                                            setScalingLevel(clamped);
                                        }}
                                        inputProps={{ min: 1, max: 30 }}
                                        sx={{ width: 120 }}
                                        disabled={isReadOnly}
                                    />
                                    <TextField
                                        label="Qtd. jogadores"
                                        type="number"
                                        value={scalingPlayers}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            const num = Number(raw);
                                            const clamped = Math.min(8, Math.max(1, isNaN(num) ? 4 : num));
                                            setScalingPlayers(clamped);
                                        }}
                                        inputProps={{ min: 1, max: 8 }}
                                        sx={{ width: 140 }}
                                        disabled={isReadOnly}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={handleApplyScaling}
                                        disabled={isReadOnly || !baseCreature}
                                    >
                                        Aplicar ajuste
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                {/* Tab: Habilidades */}
                {activeTab === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setSkillsModalOpen(true)}
                                disabled={isReadOnly}
                            >
                                Buscar do banco
                            </Button>
                        </Box>
                        {/* Adicionar habilidade */}
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                Adicionar Habilidade
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <TextField
                                    label="Nome"
                                    value={newSkill.name}
                                    onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                    size="small"
                                    sx={{ flex: 1, minWidth: 150 }}
                                    disabled={isReadOnly}
                                />
                                <TextField
                                    label="Tipo"
                                    select
                                    value={newSkill.type}
                                    onChange={(e) => setNewSkill(prev => ({ ...prev, type: e.target.value }))}
                                    size="small"
                                    SelectProps={{ native: true }}
                                    sx={{ width: 150 }}
                                    disabled={isReadOnly}
                                >
                                    {skillTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </TextField>
                                <Button 
                                    variant="contained" 
                                    onClick={addSkill}
                                    disabled={isReadOnly || !newSkill.name?.trim()}
                                    startIcon={<Add />}
                                    sx={{ bgcolor: purple[600] }}
                                >
                                    Adicionar
                                </Button>
                            </Box>
                            <TextField
                                label="Descrição"
                                value={newSkill.description}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                disabled={isReadOnly}
                                sx={{ mt: 1 }}
                            />
                        </Box>

                        {/* Lista de habilidades */}
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, maxHeight: 250, overflow: 'auto' }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Habilidades ({creatureData.skills.length})
                            </Typography>
                            {creatureData.skills.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                    Nenhuma habilidade adicionada
                                </Typography>
                            ) : (
                                <List dense>
                                    {creatureData.skills.map(skill => (
                                        <ListItem 
                                            key={skill.id}
                                            secondaryAction={
                                                <IconButton edge="end" onClick={() => removeSkill(skill.id)} color="error" disabled={isReadOnly}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText 
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="body2" fontWeight={600}>{skill.name}</Typography>
                                                        <Chip label={skill.type} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                                                    </Box>
                                                }
                                                secondary={skill.description}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Tab: Magias */}
                {activeTab === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setSpellsModalOpen(true)}
                                disabled={isReadOnly}
                            >
                                Buscar do banco
                            </Button>
                        </Box>
                        {/* Adicionar magia */}
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                Adicionar Magia
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <TextField
                                    label="Nome"
                                    value={newSpell.name}
                                    onChange={(e) => setNewSpell(prev => ({ ...prev, name: e.target.value }))}
                                    size="small"
                                    sx={{ flex: 1, minWidth: 150 }}
                                    disabled={isReadOnly}
                                />
                                <TextField
                                    label="Elemento"
                                    select
                                    value={newSpell.element}
                                    onChange={(e) => setNewSpell(prev => ({ ...prev, element: e.target.value }))}
                                    size="small"
                                    SelectProps={{ native: true }}
                                    sx={{ width: 120 }}
                                    disabled={isReadOnly}
                                >
                                    {elements.map(el => (
                                        <option key={el} value={el}>{el}</option>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Nível"
                                    type="number"
                                    value={newSpell.level}
                                    onChange={(e) => setNewSpell(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                                    size="small"
                                    inputProps={{ min: 1, max: 5 }}
                                    sx={{ width: 80 }}
                                    disabled={isReadOnly}
                                />
                                <TextField
                                    label="Custo MP"
                                    type="number"
                                    value={newSpell.cost}
                                    onChange={(e) => setNewSpell(prev => ({ ...prev, cost: parseInt(e.target.value) || 1 }))}
                                    size="small"
                                    inputProps={{ min: 0 }}
                                    sx={{ width: 100 }}
                                    disabled={isReadOnly}
                                />
                                <Button 
                                    variant="contained" 
                                    onClick={addSpell}
                                    disabled={isReadOnly || !newSpell.name?.trim()}
                                    startIcon={<Add />}
                                    sx={{ bgcolor: blue[600] }}
                                >
                                    Adicionar
                                </Button>
                            </Box>
                            <TextField
                                label="Descrição"
                                value={newSpell.description}
                                onChange={(e) => setNewSpell(prev => ({ ...prev, description: e.target.value }))}
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                disabled={isReadOnly}
                                sx={{ mt: 1 }}
                            />
                        </Box>

                        {/* Lista de magias */}
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, maxHeight: 250, overflow: 'auto' }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                Magias ({creatureData.spells.length})
                            </Typography>
                            {creatureData.spells.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                    Nenhuma magia adicionada
                                </Typography>
                            ) : (
                                <List dense>
                                    {creatureData.spells.map(spell => (
                                        <ListItem 
                                            key={spell.id}
                                            secondaryAction={
                                                <IconButton edge="end" onClick={() => removeSpell(spell.id)} color="error" disabled={isReadOnly}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText 
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography variant="body2" fontWeight={600}>{spell.name}</Typography>
                                                        <Chip label={spell.element} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                                                        <Chip label={`Nv. ${spell.level}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                                                        <Chip label={`${spell.cost} MP`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: blue[100], color: blue[800] }} />
                                                    </Box>
                                                }
                                                secondary={spell.description}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Tab: Perícias */}
                {activeTab === 3 && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                            Perícias (valores de 0 a 10)
                        </Typography>
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                            gap: 1,
                            maxHeight: 350,
                            overflow: 'auto',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 2
                        }}>
                            {expertiseList.map(exp => (
                                <Box 
                                    key={exp.key} 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1,
                                        p: 0.5,
                                        borderRadius: 1,
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ flex: 1, fontSize: '0.85rem' }}>
                                        {exp.name}
                                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                            ({exp.attr.toUpperCase()})
                                        </Typography>
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={creatureData.expertises[exp.key]?.value || 0}
                                        onChange={(e) => updateExpertise(exp.key, parseInt(e.target.value) || 0)}
                                        inputProps={{ min: 0, max: 10, style: { textAlign: 'center' } }}
                                        size="small"
                                        sx={{ width: 60 }}
                                        disabled={isReadOnly}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <ResourceListModal
                title="Selecionar Habilidades"
                open={skillsModalOpen}
                onClose={() => setSkillsModalOpen(false)}
                queryKey="magicPowers-creature"
                fetchFunction={async (params) => await poderService.fetch(params)}
                addFunction={handleAddPowerToCreature}
                validateAdd={validateAddPowerForCreature}
                successMessage={(power: Power) => `Habilidade ${power.name} adicionada à criatura!`}
                errorMessage={(err: Error) => err.message || 'Erro ao adicionar habilidade'}
                filterOptions={elements.map(element => element.toUpperCase())}
                sortOptions={[ 'Elemento', 'Nome' ]}
                initialSort={{ value: 'Nome', order: 'ASC' }}
                renderResource={({ item, handleAddItem }) => (
                    <Magic
                        as="magic-power"
                        key={item.id}
                        magicPower={item}
                        id={item.id}
                        isAdding
                        onIconClick={handleAddItem}
                    />
                )}
            />

            <ResourceListModal
                title="Selecionar Magias"
                open={spellsModalOpen}
                onClose={() => setSpellsModalOpen(false)}
                queryKey="spells-creature"
                fetchFunction={async (params) => await magiaService.fetch(params)}
                addFunction={handleAddSpellToCreature}
                validateAdd={validateAddSpellForCreature}
                successMessage={(spell: Spell) => `Magia ${spell.name} adicionada à criatura!`}
                errorMessage={(err: Error) => err.message || 'Erro ao adicionar magia'}
                filterOptions={[ ...elements, ...specialElements ]}
                sortOptions={[ 'Nível', 'Elemento', 'Alfabética' ]}
                initialSort={{ value: 'Nível', order: 'ASC' }}
                renderResource={({ item, handleAddItem }) => (
                    <Magic
                        as="magic-spell"
                        key={item.id}
                        magic={item}
                        id={item.id}
                        isAdding
                        onIconClick={handleAddItem}
                    />
                )}
            />

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={isLoading} variant="outlined">
                    Cancelar
                </Button>
                {!isReadOnly && (
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!creatureData.name.trim() || isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : <PetsIcon />}
                        sx={{ bgcolor: orange[600], '&:hover': { bgcolor: orange[700] } }}
                    >
                        {isLoading ? 'Salvando...' : (editingCreature ? 'Atualizar' : 'Criar Criatura')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
