'use client';

import { Box } from '@mui/material';
import { duration, easing } from '@themes/tokens';
import type { ReactElement } from 'react';
import { useChatContext } from '@contexts/chatContext';
import CampaignComponent from './CampaignComponent';
import { CHAT_DOCK_GAP, CHAT_PANEL_WIDTH, useChatDocked } from './campaignLayout';

/** Moldura da página da campanha: com o chat encaixado e aberto, o conteúdo ganha a margem dele em vez de ficar por baixo */
export default function CampaignShell(): ReactElement {
    const { isChatOpen } = useChatContext();
    const docked = useChatDocked();

    return (
        <Box
            sx={{
                minHeight: '90vh',
                p: 2,
                pr: docked && isChatOpen ? `${CHAT_PANEL_WIDTH + CHAT_DOCK_GAP}px` : 2,
                transition: `padding-right ${duration.slow}ms ${easing.standard}`
            }}
        >
            <CampaignComponent />
        </Box>
    );
}
