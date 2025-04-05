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
    setPlayerFichas: Dispatch<SetStateAction<Ficha[]>>
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
        custom: {
            items: [],
            magias: [],
            creatures: []
        },
        myFicha: null,
        notes: []
    },
    campUsers: {
        admin: [],
        player: []
    },
    playerFichas: [],
    setPlayerFichas: () => {},
    setCampaign: () => {}
})

export const useCampaignContext = (): CampaignContextType => useContext(campaignContext)
