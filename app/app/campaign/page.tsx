'use client';

import { CampaignOptionsModal, CampaingCard } from '@components/campaign';
import { Box, Button, Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { useUserCampaigns } from '@hooks/useUserCampaigns';
import { SubscriptionGuard } from '@components/subscription';
import { Permission } from '@enums/subscriptionEnum';

export default function CampaignPage(): ReactElement {
    const { data: session } = useSession();
    const [ contentType, setContentType ] = useState<'create' | 'join'>('create');
    const [ open, setOpen ] = useState(false);
    const userId = session?.user?.id ?? '';

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const { data: allCampaigns, loading } = useUserCampaigns(userId);

    return (
        <SubscriptionGuard permission={Permission.ACCESS_CAMPAIGNS}>
            <Box display='flex' flexDirection='column' gap={3} p={2}>
                <Box>
                    <Box display='flex' flexDirection='column' gap={2}>
                        <Box>
                            <Typography variant='h5'>Campanha</Typography>
                        </Box>
                        <Grid container gap={2}>
                            {loading ? [ 0, 1, 2, 3 ].map(() => (
                                <Skeleton
                                    key={Math.random()}
                                    variant='rectangular'
                                    sx={{
                                        borderRadius: 3,
                                        height: !matches ? 290 : 320,
                                        width: !matches ? 320 : '100%',
                                        maxWidth: 360
                                    }}
                                />
                            )) : allCampaigns?.length === 0 && !loading ? (
                                <Typography>Você não está em nenhuma campanha no momento</Typography>
                            ) : allCampaigns?.map(camp => (
                                <motion.div 
                                    key={camp.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <CampaingCard
                                        id={camp.id}
                                        title={camp.title}
                                        description={camp.description}
                                        gameMaster={camp.admin}
                                        playersQtd={camp.players.length}
                                        code={camp.campaignCode}
                                    />
                                </motion.div>
                            ))}
                        </Grid>
                    </Box>
                </Box>
                <Box>
                    <Box display='flex' gap={2}>
                        <Button
                            onClick={() => { setOpen(true); setContentType('join'); }}
                            variant='contained'
                        >Ingressar</Button>
                        <Button
                            onClick={() => { setOpen(true); setContentType('create'); }}
                            variant='contained'
                        >Criar</Button>
                    </Box>
                    <CampaignOptionsModal
                        open={open}
                        setOpen={setOpen}
                        contentType={contentType}
                    />
                </Box>
            </Box>
        </SubscriptionGuard>
    );
}
