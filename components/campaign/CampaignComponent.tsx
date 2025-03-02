// 'use client';

import { useChannel } from '@contexts/channelContext';
import { Box, Backdrop, CircularProgress } from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';
import { CampaignPlayerDashboard, SessionChat } from '.';
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
    const [ isSubscribed, setIsSubscribed ] = useState(false);

    useEffect(() => {
        if (!channel) return;

        const handleSubscription = async () => {
            await sessionService.connect({
                campaignCode: campaign.campaignCode,
                isGM: campaign.admin.includes(session?.user._id ?? ''),
                userId: session?.user._id ?? ''
            });

            enqueueSnackbar('Você entrou na sessão!', toastDefault('subscriptionToChannel', 'success'));
            setIsSubscribed(true);
        };

        channel.bind(PusherEvent.SUBSCRIPTION, handleSubscription);

        channel.bind(PusherEvent.MEMBER_ADDED, (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} entrou na sessão!`, toastDefault('enteredToChannel'));
        });

        channel.bind(PusherEvent.MEMBER_REMOVED, (user: PusherMemberParam) => {
            enqueueSnackbar(`${user.info.name} saiu da sessão!`, toastDefault('exitFromChannel'));
        });

        channel.bind(PusherEvent.CAMPAIGN_UPDATED, (data: Campaign) => {
            console.log(PusherEvent.CAMPAIGN_UPDATED);
            setCampaign(prev => ({
                ...data,
                session: {
                    ...data.session,
                    messages: prev?.session?.messages ?? data.session.messages
                }
            }));
        })

        return () => {
            channel.unbind(PusherEvent.CAMPAIGN_UPDATED);
        };
    }, [ ]);

    if (!isSubscribed) {
        return (
            <Backdrop
                open={true}
                sx={{
                    zIndex: theme => theme.zIndex.drawer + 1
                }}
            >
                <CircularProgress color="primary" />
            </Backdrop>
        );
    }

    return (
        <>
            <Box sx={{
                display: 'flex',
                position: 'relative',
                gap: 2,
                width: '100%',
                height: '100%'
            }}>
                <Box sx={{
                    width: '100%'
                }}>
                    <CampaignPlayerDashboard />
                </Box>
            </Box>
            <SessionChat />
        </>
    );
}