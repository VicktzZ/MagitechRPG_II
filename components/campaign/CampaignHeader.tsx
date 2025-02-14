'use client'

import { useEffect, useState, type ReactElement } from 'react'
import {
    Box,
    Typography,
    Avatar,
    AvatarGroup,
    Tooltip,
    Paper,
    useTheme,
    useMediaQuery,
    Divider,
    Skeleton,
    Button,
    type Theme
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useChannel } from '@contexts/channelContext'
import { useCampaignContext } from '@contexts/campaignContext'
import { PusherEvent } from '@enums'
import { grey } from '@mui/material/colors'
import { fichaService } from '@services'
import type { User } from '@types'
import Image from 'next/image'

interface OnlineUser extends User {
    lastSeen: Date
}

export default function CampaignHeader(): ReactElement {
    const { data: session } = useSession()
    const { channel } = useChannel()
    const { campaign, campUsers } = useCampaignContext()
    const [ onlineUsers, setOnlineUsers ] = useState<OnlineUser[]>([])
    const [ fichas, setFichas ] = useState<any[]>([])
    const [ isLoading, setIsLoading ] = useState<boolean>(true)
    const [ sessionUsers, setSessionUsers ] = useState<string[]>([])
    const [ copiedCode, setCopiedCode ] = useState<boolean>(false)
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

    // Função para atualizar o status online dos usuários
    const updateOnlineUsers = (users: OnlineUser[]) => {
        // Remove usuários que não deram sinal nos últimos 30 segundos
        const now = new Date()
        const activeUsers = users.filter(user => {
            const lastSeen = new Date(user.lastSeen)
            const diffInSeconds = (now.getTime() - lastSeen.getTime()) / 1000
            return diffInSeconds <= 30
        })

        setOnlineUsers(activeUsers)
    }

    // Envia status online periodicamente
    useEffect(() => {
        if (!channel || !session?.user) return

        const interval = setInterval(() => {
            channel.trigger(PusherEvent.SESSION_USERS_UPDATED, {
                user: session.user,
                lastSeen: new Date()
            })
        }, 10000) // Atualiza a cada 10 segundos

        return () => clearInterval(interval)
    }, [ channel, session ])

    // Escuta atualizações de status dos usuários
    useEffect(() => {
        if (!channel) return

        const handleSessionUsersUpdate = (data: { user: User; lastSeen: string }) => {
            setOnlineUsers(prev => {
                const userIndex = prev.findIndex(u => u._id === data.user._id)
                const newUser = { ...data.user, lastSeen: new Date(data.lastSeen) }

                if (userIndex >= 0) {
                    // Atualiza usuário existente
                    const updatedUsers = [ ...prev ]
                    updatedUsers[userIndex] = newUser
                    return updatedUsers
                } else {
                    // Adiciona novo usuário
                    return [ ...prev, newUser ]
                }
            })
        }

        channel.bind(PusherEvent.SESSION_USERS_UPDATED, handleSessionUsersUpdate)
        channel.bind(PusherEvent.SUBSCRIPTION, () => {
            // Quando se conecta, envia status imediatamente
            if (session?.user) {
                channel.trigger(PusherEvent.SESSION_USERS_UPDATED, {
                    user: session.user,
                    lastSeen: new Date()
                })
            }
        })

        return () => {
            channel.unbind(PusherEvent.SESSION_USERS_UPDATED, handleSessionUsersUpdate)
            channel.unbind(PusherEvent.SUBSCRIPTION)
        }
    }, [ channel, session ])

    // Limpa usuários inativos periodicamente
    useEffect(() => {
        const interval = setInterval(() => {
            updateOnlineUsers(onlineUsers)
        }, 5000) // Verifica a cada 5 segundos

        return () => clearInterval(interval)
    }, [ onlineUsers ])

    useEffect(() => {
        setSessionUsers(campaign.session.users)
    }, [ campaign.session.users ])

    useEffect(() => {
        const fetchPlayersFicha = async (): Promise<void> => {
            if (!campaign.players.length) return

            setIsLoading(true)
            try {
                const fichaResponse = await Promise.all(
                    campaign.players.map(async player => await fichaService.getById(player.fichaId))
                )

                setFichas(fichaResponse.filter(Boolean))
            } catch (error) {
                console.error('Erro ao buscar fichas:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPlayersFicha()
    }, [ campaign.players ])

    const renderUserAvatar = (user: User, isAdmin: boolean = false) => (
        <Box display="flex" gap={2} key={user._id}>
            <Avatar sx={{ height: '3rem', width: '3rem' }}>
                <Image
                    height={250}
                    width={250}
                    src={user?.image ?? '/'}
                    alt={user.name ?? 'User Avatar'}
                    style={{
                        height: '100%',
                        width: '100%',
                        filter: sessionUsers.includes(user._id!) ? 'none' : 'grayscale(100%)',
                        transition: 'filter 0.3s ease-in-out'
                    }}
                />
            </Avatar>
            <Box>
                <Typography>
                    {isAdmin ? 'Game Master' : fichas.find(ficha => ficha.userId === user._id)?.name}
                </Typography>
                <Typography color={grey[500]} variant="caption">
                    {user.name}
                </Typography>
            </Box>
        </Box>
    )

    return (
        <Box display="flex" flexDirection="column" minWidth="5%" borderRadius={1} gap={2}>
            <Paper
                sx={{
                    p: { xs: 1, sm: 2 },
                    bgcolor: 'background.paper2',
                    borderRadius: 2
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1, sm: 2 }
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1
                        }}
                    >
                        <Typography variant="h5" gutterBottom={isMobile}>
                            {campaign.title}
                        </Typography>
                        <Typography mt={2} variant="body2" color="text.secondary">
                            {campaign.description}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'column' },
                            gap: 2
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 2,
                                alignItems: { xs: 'stretch', sm: 'center' },
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: { xs: 'flex-start', sm: 'flex-end' }
                                }}
                            >
                                <Typography variant="subtitle2" color="primary">
                                    Mestre
                                </Typography>
                                <Typography variant="body2">{campUsers.admin[0].name}</Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: { xs: 'flex-start', sm: 'flex-end' }
                                }}
                            >
                                <Typography variant="subtitle2" color="primary">
                                    Jogadores
                                </Typography>
                                <Typography variant="body2">
                                    {onlineUsers.length} / {campUsers.player.length}
                                </Typography>
                            </Box>
                        </Box>
                        <Box mt={2}>
                            <Tooltip open={copiedCode} title="Copiado!" placement="top">
                                <Box display="flex" alignItems="center" gap={1}>
                                    Código:
                                    <Button
                                        onClick={() => {
                                            navigator.clipboard.writeText(campaign.campaignCode)
                                            setCopiedCode(true)
                                            setTimeout(() => {
                                                setCopiedCode(false)
                                            }, 1000)
                                        }}
                                        variant="outlined"
                                    >
                                        {campaign.campaignCode}
                                    </Button>
                                </Box>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            <Box
                display="flex"
                flexDirection="column"
                minWidth="40%"
                minHeight={!isMobile ? '70vh' : '10vh'}
                bgcolor="background.paper"
                borderRadius={1}
                p={2}
                mb={6}
                gap={2}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems={'flex-start'}
                    justifyContent="center"
                    gap={3}
                >
                    {campUsers.admin.map(user => renderUserAvatar(user, true))}
                </Box>

                <Divider />

                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems={'flex-start'}
                    justifyContent="center"
                    gap={3}
                >
                    {campUsers.player.map(user => (
                        <Box display="flex" flexDirection="column" gap={2} key={user._id}>
                            {isLoading && isMobile ? (
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Skeleton variant="circular" width={45} height={45} />
                                    <Box>
                                        <Skeleton variant="text" width={100} height={20} />
                                        <Skeleton variant="text" width={80} height={20} />
                                    </Box>
                                </Box>
                            ) : (
                                renderUserAvatar(user)
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}
