/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import {
    AttachMoney,
    AutoStories,
    Casino,
    Inventory2,
    Notes,
    Person,
    SelfImprovement,
    SportsMartialArts,
    Tune
} from '@mui/icons-material';
import {
    Box,
    Stack,
    type SxProps
} from '@mui/material';
import { useState, useEffect, useMemo, type ReactElement } from 'react';

import { CustomDices, Passives, Skills } from '@components/charsheet';
import Section from '../Section';
import NotesSection from './NotesSection';
import PlayerStickyBar, { type PlayerSectionLink } from './PlayerStickyBar';
import ExpertiseSection from './ExpertiseSection';
import InventorySection from './InventorySection';
import MoneyAndAmmo from './MoneyAndAmmo';
import PlayerHeader from './PlayerHeader';
import SpellsSection from './SpellsSection';
import AcquiredPerks from './AcquiredPerks';
import CampaignCustomResources from './CampaignCustomResources';
import ShopDrawer from './ShopDrawer';
import { PerkCardsModal, type SessionPlayer } from '@features/roguelite/components';
import { savePerkToCharsheet } from '@features/roguelite/utils';
import { DonationReceivedModal, type DonationNotification } from '@features/roguelite/components/perkCardsModal/components/DonationReceivedModal';
import { useSnackbar } from '@node_modules/notistack';
import { useSession } from 'next-auth/react';
import { campaignService } from '@services';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';

/**
 * Normaliza um valor que pode ser um array ou um objeto com chaves numéricas
 * Converte Record<number, T> para T[]
 */
function normalizeToArray<T>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    
    // Se é um objeto com chaves numéricas, converter para array
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        const isNumericKeys = keys.every(key => !isNaN(Number(key)));
        if (isNumericKeys) {
            return keys
                .map(key => Number(key))
                .sort((a, b) => a - b)
                .map(key => value[key]);
        }
    }
    
    return [];
}

export default function CampaignPlayerDashboard(): ReactElement | null {
    const { users, campaign, charsheets } = useCampaignContext();
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext()
    const { data: session } = useSession()
    const { enqueueSnackbar } = useSnackbar()
    const { system: customSystem } = useCharsheetSystem(charsheet?.systemId)
    const showSpells = !customSystem || (customSystem.enabledFields?.spells ?? true)

    // Verifica se o usuário está na lista de pending perks
    const isUserPendingPerk = useMemo(() => {
        const userId = session?.user?.id
        const pendingUsers = campaign?.session?.pendingPerkUsers || []
        return !!(userId && pendingUsers.includes(userId))
    }, [ session?.user?.id, campaign?.session?.pendingPerkUsers ])

    // Cabeçalho do personagem: a barra fixa observa quando ele sai da tela
    const [ headerElement, setHeaderElement ] = useState<HTMLElement | null>(null)

    // Modal abre SOMENTE quando o usuário está na lista de pendentes
    const [ perkModalOpen, setPerkModalOpen ] = useState(false)

    // Estado para notificação de doação recebida
    const [ donationNotification, setDonationNotification ] = useState<DonationNotification | null>(null)
    const [ processedNotificationIds, setProcessedNotificationIds ] = useState<Set<string>>(new Set())

    // Efeito para abrir modal quando usuário tem perk pendente
    useEffect(() => {
        if (isUserPendingPerk) {
            setPerkModalOpen(true)
        } else {
            setPerkModalOpen(false)
        }
    }, [ isUserPendingPerk ])

    // Verifica se há notificações de doação não lidas
    useEffect(() => {
        const notifications = charsheet?.notifications || []
        // Filtra notificações não lidas e não processadas localmente
        const unreadDonations = notifications.filter(
            (n: any) => n.type === 'donation' && !n.read && !processedNotificationIds.has(n.id)
        )
        
        // Pega a mais recente (última na lista, ou ordena por data se houver)
        const latestDonation = unreadDonations.length > 0 
            ? unreadDonations.sort((a: any, b: any) => 
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            )[0]
            : null
        
        if (latestDonation && !donationNotification) {
            setDonationNotification({
                id: latestDonation.id,
                donorName: latestDonation.donorName,
                itemName: latestDonation.itemName,
                itemType: latestDonation.itemType,
                itemRarity: latestDonation.itemRarity
            })
        }
    }, [ charsheet?.notifications, processedNotificationIds, donationNotification ])

    // Prepara lista de jogadores da sessão (excluindo o jogador atual)
    const sessionPlayers: SessionPlayer[] = useMemo(() => {
        const currentUserId = session?.user?.id
        
        // campaign.players contém { userId, charsheetId } para cada jogador
        // charsheets (do contexto) contém os charsheets completos
        const campaignPlayers = campaign?.players || []
        const allCharsheets = charsheets || []
        
        console.log('[CampaignPlayerDashboard] Debug inicial:', {
            usersPlayers: users.players.map(p => ({ id: p.id, name: p.name })),
            currentUserId,
            campaignPlayers,
            allCharsheets: allCharsheets.map(cs => ({ id: cs.id, userId: cs.userId, name: cs.name }))
        })
        
        const allPlayers = users.players
            .filter(player => player.id !== currentUserId)
            .map(player => {
                // Primeiro, encontra o charsheetId do jogador na campanha
                const playerInCampaign = campaignPlayers.find((cp: any) => cp.userId === player.id)
                // Depois, busca o charsheet completo
                const playerCharsheet = playerInCampaign 
                    ? allCharsheets.find((cs: any) => cs.id === playerInCampaign.charsheetId)
                    : undefined
                
                const sessionPlayer = {
                    odac: player.name || 'Jogador',
                    name: playerCharsheet?.name || `Ficha de ${player.name || 'Jogador'}`,
                    odacId: player.id,
                    odacImage: player.image,
                    charsheetId: playerCharsheet?.id || playerInCampaign?.charsheetId || '',
                    weaponCount: playerCharsheet?.inventory?.weapons?.length || 0,
                    armorCount: playerCharsheet?.inventory?.armors?.length || 0,
                    currentCargo: playerCharsheet?.capacity?.cargo || 0,
                    maxCargo: playerCharsheet?.capacity?.max || 0
                }
                
                console.log(`[CampaignPlayerDashboard] Processando jogador ${player.name}:`, {
                    playerId: player.id,
                    playerInCampaign,
                    hasCharsheet: !!playerCharsheet,
                    charsheetId: sessionPlayer.charsheetId,
                    charsheetName: playerCharsheet?.name,
                    sessionPlayer
                })
                
                return sessionPlayer
            })
        
        // Filtra jogadores sem charsheet
        const players = allPlayers.filter(p => p.charsheetId)
        
        console.log('[CampaignPlayerDashboard] SessionPlayers final:', {
            totalPlayers: users.players.length,
            currentUserId,
            filteredBefore: allPlayers.length,
            filteredPlayers: players.length,
            sessionPlayers: players
        })
        
        return players
    }, [ users.players, session?.user?.id, charsheets, campaign?.players ])

    const handlePerkSelected = async (perk: any, replacedItemId?: string) => {
        if (!charsheet?.id || !campaign?.campaignCode) return
        
        const result = await savePerkToCharsheet({
            perk,
            charsheetId: charsheet.id,
            campaignCode: campaign.campaignCode,
            campaignMode: campaign.mode,
            currentCharsheet: charsheet,
            replacedItemId
        })
        
        if (result.success) {
            enqueueSnackbar(result.message, { variant: 'success' })
        } else {
            enqueueSnackbar(result.message, { variant: 'error' })
        }
    }

    // Prepara informações de espaço do charsheet para o modal de perks
    const charsheetSpace = useMemo(() => ({
        spellSpace: charsheet?.spellSpace || 0,
        currentSpells: normalizeToArray(charsheet?.spells).map(spell => ({
            id: spell.id || crypto.randomUUID(),
            name: spell.name,
            description: spell.stages?.[0] || '',
            level: spell.level,
            element: spell.element
        })),
        weaponSlots: 2, // Limite padrão de 2 armas
        currentWeapons: normalizeToArray(charsheet?.inventory?.weapons).map(weapon => ({
            id: weapon.id || crypto.randomUUID(),
            name: weapon.name,
            description: weapon.description || weapon.effect || '',
            rarity: weapon.rarity,
            categ: weapon.categ
        })),
        armorSlots: 1, // Limite padrão de 1 armadura
        currentArmors: normalizeToArray(charsheet?.inventory?.armors).map(armor => ({
            id: armor.id || crypto.randomUUID(),
            name: armor.name,
            description: armor.description || armor.effect || '',
            rarity: armor.rarity,
            ap: armor.ap
        }))
    }), [ charsheet?.spellSpace, charsheet?.spells, charsheet?.inventory?.weapons, charsheet?.inventory?.armors ])

    const handleCloseModal = async () => {
        // Guarda referência antes de fechar
        const userId = session?.user?.id
        const wasPending = isUserPendingPerk
        
        setPerkModalOpen(false)
        
        // Se o usuário estava na lista de pendentes, remove após escolher
        if (userId && wasPending) {
            try {
                console.log('[CampaignPlayerDashboard] Removendo usuário da lista de pendentes:', userId)
                await campaignService.removePendingPerkUser(campaign.id, userId)
                console.log('[CampaignPlayerDashboard] Usuário removido com sucesso')
            } catch (error) {
                console.error('Erro ao remover usuário da lista de pendentes:', error)
            }
        }
    }

    // Fecha modal de doação e marca a notificação como lida
    const handleCloseDonationModal = async () => {
        if (!donationNotification?.id) {
            setDonationNotification(null)
            return
        }

        const notificationId = donationNotification.id
        
        // Adiciona ao set de processados para evitar reabrir
        setProcessedNotificationIds(prev => new Set([ ...prev, notificationId ]))
        
        // Limpa o estado local imediatamente
        setDonationNotification(null)
        
        // Marca a notificação como lida no charsheet
        try {
            const notifications = charsheet?.notifications || []
            const updatedNotifications = notifications.map((n: any) => 
                n.id === notificationId ? { ...n, read: true } : n
            )
            
            await updateCharsheet({
                notifications: updatedNotifications
            })
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error)
        }
    }

    if (!charsheet) return null;
    
    const charsheetUser = users.players.find(player => player.id === charsheet.userId);
    const avatar = charsheetUser?.image ?? '/assets/default-avatar.jpg';

    // Atalhos da barra fixa: um por seção, na ordem em que aparecem
    const sections: PlayerSectionLink[] = [
        { id: 'passivas', label: 'Passivas' },
        { id: 'inventario', label: 'Inventário' },
        { id: 'habilidades', label: 'Habilidades' },
        { id: 'recursos', label: 'Recursos' },
        ...(showSpells ? [ { id: 'magias', label: 'Magias' } ] : []),
        ...(charsheet.systemId ? [ { id: 'sistema', label: 'Sistema' } ] : []),
        { id: 'pericias', label: 'Perícias' },
        { id: 'dados', label: 'Dados' },
        { id: 'anotacoes', label: 'Anotações' }
    ]

    // Duas seções lado a lado quando a COLUNA (não a janela) comporta; com o chat encaixado a coluna é mais estreita
    const pair = (columns: string): SxProps => ({
        display: 'grid',
        gap: 3,
        gridTemplateColumns: 'minmax(0, 1fr)',
        '@container (min-width: 820px)': { gridTemplateColumns: columns }
    })

    const sectionIcon = { color: 'text.secondary' }

    return (
        <Box
            sx={{
                width: '100%',
                pb: 8,
                position: 'relative',
                containerType: 'inline-size',
                '--campaign-sticky-offset': '120px'
            }}
        >
            <PlayerHeader avatar={avatar} rootRef={setHeaderElement} />
            <PlayerStickyBar headerElement={headerElement} sections={sections} />

            <Stack spacing={3} sx={{ mt: 3 }}>
                <Section id="passivas" title="Passivas" icon={<SelfImprovement sx={sectionIcon} />}>
                    <Passives realtime={true} />
                </Section>

                <Box sx={pair('minmax(0, 3fr) minmax(0, 2fr)')}>
                    <Section id="inventario" title="Inventário" icon={<Inventory2 sx={sectionIcon} />}>
                        <InventorySection />
                    </Section>
                    <Section id="habilidades" title="Habilidades" icon={<SportsMartialArts sx={sectionIcon} />}>
                        <Skills />
                    </Section>
                </Box>

                <Box sx={showSpells ? pair('minmax(0, 2fr) minmax(0, 3fr)') : undefined}>
                    <Section id="recursos" title="Recursos" icon={<AttachMoney sx={sectionIcon} />}>
                        <MoneyAndAmmo />
                    </Section>
                    {showSpells && (
                        <Section id="magias" title="Magias" icon={<AutoStories sx={sectionIcon} />}>
                            <SpellsSection />
                        </Section>
                    )}
                </Box>

                {/* Recursos customizados do sistema (ex: Bateria, O2, Estresse) */}
                {charsheet.systemId && (
                    <Section id="sistema" title="Recursos do Sistema" icon={<Tune sx={sectionIcon} />}>
                        <CampaignCustomResources />
                    </Section>
                )}

                {/* Perícias */}
                <Section id="pericias" title="Perícias" icon={<Person sx={sectionIcon} />}>
                    <ExpertiseSection />
                </Section>

                {/* Dados e anotações do jogador: ficavam na coluna lateral, longe da ficha */}
                <Box sx={pair('minmax(0, 1fr) minmax(0, 1fr)')}>
                    <Section id="dados" title="Dados customizados" icon={<Casino sx={sectionIcon} />}>
                        <CustomDices enableChatIntegration={true} realtime={true} />
                    </Section>
                    <Section id="anotacoes" title="Anotações" icon={<Notes sx={sectionIcon} />}>
                        <NotesSection />
                    </Section>
                </Box>
            </Stack>

            {/* Modal de Perks - aparece SOMENTE quando GM oferece e usuário está na lista */}
            {isUserPendingPerk && (
                <PerkCardsModal 
                    open={perkModalOpen} 
                    seed={campaign.session?.sharedPerkSeed || undefined}
                    level={charsheet.level}
                    hideFilters={true}
                    initialFilters={campaign.session?.perkFilters ? {
                        rarities: campaign.session.perkFilters.rarities,
                        type: campaign.session.perkFilters.type || undefined,
                        element: campaign.session.perkFilters.element || undefined,
                        spellLevel: campaign.session.perkFilters.spellLevel || undefined,
                        execution: campaign.session.perkFilters.execution || undefined,
                        itemKinds: campaign.session.perkFilters.itemKinds,
                        skillTypes: campaign.session.perkFilters.skillTypes
                    } : undefined}
                    charsheetSpace={charsheetSpace}
                    sessionPlayers={sessionPlayers}
                    campaignId={campaign.id}
                    currentCharsheetId={charsheet.id}
                    currentPlayerName={charsheet.name}
                    onPerkSelected={handlePerkSelected}
                    onClose={handleCloseModal}
                />
            )}
            
            {/* Lista de perks adquiridos - apenas em Roguelite */}
            {campaign.mode === 'Roguelite' && (
                <AcquiredPerks />
            )}

            {/* Modal de notificação de doação recebida */}
            <DonationReceivedModal
                open={!!donationNotification}
                donation={donationNotification}
                onClose={handleCloseDonationModal}
            />

            {/* Drawer de loja - disponível em qualquer campanha quando a loja está aberta */}
            <ShopDrawer />
        </Box>
    );
}
