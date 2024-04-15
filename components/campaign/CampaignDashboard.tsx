// import { useChannel } from '@contexts/channelContext'
import { useCampaignContext } from '@contexts/campaignContext'
import { useChannel } from '@contexts/channelContext'
import { LinearProgressWithLabel } from '@layout'
import { Box } from '@mui/material'
import { useSession } from 'next-auth/react'
// import type { Ficha } from '@types'
import type { ReactElement } from 'react'

function CampaignPlayerDashboard(): ReactElement {
    // const { channel } = useChannel()

    // const ficha: Ficha = channel.members.me?.info

    return (
        <Box>
            <Box display='flex' gap={1}>
                <LinearProgressWithLabel
                    label='LP'
                    minvalue={50}
                    maxvalue={100}
                    value={50}
                />
                <LinearProgressWithLabel
                    label='MP'
                    minvalue={50}
                    maxvalue={100}
                    value={50}
                />
                <LinearProgressWithLabel
                    label='AP'
                    minvalue={50}
                    maxvalue={100}
                    value={50}
                />
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