/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import copy from 'clipboard-copy'
import { PlayerAvatar } from '@components/campaign';
import { useCampaignContext } from '@contexts/campaignContext';
import { useChannel } from '@contexts/channelContext';
import { Tooltip } from '@mui/material';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import type { PlayerInfo } from '@types';
import { useEffect, useState, type ReactElement } from 'react';

export default function CampaignDashboardHeader(): ReactElement {
    const [ playersInfo, setPlayersInfo ] = useState<PlayerInfo[]>([])
    const { channel } = useChannel()
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ openTooltip, setOpenTooltip ] = useState<boolean>(false)

    const campaign = useCampaignContext()

    const code = location.href.split('/')[5]

    useEffect(() => {
        (async () => {
            const playersInfoResponse: PlayerInfo[] = await fetch(`/api/campaign/playersinfo?code=${code}`).then(async res => await res.json())
            setPlayersInfo(playersInfoResponse)

            // channel.bind('pusher:member_added', async (user: PlayerInfo) => {
            //     setPlayersInfo(await fetch(`/api/campaign/playersinfo?code=${code}`).then(async res => await res.json() as PlayerInfo[]))
            // })

            // channel.bind('pusher:member_removed', async (user: PlayerInfo) => {
            //     setPlayersInfo(await fetch(`/api/campaign/playersinfo?code=${code}`).then(async res => await res.json() as PlayerInfo[]))
            // })

            setLoading(false)
        })()
    }, [ code, channel ])

    return (
        <Box display='flex' gap={5} flexDirection='column'>
            <Box display='flex' gap={2} flexDirection='column'>
                <Box display='flex' gap={1} flexDirection={'column'}>
                    <Typography fontFamily='WBZ' variant='h3' textAlign='center'>
                        {campaign?.title}
                    </Typography>
                    <Typography fontFamily='Times New Roman' textAlign='center'>{campaign?.description}</Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={1} justifyContent='center'>
                    <Typography>Código:</Typography>
                    <Tooltip
                        onClose={() => { setOpenTooltip(false) }}
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
                                await copy(window.location.href)
                                setOpenTooltip(true)
                                setTimeout(() => {
                                    setOpenTooltip(false)
                                }, 1000);
                            } catch (error:any) {
                                console.log(error.message)
                            }
                        }}>{campaign?.campaignCode}</Button>
                    </Tooltip>
                </Box>
            </Box>
            <Box
                display='flex'
                gap={2}
                justifyContent='space-evenly' 
                width='100%' 
                p={2}
            >
                {loading ? <Skeleton variant='rectangular' height={250} width={350} /> : playersInfo.length > 0 && playersInfo?.map(p => (
                    <PlayerAvatar
                        key={Math.random()}
                        image={p.image}
                        username={p.username}
                        charname={p.charname}
                    />
                ))}
            </Box>
        </Box>
    )
}