/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import PusherClient from 'pusher-js'
import { useEffect, type ReactElement, useState } from 'react'
import SessionComponent from '../SessionComponent'
import { PUSHER_KEY } from '@constants';
import { useSession } from 'next-auth/react';
import { useChannel } from '@contexts/channelContext';
import type { Ficha } from '@types';
import { Box, Modal } from '@mui/material';

export default function Session({ params }: { params: { code: string } }): ReactElement {
    const sessionName = 'presence-' + params.code
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ ficha, setFicha ] = useState<Ficha>()
    const { data: session } = useSession()
    const { setChannel } = useChannel()

    const pusherClient = new PusherClient(PUSHER_KEY, {
        cluster: 'sa1',
        authEndpoint: `/api/pusher/auth?session=${JSON.stringify({ ...session, ficha })}`,
        forceTLS: true
    })

    useEffect(() => {
        document.title = 'Session - ' + params.code
        setChannel(pusherClient.subscribe(sessionName))

        setLoading(false)

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
                    <SessionComponent sessionCode={params.code} />
                )
            }
        </>
    )
}