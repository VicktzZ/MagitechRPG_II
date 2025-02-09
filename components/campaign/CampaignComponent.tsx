// 'use client';

import { useChannel } from '@contexts/channelContext';
import { Box } from '@mui/material';
import { useEffect, type ReactElement } from 'react';
import { CampaignDashboard, SessionChat } from '.';
import { useSnackbar } from 'notistack';
import { useSession } from '@node_modules/next-auth/react';
import { useCampaignContext } from '@contexts/campaignContext';
import { sessionService } from '@services';
import { toastDefault } from '@constants';
import { PusherEvent } from '@enums';
import type { Campaign, PusherMemberParam } from '@types';

export default function CampaignComponent(): ReactElement {
    const { channel } = useChannel();
    const { data: session } = useSession();
    const { enqueueSnackbar } = useSnackbar();
    const { campaign, setCampaign } = useCampaignContext();

    useEffect(() => {
        channel.bind(PusherEvent.SUBSCRIPTION, async () => {
            await sessionService.connect({
                campaignCode: campaign.campaignCode,
                isGM: campaign.admin.includes(session?.user._id ?? ''),
                playerId: session?.user._id ?? ''
            });

            enqueueSnackbar('Você entrou na sessão!', toastDefault('subscriptionToChannel', 'success'));
        });
        
        channel.bind(PusherEvent.MEMBER_ADDED, async (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} entrou na sessão!`, toastDefault('enteredToChannel'));
        });

        channel.bind(PusherEvent.MEMBER_REMOVED, async (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} saiu da sessão!`, toastDefault('exitFromChannel'));
        });

        channel.bind(PusherEvent.UPDATE_CAMPAIGN, async (data: Campaign) => {
            console.log(data)
            setCampaign(data)
        })
    }, [ ]);

    return (
        <Box>
            <SessionChat />
            <CampaignDashboard />
        </Box>
    );
}