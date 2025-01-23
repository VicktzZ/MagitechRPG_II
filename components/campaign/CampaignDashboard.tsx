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
    const [ , setFicha ] = useState<Ficha>()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)

    useEffect(() => {
        channel.bind('pusher:subscription_succeeded', async () => {
            setIsLoading(true)
            const response: Ficha = await fetch(`/api/ficha/${channel.members.me?.info.currentFicha}`).then(async r => await r.json())
            setFicha(response)
            setIsLoading(false)
        })

        channel.bind('client-ficha_updated', (data: { ficha: Ficha }) => {
            console.log(data)
            setFicha(data.ficha)
        })
    }, [])

    if (!isLoading) {
        return (
            <></>
            // <Box>
            //     <Box display='flex' gap={5}>
            //         <Box
            //             display='flex'
            //             flexDirection='column'
            //             width='30%'
            //             gap={2}
            //         >
            //             <Box
            //                 display='flex'
            //                 flexDirection='column'
            //                 width='100%'
            //                 gap={1}
            //             >
            //                 <LinearProgressWithLabel
            //                     label='LP'
            //                     minvalue={ficha?.attributes?.lp}
            //                     maxvalue={ficha?.attributes?.lp}
            //                     value={ficha?.attributes?.lp}
            //                 />
            //                 <Box display='flex' justifyContent='space-between' width='100%'>
            //                     <Box display='flex' gap={2}>
            //                         <Button onClick={() => {
            //                         }} variant='outlined' color='primary'>-{attrPointsMultiplyer}</Button>
            //                         <Button onClick={() => {
            //                         }} variant='outlined' color='primary'>+{attrPointsMultiplyer}</Button>
            //                     </Box>
            //                     <Box>
            //                         <Button variant='outlined' color='secondary'>x5</Button>
            //                     </Box>
            //                 </Box>
            //             </Box>
            //             <Box
            //                 display='flex'
            //                 flexDirection='column'
            //                 gap={1}
            //             >
            //                 <LinearProgressWithLabel
            //                     label='MP'
            //                     minvalue={ficha?.attributes?.mp}
            //                     maxvalue={ficha?.attributes?.mp}
            //                     value={ficha?.attributes?.mp}
            //                 />
            //             </Box>
            //             <Box
            //                 display='flex'
            //                 flexDirection='column'
            //                 gap={1}
            //             >
            //                 <LinearProgressWithLabel
            //                     label='AP'
            //                     minvalue={ficha?.attributes?.ap}
            //                     maxvalue={ficha?.attributes?.ap}
            //                     value={ficha?.attributes?.ap}
            //                 />
            //             </Box>
            //         </Box>
            //     </Box>
            // </Box>
        )
    } else {
        return (
            <Box>
                Carregando...
            </Box>
        )
    }
}

function CampaignGMDashboard(): ReactElement {
    const { channel } = useChannel()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ playersFicha, setPlayersFicha ] = useState<Ficha[]>([])
    const campaign = useCampaignContext()

    useEffect(() => {
        (async () => {
            setIsLoading(true)

            campaign.players.map(async player => {
                const response: Ficha = await fetch(`/api/ficha/${player.fichaId}`).then(async r => await r.json())
                setPlayersFicha([ ...playersFicha, response ])
            })

            setIsLoading(false)
        })()
    }, [ campaign ])

    async function updateFicha() {
        await fetch(`/api/ficha/${playersFicha[0]._id}`, {
            method: 'PATCH',
            body: JSON.stringify(playersFicha[0])
        }).then(async r => {
            const response = await r.json()
            setPlayersFicha([ ...playersFicha, response ])
            channel.trigger('client-ficha_updated', {
                ficha: response.updatedFicha
            })
        })
    }

    if (!isLoading) {
        return (
            <Box display='flex' flexDirection='column' gap={5}>
                {playersFicha.map(ficha => {
                    return (
                        <Box
                            key={ficha._id}
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
                                <Button onClick={updateFicha}>Alterar Ficha</Button>
                                <LinearProgressWithLabel
                                    label='LP'
                                    minvalue={ficha.attributes?.lp}
                                    maxvalue={ficha.attributes?.lp}
                                    value={ficha.attributes?.lp}
                                />
                            </Box>
                            <Box
                                display='flex'
                                flexDirection='column'
                                gap={1}
                            >
                                <LinearProgressWithLabel
                                    label='MP'
                                    minvalue={ficha.attributes?.mp}
                                    maxvalue={ficha.attributes?.mp}
                                    value={ficha.attributes?.mp}
                                />
                            </Box>
                            <Box
                                display='flex'
                                flexDirection='column'
                                gap={1}
                            >
                                <LinearProgressWithLabel
                                    label='AP'
                                    minvalue={ficha.attributes?.ap}
                                    maxvalue={ficha.attributes?.ap}
                                    value={ficha.attributes?.ap}
                                />
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        )
    } else {
        return (
            <Box>
                Carregando...
            </Box>
        )
    }
}

export default function CampaignDashboard(): ReactElement {
    const { data: session } = useSession()
    const campaign = useCampaignContext()

    return campaign?.admin.includes(session?.user._id ?? '') ? <CampaignGMDashboard /> : <CampaignPlayerDashboard />
}