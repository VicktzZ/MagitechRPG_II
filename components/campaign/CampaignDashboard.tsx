// import { useChannel } from '@contexts/channelContext'
import { useCampaignContext } from '@contexts/campaignContext'
import { useChannel } from '@contexts/channelContext'
import { LinearProgressWithLabel } from '@layout'
import { Box, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import type { Ficha } from '@types'
import { useEffect, useState, type ReactElement } from 'react'
import { fichaService } from '@services'

function CampaignPlayerDashboard(): ReactElement {
    const { channel } = useChannel()
    const { campaign: { myFicha } } = useCampaignContext()

    const [ ficha, setFicha ] = useState<Ficha>(myFicha!);

    useEffect(() => {
        setFicha(myFicha!)

        channel.bind('client-ficha_updated', (data: { ficha: Ficha }) => {
            console.log(data)
            setFicha(data.ficha)
        })
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
    // const { channel } = useChannel()
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ playersFicha, setPlayersFicha ] = useState<Ficha[]>([])
    const { campaign } = useCampaignContext()

    async function updateFicha() {
        // await fetch(`/api/ficha/${playersFicha[0]._id}`, {
        //     method: 'PATCH',
        //     body: JSON.stringify(playersFicha[0])
        // }).then(async r => {
        //     const response = await r.json()
        //     setPlayersFicha([ ...playersFicha, response ])
        //     channel.trigger('client-ficha_updated', {
        //         ficha: response.updatedFicha
        //     })
        // })
    }

    useEffect(() => {
        const fetchFichas = async () => {
            setIsLoading(true)

            campaign.players.map(async player => {
                const response = await fichaService.getById(player.fichaId)
                setPlayersFicha([ ...playersFicha, response ])
            })

            setIsLoading(false)
        }

        fetchFichas()
    }, [ campaign ])

    if (isLoading) {
        return (
            <Typography>Carregando...</Typography>
        )
    } else {
        return (
            <></>
        )
    }
}

export default function CampaignDashboard(): ReactElement {
    const { data: session } = useSession()
    const { campaign } = useCampaignContext()

    return campaign?.admin.includes(session?.user._id ?? '') ? <CampaignGMDashboard /> : <CampaignPlayerDashboard />
}