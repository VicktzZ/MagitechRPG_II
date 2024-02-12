/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import PusherClient, { type PresenceChannel } from 'pusher-js'
import { useEffect, type ReactElement, useState } from 'react'
import { PUSHER_KEY } from '@constants';
import { useSession } from 'next-auth/react';
import { useChannel } from '@contexts/channelContext';
import { Box, Modal } from '@mui/material';
import { SessionComponent } from '@components/session';
import { gameMasterContext } from '@contexts';
import type { Ficha, SessionModel } from '@types';

export default function Session({ params }: { params: { code: string } }): ReactElement {
    const sessionName = 'presence-' + params.code
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ ficha, , ] = useState<Ficha>()
    const [ gameMasterId, setGameMasterId ] = useState<string[]>([])
    const { data: session } = useSession()
    const { setChannel } = useChannel()

    const pusherClient = new PusherClient(PUSHER_KEY, {
        cluster: 'sa1',
        authEndpoint: `/api/pusher/auth?session=${JSON.stringify({ ...session, ficha })}`,
        forceTLS: true
    })

    useEffect(() => {
        (async () => {
            document.title = 'Session - ' + params.code
    
            const sessionResponse: SessionModel = await fetch(`/api/session?code=${params.code}`).then(async res => await res.json())

            if (!sessionResponse) {
                setLoading(false)
                return
            }

            setGameMasterId(sessionResponse?.admin)

            setChannel(pusherClient.subscribe(sessionName) as PresenceChannel)
            setLoading(false)
        })()

        return () => {
            pusherClient.unsubscribe(sessionName)
        }
    }, [])
    
    return (
        <>
            {
                loading ? (
                    <Modal
                        open={loading}
                        onClose={() => {}}
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
                        <Box></Box>
                    </Modal>
                ) : (
                    <gameMasterContext.Provider value={{ gameMasterId }}>
                        <SessionComponent sessionCode={params.code} />
                    </gameMasterContext.Provider>
                )
            }
        </>
    )
}