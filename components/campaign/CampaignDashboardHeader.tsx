/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import copy from 'clipboard-copy';
import { PlayerAvatar } from '@components/campaign';
import { useCampaignContext } from '@contexts/campaignContext';
import { useChannel } from '@contexts/channelContext';
import { Grid, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import type { PlayerInfo, PusherMemberParam } from '@types';
import { useEffect, useState, type ReactElement } from 'react';
import { green, red } from '@mui/material/colors';

export default function CampaignDashboardHeader(): ReactElement {
    const [ playersInfo, setPlayersInfo ] = useState<PlayerInfo[]>([]);
    const { channel } = useChannel();
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ openTooltip, setOpenTooltip ] = useState<boolean>(false);
    const [ usernames, setUsernames ] = useState<string[]>([])

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));

    const campaign = useCampaignContext();

    const code = location.href.split('/')[5];

    useEffect(() => {
        (async () => {
            const playersInfoResponse: PlayerInfo[] = await fetch(`/api/campaign/playersinfo?code=${code}`).then(async res => await res.json());
            setPlayersInfo(playersInfoResponse);

            channel.members.each((member: PusherMemberParam) => {
                if (!usernames.includes(member.info.name))
                    setUsernames(state => [ ...state, member.info.name ])
            })

            console.log(usernames)

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
                    <Box
                        key={p.username + '_' + p.charname}
                        position='relative'
                    >
                        <Box 
                            position='relative'
                            width='15px'
                            height='15px'
                            left='48px'
                            top='22px'
                            zIndex={100}
                            borderRadius='100%'
                            bgcolor={usernames.includes(p.username) ? green[500] : red[500]}
                        >
                        </Box>
                        <Box
                            sx={{ filter: !usernames.includes(p.username) ? 'grayscale(100%)' : '' }}
                        >
                            <PlayerAvatar
                                image={p.image}
                                username={p.username}
                                charname={p.charname}
                            />
                        </Box>
                    </Box>
                ))}
            </Grid>
        </Box>
    );
}