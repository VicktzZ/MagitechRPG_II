/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, type ReactElement, useState, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Backdrop, Box, CircularProgress, Grid, Modal, Skeleton, type Theme, Typography, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CampaignComponent, CampaignHeader } from '@components/campaign';
import { FichaCard } from '@components/ficha';
import { useChannel } from '@contexts/channelContext';
import { gameMasterContext, campaignContext } from '@contexts';
import { PUSHER_KEY } from '@constants';
import type { Ficha, Campaign as CampaignType, User } from '@types';
import PusherClient, { type PresenceChannel } from 'pusher-js';
import { campaignService, fichaService, sessionService } from '@services';
import { ChatProvider } from '@contexts/ChatProvider';

export default function Campaign({ params }: { params: { code: string } }): ReactElement {
    const campaignName = 'presence-' + params.code;
    document.title = 'Campaign - ' + params.code;
    
    const router = useRouter();
    const { data: session } = useSession();
    const { channel, setChannel } = useChannel();
    const [ isLoading, setIsLoading ] = useState<    boolean>(true);
    const [ isLoadingFichas, setIsLoadingFichas ] = useState<boolean>(true);
    const [ userFichas, setUserFichas ] = useState<Ficha[]>([]);
    const [ allGameMastersId, setAllGameMastersId ] = useState<string[]>([]);
    const [ isUserGM, setIsUserGM ] = useState<boolean>(false);
    const [ campaign, setCampaign ] = useState<CampaignType>({} as CampaignType);
    const [ openFichaModal, setOpenFichaModal ] = useState<boolean>(false);
    const [ ficha, setFicha ] = useState<Ficha>();
    const [ campaignUsers, setCampaignUsers ] = useState<User[]>([]);
    const pusherClientRef = useRef<PusherClient | null>(null);
    const channelRef = useRef<PresenceChannel | null>(null);

    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    useEffect(() => {
        if (!pusherClientRef.current) {
            const pusher = new PusherClient(PUSHER_KEY, {
                cluster: 'sa1',
                authEndpoint: `/api/pusher/auth?session=${JSON.stringify(session)}`,
                forceTLS: true
            });
            pusherClientRef.current = pusher;
        }
    }, [  ]);

    useEffect(() => {
        if (pusherClientRef.current && !channelRef.current && (isUserGM || ficha)) {
            const chn = pusherClientRef.current.subscribe(campaignName) as PresenceChannel;
            channelRef.current = chn;
            setChannel(chn);
        }

        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                setChannel(null);
                channelRef.current = null;
            }
        };
    }, [ campaignName, isUserGM, ficha ]);

    useEffect(() => {
        const fetchCampaign = async () => {
            const campaignResponse = await campaignService.getById(params.code);
            setCampaign(campaignResponse);

            if (campaignResponse) {
                const usersResponse = await campaignService.getCampaignUsers(params.code)
                setCampaignUsers(usersResponse);

                if (campaignResponse.admin.includes(session?.user?._id ?? '')) setIsUserGM(true);
                else {
                    const fichaResponse = await fichaService.fetch({ userId: session?.user?._id ?? '' });

                    setUserFichas(fichaResponse);
                    setIsLoadingFichas(false);
                    setOpenFichaModal(true);
                }
                setAllGameMastersId(campaignResponse.admin);
            }
            setIsLoading(false)
        }

        fetchCampaign();

        return () => {
            pusherClientRef.current?.disconnect();
            sessionService.disconnect({ 
                campaignCode: params.code,
                userId: session?.user?._id ?? ''
            }).then((data) => { console.log(data) })
        };
    }, [ params.code ]);

    const campUsers = useMemo(() => ({
        admin: campaignUsers.filter(u => allGameMastersId.includes(u._id ?? '')),
        player: campaignUsers.filter(u => {
            const isPlayer = campaign.players.some(p => p.userId === u._id);
            const isGM = allGameMastersId.includes(u._id ?? '');
            return isPlayer && !isGM;
        })
    }), [ campaignUsers, allGameMastersId, campaign.players ]);

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
                                    onClick={() => {
                                        setFicha(f);
                                        setCampaign(state =>  ({ ...state, myFicha: f }));
                                        setOpenFichaModal(false);
                                    }}
                                />
                            ))}
                        </Grid>
                    </Box>
                </Modal>
            )}

            {campaign && channel && ((!isLoading && isUserGM) || (!isLoading && ficha)) && (
                <campaignContext.Provider value={{ campaign, setCampaign, campUsers }}>
                    <gameMasterContext.Provider value={{ allGameMastersId, isUserGM }}>
                        <ChatProvider>
                            <Box display='flex' flexDirection='column' gap={3} p={2} minHeight='90vh'>
                                <Box height='100%' width='100%' display={!isMobile ? 'flex' : 'column'} gap={2}>
                                    <CampaignHeader />
                                    <CampaignComponent />
                                </Box>
                            </Box>
                        </ChatProvider>
                    </gameMasterContext.Provider>
                </campaignContext.Provider>
            )}
        </>
    );
}