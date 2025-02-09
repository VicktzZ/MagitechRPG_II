/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, type ReactElement, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Backdrop, Box, Button, CircularProgress, Grid, Modal, Skeleton, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CampaignComponent, CampaignHeader } from '@components/campaign';
import { FichaCard } from '@components/ficha';
import { useChannel } from '@contexts/channelContext';
import { gameMasterContext, campaignContext } from '@contexts';
import { PUSHER_KEY } from '@constants';
import type { Ficha, Campaign as CampaignType, User } from '@types';
import PusherClient, { type PresenceChannel } from 'pusher-js';
import { campaignService, fichaService, sessionService, userService } from '@services';

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
    const [ campaign, setCampaign ] = useState<CampaignType>({} as CampaignType);
    const [ openFichaModal, setOpenFichaModal ] = useState<boolean>(false);
    const [ ficha, setFicha ] = useState<Ficha>();
    const [ pusherClient, setPusherClient ] = useState<PusherClient | null>(null);
    const [ copiedCode, setCopiedCode ] = useState<boolean>(false);
    const [ campaignUsers, setCampaignUsers ] = useState<Record<'players' | 'admins', User[]>>({
        players: [],
        admins: []
    })

    useEffect(() => {
        let chn: PresenceChannel | null = null;

        if (campaign && ((!isLoading && isUserGM) || (!isLoading && ficha))) {
            const pusher = new PusherClient(PUSHER_KEY, {
                cluster: 'sa1',
                authEndpoint: `/api/pusher/auth?session=${JSON.stringify(session)}`,
                forceTLS: true
            });

            chn = pusher.subscribe(campaignName) as PresenceChannel;

            setPusherClient(pusher);
            setChannel(chn);
        }
    }, [ campaign, isLoading, ficha, isUserGM ]);  

    useEffect(() => {
        const fetchCampaign = async () => {
            const campaignResponse = await campaignService.getById(params.code);
            setCampaign(campaignResponse);

            if (campaignResponse) {
                campaignResponse.players.map(async player => {
                    const user = await userService.getById(player.userId)
                    setCampaignUsers(state => ({ ...state, players: [ ...state.players, user ] }))
                });

                campaignResponse.admin.map(async gm => {
                    const user = await userService.getById(gm)
                    setCampaignUsers(state => ({ ...state, admins: [ ...state.admins, user ] }))
                });

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
            console.log('asdasdasda')
            pusherClient?.unsubscribe(campaignName);
            channel?.unsubscribe();
            setChannel(null);

            pusherClient?.disconnect();

            sessionService.disconnect({ 
                campaignCode: params.code,
                playerId: session?.user?._id ?? ''
            }).then((data) => { console.log(data) })
        };
    }, [ ]);              

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
                <campaignContext.Provider value={{ campaign, setCampaign }}>
                    <gameMasterContext.Provider value={{ allGameMastersId, isUserGM }}>
                        <Box display='flex' flexDirection='column' gap={3} p={2} minHeight='90vh'>
                            <Box display='flex' flexDirection='column' gap={2} width='50%'>
                                <Typography variant='h6'>{campaign.title}</Typography>
                                <Box width='25%'>
                                    <Tooltip
                                        open={copiedCode}
                                        title='Copiado!'
                                        placement='top'
                                    >
                                        <Box display='flex' alignItems='center' gap={1}>
                                            Código: 
                                            <Button onClick={() => {
                                                navigator.clipboard.writeText(params.code);
                                                setCopiedCode(true);
                                                setTimeout(() => { setCopiedCode(false) }, 1000);
                                            }} variant='outlined'>{params.code}</Button>
                                        </Box>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <Box height='100%' width='25%' display='flex' gap={2}>
                                <CampaignHeader 
                                    admins={campaignUsers.admins}
                                    players={campaignUsers.players}
                                />
                                <CampaignComponent />
                            </Box>
                        </Box>
                    </gameMasterContext.Provider>
                </campaignContext.Provider>
            )}
        </>
    );
}