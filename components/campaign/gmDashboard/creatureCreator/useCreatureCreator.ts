import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import { useCampaignContext } from '@contexts';
import type { Power, Spell } from '@models/entities';
import type { RolePreset } from './constants';
import {
    buildInitialCreature,
    buildRolePresetStats,
    clamp,
    getAttributeDefs,
    getExpertiseDefs,
    scaleCreature
} from './creatureStats';
import type { CreatureDice } from '@utils/combat/creatureDice';
import type { CreatureData, SkillData, SpellData } from './types';

interface UseCreatureCreatorParams {
    open: boolean;
    onClose: () => void;
    onSave?: (creature: CreatureData) => void;
    editingCreature?: CreatureData | null;
}

/** Estado e ações do diálogo de criação/edição de criatura */
export function useCreatureCreator({ open, onClose, onSave, editingCreature }: UseCreatureCreatorParams) {
    const { campaign, rpgSystem } = useCampaignContext();
    const { enqueueSnackbar } = useSnackbar();

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

    const applyRolePreset = (preset: RolePreset) => {
        const level = clamp(creatureData.level || 1, 1, 30);
        const { attributes, stats } = buildRolePresetStats(preset, level, attrDefs);
        setCreatureData(prev => ({
            ...prev,
            attributes,
            stats
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

        const scaled = scaleCreature(baseCreature, scalingLevel, scalingPlayers, attrDefs);

        setCreatureData(prev => ({
            ...prev,
            level: scaled.level,
            attributes: scaled.attributes,
            stats: scaled.stats,
            expertises: scaled.expertises
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

    const setDices = (dices: CreatureDice[]) => {
        setCreatureData(prev => ({ ...prev, dices }));
    };

    const clearExpertises = () => {
        setCreatureData(prev => ({ ...prev, expertises: {} }));
    };

    return {
        rpgSystem,
        attrDefs,
        expertiseDefs,
        creatureData,
        setCreatureData,
        activeTab,
        setActiveTab,
        isLoading,
        baseCreature,
        scalingLevel,
        setScalingLevel,
        scalingPlayers,
        setScalingPlayers,
        scalingOpen,
        setScalingOpen,
        expertiseSearch,
        setExpertiseSearch,
        skillsModalOpen,
        setSkillsModalOpen,
        spellsModalOpen,
        setSpellsModalOpen,
        newSkill,
        setNewSkill,
        newSpell,
        setNewSpell,
        attributeSum,
        expertiseCount,
        filteredExpertiseDefs,
        handleSave,
        setAttribute,
        applyRolePreset,
        addSkill,
        removeSkill,
        addSpell,
        removeSpell,
        validateAddPowerForCreature,
        handleAddPowerToCreature,
        validateAddSpellForCreature,
        handleAddSpellToCreature,
        handleApplyScaling,
        updateExpertise,
        clearExpertises,
        setDices
    };
}
