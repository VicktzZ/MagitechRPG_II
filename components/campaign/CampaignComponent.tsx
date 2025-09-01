'use client';

import { useCampaignContext } from '@contexts';
import { Box } from '@mui/material';
import { type ReactElement } from 'react';
import { CampaignGMDashboard, CampaignNotes, CampaignPlayerDashboard, SessionChat } from '.';
import GMActions from './gmDashboard/GMActions';

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
                    {isUserGM && (
                        <Box sx={{ display: 'flex', mb: 2 }}>
                            <GMActions />
                        </Box>
                    )}
                    <CampaignNotes />
                    {isUserGM ? <CampaignGMDashboard /> : <CampaignPlayerDashboard />}
                </Box>
            </Box>
            <SessionChat />
        </>
    );
}