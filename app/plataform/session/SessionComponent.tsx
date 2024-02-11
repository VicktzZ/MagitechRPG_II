/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-misused-promises */

'use client';

import copy from 'clipboard-copy'
import { useChannel } from '@contexts/channelContext';
import { Avatar, Box, Button, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { type ReactElement, useState, useEffect } from 'react'
import type { Member } from '@types';
import type { Members } from 'pusher-js';
import useForceUpdate from '@hooks/useForceUpdate';
import Image from 'next/image';

export default function SessionComponent({ sessionCode }: { sessionCode: string }): ReactElement {
    const [ openTooltip, setOpenTooltip ] = useState(false);
    const { enqueueSnackbar } = useSnackbar()
    const { channel } = useChannel()
    const [ members, setMembers ] = useState<Members>()

    const forceUpdate = useForceUpdate()

    useEffect(() => {
        channel.bind('pusher:subscription_succeeded', () => {
            enqueueSnackbar('Você entrou na sessão!', { autoHideDuration: 3000, variant: 'success', preventDuplicate: true })
            forceUpdate()
        })

        channel.bind('pusher:member_added', (member: { id: string, info: Member }) => {
            enqueueSnackbar(`${member.info.name} entrou na sessão!`, { autoHideDuration: 3000, preventDuplicate: true })
            forceUpdate()
        })

        channel.bind('pusher:member_removed', (member: { id: string, info: Member }) => {
            enqueueSnackbar(`${member.info.name} saiu da sessão!`, { autoHideDuration: 3000, preventDuplicate: true })
            forceUpdate()
        })

        setMembers(channel.members)

        return () => {
            channel.unbind('pusher:member_added')
        }
    }, [ ])

    useEffect(() => {
        forceUpdate()
    }, [ channel.members ])

    return (
        <Box p={2}>
            <Box display='flex' alignItems='center' gap={1}>
                <Typography variant='h6'>Código da Sessão:</Typography>
                <Tooltip
                    onClose={() => { setOpenTooltip(false) }}
                    open={openTooltip}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title="Link copiado!"
                    PopperProps={{
                        disablePortal: true
                    }}
                >
                    <Button onClick={async () => {
                        try {
                            await copy(window.location.href)
                            setOpenTooltip(true)
                            setTimeout(() => {
                                setOpenTooltip(false)
                            }, 1000);
                        } catch (error:any) {
                            console.log(error.message)
                        }
                    }}>{sessionCode}</Button>
                </Tooltip>
            </Box>
            <Box>
                {
                    members?.members ?
                        Object?.values<Member>(members?.members as Record<string, Member>).map((member: Member) => (
                            <Box
                                display='flex'
                                key={member._id}
                                m={'20px 0'}
                                gap={2}
                                alignItems='center'
                            >
                                <Avatar
                                    // sx={{
                                    //     border: '2px solid yellow'
                                    // }}
                                >
                                    {
                                        member.image ? (
                                            <Image
                                                height={250}
                                                width={250}
                                                style={{ height: '100%', width: '100%' }} 
                                                src={member.image}
                                                alt={member.name.charAt(0).toUpperCase()}
                                            />
                                        ) : (
                                            member.name.charAt(0).toUpperCase()
                                        )
                                    }
                                </Avatar>
                                <Typography>{member.name}</Typography>
                            </Box>
                        ))
                        : 'Carregando...'
                }
            </Box>
        </Box>
    )
}