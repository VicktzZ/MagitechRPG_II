'use client';

import { useCampaignContext } from '@contexts';
import { Box } from '@mui/material';
import { type ReactElement } from 'react';
import { CampaignGMDashboard, CampaignNotes, CampaignPlayerDashboard, SessionChat } from '.';

export default function CampaignComponent(): ReactElement {
    const { isUserGM } = useCampaignContext();

    return (
        <>
            <Box sx={{
                display: 'flex',
                position: 'relative',
                gap: 2,
                width: '100%',
                height: '100%'
            }}>
                <Box sx={{
                    width: '100%'
                }}>
                    <CampaignNotes />
                    {isUserGM ? <CampaignGMDashboard /> : <CampaignPlayerDashboard />}
                </Box>
            </Box>
            <SessionChat />
        </>
    );
}