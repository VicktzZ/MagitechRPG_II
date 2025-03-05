'use client';

import { useChannel } from '@contexts/channelContext';
import { Box, Backdrop, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';
import { CampaignGMDashboard, CampaignNotes, CampaignPlayerDashboard, SessionChat } from '.';
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
    const [ error, setError ] = useState<string | null>(null);

    useEffect(() => {
        if (!channel || !campaign || !session?.user?._id) return;

        const connectToSession = async () => {
            try {
                const isGM = campaign.admin.includes(session.user._id);
                
                await sessionService.connect({
                    campaignCode: campaign.campaignCode,
                    isGM,
                    userId: session.user._id
                });

                setIsSubscribed(true);
                enqueueSnackbar('Você entrou na sessão!', toastDefault('subscriptionToChannel', 'success'));
            } catch (err) {
                console.error('Erro ao conectar na sessão:', err);
                setError('Erro ao entrar na sessão. Tente recarregar a página.');
                enqueueSnackbar('Erro ao entrar na sessão. Tente novamente.', toastDefault('subscriptionToChannel', 'error'));
            }
        };

        const handleCampaignUpdate = (data: Campaign) => {
            if (!data) return;

            console.log(PusherEvent.CAMPAIGN_UPDATED, data);
            setCampaign(prev => ({
                ...data,
                session: {
                    ...data.session,
                    messages: prev?.session?.messages ?? data.session.messages
                }
            }));
        };

        // Conecta à sessão assim que o canal estiver pronto
        connectToSession();

        // Registra os eventos do Pusher
        channel.bind(PusherEvent.CAMPAIGN_UPDATED, handleCampaignUpdate);

        channel.bind(PusherEvent.MEMBER_ADDED, (user: PusherMemberParam) => {
            if (user?.info?.name) {
                enqueueSnackbar(`${user.info.name} entrou na sessão!`, toastDefault('enteredToChannel'));
            }
        });

        channel.bind(PusherEvent.MEMBER_REMOVED, (user: PusherMemberParam) => {
            if (user?.info?.name) {
                enqueueSnackbar(`${user.info.name} saiu da sessão!`, toastDefault('exitFromChannel'));
            }
        });

        // Cleanup dos eventos ao desmontar ou quando as dependências mudarem
        return () => {
            channel.unbind(PusherEvent.CAMPAIGN_UPDATED, handleCampaignUpdate);
            channel.unbind(PusherEvent.MEMBER_ADDED);
            channel.unbind(PusherEvent.MEMBER_REMOVED);
        };
    }, [ channel, campaign, session?.user?._id, enqueueSnackbar, setCampaign ]);

    // Mostra loading enquanto não estiver inscrito
    if (!isSubscribed) {
        return (
            <Backdrop
                open={true}
                sx={{
                    zIndex: theme => theme.zIndex.drawer + 1
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress color="primary" />
                    {error && (
                        <Typography sx={{ mt: 2, color: 'error.main' }}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </Backdrop>
        );
    }

    // Verifica se tem todas as informações necessárias
    if (!campaign || !session?.user?._id) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography>Erro ao carregar a campanha. Tente recarregar a página.</Typography>
            </Box>
        );
    }

    const isGM = campaign.admin.includes(session.user._id);

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
                    <CampaignNotes />
                    {isGM ? <CampaignGMDashboard /> : <CampaignPlayerDashboard />}
                </Box>
            </Box>
            <SessionChat />
        </>
    );
}