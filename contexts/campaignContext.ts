import type { CampaignData } from '@models/types/session'
import type { Campaign } from '@models/entities'
import { createContext, useContext } from 'react'

export interface CampaignContextValue extends CampaignData {
    updateCampaign: (data: Partial<Campaign>) => Promise<void>
}

export const campaignContext = createContext<CampaignContextValue>({
    campaign: {
        id: '',
        admin: [],
        campaignCode: '',
        title: '',
        description: '',
        players: [],
        mode: 'Classic',
        createdAt: new Date().toISOString(),
        session: {
            users: [],
            messages: []
        },
        custom: {
            items: {
                weapon: [],
                armor: [],
                item: []
            },
            dices: [],
            magias: [],
            creatures: [],
            skills: []
        },
        notes: []
    },
    users: {
        admin: [],
        players: [],
        all: []
    },
    charsheets: [],
    isUserGM: false,
    updateCampaign: async () => {}
})

export const useCampaignContext = (): CampaignContextValue => useContext(campaignContext)
