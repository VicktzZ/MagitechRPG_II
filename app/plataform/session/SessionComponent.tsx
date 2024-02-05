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

export default function SessionComponent({ sessionCode }: { sessionCode: string }): ReactElement {
    const [ members, setMembers ] = useState<Members>()
    const [ openTooltip, setOpenTooltip ] = useState(false);
    const { enqueueSnackbar } = useSnackbar()
    const { channel } = useChannel()

    useEffect(() => {
        setMembers(channel.members)
        enqueueSnackbar('Você entrou na sessão!', { autoHideDuration: 3000, variant: 'success', preventDuplicate: true })

        channel.bind('pusher:member_added', (member: { id: string, info: Member }) => {
            enqueueSnackbar(`${member.info.name} entrou na sessão!`, { autoHideDuration: 3000, preventDuplicate: true })
            setMembers(channel.members)
        })

        channel.bind('pusher:member_removed', (member: { id: string, info: Member }) => {
            enqueueSnackbar(`${member.info.name} saiu da sessão!`, { autoHideDuration: 3000, preventDuplicate: true })
            setMembers(channel.members)
        })
    }, [])

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
                <Typography variant='h6'>Membros: {members?.count}</Typography>
            </Box>
        </Box>
    )
}