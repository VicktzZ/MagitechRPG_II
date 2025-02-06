import type { Campaign } from '@types';
import { createContext, useContext } from 'react';

export const campaignContext = createContext<Campaign>({
    _id: '',
    admin: [],
    campaignCode: '',
    title: '',
    description: '',
    players: [],
    session: [],
    myFicha: null
})

export const useCampaignContext = (): Campaign => useContext(campaignContext)