/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, type ReactElement, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Backdrop, Box, CircularProgress, Grid, Modal, Skeleton, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CampaignComponent } from '@components/campaign';
import { FichaCard } from '@components/ficha';
import { useChannel } from '@contexts/channelContext';
import { gameMasterContext, campaignContext } from '@contexts';
import { PUSHER_KEY } from '@constants';
import type { Ficha, Campaign as CampaignType } from '@types';
import PusherClient, { type PresenceChannel } from 'pusher-js';
import { useCampaignContext } from '@contexts/campaignContext';

export default function Campaign({ params }: { params: { code: string } }): ReactElement {
    const campaignName = 'presence-' + params.code;
    document.title = 'Campaign - ' + params.code;
    
    const router = useRouter();
    const { data: session } = useSession();
    const { channel, setChannel } = useChannel();
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const [ isLoadingFichas, setIsLoadingFichas ] = useState<boolean>(true);
    const [ userFichas, setUserFichas ] = useState<Ficha[]>([]);
    const [ allGameMastersId, setAllGameMastersId ] = useState<string[]>([]);
    const [ isUserGM, setIsUserGM ] = useState<boolean>(false);
    const [ campaign, setCampaign ] = useState<CampaignType>();
    const [ openFichaModal, setOpenFichaModal ] = useState<boolean>(false);
    const [ ficha, setFicha ] = useState<Ficha>();

    useEffect(() => {
        const fetchCampaign = async () => {
            const campaignResponse: CampaignType = await fetch(`/api/campaign?code=${params.code}`).then(async res => await res.json());
            setCampaign(campaignResponse);

            if (campaignResponse) {
                if (campaignResponse.admin.includes(session?.user?._id ?? '')) setIsUserGM(true);
                else {
                    const fichaResponse: Ficha[] = await fetch(`/api/ficha?user=${session?.user?._id}`).then(async res => await res.json());
                    setUserFichas(fichaResponse);
                    setIsLoadingFichas(false);
                    setOpenFichaModal(true);
                }
                setAllGameMastersId(campaignResponse.admin);
            }
            setIsLoading(false)
        }

        fetchCampaign();
    }, [ ]);

    useEffect(() => {
        let pusherClient: PusherClient | null = null;
        let channel: PresenceChannel | null = null;

        if (campaign && ((!isLoading && isUserGM) || (!isLoading && ficha))) {
            pusherClient = new PusherClient(PUSHER_KEY, {
                cluster: 'sa1',
                authEndpoint: `/api/pusher/auth?session=${JSON.stringify(session)}`,
                forceTLS: true
            });

            channel = pusherClient.subscribe(campaignName) as PresenceChannel;
            setChannel(channel);
        }

        return () => {
            pusherClient?.unsubscribe(campaignName);
            
            fetch('/api/campaign/session', { 
                method: 'PATCH',
                body: JSON.stringify({
                    campaignCode: params.code,
                    playerId: session?.user?._id
                })
            }).then(async r => { console.log(await r.json()) });
        };
    }, [ campaign, isLoading, ficha, isUserGM ]);                

    return (
        <>
            {isLoading && (
                <Backdrop open={true}>
                    <CircularProgress />
                </Backdrop>
            )}

            {!isLoading && !campaign && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        width: '100vw'
                    }}
                >
                    <Typography variant='h5'>Campanha não encontrada</Typography>
                </Box>
            )}

            {!isLoading && !isUserGM && (
                <Modal
                    open={openFichaModal}
                    onClose={() => { router.push('/plataform'); }}
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
                            <Typography variant='h6'>Escolha uma Ficha para ingressar</Typography>
                        </Box>
                        <Grid minHeight='100%' overflow='auto' gap={2} container>
                            {isLoadingFichas ? [ 0, 1, 2, 4, 5 ].map(() => (
                                <Skeleton
                                    variant='rectangular' key={Math.random()} width='20rem' height='15rem' 
                                />
                            )) : userFichas.map((f) => (
                                <FichaCard 
                                    key={f._id}
                                    ficha={f}
                                    disableDeleteButton
                                    onClick={async () => {
                                        await fetch('/api/campaign/session', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                campaignCode: params.code,
                                                player: {
                                                    userId: session?.user._id,
                                                    fichaId: f._id 
                                                }
                                                
                                            })
                                        }).then(async r => { console.log(await r.json()) });

                                        setFicha(f);
                                        setCampaign(state =>  ({ ...state!, myFicha: f }));
                                        setOpenFichaModal(false);
                                    }}
                                />
                            ))}
                        </Grid>
                    </Box>
                </Modal>
            )}

            {campaign && channel && ((!isLoading && isUserGM) || (!isLoading && ficha)) && (
                <campaignContext.Provider value={campaign}>
                    <gameMasterContext.Provider value={{ allGameMastersId, isUserGM }}>
                        <CampaignComponent />
                    </gameMasterContext.Provider>
                </campaignContext.Provider>
            )}
        </>
    );
}