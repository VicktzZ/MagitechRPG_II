/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import {
    AttachMoney,
    AutoAwesome,
    Inventory2,
    Person,
    SelfImprovement,
    SportsMartialArts
} from '@mui/icons-material';
import {
    Backdrop,
    Box,
    CircularProgress,
    Stack
} from '@mui/material';
import { type ReactElement } from 'react';

import { Passives, Skills } from '@components/charsheet';
import Section from '../Section';
import ExpertiseSection from './ExpertiseSection';
import InventorySection from './InventorySection';
import MoneyAndAmmo from './MoneyAndAmmo';
import PlayerHeader from './PlayerHeader';
import SpellsSection from './SpellsSection';
import { PerkCardsModal } from '@features/roguelite/components';

export default function CampaignPlayerDashboard(): ReactElement | null {
    const { users, isUserGM, campaign } = useCampaignContext();
    const { charsheet } = useCampaignCurrentCharsheetContext()

    if (!charsheet || isUserGM) return null;
    
    const charsheetUser = users.players.find(player => player.id === charsheet.userId);
    const avatar = charsheetUser?.image ?? '/assets/default-avatar.jpg';

    return (
        <Box 
            sx={{ 
                width: '100%', 
                pb: 8, 
                position: 'relative',
                minHeight: '100vh'
            }}
        >
            {!charsheet ? (
                <Backdrop 
                    open={true}
                    sx={{ 
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backdropFilter: 'blur(3px)'
                    }}
                >
                    <Stack spacing={2} alignItems="center">
                        <CircularProgress size={60} />
                    </Stack>
                </Backdrop>
            ) : (
                <Box 
                    sx={{
                        maxWidth: '1400px',
                        mx: 'auto'
                    }}
                >
                    {/* Header da Charsheet */}
                    <PlayerHeader avatar={avatar} />

                    {/* Grid Principal */}
                    <Stack spacing={4}>
                        {/* Passivas */}
                        <Section
                            title="Passivas"
                            icon={<SelfImprovement sx={{ color: 'text.secondary' }} />}
                        >
                            <Passives realtime={true} />
                        </Section>
                        
                        {/* Inventário e Habilidades */}
                        <Box display='flex' gap={4}>

                            {/* Inventário */}
                            <Section 
                                title="Inventário" 
                                icon={<Inventory2 sx={{ color: 'success.main' }} />}
                                sx={{ width: '60%' }}
                            >
                                <Box>
                                    <InventorySection />
                                </Box>
                            </Section>

                            {/* Habilidades */}
                            <Section 
                                title="Habilidades" 
                                icon={<SportsMartialArts sx={{ color: 'primary.main' }} />}
                                sx={{ width: '40%' }}
                            >
                                <Box>
                                    <Skills />
                                </Box>
                            </Section>
                        </Box>

                        {/* Recursos e Magias */}
                        <Box display='flex' gap={4}>
                            {/* Recursos */}
                            <Section 
                                title="Recursos" 
                                icon={<AttachMoney sx={{ color: 'warning.main' }} />}
                                sx={{ width: '40%' }}
                            >
                                <Box>
                                    <MoneyAndAmmo />
                                </Box>
                            </Section>

                            {/* Magias */}
                            <Section 
                                title="Magias" 
                                icon={<AutoAwesome sx={{ color: 'secondary.main' }} />}
                                sx={{ width: '60%' }}
                            >
                                <Box>
                                    <SpellsSection />
                                </Box>
                            </Section>
                        </Box>

                        {/* Perícias */}
                        <Box>
                            <Section 
                                title="Perícias" 
                                icon={<Person sx={{ color: 'info.main' }} />}
                            >
                                <Box>
                                    <ExpertiseSection />
                                </Box>
                            </Section>
                        </Box>
                    </Stack>
                    {campaign.mode === 'Roguelite' && (
                        <PerkCardsModal open={true} level={charsheet.level} />
                    )}
                </Box>
            )}
        </Box>
    );
}