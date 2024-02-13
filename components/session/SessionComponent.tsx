/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-misused-promises */

'use client';

import copy from 'clipboard-copy'
import { useChannel } from '@contexts/channelContext';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { type ReactElement, useState, useEffect } from 'react'
import type { Member } from '@types';
import type { Members } from 'pusher-js';
import { CustomChat, SessionMembers } from '@components/session';
import { useForceUpdate } from '@mantine/hooks';

export default function SessionComponent({ sessionCode }: { sessionCode: string }): ReactElement {
    const [ openTooltip, setOpenTooltip ] = useState(false);
    const { enqueueSnackbar } = useSnackbar()
    const { channel } = useChannel()
    const [ , setMembers ] = useState<Members>()

    const forceUpdate = useForceUpdate()

    useEffect(() => {
        if (!channel) return
        
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
    
    return (
        <>
            {
                !channel ? (
                    <Box display='flex' justifyContent='center' alignItems='center'>
                        <Typography variant='h4'>Esta sessão não existe ou foi fechada.</Typography>
                    </Box>
                ) : (
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
                                        setOpenTooltip( true)
                                        setTimeout(() => {
                                            setOpenTooltip(false)
                                        }, 1000);
                                    } catch (error:any) {
                                        console.log(error.message)
                                    }
                                }}>{sessionCode}</Button>
                            </Tooltip>
                        </Box>
                        <Box height='80vh' mt={2} display='flex' gap={10}>
                            <SessionMembers members={channel.members} />
                            <CustomChat />
                        </Box>
                    </Box>
                )
            }
        </>
    )
}