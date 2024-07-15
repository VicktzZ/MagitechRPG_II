'use client';

import { useChannel } from '@contexts/channelContext'
import { Box } from '@mui/material'
import { useEffect, type ReactElement } from 'react'
import { CampaignDashboard, CampaignDashboardHeader } from '.';
import { useSnackbar } from 'notistack';
import type { PusherMemberParam } from '@types';

export default function CampaignComponent(): ReactElement {
    const { channel } = useChannel()
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() => {
        channel.bind('pusher:subscription_succeeded', () => {
            enqueueSnackbar('Você entrou na campanha!', { 
                variant: 'success',
                autoHideDuration: 3000,
                preventDuplicate: true,
                key: 'subscriptionToChannel' 
            })
        })
        
        channel.bind('pusher:member_added', (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} entrou na campanha!`, { 
                autoHideDuration: 3000,
                preventDuplicate: true,
                key: 'enteredToChannel'
            })
        })

        channel.bind('pusher:member_removed', (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} saiu da campanha!`, { 
                autoHideDuration: 3000,
                preventDuplicate: true,
                key: 'exitFromChannel'
            })
        })
    }, [ channel, enqueueSnackbar ])

    return (
        <Box>
            <CampaignDashboardHeader />
            <CampaignDashboard />
        </Box>
    )
}