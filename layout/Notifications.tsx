'use client'

import { useState, useEffect } from 'react'
import { IconButton, Badge, Menu, MenuItem, Typography, Box } from '@mui/material'
import { Notifications as NotificationsIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Notification } from '@types'

export default function Notifications() {
    const { data: session } = useSession()
    const router = useRouter()
    const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null)
    const [ notifications, setNotifications ] = useState<Notification[]>([])

    // Busca notificações ao montar o componente
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!session?.user?._id) return

            try {
                const response = await fetch(`/api/notifications/${session.user._id}`)
                if (!response.ok) {
                    throw new Error('Erro ao buscar notificações')
                }
                
                const data = await response.json()
                
                // Verifica se data é um array
                if (Array.isArray(data)) {
                    setNotifications(data)
                } else {
                    console.error('Resposta inválida:', data)
                    setNotifications([])
                }
            } catch (error) {
                console.error('Erro ao buscar notificações:', error)
                setNotifications([])
            }
        }

        fetchNotifications()
    }, [ session?.user?._id ])

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification._id) return

        try {
            const response = await fetch(`/api/notifications/${notification._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ read: true })
            })

            if (!response.ok) {
                throw new Error('Erro ao marcar notificação como lida')
            }

            // Atualiza estado local
            setNotifications(prev => 
                prev.map(n => 
                    n._id === notification._id 
                        ? { ...n, read: true }
                        : n
                )
            )

            // Fecha menu e navega para o link se existir
            handleClose()
            if (notification.link) {
                router.push(notification.link)
            }
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error)
        }
    }

    // Conta apenas notificações não lidas
    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <Box>
            <IconButton
                size="large"
                color="inherit"
                onClick={handleClick}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: '80vh',
                        width: '300px'
                    }
                }}
            >
                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography>Nenhuma notificação</Typography>
                    </MenuItem>
                ) : (
                    notifications.map(notification => (
                        <MenuItem 
                            key={notification._id} 
                            onClick={async () => await handleNotificationClick(notification)}
                            sx={{
                                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                                '&:hover': {
                                    backgroundColor: notification.read ? 'action.hover' : 'action.selected'
                                }
                            }}
                        >
                            <Box display='flex' flexDirection='column' gap={1} width="100%">
                                <Typography fontWeight={notification.read ? 'normal' : 'bold'}>
                                    {notification.title}
                                </Typography>
                                <Typography 
                                    variant='body2' 
                                    whiteSpace='pre-wrap'
                                    color={notification.read ? 'text.secondary' : 'text.primary'}
                                >
                                    {notification.content}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                    {new Intl.DateTimeFormat('pt-BR', {
                                        year: 'numeric',
                                        month: 'numeric',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric'
                                    }).format(new Date(notification.timestamp))}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </Box>
    )
}