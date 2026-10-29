'use client';

import type { ReactElement } from 'react';
import { useCampaignContext } from '@contexts';
import SingleWidgetPanel from './SingleWidgetPanel';

/**
 * Widgets FLUTUANTES da campanha — visíveis a todos os participantes (jogadores e mestre).
 * Suporta até MAX_CAMPAIGN_WIDGETS instâncias simultâneas. Quem posiciona e empilha é o
 * FloatingDock (junto do card de combate); aqui só saem os painéis.
 */
export default function CampaignWidgetPanel(): ReactElement | null {
    const { campaign, isUserGM } = useCampaignContext();

    const widgets = (campaign.widgets ?? []).filter(w => w.enabled);
    if (widgets.length === 0) return null;

    return (
        <>
            {widgets.map(widget => (
                <SingleWidgetPanel
                    key={widget.id}
                    widget={widget}
                    campaignId={campaign.id}
                    isUserGM={isUserGM}
                    isFinished={campaign.status === 'finished'}
                />
            ))}
        </>
    );
}
