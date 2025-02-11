import type { Campaign } from '@types'
import { createContext, type Dispatch, type SetStateAction, useContext } from 'react'

export const campaignContext = createContext<{ campaign: Campaign, setCampaign: Dispatch<SetStateAction<Campaign>> }>({
    campaign: {
        _id: '',
        admin: [],
        campaignCode: '',
        title: '',
        description: '',
        players: [],
        session: {
            users: [],
            messages: []
        },
        myFicha: null
    },
    setCampaign: () => {}
})

export const useCampaignContext = (): { campaign: Campaign, setCampaign: Dispatch<SetStateAction<Campaign>> } => useContext(campaignContext)
