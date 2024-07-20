// import { useChannel } from '@contexts/channelContext'
import { useCampaignContext } from '@contexts/campaignContext'
import { useChannel } from '@contexts/channelContext'
import { LinearProgressWithLabel } from '@layout'
import { Box, Button } from '@mui/material'
import { useSession } from 'next-auth/react'
import type { Ficha } from '@types'
import { useEffect, useState, type ReactElement } from 'react'

function CampaignPlayerDashboard(): ReactElement {
    const { channel } = useChannel()
    const [ ficha, , ] = useState<Ficha>(channel.members.me?.info.currentFicha as Ficha)
    const [ attrPointsMultiplyer, setAttrPointsMultiplyer ] = useState(1)
    
    const [ attributesPoints, setAttributesPoints ] = useState({
        lp: ficha?.attributes.lp ?? 0,
        mp: ficha?.attributes.mp ?? 0,
        ap: ficha?.attributes.ap ?? 0
    })

    useEffect(() => {
        channel.bind('pusher:subscription_succeeded', () => {
            setAttributesPoints({
                lp: ficha?.attributes.lp ?? 0,
                mp: ficha?.attributes.mp ?? 0,
                ap: ficha?.attributes.ap ?? 0
            })
        })
    }, [ channel, ficha ])

    return (
        <Box>
            <Box display='flex' gap={5}>
                <Box
                    display='flex'
                    flexDirection='column'
                    width='30%'
                    gap={2}
                >
                    <Box
                        display='flex'
                        flexDirection='column'
                        width='100%'
                        gap={1}
                    >
                        <LinearProgressWithLabel
                            label='LP'
                            minvalue={attributesPoints.lp}
                            maxvalue={ficha?.attributes.lp ?? 0}
                            value={attributesPoints.lp}
                        />
                        <Box display='flex' justifyContent='space-between' width='100%'>
                            <Box display='flex' gap={2}>
                                <Button onClick={() => {
                                    setAttributesPoints({ ...attributesPoints, lp: -(attributesPoints.lp * attrPointsMultiplyer) })
                                }} variant='outlined' color='primary'>-{attrPointsMultiplyer}</Button>
                                <Button  onClick={() => {
                                    setAttributesPoints({ ...attributesPoints, lp: (attributesPoints.lp * attrPointsMultiplyer) })
                                }} variant='outlined' color='primary'>+{attrPointsMultiplyer}</Button>
                            </Box>
                            <Box>
                                <Button variant='outlined' color='secondary'>x5</Button>
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        display='flex'
                        flexDirection='column'
                        gap={1}
                    >
                        <LinearProgressWithLabel
                            label='MP'
                            minvalue={attributesPoints.mp}
                            maxvalue={ficha?.attributes.mp ?? 0}
                            value={attributesPoints.mp}
                        />
                    </Box>
                    <Box
                        display='flex'
                        flexDirection='column'
                        gap={1}
                    >
                        <LinearProgressWithLabel
                            label='AP'
                            minvalue={attributesPoints.ap}
                            maxvalue={ficha?.attributes.ap ?? 0}
                            value={attributesPoints.ap}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function CampaignGMDashboard(): ReactElement {
    const { channel } = useChannel()
    
    console.log(channel.members)

    return (
        <Box>
            DASHBOARD DO GM
        </Box>
    )
}

export default function CampaignDashboard(): ReactElement {
    const { data: session } = useSession()    
    const campaign = useCampaignContext()

    return campaign?.admin.includes(session?.user._id ?? '') ? <CampaignGMDashboard /> : <CampaignPlayerDashboard />
}