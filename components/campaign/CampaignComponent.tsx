// 'use client';

import { useChannel } from '@contexts/channelContext';
import { Box, IconButton, Backdrop, CircularProgress } from '@mui/material';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';
import { useEffect, useState, type ReactElement } from 'react';
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
    const [ isChatOpen, setIsChatOpen ] = useState(true);
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

        channel.bind(PusherEvent.MEMBER_ADDED, async (user: PusherMemberParam) => {
            channel.trigger('client-session_updated', { user: user.info._id, session: 'entered' })
            enqueueSnackbar(`${user.info.name} entrou na sessão!`, toastDefault('enteredToChannel'));
        });

        channel.bind(PusherEvent.MEMBER_REMOVED, async (user: PusherMemberParam) => {
            channel.trigger('client-session_updated', { user: user.info._id, session: 'exit' })
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

        channel.bind(PusherEvent.CAMPAIGN_UPDATED, () => {
            console.log('Campaign updated');
        });

        return () => {
            channel.unbind(PusherEvent.CAMPAIGN_UPDATED);
        };
    }, [ ]);

    if (!isSubscribed) {
        return (
            <Backdrop
                open={true}
                sx={{
                    zIndex: theme => theme.zIndex.drawer + 1,
                    backgroundColor: 'background.default'
                }}
            >
                <CircularProgress color="primary" />
            </Backdrop>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            position: 'relative',
            gap: 2,
            width: '100%',
            height: '100%',
            p: 2
        }}>
            <Box sx={{
                width: '100%'
            }}>
                <CampaignDashboard />
            </Box>

            <Box sx={{
                position: 'fixed',
                right: isChatOpen ? 0 : -300,
                top: 0,
                height: '100vh',
                width: '300px',
                bgcolor: 'background.paper',
                transition: 'right 0.3s ease-in-out',
                borderLeft: '1px solid',
                borderColor: 'divider',
                zIndex: 1200,
                display: 'flex'
            }}>
                <IconButton
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    sx={{
                        position: 'absolute',
                        left: -20,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                            bgcolor: 'action.hover'
                        }
                    }}
                >
                    {isChatOpen ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
                <SessionChat />
            </Box>
        </Box>
    );
}