'use client';

import { Box } from '@mui/material';
import type { ReactElement } from 'react';
import { useCampaignContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext';
import SingleWidgetPanel from './SingleWidgetPanel';

/**
 * Empilha os widgets FLUTUANTES da campanha — visíveis a todos os
 * participantes (jogadores e mestre), no mesmo estilo do pop-up de combate.
 * Suporta até MAX_CAMPAIGN_WIDGETS instâncias simultâneas.
 */
export default function CampaignWidgetPanel(): ReactElement | null {
    const { campaign, isUserGM } = useCampaignContext();
    const { isChatOpen } = useChatContext();

    const widgets = (campaign.widgets ?? []).filter(w => w.enabled);
    if (widgets.length === 0) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 80,
                // Desloca para a esquerda do chat (400px + gap) quando ele está aberto,
                // para os widgets continuarem visíveis ao lado em vez de ficarem cobertos
                right: isChatOpen ? 416 : 16,
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column-reverse',
                alignItems: 'flex-end',
                gap: 1.5,
                maxHeight: 'calc(100vh - 100px)',
                transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {widgets.map(widget => (
                <SingleWidgetPanel
                    key={widget.id}
                    widget={widget}
                    campaignId={campaign.id}
                    isUserGM={isUserGM}
                    isFinished={campaign.status === 'finished'}
                />
            ))}
        </Box>
    );
}
