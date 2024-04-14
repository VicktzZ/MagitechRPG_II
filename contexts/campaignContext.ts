import type { Campaign } from '@types';
import { createContext, useContext } from 'react';

export const campaignContext = createContext<Campaign>({
    _id: '',
    admin: [],
    title: '',
    description: '',
    players: [],
    campaignCode: ''
})

export const useCampaignContext = (): Campaign  => useContext(campaignContext)