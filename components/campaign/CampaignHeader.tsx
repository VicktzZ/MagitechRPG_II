import { Avatar, Box, Divider, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material'
import type { Ficha, User } from '@types'
import { grey } from '@mui/material/colors'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { fichaService } from '@services'
import { useCampaignContext } from '@contexts/campaignContext'

export default function CampaignHeader({
    admins,
    players
}: {
    admins: User[]
    players: User[]
}) {
    const [ fichas, setFichas ] = useState<Ficha[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(true);
    const { campaign } = useCampaignContext()

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    useEffect(() => {
        const fetchFichas = async (): Promise<void> => {
            setIsLoading(true)

            const fichaResponse = await Promise.all(campaign.players.map(async player => {
                return await fichaService.getById(player.fichaId)
            }))
            
            setFichas([ ...fichas, ...fichaResponse ])
 
            setIsLoading(false)
            setFichas(fichaResponse)

            console.log({
                fichas,
                admins,
                players
            })
        }

        fetchFichas()
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
                    {admins.map(admin => (
                        <Box display="flex" gap={2} key={admin._id}>
                            <Box position='absolute'></Box>
                            <Avatar sx={{ height: '3rem', width: '3rem' }}>
                                <Image
                                    height={250}
                                    width={250}
                                    style={{ height: '100%', width: '100%' }}
                                    src={admin.image ?? 'undefined'}
                                    alt={admin.name ?? 'User Avatar'}
                                />
                            </Avatar>
                            {!matches && (
                                <Box>
                                    <Typography>Game Master</Typography>
                                    <Typography color={grey[500]} variant="caption">
                                        {admin.name}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>

                <Divider />
            
                <Box display="flex" flexDirection="column" alignItems={matches ? 'center' : 'flex-start'} justifyContent='center' gap={3}>
                    {players.map(player => (
                        <Box display="flex" flexDirection='column' gap={2} key={player._id}>
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
                                            style={{ height: '100%', width: '100%' }}
                                            src={player.image ?? 'undefined'}
                                            alt={player.name ?? 'User Avatar'}
                                        />
                                    </Avatar>
                                    {!matches && (
                                        <Box>
                                            <Typography>{player.name}</Typography>
                                            <Typography color={grey[500]} variant="caption">
                                                {fichas.find(ficha => ficha.userId === player._id)?.name}
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
