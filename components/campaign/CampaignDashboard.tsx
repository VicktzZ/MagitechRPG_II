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
    const { myFicha } = useCampaignContext()

    const [ ficha, setFicha ] = useState<Ficha>(myFicha!);

    useEffect(() => {
        setFicha(myFicha!)

        channel.bind('client-ficha_updated', (data: { ficha: Ficha }) => {
            console.log(data)
            setFicha(data.ficha)
        })

        console.log(ficha)
    }, [])

    return (
        <Box>
            <LinearProgressWithLabel
                label='LP'
                minvalue={ficha.attributes?.lp}
                maxvalue={ficha.attributes?.lp}
                value={ficha.attributes?.lp}
            />
            <LinearProgressWithLabel
                label='MP'
                minvalue={ficha.attributes?.mp}
                maxvalue={ficha.attributes?.mp}
                value={ficha.attributes?.mp}
            />
            <LinearProgressWithLabel
                label='AP'
                minvalue={ficha.attributes?.ap}
                maxvalue={ficha.attributes?.ap}
                value={ficha.attributes?.ap}
            />
        </Box>
    )
}

function CampaignGMDashboard(): ReactElement {
    const { channel } = useChannel()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ playersFicha, setPlayersFicha ] = useState<Ficha[]>([])
    const campaign = useCampaignContext()

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