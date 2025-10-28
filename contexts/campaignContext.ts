import type { CampaignData } from '@models/types/session'
import { createContext, useContext } from 'react'

export const campaignContext = createContext<CampaignData>({
    campaign: {
        id: '',
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
            items: {
                weapon: [],
                armor: [],
                item: []
            },
            magias: [],
            creatures: [],
            skills: []
        },
        myCharsheet: null,
        notes: []
    },
    users: {
        admin: [],
        players: [],
        all: []
    },
    charsheets: [],
    isUserGM: false
})

export const useCampaignContext = (): CampaignData => useContext(campaignContext)
