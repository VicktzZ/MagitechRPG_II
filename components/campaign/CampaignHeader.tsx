'use client'

import { useCampaignContext } from '@contexts'
import {
    Avatar,
    Box,
    Button,
    Divider,
    Paper,
    Tooltip,
    Typography,
    useMediaQuery,
    type Theme
} from '@mui/material'
import { grey } from '@mui/material/colors'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { campaignService, sessionService } from '@services'
import type { User } from '@types'
import { useLocalStorage } from '@uidotdev/usehooks'
import Image from 'next/image'
import { useMemo, useState, type ReactElement } from 'react'

export default function CampaignHeader(): ReactElement {
    const { campaign, users, fichas, isUserGM } = useCampaignContext()
    const [ copiedCode, setCopiedCode ] = useState<boolean>(false)
    const [ , setCurrentFicha ] = useLocalStorage<string>('currentFicha', '');
    const { data: session } = useSession()
    
    const router = useRouter()
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const onlineUsers = useMemo(() => campaign.session.users, [ campaign ])

    console.log({
        campaign,
        users,
        fichas,
        isUserGM,
        onlineUsers
    })

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
                        filter: onlineUsers.includes(user._id!) ? 'none' : 'grayscale(100%)',
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
                                <Typography variant="body2">{users.admin[0].name}</Typography>
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
                                    {onlineUsers.length} / {users.all.length}
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
                justifyContent='space-between'
                borderRadius={1}
                p={2}
                mb={6}
                gap={2}
            >
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    gap={2}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems={'flex-start'}
                        justifyContent="center"
                        gap={3}
                    >
                        {users.admin.map(user => renderUserAvatar(user, true))}
                    </Box>

                    <Divider />

                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems={'flex-start'}
                        justifyContent="center"
                        gap={3}
                    >
                        {users.players.map(user => (
                            <Box display="flex" flexDirection="column" gap={2} key={user._id}>
                                {renderUserAvatar(user)}
                            </Box>
                        ))}
                    </Box>
                </Box>
                {!isUserGM && (
                    <Box>
                        <Button onClick={() => {
                            if (!session?.user?._id || !campaign._id) return

                            setCurrentFicha('');
                            const userId = session?.user?._id;
                            if (!userId) return;
                            
                            sessionService.disconnect({ campaignCode: campaign.campaignCode, userId });
                            campaignService.removeUser(campaign._id, session.user._id);
                            router.push('/app/campaign');
                        }} variant="contained">Sair da campanha</Button>
                    </Box>
                )}
            </Box>
        </Box>
    )
}
