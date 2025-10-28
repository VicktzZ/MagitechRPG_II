'use client';

import { useCampaignData } from '@hooks/useCampaignData';
import { Backdrop, Box, CircularProgress, Modal, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { type ReactElement } from 'react';
import { campaignContext } from './campaignContext';

export function CampaignProvider({ children, code }: { children: ReactElement, code: string }) {
    document.title = 'Campaign - ' + code;

    const router = useRouter();
    const { data: session } = useSession();

    const campaignData = useCampaignData({
        campaignCode: code,
        userId: session?.user?.id
    });

    const isUserGM = campaignData?.isUserGM ?? false;

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

    if (campaignData && (isUserGM || campaignData.charsheets.find(f => f.userId === session?.user?.id))) {
        localStorage.setItem('currentCharsheet', campaignData.charsheets.find(f => f.userId === session?.user?.id)?.id ?? '');
        return (
            <campaignContext.Provider value={campaignData}>
                {children}
            </campaignContext.Provider>
        )
    } else {
        return (
            <Modal
                open={true}
                onClose={() => { router.push('/app'); }}
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
                        <Typography variant='h6'>Escolha uma Charsheet para ingressar</Typography>
                    </Box>
                    {/* <Grid minHeight='100%' overflow='auto' gap={2} container>
                        {isCharsheetLoading ? [ 0, 1, 2, 4, 5 ].map(() => (
                            <Skeleton
                                variant='rectangular' key={Math.random()} width='20rem' height='15rem'
                            />
                        )) : charsheetsResponse?.map((f: Charsheet) => (
                            <CharsheetCard
                                key={f.id}
                                charsheet={f}
                                disableDeleteButton
                                onClick={() => { setCurrentCharsheet(f.id ?? ''); setCharsheet(f); }}
                            />
                        ))}
                    </Grid> */}
                </Box>
            </Modal>
        )
    }
}