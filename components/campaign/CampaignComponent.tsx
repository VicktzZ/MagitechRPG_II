// 'use client';

import { useChannel } from '@contexts/channelContext';
import { Box } from '@mui/material';
import { useEffect, type ReactElement } from 'react';
import { CampaignDashboard, CampaignDashboardHeader } from '.';
import { useSnackbar } from 'notistack';
import type { PusherMemberParam } from '@types';
import { useSession } from '@node_modules/next-auth/react';

export default function CampaignComponent(): ReactElement {
    const { channel } = useChannel();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    const campaignCode = window.location.pathname.slice(-8);

    useEffect(() => {
        console.log({ TESTE: 'textando' })

        channel.bind('pusher:subscription_succeeded', async () => {
            console.log({
                message: 'subscription_succeeded',
                campaignCode,
                player: {
                    userId: session?.user._id,
                    fichaId: channel.members.me.info.currentFicha
                }
            });
            
            await fetch('/api/campaign/session', {
                method: 'POST',
                body: JSON.stringify({
                    campaignCode,
                    player: {
                        userId: session?.user._id,
                        fichaId: channel.members.me.info.currentFicha
                    }
                })
            });

            enqueueSnackbar('Você entrou na sessão!', { 
                variant: 'success',
                autoHideDuration: 3000,
                preventDuplicate: true,
                key: 'subscriptionToChannel' 
            });
        });
        
        channel.bind('pusher:member_added', (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} entrou na sessão!`, { 
                autoHideDuration: 3000,
                preventDuplicate: true,
                key: 'enteredToChannel'
            });
        });

        channel.bind('pusher:member_removed', (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} saiu da sessão!`, { 
                autoHideDuration: 3000,
                preventDuplicate: true,
                key: 'exitFromChannel'
            });
        });
    }, [ channel, session?.user._id ]);    

    return (
        <Box>
            <CampaignDashboardHeader />
            <CampaignDashboard />
        </Box>
    );
}