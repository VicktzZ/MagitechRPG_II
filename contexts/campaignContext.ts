import type { Campaign, User } from '@types'
import { createContext, type Dispatch, type SetStateAction, useContext } from 'react'

export const campaignContext = createContext<{ campaign: Campaign, setCampaign: Dispatch<SetStateAction<Campaign>>, campUsers: { admin: User[], player: User[] } }>({
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
    campUsers: {
        admin: [],
        player: []
    },
    setCampaign: () => {}
})

export const useCampaignContext = (): { campaign: Campaign, setCampaign: Dispatch<SetStateAction<Campaign>>, campUsers: { admin: User[], player: User[] } } => useContext(campaignContext)
