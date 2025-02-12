import { Avatar, Box, Divider, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material'
import type { Ficha, User } from '@types'
import { grey } from '@mui/material/colors'
import Image from 'next/image'
import { useEffect, useState, useMemo } from 'react'
import { fichaService } from '@services'
import { useCampaignContext } from '@contexts/campaignContext'
import { useGameMasterContext } from '@contexts/gameMasterContext'
import { useChannel } from '@contexts/channelContext'
import { PusherEvent } from '@enums'

export default function CampaignHeader() {
    const [ fichas, setFichas ] = useState<Ficha[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const [ sessionUsers, setSessionUsers ] = useState<string[]>([]);
    const { campaign, campUsers } = useCampaignContext();
    const { channel } = useChannel();

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));

    // Atualiza a lista de usuários da sessão quando a campanha mudar
    useEffect(() => {
        setSessionUsers(campaign.session.users);
    }, [ campaign.session.users ]);

    useEffect(() => {
        const fetchPlayersFicha = async (): Promise<void> => {
            if (!campaign.players.length) return;
            
            setIsLoading(true);
            try {
                const fichaResponse = await Promise.all(
                    campaign.players.map(async player => await fichaService.getById(player.fichaId))
                );
                
                setFichas(fichaResponse.filter(Boolean));
            } catch (error) {
                console.error('Erro ao buscar fichas:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlayersFicha();
    }, [ campaign.players ]);

    useEffect(() => {
        if (!channel) return;

        // Atualiza quando um usuário entra na sessão
        const handleUserEnter = (data: { userId: string }) => {
            setSessionUsers(prev => [ ...prev, data.userId ]);
        };

        // Atualiza quando um usuário sai da sessão
        const handleUserExit = (data: { userId: string }) => {
            setSessionUsers(prev => prev.filter(id => id !== data.userId));
        };

        // Atualiza quando a campanha é modificada
        const handleCampaignUpdate = (data: any) => {
            if (data?.session?.users) {
                setSessionUsers(data.session.users);
            }
        };

        channel.bind(PusherEvent.USER_ENTER, handleUserEnter);
        channel.bind(PusherEvent.USER_EXIT, handleUserExit);
        channel.bind(PusherEvent.UPDATE_CAMPAIGN, handleCampaignUpdate);

        return () => {
            channel.unbind(PusherEvent.USER_ENTER, handleUserEnter);
            channel.unbind(PusherEvent.USER_EXIT, handleUserExit);
            channel.unbind(PusherEvent.UPDATE_CAMPAIGN, handleCampaignUpdate);
        };
    }, [ channel ]);

    const renderUserAvatar = (user: User, isAdmin: boolean = false) => (
        <Box display="flex" gap={2} key={user._id}>
            <Avatar sx={{ height: '3rem', width: '3rem' }}>
                <Image
                    height={250}
                    width={250}
                    src={user.image ?? 'undefined'}
                    alt={user.name ?? 'User Avatar'}
                    style={{ 
                        height: '100%',
                        width: '100%',
                        filter: sessionUsers.includes(user._id!) ? 'none' : 'grayscale(100%)',
                        transition: 'filter 0.3s ease-in-out'
                    }}
                />
            </Avatar>
            {!matches && (
                <Box>
                    <Typography>
                        {isAdmin ? 'Game Master' : fichas.find(ficha => ficha.userId === user._id)?.name}
                    </Typography>
                    <Typography color={grey[500]} variant="caption">
                        {user.name}
                    </Typography>
                </Box>
            )}
        </Box>
    );

    return (
        <Box
            display="flex"
            flexDirection="column"
            minWidth="50%"
            borderRadius={1}
            gap={2}
        >
            <Box
                display="flex"
                flexDirection="column"
                minWidth="40%"
                bgcolor="background.paper"
                borderRadius={1}
                p={3}
                gap={2}
            >
                <Box display="flex" flexDirection="column" alignItems={matches ? 'center' : 'flex-start'} justifyContent='center' gap={3}>
                    {campUsers.admin.map(user => renderUserAvatar(user, true))}
                </Box>

                <Divider />
            
                <Box display="flex" flexDirection="column" alignItems={matches ? 'center' : 'flex-start'} justifyContent='center' gap={3}>
                    {campUsers.player.map(user => (
                        <Box display="flex" flexDirection='column' gap={2} key={user._id}>
                            {isLoading && !matches ? (
                                <Box display='flex' alignItems='center' gap={2}>
                                    <Skeleton variant="circular" width={45} height={45} />
                                    <Box>
                                        <Skeleton variant="text" width={100} height={20} />
                                        <Skeleton variant="text" width={80} height={20} />
                                    </Box>
                                </Box>
                            ) : renderUserAvatar(user)}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
