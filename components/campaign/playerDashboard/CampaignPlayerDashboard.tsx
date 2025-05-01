/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext } from '@contexts/campaignContext';
import { useGameMasterContext } from '@contexts/gameMasterContext';
import { SkillType } from '@enums';
import { Box, Button, Grid } from '@mui/material';
import { fichaService } from '@services';
import { useCallback, useEffect, useState, type ReactElement } from 'react';

import CharacterInfo from './CharacterInfo';
import ExpertiseSection from './ExpertiseSection';
import InventorySection from './InventorySection';
import MoneyAndAmmo from './MoneyAndAmmo';
import NotesSection from './NotesSection';
import SkillsSection from './SkillsSection';
import SpellsSection from './SpellsSection';
import { useSaveFichaChanges } from '@hooks';

export default function CampaignPlayerDashboard(): ReactElement | null {
    const { isUserGM } = useGameMasterContext();
    const { campaign, campUsers, setCampaign } = useCampaignContext();
    const [ selectedSkillType, setSelectedSkillType ] = useState<SkillType>(SkillType.ALL);
    const [ updatedNotes, setUpdatedNotes ] = useState<string | null>(null);
    const [ isSaving, setIsSaving ] = useState(false);

    const ficha = campaign.myFicha;
    if (isUserGM || !ficha) return null;
    
    useSaveFichaChanges() // Save users ficha changes globally

    const fichaUser = campUsers.player.find(player => player._id === ficha.userId);
    const avatar = fichaUser?.image ?? '/assets/default-avatar.jpg';

    const handleNotesChange = useCallback((notes: string) => {
        setUpdatedNotes(notes);
    }, []);

    const handleSave = async (): Promise<void> => {
        if (!ficha._id || updatedNotes === null) return;

        try {
            setIsSaving(true);
            const updatedFicha = await fichaService.updateById({
                id: ficha._id,
                data: {
                    ...ficha,
                    anotacoes: updatedNotes
                }
            });
            
            if (updatedFicha) {
                setCampaign(prev => ({
                    ...prev,
                    myFicha: updatedFicha
                }));
                setUpdatedNotes(null); // Reseta o estado após salvar com sucesso
            }
        } catch (error) {
            console.error('Erro ao salvar ficha:', error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            handleSave();
        }, 60000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{ width: '100%', pb: 8, position: 'relative' }}>
            <Grid container spacing={2}>
                <CharacterInfo avatar={avatar} />
                <MoneyAndAmmo />
                <SkillsSection selectedSkillType={selectedSkillType} setSelectedSkillType={setSelectedSkillType} />
                <InventorySection />
                <SpellsSection />
                <ExpertiseSection />
                <NotesSection onNotesChange={handleNotesChange} />
            </Grid>
            <Box 
                position="fixed" 
                bottom={0} 
                left={0} 
                right={0} 
                bgcolor="background.paper" 
                p={2} 
                display="flex" 
                justifyContent="center"
            >
                <Button 
                    variant="contained" 
                    onClick={handleSave}
                    disabled={isSaving || updatedNotes === null}
                >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
            </Box>
        </Box>
    );
}