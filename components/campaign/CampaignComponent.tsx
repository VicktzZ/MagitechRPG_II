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
import type { Campaign, PusherMemberParam } from '@types';

export default function CampaignComponent(): ReactElement {
    const { channel } = useChannel();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    const { campaign, setCampaign } = useCampaignContext();

    useEffect(() => {
        channel.bind('pusher:subscription_succeeded', async () => {
            await sessionService.connect(campaign.campaignCode, {
                userId: session?.user._id ?? '',
                fichaId: campaign.myFicha?._id ?? ''
            });

            enqueueSnackbar('Você entrou na sessão!', toastDefault('subscriptionToChannel', 'success'));
        });
        
        channel.bind('pusher:member_added', async (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} entrou na sessão!`, toastDefault('enteredToChannel'));
        });

        channel.bind('pusher:member_removed', async (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} saiu da sessão!`, toastDefault('exitFromChannel'));
        });

        channel.bind('update-campaign', async (data: Campaign) => {
            console.log(data)
            setCampaign(data)
        })
    }, [ ]);

    return (
        <Box>
            <CampaignDashboard />
        </Box>
    );
}