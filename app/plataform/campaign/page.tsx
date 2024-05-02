'use client';

import { CampaignOptionsModal, CampaingCard } from '@components/campaign';
import { Box, Button, Grid, Skeleton, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useEffect, useState, type ReactElement } from 'react';
import type { Campaign } from '@types';

export default function CampaignPage(): ReactElement {
    const { data: session } = useSession();
    const [ contentType, setContentType ] = useState<'create' | 'join'>('create');
    const [ open, setOpen ] = useState(false);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ campaigns, setCampaigns ] = useState<Campaign[]>([]);

    useEffect(() => {
        (async () => {
            setIsLoading(true);

            const camps: Campaign[] = await fetch('/api/campaign?userId=' + session?.user?._id ?? '', {
                method: 'GET'
            }).then(async r => await r.json());

            setCampaigns(camps);
            setIsLoading(false);
        })();
    }, [ session?.user?._id ]);

    return (
        <Box display='flex' flexDirection='column' gap={3} p={2}>
            <Box>
                <Box display='flex' flexDirection='column' gap={2}>
                    <Box>
                        <Typography variant='h5'>Campanha</Typography>
                    </Box>
                    <Grid container gap={2}>
                        {isLoading ? [ 0, 1, 2, 3 ].map(() => (
                            <Skeleton 
                                key={Math.random()} 
                                variant='rectangular'
                                height={250}
                                width={350}
                            />
                        )) : campaigns.length === 0 ? (
                            <Typography>Você não está em nenhuma campanha no momento</Typography>
                        ) : campaigns.map(camp => (
                            <CampaingCard 
                                key={camp._id}
                                title={camp.title}
                                description={camp.description}
                                gameMaster={camp.admin}
                                playersQtd={camp.players.length}
                                code={camp.campaignCode}
                            />
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
    );
}
