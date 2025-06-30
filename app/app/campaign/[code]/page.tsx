/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, type ReactElement, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Backdrop, Box, CircularProgress, Grid, Modal, Skeleton, type Theme, Typography, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CampaignComponent, CampaignHeader } from '@components/campaign';
import { FichaCard } from '@components/ficha';
import { gameMasterContext, campaignContext } from '@contexts';
import type { Ficha, Campaign as CampaignType, User } from '@types';
import { campaignService, fichaService } from '@services';
import { ChatProvider } from '@contexts/ChatProvider';
import { useQuery } from '@tanstack/react-query';
import { useChannel } from '@contexts/channelContext';
import { usePusher } from '@hooks';

export default function Campaign({ params }: { params: { code: string } }): ReactElement {
    const campaignName = 'presence-' + params.code;
    document.title = 'Campaign - ' + params.code;
    
    const router = useRouter();
    const { data: session } = useSession();
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const [ isLoadingFichas, setIsLoadingFichas ] = useState<boolean>(true);
    const [ userFichas, setUserFichas ] = useState<Ficha[]>([]);
    const [ allGameMastersId, setAllGameMastersId ] = useState<string[]>([]);
    const [ isUserGM, setIsUserGM ] = useState<boolean>(false);
    const [ campaign, setCampaign ] = useState<CampaignType>({} as CampaignType);
    const [ openFichaModal, setOpenFichaModal ] = useState<boolean>(false);
    const [ ficha, setFicha ] = useState<Ficha>();
    const [ campaignUsers, setCampaignUsers ] = useState<User[]>([]);
    const [ playerFichas, setPlayerFichas ] = useState<Ficha[]>([]);
    const [ fichaUpdated, setFichaUpdated ] = useState<boolean>(false);
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

    usePusher(campaignName, isUserGM, ficha, session);
    const { channel } = useChannel();

    const { data: campaignResponse, isLoading: isCampaignLoading } = useQuery({
        queryKey: [ 'campaign', params.code ],
        queryFn: async () => await campaignService.getById(params.code)
    });

    const { data: usersResponse, isLoading: isUsersLoading } = useQuery({
        queryKey: [ 'campaignUsers', params.code ],
        queryFn: async () => {
            if (campaignResponse) return await campaignService.getCampaignUsers(params.code);
        },
        enabled: !!campaignResponse
    });

    const { data: fichaResponse, isLoading: isFichaLoading } = useQuery({
        queryKey: [ 'userFichas', session?.user?._id ?? '' ],
        queryFn: async () => {
            if (session?.user?._id) return await fichaService.fetch({ queryParams: { userId: session?.user?._id ?? '' } });
        },
        enabled: !!session?.user?._id
    });

    const { data: playerFichasResponse, isLoading: isPlayerFichasLoading } = useQuery({
        queryKey: [ 'playerFichas', campaignResponse?.players ?? [] ],
        queryFn: async () => {
            if (campaignResponse?.players) return await Promise.all(campaignResponse.players.map(async (player) => {
                const playerFicha = await fichaService.getById(player.fichaId);
                return playerFicha;
            }));
        },
        enabled: !!campaignResponse?.players
    });

    useEffect(() => {
        if (campaignResponse) setCampaign(campaignResponse);
        if (usersResponse) setCampaignUsers(usersResponse);
        if (fichaResponse) {
            setUserFichas(fichaResponse);
            setIsLoadingFichas(false);
            setOpenFichaModal(true);
        }
        if (playerFichasResponse) setPlayerFichas(playerFichasResponse);
    }, [ campaignResponse, usersResponse, fichaResponse, playerFichasResponse ]);

    useEffect(() => {
        setIsLoading(isCampaignLoading || isUsersLoading || isFichaLoading || isPlayerFichasLoading);
    }, [ isCampaignLoading, isUsersLoading, isFichaLoading, isPlayerFichasLoading ]);

    useEffect(() => {
        if (campaignResponse?.admin.includes(session?.user?._id ?? '')) setIsUserGM(true);
        setAllGameMastersId(campaignResponse?.admin ?? []);
    }, [ campaignResponse, session?.user?._id ]);

    const campUsers = useMemo(() => ({
        admin: campaignUsers.filter(u => allGameMastersId.includes(u._id ?? '')),
        player: campaignUsers.filter(u => {
            const isPlayer = campaignResponse?.players.some(p => p.userId === u._id);
            const isGM = allGameMastersId.includes(u._id ?? '');
            return isPlayer && !isGM;
        })
    }), [ campaignUsers, allGameMastersId, campaignResponse?.players ]);

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
                <campaignContext.Provider value={{
                    campaign,
                    setCampaign,
                    campUsers,
                    playerFichas,
                    setPlayerFichas,
                    fichaUpdated,
                    setFichaUpdated
                }}>
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