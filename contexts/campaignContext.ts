import type { CampaignData } from '@types'
import { createContext, useContext } from 'react'

export const campaignContext = createContext<CampaignData>({
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
            creatures: [],
            skills: []
        },
        myFicha: null,
        notes: []
    },
    users: {
        admin: [],
        player: [],
        all: []
    },
    fichas: [],
    isUserGM: false,
    code: ''
})

export const useCampaignContext = (): CampaignData => useContext(campaignContext)
