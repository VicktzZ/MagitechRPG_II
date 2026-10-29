'use client';

import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Tab,
    Tabs
} from '@mui/material';
import {
    Pets as PetsIcon,
    Psychology,
    AutoStories,
    Star
} from '@mui/icons-material';
import BasicTab from './creatureCreator/BasicTab';
import CreatureHeader from './creatureCreator/CreatureHeader';
import CreatureResourceModals from './creatureCreator/CreatureResourceModals';
import ExpertisesTab from './creatureCreator/ExpertisesTab';
import SkillsTab from './creatureCreator/SkillsTab';
import SpellsTab from './creatureCreator/SpellsTab';
import type { CreatureData } from './creatureCreator/types';
import { useCreatureCreator } from './creatureCreator/useCreatureCreator';

interface CreatureCreatorProps {
    open: boolean;
    onClose: () => void;
    onSave?: (creature: CreatureData) => void;
    editingCreature?: CreatureData | null;
    readOnly?: boolean;
}

export default function CreatureCreator({ open, onClose, onSave, editingCreature, readOnly }: CreatureCreatorProps) {
    const isReadOnly = !!readOnly;
    const creator = useCreatureCreator({ open, onClose, onSave, editingCreature });
    const { creatureData, activeTab, isLoading } = creator;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <CreatureHeader
                creatureData={creatureData}
                isReadOnly={isReadOnly}
                isEditingExisting={!!editingCreature}
                attributeSum={creator.attributeSum}
                expertiseCount={creator.expertiseCount}
            />

            <Tabs
                value={activeTab}
                onChange={(_, v) => creator.setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Básico" icon={<PetsIcon />} iconPosition="start" />
                <Tab label="Habilidades" icon={<Psychology />} iconPosition="start" />
                <Tab label="Magias" icon={<AutoStories />} iconPosition="start" />
                <Tab label="Perícias" icon={<Star />} iconPosition="start" />
            </Tabs>

            <DialogContent sx={{ minHeight: 440 }}>
                {/* ── Tab: Básico ── */}
                {activeTab === 0 && (
                    <BasicTab
                        creatureData={creatureData}
                        setCreatureData={creator.setCreatureData}
                        isReadOnly={isReadOnly}
                        rpgSystem={creator.rpgSystem}
                        attrDefs={creator.attrDefs}
                        setAttribute={creator.setAttribute}
                        applyRolePreset={creator.applyRolePreset}
                        baseCreature={creator.baseCreature}
                        scalingOpen={creator.scalingOpen}
                        setScalingOpen={creator.setScalingOpen}
                        scalingLevel={creator.scalingLevel}
                        setScalingLevel={creator.setScalingLevel}
                        scalingPlayers={creator.scalingPlayers}
                        setScalingPlayers={creator.setScalingPlayers}
                        handleApplyScaling={creator.handleApplyScaling}
                    />
                )}

                {/* ── Tab: Habilidades ── */}
                {activeTab === 1 && (
                    <SkillsTab
                        creatureData={creatureData}
                        isReadOnly={isReadOnly}
                        newSkill={creator.newSkill}
                        setNewSkill={creator.setNewSkill}
                        addSkill={creator.addSkill}
                        removeSkill={creator.removeSkill}
                        onOpenBank={() => creator.setSkillsModalOpen(true)}
                    />
                )}

                {/* ── Tab: Magias ── */}
                {activeTab === 2 && (
                    <SpellsTab
                        creatureData={creatureData}
                        isReadOnly={isReadOnly}
                        newSpell={creator.newSpell}
                        setNewSpell={creator.setNewSpell}
                        addSpell={creator.addSpell}
                        removeSpell={creator.removeSpell}
                        onOpenBank={() => creator.setSpellsModalOpen(true)}
                    />
                )}

                {/* ── Tab: Perícias ── */}
                {activeTab === 3 && (
                    <ExpertisesTab
                        creatureData={creatureData}
                        isReadOnly={isReadOnly}
                        expertiseSearch={creator.expertiseSearch}
                        setExpertiseSearch={creator.setExpertiseSearch}
                        expertiseCount={creator.expertiseCount}
                        filteredExpertiseDefs={creator.filteredExpertiseDefs}
                        clearExpertises={creator.clearExpertises}
                        updateExpertise={creator.updateExpertise}
                    />
                )}
            </DialogContent>

            <CreatureResourceModals
                skillsModalOpen={creator.skillsModalOpen}
                onCloseSkills={() => creator.setSkillsModalOpen(false)}
                spellsModalOpen={creator.spellsModalOpen}
                onCloseSpells={() => creator.setSpellsModalOpen(false)}
                validateAddPowerForCreature={creator.validateAddPowerForCreature}
                handleAddPowerToCreature={creator.handleAddPowerToCreature}
                validateAddSpellForCreature={creator.validateAddSpellForCreature}
                handleAddSpellToCreature={creator.handleAddSpellToCreature}
            />

            <Divider />
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={isLoading} variant="outlined">
                    {isReadOnly ? 'Fechar' : 'Cancelar'}
                </Button>
                {!isReadOnly && (
                    <Button
                        onClick={creator.handleSave}
                        variant="contained"
                        disabled={!creatureData.name.trim() || isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : <PetsIcon />}
                    >
                        {isLoading ? 'Salvando...' : (editingCreature ? 'Atualizar' : 'Criar Criatura')}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
