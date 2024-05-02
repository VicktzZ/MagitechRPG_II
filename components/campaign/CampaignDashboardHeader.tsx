/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import copy from 'clipboard-copy';
import { PlayerAvatar } from '@components/campaign';
import { useCampaignContext } from '@contexts/campaignContext';
import { useChannel } from '@contexts/channelContext';
import { Grid, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import type { PlayerInfo } from '@types';
import { useEffect, useState, type ReactElement } from 'react';

export default function CampaignDashboardHeader(): ReactElement {
    const [ playersInfo, setPlayersInfo ] = useState<PlayerInfo[]>([]);
    const { channel } = useChannel();
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ openTooltip, setOpenTooltip ] = useState<boolean>(false);

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));

    const campaign = useCampaignContext();

    const code = location.href.split('/')[5];

    useEffect(() => {
        (async () => {
            const playersInfoResponse: PlayerInfo[] = await fetch(`/api/campaign/playersinfo?code=${code}`).then(async res => await res.json());
            setPlayersInfo(playersInfoResponse);

            // channel.bind('pusher:member_added', async (user: PlayerInfo) => {
            //     setPlayersInfo(await fetch(`/api/campaign/playersinfo?code=${code}`).then(async res => await res.json() as PlayerInfo[]))
            // })

            // channel.bind('pusher:member_removed', async (user: PlayerInfo) => {
            //     setPlayersInfo(await fetch(`/api/campaign/playersinfo?code=${code}`).then(async res => await res.json() as PlayerInfo[]))
            // })

            setLoading(false);
        })();
    }, [ code, channel ]);

    return (
        <Box display='flex' gap={5} flexDirection='column'>
            <Box display='flex' gap={2} flexDirection='column'>
                <Box display='flex' gap={1} flexDirection={'column'}>
                    <Typography fontFamily='WBZ' variant='h3' textAlign='center'>
                        {campaign?.title}
                    </Typography>
                    <Typography textAlign='center'>{campaign?.description}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={1} justifyContent='center'>
                    <Typography>Código:</Typography>
                    <Tooltip
                        onClose={() => { setOpenTooltip(false); }}
                        open={openTooltip}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        title="Link copiado!"
                        PopperProps={{
                            disablePortal: true
                        }}
                    >
                        <Button variant='outlined' onClick={async () => {
                            try {
                                await copy(window.location.href);
                                setOpenTooltip(true);
                                setTimeout(() => {
                                    setOpenTooltip(false);
                                }, 1000);
                            } catch (error: any) {
                                console.log(error.message);
                            }
                        }}>{campaign?.campaignCode}</Button>
                    </Tooltip>
                </Box>
            </Box>
            <Grid
                container
                gap={2}
                justifyContent='space-evenly' 
                width='100%' 
                p={2}
            >
                {loading ? [ 0, 1, 2, 3 ].map(() => (
                    <Box key={Math.random()} display='flex' alignItems='center' gap={!matches ? 2 : 1}>
                        <Skeleton 
                            variant='circular' 
                            height={!matches ? '4.5rem' : '4rem'} 
                            width={!matches ? '4.5rem' : '4rem'} 
                        />
                        <Box display='flex' flexDirection='column' alignItems='center'>
                            <Skeleton variant='text' width={!matches ? '10rem' : '6.5rem'} />
                            <Skeleton variant='text' width={!matches ? '10rem' : '6.5rem'} />
                        </Box>
                    </Box>
                )) : playersInfo.length > 0 && playersInfo?.map(p => (
                    <PlayerAvatar
                        key={Math.random()}
                        image={p.image}
                        username={p.username}
                        charname={p.charname}
                    />
                ))}
            </Grid>
        </Box>
    );
}