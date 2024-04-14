/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import PusherClient, { type PresenceChannel } from 'pusher-js'
import { useEffect, type ReactElement, useState } from 'react'
import { PUSHER_KEY } from '@constants';
import { useSession } from 'next-auth/react';
import { useChannel } from '@contexts/channelContext';
import { Backdrop, Box, CircularProgress, Grid, Modal, Skeleton, Typography } from '@mui/material';
import { SessionComponent } from '@components/session';
import { gameMasterContext } from '@contexts';
import { useRouter } from 'next/navigation';
import type { Ficha, SessionModel } from '@types';
import { FichaCard } from '@components/ficha';

export default function Session({ params }: { params: { code: string } }): ReactElement {
    const sessionName = 'presence-' + params.code
    const router = useRouter()

    // const [ pusherClient, setPusherClient ] = useState<PusherClient | null>(null)
    let pusherClient: PusherClient | null

    const [ loading, setLoading ] = useState<boolean>(true)
    const [ isFichaLoading, setIsFichaLoading ] = useState<boolean>(true)
    const [ userFichas, setUserFichas ] = useState<Ficha[]>([])

    const [ ficha, setFicha ] = useState<Ficha>()
    const [ gameMasterId, setGameMasterId ] = useState<string[]>([])

    const { data: session } = useSession()
    const { setChannel } = useChannel()

    useEffect(() => {
        (async () => {
            document.title = 'Session - ' + params.code
    
            const sessionResponse: SessionModel = await fetch(`/api/session?code=${params.code}`).then(async res => await res.json())

            if (!sessionResponse) {
                setLoading(false)
                return
            }

            setGameMasterId(sessionResponse?.admin)
            
            if (sessionResponse.admin.includes(session?.user?._id as unknown as string)) {
                pusherClient = new PusherClient(PUSHER_KEY, {
                    cluster: 'sa1',
                    authEndpoint: `/api/pusher/auth?session=${JSON.stringify(session)}`,
                    forceTLS: true
                })

                setIsFichaLoading(false)
                setLoading(true)

                setChannel(pusherClient?.subscribe(sessionName) as PresenceChannel)
                setLoading(false)
            }

            if (isFichaLoading) {
                const fichaResponse: Ficha[] = await fetch(`/api/ficha?user=${session?.user?._id}`).then(async res => await res.json())

                setUserFichas(fichaResponse)
                setIsFichaLoading(false)
            }
        })()

        return () => {
            pusherClient?.unsubscribe(sessionName)
        }
    }, [])
    
    return (
        <>
            {
                loading ? (
                    <Modal
                        open={loading}
                        onClose={() => { router.push('/plataform') }}
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
                                {isFichaLoading ? [ 0, 1, 2 ].map(() => (
                                    <Skeleton
                                        variant='rectangular' key={Math.random()} width='20rem' height='15rem' 
                                    />
                                )) : userFichas.map((f) => (
                                    <FichaCard 
                                        key={f._id}
                                        ficha={f}
                                        disableDeleteButton
                                        onClick={() => {
                                            setFicha(f)
                                            setLoading(false)

                                            pusherClient = new PusherClient(PUSHER_KEY, {
                                                cluster: 'sa1',
                                                authEndpoint: `/api/pusher/auth?session=${JSON.stringify(session)}&ficha=${JSON.stringify(f)}`,
                                                forceTLS: true
                                            })

                                            setChannel(pusherClient?.subscribe(sessionName) as PresenceChannel)
                                        }}
                                    />
                                ))}
                            </Grid>
                        </Box>
                    </Modal>
                ) : !loading ? (
                    <gameMasterContext.Provider value={{ allGameMasters: gameMasterId, userIsGM: false }}>
                        <SessionComponent sessionCode={params.code} />
                    </gameMasterContext.Provider>
                ) : ficha && (
                    <Backdrop
                        open={loading}
                    >
                        <CircularProgress />
                    </Backdrop>
                )
            }
        </>
    )
}