'use client';

import { CharsheetCard } from '@components/charsheet';
import { usePusher } from '@hooks';
import { useCampaignData } from '@hooks/useCampaignData';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import { Backdrop, Box, CircularProgress, Grid, Modal, Skeleton, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, type ReactElement } from 'react';
import { campaignContext, type CampaignContextValue } from './campaignContext';
import { campaignEntity } from '@utils/firestoreEntities';
import type { Campaign } from '@models/entities';

export function CampaignProvider({ children, code }: { children: ReactElement, code: string }) {
    document.title = 'Campaign - ' + code;

    const router = useRouter();
    const { data: session } = useSession();
    const [ charsheetId, setCharsheetId ] = useState('');

    const campaignData = useCampaignData({
        campaignCode: code,
        userId: session?.user?.id
    });

    const { data: charsheetsResponse, loading } = useFirestoreRealtime('charsheet', {
        filters: [
            { field: 'userId', operator: '==', value: session?.user?.id }
        ]
    });

    const isUserGM = campaignData?.isUserGM ?? false;

    usePusher(code, isUserGM, session)

    if (!campaignData) {
        return (
            <Backdrop open={true}>
                <CircularProgress />
            </Backdrop>
        )
    }

    if (campaignData === null) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Typography variant='h5'>Campanha não encontrada</Typography>
            </Box>
        )
    }

    if (!!campaignData && (isUserGM || !!campaignData.charsheets.find(c => c.userId === session?.user?.id) || campaignData.charsheets.map(c => c.id).includes(charsheetId)) || charsheetId) {
        localStorage.setItem('currentCharsheet', (charsheetId || campaignData.charsheets.find(f => f.userId === session?.user?.id)?.id) ?? '');

        const value: CampaignContextValue = {
            ...campaignData,
            updateCampaign: async (data: Partial<Campaign>) => {
                if (!campaignData.campaign.id) return;
                await campaignEntity.update(campaignData.campaign.id, data);
            }
        };

        return (
            <campaignContext.Provider value={value}>
                {children}
            </campaignContext.Provider>
        )
    } else {
        return (
            <Modal
                open={true}
                onClose={() => { router.push('/app/campaign'); }}
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
                disablePortal
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Box
                    display='flex'
                    height='50%'
                    width='61%'
                    bgcolor='background.paper'
                    borderRadius={1}
                    flexDirection='column'
                    p={2}
                    gap={2}
                >
                    <Box>
                        <Typography variant='h6'>Escolha uma ficha para ingressar</Typography>
                    </Box>
                    <Grid minHeight='100%' overflow='auto' gap={2} container>
                        {loading ? [ 0, 1, 2 ].map(() => (
                            <Skeleton
                                variant='rectangular' key={Math.random()} width='20rem' height='15rem'
                            />
                        )) : charsheetsResponse?.map(c => (
                            <CharsheetCard
                                key={c.id}
                                charsheet={c}
                                disableDeleteButton
                                onClick={() => setCharsheetId(c.id)}
                            />
                        ))}
                    </Grid>
                </Box>
            </Modal>
        )
    }
}