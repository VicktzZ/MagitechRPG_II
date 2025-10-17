'use client';

import { CampaignComponent, CampaignHeader } from '@components/campaign';
import { CampaignProvider } from '@contexts/CampaignProvider';
import { ChatProvider } from '@contexts/ChatProvider';
import { Box, useMediaQuery } from '@mui/material';
import { type Theme } from '@mui/material/styles';
import { type ReactElement } from 'react';

export default function Campaign({ params }: { params: { code: string } }): ReactElement {
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    return (
        <CampaignProvider code={params.code}>
            <ChatProvider>
                <Box display='flex' flexDirection='column' gap={3} p={2} minHeight='90vh'>
                    <Box height='100%' width='100%' display={!isMobile ? 'flex' : 'column'} gap={2}>
                        <CampaignHeader />
                        <CampaignComponent />
                    </Box>
                </Box>
            </ChatProvider>
        </CampaignProvider>
    );
}