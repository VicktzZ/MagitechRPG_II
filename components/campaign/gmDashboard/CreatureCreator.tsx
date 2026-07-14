'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Autocomplete,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Paper,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import {
    Add,
    Delete,
    Remove,
    Search,
    TuneRounded,
    ExpandMore,
    Pets as PetsIcon,
    Psychology,
    AutoFixHigh,
    Stars,
    ImageOutlined,
    FavoriteBorder,
    BoltOutlined,
    ShieldOutlined
} from '@mui/icons-material';
import { orange, blue, purple, grey, red, green } from '@mui/material/colors';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import { Expertises, type Expertise as ExpertiseModel } from '@models';
import { ResourceListModal } from '@components/utils';
import Magic from '@components/charsheet/subcomponents/Magic';
import { poderService, magiaService } from '@services';
import { elements, specialElements } from '@constants';
import type { Power, Spell, RPGSystem } from '@models/entities';

interface CreatureData {
    id?: string;
    name: string;
    description: string;
    /** Categoria da criatura (ex: Fera, Humanoide, Morto-vivo) — livre */
    type?: string;
    /** URL de imagem/retrato da criatura */
    imageUrl?: string;
    level: number;
    attributes: Record<string, number>;
    stats: {
        lp: number;
        maxLp: number;
        mp: number;
        maxMp: number;
        ap: number;
    };
    skills: SkillData[];
    spells: SpellData[];
    expertises: Record<string, { value: number; defaultAttribute?: string | null }>;
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

interface AttributeDef { key: string; label: string; name: string }
interface ExpertiseDef { key: string; name: string; attrKey: string | null; attrLabel: string }

const DEFAULT_ATTRIBUTE_DEFS: AttributeDef[] = [
    { key: 'vig', label: 'VIG', name: 'Vigor' },
    { key: 'des', label: 'DES', name: 'Destreza' },
    { key: 'foc', label: 'FOC', name: 'Foco' },
    { key: 'log', label: 'LOG', name: 'Lógica' },
    { key: 'sab', label: 'SAB', name: 'Sabedoria' },
    { key: 'car', label: 'CAR', name: 'Carisma' }
];

// Perícias padrão (Magitech) — preserva a defaultAttribute crua (minúscula) usada em combate
const DEFAULT_EXPERTISE_DEFS: ExpertiseDef[] = (() => {
    const expertises = new Expertises();
    return Object.entries(expertises).map(([ name, value ]) => {
        const exp = value as ExpertiseModel;
        const attrKey = (exp.defaultAttribute as unknown as string) || null;
        return {
            key: name,
            name,
            attrKey,
            attrLabel: attrKey ? attrKey.toUpperCase() : '—'
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

const CREATURE_TYPE_SUGGESTIONS = [
    'Fera', 'Humanoide', 'Morto-vivo', 'Aberração', 'Constructo', 'Elemental',
    'Demônio', 'Celestial', 'Planta', 'Limo', 'Dragão', 'Espírito', 'Máquina',
    'Inseto', 'Monstruosidade', 'Gigante', 'Fada'
];

// Presets de papel (role) — preenchem um bloco de estatísticas escalado pelo nível
const ROLE_PRESETS = [
    { id: 'minion', label: 'Lacaio', icon: '🐀', color: grey[600], lpPerLevel: 8, mpPerLevel: 3, ap: 2, attrFactor: 0.5, desc: 'Frágil, aparece em grupo' },
    { id: 'standard', label: 'Padrão', icon: '🐺', color: blue[600], lpPerLevel: 15, mpPerLevel: 5, ap: 3, attrFactor: 0.8, desc: 'Ameaça equilibrada' },
    { id: 'elite', label: 'Elite', icon: '🦁', color: purple[600], lpPerLevel: 30, mpPerLevel: 8, ap: 4, attrFactor: 1.0, desc: 'Resistente e perigoso' },
    { id: 'boss', label: 'Chefe', icon: '🐲', color: orange[700], lpPerLevel: 60, mpPerLevel: 12, ap: 5, attrFactor: 1.3, desc: 'Combate memorável' }
] as const;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Modificador exibido do atributo, na mesma escala usada nas rolagens de criatura */
const attributeModifier = (value: number): number => (value === 0 ? -1 : Math.min(5, Math.floor(value / 5)));

function getAttributeDefs(rpgSystem: RPGSystem | null): AttributeDef[] {
    if (rpgSystem?.attributes?.length) {
        return rpgSystem.attributes.map(a => ({
            key: a.key,
            label: (a.abbreviation || a.name || a.key).toUpperCase(),
            name: a.name || a.key
        }));
    }
    return DEFAULT_ATTRIBUTE_DEFS;
}

function getExpertiseDefs(rpgSystem: RPGSystem | null): ExpertiseDef[] {
    if (rpgSystem?.expertises?.length) {
        const attrByKey = new Map((rpgSystem.attributes ?? []).map(a => [ a.key, (a.abbreviation || a.name || a.key).toUpperCase() ]));
        return rpgSystem.expertises.map(e => ({
            key: e.key,
            name: e.name || e.key,
            attrKey: e.defaultAttribute ?? null,
            attrLabel: e.defaultAttribute ? (attrByKey.get(e.defaultAttribute) ?? e.defaultAttribute.toUpperCase()) : '—'
        }));
    }
    return DEFAULT_EXPERTISE_DEFS;
}

function buildInitialCreature(
    editing: CreatureData | null | undefined,
    attrDefs: AttributeDef[]
): CreatureData {
    const attributes: Record<string, number> = {};
    attrDefs.forEach(d => { attributes[d.key] = Number(editing?.attributes?.[d.key] ?? 0) || 0; });

    if (!editing) {
        return {
            name: '',
            description: '',
            type: '',
            imageUrl: '',
            level: 1,
            attributes,
            stats: { lp: 10, maxLp: 10, mp: 5, maxMp: 5, ap: 3 },
            skills: [],
            spells: [],
            expertises: {}
        };
    }

    return {
        ...editing,
        type: editing.type ?? '',
        imageUrl: editing.imageUrl ?? '',
        attributes,
        stats: {
            lp: editing.stats?.lp ?? 10,
            maxLp: editing.stats?.maxLp ?? editing.stats?.lp ?? 10,
            mp: editing.stats?.mp ?? 5,
            maxMp: editing.stats?.maxMp ?? editing.stats?.mp ?? 5,
            ap: editing.stats?.ap ?? 3
        },
        skills: editing.skills ?? [],
        spells: editing.spells ?? [],
        expertises: editing.expertises ?? {}
    };
}

export default function CreatureCreator({ open, onClose, onSave, editingCreature, readOnly }: CreatureCreatorProps) {
    const { campaign, rpgSystem } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const isReadOnly = !!readOnly;

    const attrDefs = useMemo(() => getAttributeDefs(rpgSystem), [ rpgSystem ]);
    const expertiseDefs = useMemo(() => getExpertiseDefs(rpgSystem), [ rpgSystem ]);

    const [ creatureData, setCreatureData ] = useState<CreatureData>(() => buildInitialCreature(editingCreature, attrDefs));
    const [ activeTab, setActiveTab ] = useState(0);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ baseCreature, setBaseCreature ] = useState<CreatureData | null>(editingCreature || null);
    const [ scalingLevel, setScalingLevel ] = useState<number>(editingCreature?.level || 1);
    const [ scalingPlayers, setScalingPlayers ] = useState<number>(campaign.players?.length || 4);
    const [ scalingOpen, setScalingOpen ] = useState(false);
    const [ expertiseSearch, setExpertiseSearch ] = useState('');
    const [ skillsModalOpen, setSkillsModalOpen ] = useState(false);
    const [ spellsModalOpen, setSpellsModalOpen ] = useState(false);

    // Estados para adicionar skills/spells
    const [ newSkill, setNewSkill ] = useState<Partial<SkillData>>({ name: '', description: '', type: 'Classe' });
    const [ newSpell, setNewSpell ] = useState<Partial<SpellData>>({ name: '', description: '', level: 1, element: 'Arcano', cost: 1 });

    useEffect(() => {
        const initial = buildInitialCreature(editingCreature, attrDefs);
        setCreatureData(initial);
        setBaseCreature(editingCreature || null);
        setScalingLevel(editingCreature?.level || 1);
        setScalingPlayers(campaign.players?.length || 4);
        setActiveTab(0);
        setExpertiseSearch('');
        setScalingOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ editingCreature, open, campaign.id ]);

    // ── Resumo (feedback ao vivo) ───────────────────────────────────────────
    const attributeSum = useMemo(
        () => attrDefs.reduce((sum, d) => sum + (creatureData.attributes[d.key] || 0), 0),
        [ attrDefs, creatureData.attributes ]
    );
    const expertiseCount = useMemo(
        () => Object.values(creatureData.expertises).filter(e => (e?.value ?? 0) !== 0).length,
        [ creatureData.expertises ]
    );

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

    const setAttribute = (key: string, value: number) => {
        const clamped = clamp(isNaN(value) ? 0 : value, 0, 30);
        setCreatureData(prev => ({ ...prev, attributes: { ...prev.attributes, [key]: clamped } }));
    };

    const applyRolePreset = (preset: typeof ROLE_PRESETS[number]) => {
        const level = clamp(creatureData.level || 1, 1, 30);
        const attrValue = clamp(Math.round(level * preset.attrFactor), 1, 30);
        const attributes: Record<string, number> = {};
        attrDefs.forEach(d => { attributes[d.key] = attrValue; });
        const lp = Math.max(1, Math.round(preset.lpPerLevel * level));
        const mp = Math.max(0, Math.round(preset.mpPerLevel * level));
        setCreatureData(prev => ({
            ...prev,
            attributes,
            stats: { lp, maxLp: lp, mp, maxMp: mp, ap: preset.ap }
        }));
        enqueueSnackbar(`Preset "${preset.label}" aplicado (nível ${level})`, { variant: 'info' });
    };

    const addSkill = () => {
        if (!newSkill.name?.trim()) return;
        const skill: SkillData = {
            id: crypto.randomUUID(),
            name: newSkill.name,
            description: newSkill.description || '',
            type: newSkill.type || 'Classe'
        };
        setCreatureData(prev => ({ ...prev, skills: [ ...prev.skills, skill ] }));
        setNewSkill({ name: '', description: '', type: 'Classe' });
    };

    const removeSkill = (id: string) => {
        setCreatureData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
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
        setCreatureData(prev => ({ ...prev, spells: [ ...prev.spells, spell ] }));
        setNewSpell({ name: '', description: '', level: 1, element: 'Arcano', cost: 1 });
    };

    const removeSpell = (id: string) => {
        setCreatureData(prev => ({ ...prev, spells: prev.spells.filter(s => s.id !== id) }));
    };

    const validateAddPowerForCreature = () => ({ isValid: true });

    const handleAddPowerToCreature = async (power: Power) => {
        const skill: SkillData = {
            id: power.id ?? crypto.randomUUID(),
            name: power.name,
            description: power.description || '',
            type: power.type || 'Poder Mágico'
        };
        setCreatureData(prev => {
            const existing = prev.skills.filter(s => s.id !== skill.id);
            return { ...prev, skills: [ ...existing, skill ] };
        });
        return skill;
    };

    const validateAddSpellForCreature = () => ({ isValid: true });

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
            return { ...prev, spells: [ ...existing, mapped ] };
        });
        return mapped;
    };

    const handleApplyScaling = () => {
        if (!baseCreature) return;

        const levelBase = baseCreature.level || 1;
        const levelTarget = clamp(scalingLevel || levelBase, 1, 30);
        const playersBase = 4;
        const playersTarget = Math.max(1, scalingPlayers || playersBase);

        const levelFactor = levelTarget / levelBase;
        const playersFactor = playersTarget / playersBase;
        const scale = clamp(levelFactor * playersFactor, 0.5, 3);

        const scaleNumber = (value: number, min: number, max: number) =>
            clamp(Math.round(value * scale), min, max);

        const scaledAttributes: Record<string, number> = {};
        attrDefs.forEach(d => {
            scaledAttributes[d.key] = scaleNumber(baseCreature.attributes?.[d.key] ?? 0, 0, 30);
        });

        const scaledStats = {
            lp: scaleNumber(baseCreature.stats.lp, 1, Number.MAX_SAFE_INTEGER),
            maxLp: scaleNumber(baseCreature.stats.maxLp, 1, Number.MAX_SAFE_INTEGER),
            mp: scaleNumber(baseCreature.stats.mp, 0, Number.MAX_SAFE_INTEGER),
            maxMp: scaleNumber(baseCreature.stats.maxMp, 0, Number.MAX_SAFE_INTEGER),
            ap: scaleNumber(baseCreature.stats.ap, 0, Number.MAX_SAFE_INTEGER)
        };

        const scaledExpertises: CreatureData['expertises'] = {};
        Object.entries(baseCreature.expertises || {}).forEach(([ key, value ]) => {
            scaledExpertises[key] = { ...value, value: scaleNumber(value?.value ?? 0, 0, 20) };
        });

        setCreatureData(prev => ({
            ...prev,
            level: levelTarget,
            attributes: scaledAttributes,
            stats: scaledStats,
            expertises: scaledExpertises
        }));
        enqueueSnackbar('Estatísticas ajustadas', { variant: 'info' });
    };

    const updateExpertise = (key: string, value: number, attrKey: string | null) => {
        setCreatureData(prev => ({
            ...prev,
            expertises: { ...prev.expertises, [key]: { value: clamp(isNaN(value) ? 0 : value, 0, 20), defaultAttribute: attrKey } }
        }));
    };

    const filteredExpertiseDefs = useMemo(() => {
        const q = expertiseSearch.trim().toLowerCase();
        if (!q) return expertiseDefs;
        return expertiseDefs.filter(e => e.name.toLowerCase().includes(q));
    }, [ expertiseDefs, expertiseSearch ]);

    const clearExpertises = () => {
        setCreatureData(prev => ({ ...prev, expertises: {} }));
    };

    // ── Cabeçalho de resumo ─────────────────────────────────────────────────
    const iconSx = (color: string) => ({ fontSize: '0.9rem !important', color: `${color} !important` });
    const summaryChips = (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
            <Chip size="small" label={`Nível ${creatureData.level}`} sx={{ bgcolor: green[100], color: green[900], fontWeight: 700 }} />
            <Chip size="small" icon={<FavoriteBorder sx={iconSx(red[500])} />} label={creatureData.stats.lp} sx={{ bgcolor: red[50], color: red[800] }} />
            <Chip size="small" icon={<BoltOutlined sx={iconSx(blue[500])} />} label={creatureData.stats.mp} sx={{ bgcolor: blue[50], color: blue[800] }} />
            <Chip size="small" icon={<ShieldOutlined sx={iconSx(grey[600])} />} label={`${creatureData.stats.ap} AP`} sx={{ bgcolor: grey[100], color: grey[800] }} />
            <Chip size="small" label={`Σ Atrib. ${attributeSum}`} variant="outlined" />
            {creatureData.skills.length > 0 && <Chip size="small" label={`${creatureData.skills.length} habilidade(s)`} sx={{ bgcolor: purple[50], color: purple[800] }} />}
            {creatureData.spells.length > 0 && <Chip size="small" label={`${creatureData.spells.length} magia(s)`} sx={{ bgcolor: blue[50], color: blue[800] }} />}
            {expertiseCount > 0 && <Chip size="small" label={`${expertiseCount} perícia(s)`} variant="outlined" />}
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        src={creatureData.imageUrl || undefined}
                        sx={{ bgcolor: orange[100], color: orange[700], width: 44, height: 44 }}
                    >
                        <PetsIcon />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={700} noWrap>
                            {isReadOnly ? 'Detalhes da Criatura' : (editingCreature ? 'Editar Criatura' : 'Criar Criatura')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {creatureData.name || 'Sem nome'}
                            {creatureData.type ? ` · ${creatureData.type}` : ''}
                        </Typography>
                    </Box>
                </Box>
                {summaryChips}
            </DialogTitle>

            <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Básico" icon={<PetsIcon />} iconPosition="start" />
                <Tab label="Habilidades" icon={<Psychology />} iconPosition="start" />
                <Tab label="Magias" icon={<AutoFixHigh />} iconPosition="start" />
                <Tab label="Perícias" icon={<Stars />} iconPosition="start" />
            </Tabs>

            <DialogContent sx={{ minHeight: 440 }}>
                {/* ── Tab: Básico ── */}
                {activeTab === 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        {/* Identidade */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                            <Avatar
                                variant="rounded"
                                src={creatureData.imageUrl || undefined}
                                sx={{ width: 96, height: 96, bgcolor: orange[50], color: orange[400], border: '1px solid', borderColor: 'divider' }}
                            >
                                <ImageOutlined sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 240 }}>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <TextField
                                        label="Nome da Criatura"
                                        value={creatureData.name}
                                        onChange={(e) => setCreatureData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        disabled={isReadOnly}
                                        sx={{ flex: 1, minWidth: 180 }}
                                    />
                                    <TextField
                                        label="Nível"
                                        type="number"
                                        value={creatureData.level}
                                        onChange={(e) => setCreatureData(prev => ({ ...prev, level: clamp(Number(e.target.value) || 1, 1, 30) }))}
                                        inputProps={{ min: 1, max: 30 }}
                                        sx={{ width: 96 }}
                                        disabled={isReadOnly}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Autocomplete
                                        freeSolo
                                        options={CREATURE_TYPE_SUGGESTIONS}
                                        value={creatureData.type || ''}
                                        onChange={(_, v) => setCreatureData(prev => ({ ...prev, type: v || '' }))}
                                        onInputChange={(_, v) => setCreatureData(prev => ({ ...prev, type: v }))}
                                        disabled={isReadOnly}
                                        sx={{ width: 200 }}
                                        renderInput={(params) => <TextField {...params} label="Tipo / Categoria" placeholder="Ex: Fera" />}
                                    />
                                    <TextField
                                        label="URL da Imagem"
                                        value={creatureData.imageUrl || ''}
                                        onChange={(e) => setCreatureData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                        placeholder="https://..."
                                        disabled={isReadOnly}
                                        sx={{ flex: 1, minWidth: 200 }}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><ImageOutlined fontSize="small" /></InputAdornment> }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <TextField
                            label="Descrição"
                            value={creatureData.description}
                            onChange={(e) => setCreatureData(prev => ({ ...prev, description: e.target.value }))}
                            multiline
                            rows={2}
                            fullWidth
                            disabled={isReadOnly}
                        />

                        {/* Presets rápidos */}
                        {!isReadOnly && (
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Preencha rapidamente um bloco de estatísticas pelo papel da criatura (escalado pelo nível atual):
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {ROLE_PRESETS.map(preset => (
                                        <Tooltip key={preset.id} title={preset.desc} arrow>
                                            <Button
                                                variant="outlined"
                                                onClick={() => applyRolePreset(preset)}
                                                sx={{
                                                    borderColor: preset.color,
                                                    color: preset.color,
                                                    textTransform: 'none',
                                                    '&:hover': { borderColor: preset.color, bgcolor: `${preset.color}14` }
                                                }}
                                            >
                                                <span style={{ marginRight: 6 }}>{preset.icon}</span> {preset.label}
                                            </Button>
                                        </Tooltip>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Atributos */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                Atributos
                                {rpgSystem?.attributes?.length ? (
                                    <Chip label={rpgSystem.name || 'Sistema customizado'} size="small" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />
                                ) : null}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                {attrDefs.map(def => {
                                    const value = creatureData.attributes[def.key] ?? 0;
                                    const mod = attributeModifier(value);
                                    return (
                                        <Paper
                                            key={def.key}
                                            variant="outlined"
                                            sx={{ p: 1, textAlign: 'center', width: 104, borderRadius: 2 }}
                                        >
                                            <Tooltip title={def.name} arrow>
                                                <Typography variant="caption" fontWeight={700} color="text.secondary">
                                                    {def.label}
                                                </Typography>
                                            </Tooltip>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25, mt: 0.5 }}>
                                                <IconButton size="small" sx={{ p: 0.25 }} disabled={isReadOnly || value <= 0} onClick={() => setAttribute(def.key, value - 1)}>
                                                    <Remove sx={{ fontSize: 14 }} />
                                                </IconButton>
                                                <TextField
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) => setAttribute(def.key, Number(e.target.value))}
                                                    inputProps={{ min: 0, max: 30, style: { textAlign: 'center', padding: '4px 0' } }}
                                                    variant="standard"
                                                    disabled={isReadOnly}
                                                    sx={{ width: 34 }}
                                                    InputProps={{ disableUnderline: true }}
                                                />
                                                <IconButton size="small" sx={{ p: 0.25 }} disabled={isReadOnly || value >= 30} onClick={() => setAttribute(def.key, value + 1)}>
                                                    <Add sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: mod >= 0 ? green[600] : red[500], fontWeight: 600 }}>
                                                {mod >= 0 ? `+${mod}` : mod} dado(s)
                                            </Typography>
                                        </Paper>
                                    );
                                })}
                            </Box>
                        </Paper>

                        {/* Status */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Status</Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <TextField
                                    label="LP (Vida)"
                                    type="number"
                                    value={creatureData.stats.lp}
                                    onChange={(e) => {
                                        const val = Math.max(1, parseInt(e.target.value) || 0);
                                        setCreatureData(prev => ({ ...prev, stats: { ...prev.stats, lp: val, maxLp: val } }));
                                    }}
                                    inputProps={{ min: 1 }}
                                    disabled={isReadOnly}
                                    sx={{ width: 130 }}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><FavoriteBorder sx={{ color: red[400], fontSize: 18 }} /></InputAdornment> }}
                                />
                                <TextField
                                    label="MP (Mana)"
                                    type="number"
                                    value={creatureData.stats.mp}
                                    onChange={(e) => {
                                        const val = Math.max(0, parseInt(e.target.value) || 0);
                                        setCreatureData(prev => ({ ...prev, stats: { ...prev.stats, mp: val, maxMp: val } }));
                                    }}
                                    inputProps={{ min: 0 }}
                                    disabled={isReadOnly}
                                    sx={{ width: 130 }}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><BoltOutlined sx={{ color: blue[400], fontSize: 18 }} /></InputAdornment> }}
                                />
                                <TextField
                                    label="AP (Ações)"
                                    type="number"
                                    value={creatureData.stats.ap}
                                    onChange={(e) => setCreatureData(prev => ({ ...prev, stats: { ...prev.stats, ap: Math.max(0, parseInt(e.target.value) || 0) } }))}
                                    inputProps={{ min: 0 }}
                                    disabled={isReadOnly}
                                    sx={{ width: 130 }}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><ShieldOutlined sx={{ color: grey[500], fontSize: 18 }} /></InputAdornment> }}
                                />
                            </Box>
                        </Paper>

                        {/* Escalonamento (avançado) */}
                        {!isReadOnly && (
                            <Box>
                                <Button
                                    size="small"
                                    startIcon={<TuneRounded />}
                                    endIcon={<ExpandMore sx={{ transform: scalingOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
                                    onClick={() => setScalingOpen(o => !o)}
                                    sx={{ textTransform: 'none', color: 'text.secondary' }}
                                >
                                    Escalonamento por nível e jogadores
                                </Button>
                                <Collapse in={scalingOpen}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 1, borderStyle: 'dashed' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                            Ajusta atributos, status e perícias {baseCreature ? 'da versão salva' : 'atuais'} para um nível alvo e tamanho de grupo.
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <TextField
                                                label="Nível alvo"
                                                type="number"
                                                value={scalingLevel}
                                                onChange={(e) => setScalingLevel(clamp(Number(e.target.value) || 1, 1, 30))}
                                                inputProps={{ min: 1, max: 30 }}
                                                sx={{ width: 120 }}
                                            />
                                            <TextField
                                                label="Qtd. jogadores"
                                                type="number"
                                                value={scalingPlayers}
                                                onChange={(e) => setScalingPlayers(clamp(Number(e.target.value) || 4, 1, 8))}
                                                inputProps={{ min: 1, max: 8 }}
                                                sx={{ width: 140 }}
                                            />
                                            <Button
                                                variant="outlined"
                                                onClick={handleApplyScaling}
                                                disabled={!baseCreature}
                                            >
                                                Aplicar ajuste
                                            </Button>
                                            {!baseCreature && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Salve a criatura primeiro para usar o escalonamento.
                                                </Typography>
                                            )}
                                        </Box>
                                    </Paper>
                                </Collapse>
                            </Box>
                        )}
                    </Box>
                )}

                {/* ── Tab: Habilidades ── */}
                {activeTab === 1 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Habilidades ({creatureData.skills.length})
                            </Typography>
                            <Button variant="outlined" size="small" startIcon={<Search />} onClick={() => setSkillsModalOpen(true)} disabled={isReadOnly}>
                                Buscar do banco
                            </Button>
                        </Box>

                        {!isReadOnly && (
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <TextField
                                        label="Nome"
                                        value={newSkill.name}
                                        onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                        size="small"
                                        sx={{ flex: 1, minWidth: 150 }}
                                    />
                                    <TextField
                                        label="Tipo"
                                        select
                                        value={newSkill.type}
                                        onChange={(e) => setNewSkill(prev => ({ ...prev, type: e.target.value }))}
                                        size="small"
                                        SelectProps={{ native: true }}
                                        sx={{ width: 150 }}
                                    >
                                        {skillTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                                    </TextField>
                                    <Button variant="contained" onClick={addSkill} disabled={!newSkill.name?.trim()} startIcon={<Add />} sx={{ bgcolor: purple[600] }}>
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
                                    sx={{ mt: 1 }}
                                />
                            </Paper>
                        )}

                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, maxHeight: 260, overflow: 'auto' }}>
                            {creatureData.skills.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                    Nenhuma habilidade adicionada
                                </Typography>
                            ) : (
                                <List dense>
                                    {creatureData.skills.map(skill => (
                                        <ListItem
                                            key={skill.id}
                                            secondaryAction={!isReadOnly && (
                                                <IconButton edge="end" onClick={() => removeSkill(skill.id)} color="error">
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            )}
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
                        </Paper>
                    </Box>
                )}

                {/* ── Tab: Magias ── */}
                {activeTab === 2 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Magias ({creatureData.spells.length})
                            </Typography>
                            <Button variant="outlined" size="small" startIcon={<Search />} onClick={() => setSpellsModalOpen(true)} disabled={isReadOnly}>
                                Buscar do banco
                            </Button>
                        </Box>

                        {!isReadOnly && (
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <TextField
                                        label="Nome"
                                        value={newSpell.name}
                                        onChange={(e) => setNewSpell(prev => ({ ...prev, name: e.target.value }))}
                                        size="small"
                                        sx={{ flex: 1, minWidth: 150 }}
                                    />
                                    <TextField
                                        label="Elemento"
                                        select
                                        value={newSpell.element}
                                        onChange={(e) => setNewSpell(prev => ({ ...prev, element: e.target.value }))}
                                        size="small"
                                        SelectProps={{ native: true }}
                                        sx={{ width: 120 }}
                                    >
                                        {elements.map(el => (<option key={el} value={el}>{el}</option>))}
                                    </TextField>
                                    <TextField
                                        label="Nível"
                                        type="number"
                                        value={newSpell.level}
                                        onChange={(e) => setNewSpell(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                                        size="small"
                                        inputProps={{ min: 1, max: 5 }}
                                        sx={{ width: 80 }}
                                    />
                                    <TextField
                                        label="Custo MP"
                                        type="number"
                                        value={newSpell.cost}
                                        onChange={(e) => setNewSpell(prev => ({ ...prev, cost: parseInt(e.target.value) || 1 }))}
                                        size="small"
                                        inputProps={{ min: 0 }}
                                        sx={{ width: 100 }}
                                    />
                                    <Button variant="contained" onClick={addSpell} disabled={!newSpell.name?.trim()} startIcon={<Add />} sx={{ bgcolor: blue[600] }}>
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
                                    sx={{ mt: 1 }}
                                />
                            </Paper>
                        )}

                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, maxHeight: 260, overflow: 'auto' }}>
                            {creatureData.spells.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                                    Nenhuma magia adicionada
                                </Typography>
                            ) : (
                                <List dense>
                                    {creatureData.spells.map(spell => (
                                        <ListItem
                                            key={spell.id}
                                            secondaryAction={!isReadOnly && (
                                                <IconButton edge="end" onClick={() => removeSpell(spell.id)} color="error">
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            )}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
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
                        </Paper>
                    </Box>
                )}

                {/* ── Tab: Perícias ── */}
                {activeTab === 3 && (
                    <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                            <TextField
                                size="small"
                                placeholder="Buscar perícia..."
                                value={expertiseSearch}
                                onChange={(e) => setExpertiseSearch(e.target.value)}
                                sx={{ flex: 1, minWidth: 200 }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {expertiseCount} definida(s) · valores 0–20
                            </Typography>
                            {!isReadOnly && expertiseCount > 0 && (
                                <Button size="small" color="inherit" onClick={clearExpertises}>Limpar</Button>
                            )}
                        </Box>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: 1,
                            maxHeight: 380,
                            overflow: 'auto',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            p: 2
                        }}>
                            {filteredExpertiseDefs.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 2 }}>
                                    Nenhuma perícia encontrada
                                </Typography>
                            ) : filteredExpertiseDefs.map(exp => {
                                const current = creatureData.expertises[exp.key]?.value || 0;
                                return (
                                    <Box
                                        key={exp.key}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 0.5,
                                            borderRadius: 1,
                                            bgcolor: current !== 0 ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)') : 'transparent',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ flex: 1, fontSize: '0.85rem' }}>
                                            {exp.name}
                                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                ({exp.attrLabel})
                                            </Typography>
                                        </Typography>
                                        <TextField
                                            type="number"
                                            value={current}
                                            onChange={(e) => updateExpertise(exp.key, parseInt(e.target.value) || 0, exp.attrKey)}
                                            inputProps={{ min: 0, max: 20, style: { textAlign: 'center' } }}
                                            size="small"
                                            sx={{ width: 64 }}
                                            disabled={isReadOnly}
                                        />
                                    </Box>
                                );
                            })}
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

            <Divider />
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={isLoading} variant="outlined">
                    {isReadOnly ? 'Fechar' : 'Cancelar'}
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
