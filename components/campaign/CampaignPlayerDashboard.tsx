/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext } from '@contexts/campaignContext';
import { useGameMasterContext } from '@contexts/gameMasterContext';
import { SkillType } from '@enums';
import { Box, Button, Grid } from '@mui/material';
import { fichaService } from '@services';
import { useCallback, useState, type ReactElement } from 'react';

import CharacterInfo from './playerDashboard/CharacterInfo';
import ExpertiseSection from './playerDashboard/ExpertiseSection';
import InventorySection from './playerDashboard/InventorySection';
import MoneyAndAmmo from './playerDashboard/MoneyAndAmmo';
import NotesSection from './playerDashboard/NotesSection';
import SkillsSection from './playerDashboard/SkillsSection';
import SpellsSection from './playerDashboard/SpellsSection';

export default function CampaignPlayerDashboard(): ReactElement | null {
    const { isUserGM } = useGameMasterContext();
    const { campaign, campUsers, setCampaign } = useCampaignContext();
    const [ selectedSkillType, setSelectedSkillType ] = useState<SkillType>(SkillType.ALL);
    const [ updatedNotes, setUpdatedNotes ] = useState<string | null>(null);
    const [ isSaving, setIsSaving ] = useState(false);

    const ficha = campaign.myFicha;
    if (isUserGM || !ficha) return null;

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

    return (
        <Box sx={{ width: '100%', pb: 8, position: 'relative' }}>
            <Grid container spacing={2}>
                <CharacterInfo ficha={ficha} avatar={avatar} />
                <MoneyAndAmmo ficha={ficha} />
                <SkillsSection ficha={ficha} selectedSkillType={selectedSkillType} setSelectedSkillType={setSelectedSkillType} />
                <InventorySection ficha={ficha} />
                <SpellsSection ficha={ficha} />
                <ExpertiseSection ficha={ficha} />
                <NotesSection ficha={ficha} onNotesChange={handleNotesChange} />
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