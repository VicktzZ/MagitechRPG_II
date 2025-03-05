import type { Campaign, Ficha, User } from '@types'
import { createContext, type Dispatch, type SetStateAction, useContext } from 'react'

interface CampaignContextType {
    campaign: Campaign
    setCampaign: Dispatch<SetStateAction<Campaign>>
    campUsers: {
        admin: User[]
        player: User[]
    }

    playerFichas: Ficha[]
}

export const campaignContext = createContext<CampaignContextType>({
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
        myFicha: null,
        notes: []
    },
    campUsers: {
        admin: [],
        player: []
    },
    playerFichas: [],
    setCampaign: () => {}
})

export const useCampaignContext = (): CampaignContextType => useContext(campaignContext)
