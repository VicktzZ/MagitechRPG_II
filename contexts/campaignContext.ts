import type { CampaignData } from '@models/types/session'
import type { Campaign, RPGSystem } from '@models/entities'
import type { Message } from '@models'
import type { CampaignChat } from '@hooks/useCampaignChatFeed'
import { createContext, useContext } from 'react'

export interface CampaignContextValue extends CampaignData {
    updateCampaign: (data: Partial<Campaign>) => Promise<void>
    rpgSystem: RPGSystem | null
    loadingSystem: boolean
    isDefaultSystem: boolean
    /**
     * Ficha que o jogador escolheu (ou criou, no Roguelite) no modal de entrada. Quem entra pela primeira vez ainda não
     * está em `campaign.players`: a entrada na sessão é que o registra, e precisa saber qual ficha ele escolheu.
     */
    selectedCharsheetId: string
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
    isDefaultSystem: true,
    selectedCharsheetId: ''
})

export const useCampaignContext = (): CampaignContextValue => useContext(campaignContext)

/**
 * Mensagens do chat da sessão, separadas do campaignContext de propósito:
 * elas mudam a cada mensagem/rolagem de qualquer jogador, e mantê-las no
 * contexto principal re-renderizava TODOS os consumidores da campanha a
 * cada mensagem. Somente componentes de chat devem consumir este contexto.
 */
export const campaignMessagesContext = createContext<Message[]>([])
export const useCampaignMessages = (): Message[] => useContext(campaignMessagesContext)

const noChat: CampaignChat = { hasMore: false, loadingOlder: false, loadOlder: async () => {}, error: null }
export const campaignChatContext = createContext<CampaignChat>(noChat)
export const useCampaignChat = (): CampaignChat => useContext(campaignChatContext)
