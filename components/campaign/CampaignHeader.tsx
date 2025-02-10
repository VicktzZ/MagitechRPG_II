import { Avatar, Box, Divider, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material'
import type { Ficha, User } from '@types'
import { grey } from '@mui/material/colors'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { fichaService } from '@services'
import { useCampaignContext } from '@contexts/campaignContext'
import { useGameMasterContext } from '@contexts/gameMasterContext'
import { useChannel } from '@contexts/channelContext'

export default function CampaignHeader({ users }: { users: User[] }) {
    const [ fichas, setFichas ] = useState<Ficha[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const { campaign, setCampaign } = useCampaignContext()
    const { channel } = useChannel()
    const { allGameMastersId } = useGameMasterContext()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const campUsers = {
        admin: users.filter(u => allGameMastersId.includes(u._id ?? '')),
        player: users.filter(u => !allGameMastersId.includes(u._id ?? ''))
    }

    console.log(campUsers)

    useEffect(() => {
        const fetchPlayersFicha = async (): Promise<void> => {
            setIsLoading(true)

            const fichaResponse = await Promise.all(campaign.players.map(async player => {
                return await fichaService.getById(player.fichaId)
            }))
            
            setFichas([ ...fichas, ...fichaResponse ])
            setFichas(fichaResponse)

            setIsLoading(false)
        }

        fetchPlayersFicha()
    }, [])

    useEffect(() => {
        channel.bind('client-session_updated', (data: { userId: string, session: 'entered' | 'exit' }) => {
            if (data.session === 'entered' && !campaign.players.map(player => player.userId).includes(data.userId)) {
                setCampaign({ ...campaign, players: [ ...campaign.players, { userId: data.userId, fichaId: '' } ] })
            }
        })
    }, [])

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
                    {campUsers.admin.map(user => (
                        <Box display="flex" gap={2} key={user._id}>
                            <Box position='absolute'></Box>
                            <Avatar sx={{ height: '3rem', width: '3rem' }}>
                                <Image
                                    height={250}
                                    width={250}
                                    src={user.image ?? 'undefined'}
                                    alt={user.name ?? 'User Avatar'}
                                    style={{ 
                                        height: '100%',
                                        width: '100%',
                                        filter: campaign.session.users.includes(user._id!) ? 'none' : 'grayscale(100%)' 
                                    }}
                                />
                            </Avatar>
                            {!matches && (
                                <Box>
                                    <Typography>Game Master</Typography>
                                    <Typography color={grey[500]} variant="caption">
                                        {user.name}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ))}
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
                            ) : (
                                <Box display='flex' alignItems='center' gap={2}>
                                    <Avatar sx={{ height: '3rem', width: '3rem' }}>
                                        <Image
                                            height={250}
                                            width={250}
                                            src={user.image ?? 'undefined'}
                                            alt={user.name ?? 'User Avatar'}
                                            style={{ 
                                                height: '100%',
                                                width: '100%',
                                                filter: campaign.session.users.includes(user._id!) ? 'none' : 'grayscale(100%)' 
                                            }}
                                        />
                                    </Avatar>
                                    {!matches && (
                                        <Box>
                                            <Typography>
                                                {fichas.find(ficha => ficha.userId === user._id)?.name}
                                            </Typography>
                                            <Typography color={grey[500]} variant="caption">
                                                {user.name}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}
