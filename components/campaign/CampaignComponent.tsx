// 'use client';

import { useChannel } from '@contexts/channelContext';
import { Box } from '@mui/material';
import { useEffect, type ReactElement } from 'react';
import { CampaignDashboard } from '.';
import { useSnackbar } from 'notistack';
import { useSession } from '@node_modules/next-auth/react';
import { useCampaignContext } from '@contexts/campaignContext';
import { sessionService } from '@services';
import { toastDefault } from '@constants';
import type { PusherMemberParam } from '@types';

export default function CampaignComponent(): ReactElement {
    const { channel } = useChannel();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    const { campaignCode, myFicha } = useCampaignContext();

    useEffect(() => {
        channel.bind('pusher:subscription_succeeded', async () => {
            await sessionService.connect(campaignCode, {
                userId: session?.user._id ?? '',
                fichaId: myFicha?._id ?? ''
            });

            enqueueSnackbar('Você entrou na sessão!', toastDefault('subscriptionToChannel', 'success'));
        });
        
        channel.bind('pusher:member_added', (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} entrou na sessão!`, toastDefault('enteredToChannel'));
        });

        channel.bind('pusher:member_removed', (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} saiu da sessão!`, toastDefault('exitFromChannel'));
        });

        channel.bind('pusher:connection_state_changed', (e: { current: string }) => {
            console.log(e)
        })
    }, [ channel, session?.user._id ]);    

    return (
        <Box>
            <CampaignDashboard />
        </Box>
    );
}