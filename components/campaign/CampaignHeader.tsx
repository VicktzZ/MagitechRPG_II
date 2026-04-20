'use client'

import { CustomDices } from '@components/charsheet'
import { useCampaignContext } from '@contexts'
import type { User } from '@models/entities'
import { Casino as DiceIcon, Notes } from '@mui/icons-material'
import {
    Avatar,
    Badge,
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
import { campaignService, sessionService } from '@services'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, type ReactElement } from 'react'
import Section from './Section'
import NotesSection from './playerDashboard/NotesSection'

export default function CampaignHeader(): ReactElement {
    const { campaign, users, charsheets, isUserGM } = useCampaignContext()
    const [ copiedCode, setCopiedCode ] = useState<boolean>(false)
    const { data: session } = useSession()
    
    const router = useRouter()
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

    const renderUserAvatar = (user: User, isAdmin: boolean = false) => {
        return (
            <motion.div
                key={`${user.id}-${charsheets.find(c => c.userId === user.id)?.name ?? ''}-${campaign.session.users.includes(user.id)}`}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                    type: 'spring',
                    damping: 10,
                    stiffness: 100
                }}

                style={{
                    display: 'flex', 
                    gap: 2 
                }} 
            >
                <Badge 
                    badgeContent={''} 
                    color={campaign.session.users.includes(user.id) ? 'success' : 'error'}
                    sx={{
                        '& .MuiBadge-badge': {
                            height: '15px',
                            minWidth: '15px'
                        }
                    }}  
                >
                    <Avatar sx={{ height: '3rem', width: '3rem' }}>
                        <Image
                            height={250}
                            width={250}
                            src={user?.image ?? '/'}
                            alt={user.name ?? 'User Avatar'}
                            style={{
                                height: '100%',
                                width: '100%',
                                filter: campaign.session.users.includes(user.id) ? 'none' : 'grayscale(100%)',
                                transition: 'filter 0.3s ease-in-out'
                            }}
                        />
                    </Avatar>
                </Badge>
                <Box paddingLeft={2}>
                    <Typography>
                        {isAdmin ? 'Game Master' : charsheets.find(c => c.userId === user.id)?.name}
                    </Typography>
                    <Typography color={grey[500]} variant="caption">
                        {user.name}
                    </Typography>
                </Box>
            </motion.div>
        )
    }

    return (
        <Box display="flex" flexDirection="column" width={ isMobile ? '100%' : '25%' } borderRadius={1} gap={2}>
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
                                <Typography variant="body2">{users.admin[0]?.name}</Typography>
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
                                    {campaign.session.users.length} / {users.all.length}
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
                            <Box display="flex" flexDirection="column" gap={2} key={user.id}>
                                {renderUserAvatar(user)}
                            </Box>
                        ))}
                    </Box>
                </Box>
                {!isUserGM && (
                    <Box>
                        <Button onClick={() => {
                            if (!session?.user?.id || !campaign.id) return

                            localStorage.setItem('currentCharsheet', '');
                            const userId = session?.user?.id;
                            if (!userId) return;
                            
                            sessionService.disconnect({ campaignCode: campaign.campaignCode, userId });
                            campaignService.removeUser(campaign.id, session.user.id);
                            router.push('/app/campaign');
                        }} variant="contained">Sair da campanha</Button>
                    </Box>
                )}
            </Box>
            {!isUserGM && (
                <Box mt={-4} mb={2} display='flex' flexDirection='column' gap={2}>
                    <Section
                        title="Dados customizados"
                        icon={<DiceIcon sx={{ color: 'text.secondary' }} />}
                    >
                        <CustomDices 
                            enableChatIntegration={true}
                            realtime={true}
                        />
                    </Section>
                    <Section 
                        title="Anotações" 
                        icon={<Notes sx={{ color: 'text.secondary' }} />}
                        sx={{ height: '100%' }}
                    >
                        <Box>
                            <NotesSection />
                        </Box>
                    </Section>
                </Box>
            )}
        </Box>
    )
}
