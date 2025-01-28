/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, type ReactElement, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Grid, Modal, Skeleton, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CampaignComponent } from '@components/campaign';
import { FichaCard } from '@components/ficha';
import { useChannel } from '@contexts/channelContext';
import { gameMasterContext, campaignContext } from '@contexts';
import { PUSHER_KEY } from '@constants';
import type { Ficha, Campaign as CampaignType } from '@types';
import PusherClient, { type PresenceChannel } from 'pusher-js';

export default function Campaign({ params }: { params: { code: string } }): ReactElement {
    const router = useRouter();
    const campaignName = 'presence-' + params.code;

    const [ loading, setLoading ] = useState<boolean>(true);
    const [ isFichaLoading, setIsFichaLoading ] = useState<boolean>(true);
    const [ userFichas, setUserFichas ] = useState<Ficha[]>([]);

    const [ , setFicha ] = useState<Ficha>();
    const { data: session } = useSession();

    const { setChannel } = useChannel();

    const [ allGameMastersId, setAllGameMastersId ] = useState<string[]>([]);
    const [ userIsGM, setUserIsGM ] = useState<boolean>(false);

    const [ campaign, setCampaign ] = useState<CampaignType>();

    const pusherClient = new PusherClient(PUSHER_KEY, {
        cluster: 'sa1',
        authEndpoint: `/api/pusher/auth?session=${JSON.stringify(session)}`,
        forceTLS: true
    });

    useEffect(() => {
        (async () => {
            setLoading(true)
            document.title = 'Campaign - ' + params.code;
    
            const campaignResponse: CampaignType = await fetch(`/api/campaign?code=${params.code}`).then(async res => await res.json());

            if (!campaignResponse) {
                setLoading(false);
                setIsFichaLoading(false);
                return;
            }
            
            if (campaignResponse.admin.includes(session?.user?._id ?? '')) 
                setUserIsGM(true);

            if (isFichaLoading && !userIsGM) {
                const fichaResponse: Ficha[] = await fetch(`/api/ficha?user=${session?.user?._id}`).then(async res => await res.json());
                setUserFichas(fichaResponse);
            }
            
            setAllGameMastersId(campaignResponse.admin);

            setCampaign(campaignResponse ?? { 'null' : null });
            setChannel(pusherClient?.subscribe(campaignName) as PresenceChannel);

            setLoading(false)
        })();

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
    }, []);
    
    return (
        <>
            {
                isFichaLoading && !userIsGM ? (
                    <Modal
                        open={loading}
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
                                {isFichaLoading ? [ 0, 1, 2, 4, 5 ].map(() => (
                                    <Skeleton
                                        variant='rectangular' key={Math.random()} width='20rem' height='15rem' 
                                    />
                                )) : userFichas.map((f) => (
                                    <FichaCard 
                                        key={f._id}
                                        ficha={f}
                                        disableDeleteButton
                                        onClick={async () => {
                                            setFicha(f);

                                            await fetch('/api/campaign/session', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    code: params.code,
                                                    player: {
                                                        userId: session?.user._id,
                                                        fichaId: f._id 
                                                    }
                                                })
                                            });
                                            
                                            setIsFichaLoading(false);
                                        }}
                                    />
                                ))}
                            </Grid>
                        </Box>
                    </Modal>
                ) : !loading && (
                    <campaignContext.Provider value={campaign!}>
                        <gameMasterContext.Provider value={{ allGameMasters: allGameMastersId, userIsGM }}>
                            <CampaignComponent />
                        </gameMasterContext.Provider>
                    </campaignContext.Provider>
                )
            }
        </>
    );
}