/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import {
    AttachMoney,
    AutoAwesome,
    Inventory2,
    Person,
    SelfImprovement,
    SportsMartialArts
} from '@mui/icons-material';
import {
    Backdrop,
    Box,
    CircularProgress,
    Stack
} from '@mui/material';
import { useState, useEffect, useMemo, type ReactElement } from 'react';

import { Passives, Skills } from '@components/charsheet';
import Section from '../Section';
import ExpertiseSection from './ExpertiseSection';
import InventorySection from './InventorySection';
import MoneyAndAmmo from './MoneyAndAmmo';
import PlayerHeader from './PlayerHeader';
import SpellsSection from './SpellsSection';
import AcquiredPerks from './AcquiredPerks';
import ShopDrawer from './ShopDrawer';
import { PerkCardsModal, type SessionPlayer } from '@features/roguelite/components';
import { savePerkToCharsheet } from '@features/roguelite/utils';
import { DonationReceivedModal, type DonationNotification } from '@features/roguelite/components/perkCardsModal/components/DonationReceivedModal';
import { useSnackbar } from '@node_modules/notistack';
import { useSession } from 'next-auth/react';
import { campaignService } from '@services';

export default function CampaignPlayerDashboard(): ReactElement | null {
    const { users, isUserGM, campaign, charsheets } = useCampaignContext();
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext()
    const { data: session } = useSession()
    const { enqueueSnackbar } = useSnackbar()

    // Verifica se o usuário está na lista de pending perks
    const isUserPendingPerk = useMemo(() => {
        const userId = session?.user?.id
        const pendingUsers = campaign?.session?.pendingPerkUsers || []
        return !!(userId && pendingUsers.includes(userId))
    }, [ session?.user?.id, campaign?.session?.pendingPerkUsers ])

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
        currentSpells: (charsheet?.spells || []).map(spell => ({
            id: spell.id || crypto.randomUUID(),
            name: spell.name,
            description: spell.stages?.[0] || '',
            level: spell.level,
            element: spell.element
        })),
        weaponSlots: 2, // Limite padrão de 2 armas
        currentWeapons: (charsheet?.inventory?.weapons || []).map(weapon => ({
            id: weapon.id || crypto.randomUUID(),
            name: weapon.name,
            description: weapon.description || weapon.effect || '',
            rarity: weapon.rarity,
            categ: weapon.categ
        })),
        armorSlots: 1, // Limite padrão de 1 armadura
        currentArmors: (charsheet?.inventory?.armors || []).map(armor => ({
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

    if (!charsheet || isUserGM) return null;
    
    const charsheetUser = users.players.find(player => player.id === charsheet.userId);
    const avatar = charsheetUser?.image ?? '/assets/default-avatar.jpg';

    return (
        <Box 
            sx={{ 
                width: '100%', 
                pb: 8, 
                position: 'relative',
                minHeight: '100vh'
            }}
        >
            {!charsheet ? (
                <Backdrop 
                    open={true}
                    sx={{ 
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backdropFilter: 'blur(3px)'
                    }}
                >
                    <Stack spacing={2} alignItems="center">
                        <CircularProgress size={60} />
                    </Stack>
                </Backdrop>
            ) : (
                <Box 
                    sx={{
                        maxWidth: { xs: '100%', lg: '1400px', xl: '1800px' },
                        width: '100%',
                        mx: 'auto',
                        px: { xs: 2, md: 3, lg: 4 },
                        '@media (min-width: 2000px)': { maxWidth: '95%' }
                    }}
                >
                    {/* Header da Charsheet */}
                    <PlayerHeader avatar={avatar} />

                    {/* Grid Principal */}
                    <Stack spacing={4}>
                        {/* Passivas */}
                        <Section title="Passivas" icon={<SelfImprovement sx={{ color: 'text.secondary' }} />}>
                            <Passives realtime={true} />
                        </Section>

                        {/* Inventário e Habilidades */}
                        <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexDirection: { xs: 'column', md: 'row' } }}>
                            <Section title="Inventário" icon={<Inventory2 sx={{ color: 'success.main' }} />} sx={{ width: { xs: '100%', md: '60%' } }}>
                                <InventorySection />
                            </Section>
                            <Section title="Habilidades" icon={<SportsMartialArts sx={{ color: 'primary.main' }} />} sx={{ width: { xs: '100%', md: '40%' } }}>
                                <Skills />
                            </Section>
                        </Box>

                        {/* Recursos e Magias */}
                        <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexDirection: { xs: 'column', md: 'row' } }}>
                            <Section title="Recursos" icon={<AttachMoney sx={{ color: 'warning.main' }} />} sx={{ width: { xs: '100%', md: '40%' } }}>
                                <MoneyAndAmmo />
                            </Section>
                            <Section title="Magias" icon={<AutoAwesome sx={{ color: 'secondary.main' }} />} sx={{ width: { xs: '100%', md: '60%' } }}>
                                <SpellsSection />
                            </Section>
                        </Box>

                        {/* Perícias */}
                        <Section title="Perícias" icon={<Person sx={{ color: 'info.main' }} />}>
                            <ExpertiseSection />
                        </Section>
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

                    {/* Drawer de loja - apenas em Roguelite quando a loja está aberta */}
                    {campaign.mode === 'Roguelite' && (
                        <ShopDrawer />
                    )}
                </Box>
            )}
        </Box>
    );
}