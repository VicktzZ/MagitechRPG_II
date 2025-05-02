/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext } from '@contexts';
import { useGameMasterContext } from '@contexts/gameMasterContext';
import { SkillType } from '@enums';
import { Box, Grid } from '@mui/material';
import { useState, type ReactElement } from 'react';

import { useSaveFichaChanges } from '@hooks';
import CharacterInfo from './CharacterInfo';
import ExpertiseSection from './ExpertiseSection';
import InventorySection from './InventorySection';
import MoneyAndAmmo from './MoneyAndAmmo';
import NotesSection from './NotesSection';
import SkillsSection from './SkillsSection';
import SpellsSection from './SpellsSection';

export default function CampaignPlayerDashboard(): ReactElement | null {
    const { isUserGM } = useGameMasterContext();
    const { campaign, campUsers } = useCampaignContext();
    const [ selectedSkillType, setSelectedSkillType ] = useState<SkillType>(SkillType.ALL);

    const ficha = campaign.myFicha;
    if (isUserGM || !ficha) return null;
    
    useSaveFichaChanges() // Save users ficha changes globally

    const fichaUser = campUsers.player.find(player => player._id === ficha.userId);
    const avatar = fichaUser?.image ?? '/assets/default-avatar.jpg';

    return (
        <Box sx={{ width: '100%', pb: 8, position: 'relative' }}>
            <Grid container spacing={2}>
                <CharacterInfo avatar={avatar} />
                <MoneyAndAmmo />
                <SkillsSection selectedSkillType={selectedSkillType} setSelectedSkillType={setSelectedSkillType} />
                <InventorySection />
                <SpellsSection />
                <ExpertiseSection />
                <NotesSection />
            </Grid>
        </Box>
    );
}