'use client';

import { useState, type ReactElement } from 'react';
import { Box, Grid } from '@mui/material';
import { useCampaignContext } from '@contexts/campaignContext';
import { useGameMasterContext } from '@contexts/gameMasterContext';
import { SkillType, SpellType } from '@enums';
import CharacterInfo from './dashboard/CharacterInfo';
import SkillsSection from './dashboard/SkillsSection';
import MoneyAndAmmo from './dashboard/MoneyAndAmmo';
import InventorySection from './dashboard/InventorySection';
import SpellsSection from './dashboard/SpellsSection';
import ExpertiseSection from './dashboard/ExpertiseSection';

export default function CampaignPlayerDashboard(): ReactElement | null {
    const { isUserGM } = useGameMasterContext();
    const { campaign, campUsers } = useCampaignContext();
    const [ selectedSkillType, setSelectedSkillType ] = useState<SkillType>(SkillType.ALL);

    const ficha = campaign.myFicha;
    if (isUserGM || !ficha) return null;

    const fichaUser = campUsers.player.find(player => player._id === ficha.userId);
    const avatar = fichaUser?.image ?? '/assets/default-avatar.jpg';

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2}>
                <CharacterInfo ficha={ficha} avatar={avatar} />
                <MoneyAndAmmo ficha={ficha} />
                <SkillsSection ficha={ficha} selectedSkillType={selectedSkillType} setSelectedSkillType={setSelectedSkillType} />
                <InventorySection ficha={ficha} />
                <SpellsSection ficha={ficha} />
                <ExpertiseSection ficha={ficha} />
            </Grid>
        </Box>
    );
}