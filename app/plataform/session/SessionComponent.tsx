/* eslint-disable @typescript-eslint/no-misused-promises */

'use client';

import { Box, Button, TextField } from '@mui/material';
import { type ReactElement, useEffect, useState } from 'react'
import { pusherClient } from '@utils/pusher'

export default function SessionComponent({ roomId }: { roomId: string }): ReactElement {
    const [ data, setData ] = useState<string>('')
    const [ message, setMessage ] = useState<string>('')

    const sendMessage = async (): Promise<void> => {
        const res = await fetch(`/api/session/${roomId}`, {
            method: 'POST',
            body: JSON.stringify({
                message
            })
        }).then(async r => await r.json())

        console.log(res)
    }

    useEffect(() => {

        pusherClient.subscribe(roomId)

        pusherClient.bind('my-event', (dataParam: string) => {
            // setData(dataParam)
            console.log(dataParam);
        })

        return () => {
            pusherClient.unsubscribe(roomId)
        }
    }, [ ])

    return (
        <Box>
            <div>ROOM: {roomId}</div>
            <TextField 
                label='Type your message...'
                onChange={(e) => { setMessage(e.target.value) }}
                value={message}
            />
            <Button onClick={sendMessage}>
                SEND
            </Button>
            <div>MESSAGES: {data}</div>
        </Box>
    )
}