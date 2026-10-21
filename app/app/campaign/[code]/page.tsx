'use client';

import CampaignShell from '@components/campaign/CampaignShell';
import { CampaignProvider } from '@contexts/CampaignProvider';
import { ChatProvider } from '@contexts/ChatProvider';
import { type ReactElement } from 'react';

export default function Campaign({ params }: { params: { code: string } }): ReactElement {
    return (
        <CampaignProvider code={params.code}>
            <ChatProvider>
                <CampaignShell />
            </ChatProvider>
        </CampaignProvider>
    );
}
