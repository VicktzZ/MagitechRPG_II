/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, type ReactElement, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Backdrop, Box, CircularProgress, Grid, Modal, Skeleton, type Theme, Typography, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CampaignComponent, CampaignHeader } from '@components/campaign';
import { FichaCard } from '@components/ficha';
import { useChannel } from '@contexts/channelContext';
import { gameMasterContext, campaignContext } from '@contexts';
import type { Ficha, Campaign as CampaignType, User } from '@types';
import { campaignService, fichaService, sessionService } from '@services';
import { ChatProvider } from '@contexts/ChatProvider';
import { usePusher } from '@hooks';

export default function Campaign({ params }: { params: { code: string } }): ReactElement {
    const campaignName = 'presence-' + params.code;
    document.title = 'Campaign - ' + params.code;
    
    const router = useRouter();
    const { data: session } = useSession();
    const [ isLoading, setIsLoading ] = useState<    boolean>(true);
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

    useEffect(() => {
        const fetchCampaign = async () => {
            const campaignResponse = await campaignService.getById(params.code);
            setCampaign(campaignResponse);

            if (campaignResponse) {
                const usersResponse = await campaignService.getCampaignUsers(params.code)
                setCampaignUsers(usersResponse);

                if (campaignResponse.admin.includes(session?.user?._id ?? '')) setIsUserGM(true);
                else {
                    const fichaResponse = await fichaService.fetch({ queryParams: { userId: session?.user?._id ?? '' } });

                    setUserFichas(fichaResponse);
                    setIsLoadingFichas(false);
                    setOpenFichaModal(true);
                }
                setAllGameMastersId(campaignResponse.admin);

                const playerFichasPromise = Promise.all(campaignResponse.players.map(async (player) => {
                    const playerFicha = await fichaService.getById(player.fichaId);
                    return playerFicha;
                }));
    
                const playerFichasResponse = await playerFichasPromise;
                setPlayerFichas(playerFichasResponse);
            }

            setIsLoading(false)
        }

        fetchCampaign();

        return () => {
            channel?.disconnect();
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