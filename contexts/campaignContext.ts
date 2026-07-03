import type { CampaignData } from '@models/types/session'
import type { Campaign, RPGSystem } from '@models/entities'
import { createContext, useContext } from 'react'

export interface CampaignContextValue extends CampaignData {
    updateCampaign: (data: Partial<Campaign>) => Promise<void>
    rpgSystem: RPGSystem | null
    loadingSystem: boolean
    isDefaultSystem: boolean
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
    updateCampaign: async () => {},
    rpgSystem: null,
    loadingSystem: false,
    isDefaultSystem: true
})

export const useCampaignContext = (): CampaignContextValue => useContext(campaignContext)
