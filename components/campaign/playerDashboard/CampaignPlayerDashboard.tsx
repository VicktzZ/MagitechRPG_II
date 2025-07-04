/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext } from '@contexts';
import { SkillType } from '@enums';
import { Backdrop, Box, CircularProgress, Grid } from '@mui/material';
import { useState, type ReactElement } from 'react';

import { useSaveFichaChanges } from '@hooks';
import CharacterInfo from './CharacterInfo';
import ExpertiseSection from './ExpertiseSection';
import InventorySection from './InventorySection';
import MoneyAndAmmo from './MoneyAndAmmo';
import NotesSection from './NotesSection';
import SkillsSection from './SkillsSection';
import SpellsSection from './SpellsSection';
import { useRealtimeDatabase } from '@hooks';
import { useLocalStorage } from '@uidotdev/usehooks';
import { fichaService } from '@services';
import { campaignCurrentFichaContext } from '@contexts';

export default function CampaignPlayerDashboard(): ReactElement | null {
    const { users, isUserGM } = useCampaignContext();
    const [ selectedSkillType, setSelectedSkillType ] = useState<SkillType>(SkillType.ALL);
    const [ fichaId ] = useLocalStorage<string>('currentFicha', '');

    if (!fichaId) return null;

    const { data: ficha, query: { isPending } } = useRealtimeDatabase({
        collectionName: 'fichas',
        pipeline: [
            {
                $match: {
                    _id: fichaId
                }
            }
        ]
    }, {
        queryKey: [ 'ficha', fichaId ],
        queryFn: async () => await fichaService.getById(fichaId)
    })

    const { updateFicha } = useSaveFichaChanges({ 
        ficha: ficha!, 
        enabled: !isUserGM && !!ficha 
    })

    if (!ficha || isUserGM) return null;
    
    const fichaUser = users.player.find(player => player._id === ficha.userId);
    const avatar = fichaUser?.image ?? '/assets/default-avatar.jpg';

    return (
        <Box sx={{ width: '100%', pb: 8, position: 'relative' }}>
            {isPending ? (
                <Backdrop open={true}>
                    <CircularProgress />
                </Backdrop>
            ) : (
                <campaignCurrentFichaContext.Provider value={{ ficha, updateFicha }}>
                    <Grid container spacing={2}>
                        <CharacterInfo avatar={avatar} />
                        <MoneyAndAmmo />
                        <SkillsSection selectedSkillType={selectedSkillType} setSelectedSkillType={setSelectedSkillType} />
                        <InventorySection />
                        <SpellsSection />
                        <ExpertiseSection />
                        <NotesSection />
                    </Grid>
                </campaignCurrentFichaContext.Provider>
            )}
        </Box>
    );
}