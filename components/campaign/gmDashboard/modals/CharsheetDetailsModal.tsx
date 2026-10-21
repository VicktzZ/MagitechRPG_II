'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Tabs,
    Tab
} from '@mui/material';
import ChangePlayerStatusModal from './ChangePlayerStatusModal';
import type { CharsheetDTO } from '@models/dtos';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';
import AttributesTab from './charsheetDetails/AttributesTab';
import BasicInfoTab from './charsheetDetails/BasicInfoTab';
import CharsheetDetailsHeader from './charsheetDetails/CharsheetDetailsHeader';
import ExpertisesTab from './charsheetDetails/ExpertisesTab';
import InventoryTab from './charsheetDetails/InventoryTab';
import SkillsTab from './charsheetDetails/SkillsTab';
import SpellsTab from './charsheetDetails/SpellsTab';
import TabPanel, { a11yProps } from './charsheetDetails/TabPanel';
import { useCharsheetEditing } from './charsheetDetails/useCharsheetEditing';
import { useCharsheetSpells } from './charsheetDetails/useCharsheetSpells';

interface CharsheetDetailsModalProps {
    open: boolean;
    onClose: () => void;
    charsheet: Required<CharsheetDTO>;
}

export default function CharsheetDetailsModal({ open, onClose, charsheet }: CharsheetDetailsModalProps) {
    const [ tabValue, setTabValue ] = useState(0);
    const { system: customSystem } = useCharsheetSystem(charsheet.systemId);
    const weightUnit = customSystem ? (customSystem.weightConfig?.unit ?? '') : 'kg';

    const [ modalStates, setModalStates ] = useState({
        changePlayerStatusModalOpen: false,
        changePlayerAttributesModalOpen: false,
        changePlayerSkillsModalOpen: false,
        changePlayerSpellsModalOpen: false,
        changePlayerInventoryModalOpen: false,
        changePlayerAbilitiesModalOpen: false
    });

    const {
        isEditing,
        setIsEditing,
        isSaving,
        editedData,
        updateNestedField,
        handleNumberInputChange,
        handleSave,
        handleCancelEdit
    } = useCharsheetEditing({ open, charsheet });

    const spells = useCharsheetSpells(charsheet);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <CharsheetDetailsHeader
                    charsheet={charsheet}
                    editedData={editedData}
                    isEditing={isEditing}
                    isSaving={isSaving}
                    updateNestedField={updateNestedField}
                    handleNumberInputChange={handleNumberInputChange}
                    onStartEdit={() => setIsEditing(true)}
                    onCancelEdit={handleCancelEdit}
                    onSave={handleSave}
                />
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="detalhes da charsheet">
                            <Tab label="Informações Básicas" {...a11yProps(0)} />
                            <Tab label="Atributos" {...a11yProps(1)} />
                            <Tab label="Perícias" {...a11yProps(2)} />
                            <Tab label="Inventário" {...a11yProps(3)} />
                            <Tab label="Habilidades" {...a11yProps(4)} />
                            <Tab label="Spells" {...a11yProps(5)} />
                        </Tabs>
                    </Box>

                    {/* Informações Básicas */}
                    <TabPanel value={tabValue} index={0}>
                        <BasicInfoTab
                            charsheet={charsheet}
                            editedData={editedData}
                            isEditing={isEditing}
                            updateNestedField={updateNestedField}
                            handleNumberInputChange={handleNumberInputChange}
                            weightUnit={weightUnit}
                            onOpenStatusModal={() => setModalStates({ ...modalStates, changePlayerStatusModalOpen: true })}
                        />
                    </TabPanel>

                    {/* Atributos */}
                    <TabPanel value={tabValue} index={1}>
                        <AttributesTab
                            charsheet={charsheet}
                            editedData={editedData}
                            isEditing={isEditing}
                            updateNestedField={updateNestedField}
                        />
                    </TabPanel>

                    {/* Perícias */}
                    <TabPanel value={tabValue} index={2}>
                        <ExpertisesTab
                            charsheet={charsheet}
                            editedData={editedData}
                            isEditing={isEditing}
                            updateNestedField={updateNestedField}
                        />
                    </TabPanel>

                    {/* Inventário */}
                    <TabPanel value={tabValue} index={3}>
                        <InventoryTab
                            charsheet={charsheet}
                            editedData={editedData}
                            isEditing={isEditing}
                            updateNestedField={updateNestedField}
                            weightUnit={weightUnit}
                        />
                    </TabPanel>

                    {/* Habilidades */}
                    <TabPanel value={tabValue} index={4}>
                        <SkillsTab
                            charsheet={charsheet}
                            editedData={editedData}
                            isEditing={isEditing}
                            updateNestedField={updateNestedField}
                        />
                    </TabPanel>

                    {/* Spells */}
                    <TabPanel value={tabValue} index={5}>
                        <SpellsTab
                            charsheet={charsheet}
                            editedData={editedData}
                            isEditing={isEditing}
                            updateNestedField={updateNestedField}
                            spells={spells}
                        />
                    </TabPanel>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Fechar</Button>
                </DialogActions>
            </Dialog>

            {/* Modals */}
            <ChangePlayerStatusModal
                open={modalStates.changePlayerStatusModalOpen}
                onClose={() => setModalStates({ ...modalStates, changePlayerStatusModalOpen: false })}
                charsheet={charsheet}
            />
        </>
    );
}
