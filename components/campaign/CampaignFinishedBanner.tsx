'use client';

import { useState, type ReactElement } from 'react';
import { Alert, Button } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useCampaignContext } from '@contexts';
import CampaignStatsModal from './CampaignStatsModal';

/**
 * Banner exibido a todos os participantes quando a campanha está finalizada,
 * com acesso à retrospectiva de estatísticas.
 */
export default function CampaignFinishedBanner(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const [ statsOpen, setStatsOpen ] = useState(false);

    if (campaign.status !== 'finished') return null;

    const finishedDate = campaign.finishedAt
        ? new Date(campaign.finishedAt).toLocaleDateString('pt-BR')
        : null;

    return (
        <>
            <Alert
                severity="info"
                icon={<EmojiEventsIcon />}
                sx={{ mb: 2, alignItems: 'center' }}
                action={
                    <Button
                        color="inherit"
                        size="small"
                        variant="outlined"
                        startIcon={<EmojiEventsIcon />}
                        onClick={() => setStatsOpen(true)}
                    >
                        Ver Retrospectiva
                    </Button>
                }
            >
                Esta campanha foi <strong>finalizada</strong>{finishedDate ? ` em ${finishedDate}` : ''}.
                As sessões estão bloqueadas, mas a história ficou registrada!
            </Alert>

            <CampaignStatsModal
                open={statsOpen}
                onClose={() => setStatsOpen(false)}
                campaignId={campaign.id}
                campaignTitle={campaign.title}
            />
        </>
    );
}
