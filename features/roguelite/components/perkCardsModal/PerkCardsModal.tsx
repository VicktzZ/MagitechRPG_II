import { Box, Button, Grid, Stack, Typography, keyframes } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { iconForRarity } from '@features/roguelite/utils'
import type { RarityType } from '@models/types/string'
import { PerkCard, SpellCard } from '../perkCardModule'
import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { usePerkCards } from './hooks/usePerkCards'
import { FilterControls } from './components/FilterControls'
import { VisibilityToggle } from './components/VisibilityToggle'
import { LoadingState } from './components/LoadingState'
import { SubstitutionModal, type SubstitutionType, type SubstitutableItem, type SessionPlayer } from './components/SubstitutionModal'
import { mapPerkToCardProps } from './helpers/perkMapper'
import { useState, useCallback } from 'react'

// Re-export para uso externo
export type { SessionPlayer } from './components/SubstitutionModal'

// Animação de confirmação - mais rápida
const fadeOut = keyframes`
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.9); }
`

interface CharsheetSpaceInfo {
    spellSpace: number
    currentSpells: SubstitutableItem[]
    weaponSlots: number
    currentWeapons: SubstitutableItem[]
    armorSlots: number
    currentArmors: SubstitutableItem[]
}

interface PerkCardsModalProps {
    open: boolean
    seed?: string
    level?: number
    perkAmount?: number
    hideFilters?: boolean
    initialFilters?: {
        rarities?: string[]
        type?: string
        element?: string
        spellLevel?: string
        execution?: string
        itemKinds?: string[]
        skillTypes?: string[]
    }
    charsheetSpace?: CharsheetSpaceInfo
    sessionPlayers?: SessionPlayer[]
    campaignId?: string
    currentCharsheetId?: string
    currentPlayerName?: string
    onPerkSelected?: (perk: any, replacedItemId?: string) => void
    onClose?: () => void
}

function getIcon(rarity: string) {
    switch (iconForRarity(rarity as RarityType)) {
    case 'AutoAwesome':
        return <AutoAwesomeIcon />
    case 'LocalFireDepartment':
        return <LocalFireDepartmentIcon />
    case 'Whatshot':
        return <WhatshotIcon />
    default:
        return <AutoAwesomeIcon />
    }
}

export function PerkCardsModal({ 
    open, 
    level, 
    perkAmount = 5, 
    hideFilters = false, 
    initialFilters, 
    charsheetSpace, 
    sessionPlayers = [],
    campaignId,
    currentCharsheetId,
    currentPlayerName,
    onPerkSelected, 
    onClose 
}: PerkCardsModalProps) {
    const {
        isVisible,
        selectedRarities,
        selectedType,
        selectedElement,
        selectedSpellLevel,
        selectedExecution,
        selectedItemKinds,
        rolled,
        loading,
        error,
        selectedPerkIndex,
        isConfirming,
        setSelectedRarities,
        setSelectedType,
        setSelectedElement,
        setSelectedSpellLevel,
        setSelectedExecution,
        setSelectedItemKinds,
        handleReroll,
        toggleVisibility,
        selectPerk,
        confirmSelection,
        finalizeSelection,
        resetConfirmation
    } = usePerkCards({ open, level, perkAmount, initialFilters })

    // Estado para modal de substituição
    const [substitutionModal, setSubstitutionModal] = useState<{
        open: boolean
        type: SubstitutionType
        newItem: SubstitutableItem | null
        existingItems: SubstitutableItem[]
        pendingPerk: any | null
    }>({
        open: false,
        type: 'spell',
        newItem: null,
        existingItems: [],
        pendingPerk: null
    })

    /**
     * Verifica se há espaço disponível para o tipo de perk
     */
    const checkSpaceAvailable = useCallback((perk: any): { hasSpace: boolean; type: SubstitutionType; existingItems: SubstitutableItem[] } => {
        const perkType = perk.perkType as PerkTypeEnum

        console.log('[checkSpaceAvailable] Verificando:', {
            perkType,
            hasCharsheetSpace: !!charsheetSpace,
            spellSpace: charsheetSpace?.spellSpace,
            currentSpellsLength: charsheetSpace?.currentSpells?.length,
            weaponSlots: charsheetSpace?.weaponSlots,
            currentWeaponsLength: charsheetSpace?.currentWeapons?.length
        })

        // Verificação para magias
        if (perkType === PerkTypeEnum.SPELL && charsheetSpace) {
            const hasSpace = charsheetSpace.currentSpells.length < charsheetSpace.spellSpace
            console.log('[checkSpaceAvailable] Resultado para SPELL:', { hasSpace, spellsCount: charsheetSpace.currentSpells.length, spellSpace: charsheetSpace.spellSpace })
            return {
                hasSpace,
                type: 'spell',
                existingItems: charsheetSpace.currentSpells
            }
        }

        // Verificação para armas (limite de 2 armas por padrão)
        if (perkType === PerkTypeEnum.WEAPON && charsheetSpace) {
            const hasSpace = charsheetSpace.currentWeapons.length < charsheetSpace.weaponSlots
            console.log('[checkSpaceAvailable] Resultado para WEAPON:', { hasSpace, weaponsCount: charsheetSpace.currentWeapons.length, weaponSlots: charsheetSpace.weaponSlots })
            return {
                hasSpace,
                type: 'weapon',
                existingItems: charsheetSpace.currentWeapons
            }
        }

        // Verificação para armaduras (limite de 1 armadura por padrão)
        if (perkType === PerkTypeEnum.ARMOR && charsheetSpace) {
            const hasSpace = charsheetSpace.currentArmors.length < charsheetSpace.armorSlots
            console.log('[checkSpaceAvailable] Resultado para ARMOR:', { hasSpace, armorsCount: charsheetSpace.currentArmors.length, armorSlots: charsheetSpace.armorSlots })
            return {
                hasSpace,
                type: 'armor',
                existingItems: charsheetSpace.currentArmors
            }
        }

        // Por padrão, sempre há espaço
        console.log('[checkSpaceAvailable] Tipo não verificado ou sem charsheetSpace - retornando hasSpace=true')
        return { hasSpace: true, type: 'spell', existingItems: [] }
    }, [charsheetSpace])

    /**
     * Converte o perk para o formato de item substituível
     */
    const perkToSubstitutableItem = useCallback((perk: any): SubstitutableItem => {
        const data = perk.data || perk
        return {
            id: data.id || crypto.randomUUID(),
            name: data.name || perk.name || 'Item',
            description: data.description || perk.description,
            rarity: perk.rogueliteRarity || perk.rarity || data.rarity,
            level: data.level,
            element: data.element,
            categ: data.categ,
            kind: data.kind
        }
    }, [])

    /**
     * Lida com a substituição de um item
     */
    const handleSubstitute = useCallback((replacedItemId: string) => {
        const { pendingPerk } = substitutionModal
        if (pendingPerk && onPerkSelected) {
            onPerkSelected(pendingPerk, replacedItemId)
        }
        setSubstitutionModal(prev => ({ ...prev, open: false, pendingPerk: null }))
        
        // Finaliza o fluxo - incrementa seed e reseta estados
        finalizeSelection()
        
        if (onClose) {
            onClose()
        }
    }, [substitutionModal, onPerkSelected, onClose, finalizeSelection])

    /**
     * Cancela a substituição - reseta estados mas NÃO incrementa seed
     */
    const handleCancelSubstitution = useCallback(() => {
        setSubstitutionModal(prev => ({ ...prev, open: false, pendingPerk: null }))
        // Reseta o estado de confirmação para permitir nova seleção
        // Mas NÃO incrementa o seed (usuário não completou o fluxo)
        resetConfirmation()
    }, [resetConfirmation])

    /**
     * Lida com a doação de um item para outro jogador
     */
    const handleDonate = useCallback(async (targetPlayerId: string, targetCharsheetId: string): Promise<{ success: boolean; message: string }> => {
        if (!campaignId || !currentCharsheetId || !substitutionModal.pendingPerk) {
            return { success: false, message: 'Dados insuficientes para doação' }
        }

        const perk = substitutionModal.pendingPerk
        const perkType = perk.perkType as PerkTypeEnum
        const itemType = perkType === PerkTypeEnum.WEAPON ? 'weapon' : 'armor'

        try {
            const response = await fetch(`/api/campaign/${campaignId}/donate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donorCharsheetId: currentCharsheetId,
                    targetCharsheetId,
                    targetUserId: targetPlayerId,
                    itemType,
                    item: perk.data || perk,
                    donorName: currentPlayerName || 'Um jogador'
                })
            })

            const result = await response.json()

            if (result.success) {
                // Fecha o modal e finaliza o fluxo
                setSubstitutionModal(prev => ({ ...prev, open: false, pendingPerk: null }))
                finalizeSelection()
                if (onClose) {
                    onClose()
                }
            }

            return result
        } catch (error) {
            console.error('[PerkCardsModal] Erro ao doar:', error)
            return { success: false, message: 'Erro ao processar doação' }
        }
    }, [campaignId, currentCharsheetId, currentPlayerName, substitutionModal.pendingPerk, finalizeSelection, onClose])
    
    const handleConfirm = async () => {
        const selectedPerk = await confirmSelection()
        if (!selectedPerk) return

        // Verifica se há espaço disponível
        const { hasSpace, type, existingItems } = checkSpaceAvailable(selectedPerk)
        
        console.log('[PerkCardsModal] Verificando espaço:', {
            perkType: selectedPerk.perkType,
            hasSpace,
            type,
            existingItemsCount: existingItems.length,
            charsheetSpace
        })

        if (!hasSpace) {
            console.log('[PerkCardsModal] Sem espaço - abrindo modal de substituição')
            // Abre o modal de substituição - NÃO finaliza ainda
            setSubstitutionModal({
                open: true,
                type,
                newItem: perkToSubstitutableItem(selectedPerk),
                existingItems,
                pendingPerk: selectedPerk
            })
            return // Não fecha o modal principal, aguarda substituição
        }

        // Há espaço disponível - procede normalmente
        if (onPerkSelected) {
            onPerkSelected(selectedPerk)
        }
        
        // Finaliza o fluxo - incrementa seed e reseta estados
        finalizeSelection()
        
        if (onClose) {
            onClose()
        }
    }

    /**
     * Recusa a vantagem - incrementa seed mas não adiciona nada
     */
    const handleDecline = useCallback(() => {
        // Incrementa o seed mesmo recusando (para mudar as opções na próxima vez)
        finalizeSelection()
        
        if (onClose) {
            onClose()
        }
    }, [finalizeSelection, onClose])

    if (!open) return null

    return (
        <>
            <VisibilityToggle isVisible={isVisible} onToggle={toggleVisibility} />

            {isVisible && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        m: '0 !important',
                        p: '0 !important',
                        width: '100vw',
                        height: '100dvh',
                        bgcolor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9998,
                        display: 'flex',
                        flexDirection: 'column',
                        boxSizing: 'border-box'
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2.5
                        }}
                    >
                        <Typography variant="h5" fontWeight={700} color="white">
                            Escolha sua vantagem
                        </Typography>
                        {!hideFilters && (
                            <FilterControls
                                selectedRarities={selectedRarities}
                                selectedType={selectedType}
                                selectedElement={selectedElement}
                                selectedSpellLevel={selectedSpellLevel}
                                selectedExecution={selectedExecution}
                                selectedItemKinds={selectedItemKinds}
                                onRaritiesChange={setSelectedRarities}
                                onTypeChange={setSelectedType}
                                onElementChange={setSelectedElement}
                                onSpellLevelChange={setSelectedSpellLevel}
                                onExecutionChange={setSelectedExecution}
                                onItemKindsChange={setSelectedItemKinds}
                                onReroll={handleReroll}
                            />
                        )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ pt: 0, pb: 2, px: 2, flexGrow: 1, overflow: 'auto' }}>
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <LoadingState loading={loading} error={error} onRetry={handleReroll} />

                            {!loading && !error && (
                                <Grid
                                    container
                                    spacing={{ xs: 1.5, sm: 2, md: 2.5 }}
                                    justifyContent="center"
                                    alignItems="center"
                                    sx={{ maxWidth: '1600px', width: '100%' }}
                                >
                                    {rolled.map((perk, idx) => {
                                        const cardProps = mapPerkToCardProps(perk, getIcon(perk.rarity ?? 'Comum'))
                                        const isSpell = perk.perkType === PerkTypeEnum.SPELL
                                        const isSelected = selectedPerkIndex === idx
                                        
                                        return (
                                            <Grid
                                                key={idx}
                                                item
                                                xs={12}
                                                sm={6}
                                                md={4}
                                                lg={3.2}
                                                xl={2.4}
                                                display="flex"
                                                justifyContent="center"
                                                alignItems="center"
                                                sx={{
                                                    transition: 'all 0.5s ease-out',
                                                    ...(isConfirming && !isSelected && {
                                                        animation: `${fadeOut} 0.6s ease-out forwards`
                                                    })
                                                }}
                                            >
                                                {isSpell ? (
                                                    <SpellCard
                                                        title={cardProps.title}
                                                        subtitle={cardProps.subtitle}
                                                        description={cardProps.description}
                                                        element={cardProps.element ?? 'NÃO-ELEMENTAL'}
                                                        icon={cardProps.icon}
                                                        attributes={cardProps.attributes}
                                                        level={cardProps.level}
                                                        stages={cardProps.stages}
                                                        mpCost={cardProps.mpCost}
                                                        isSelected={isSelected}
                                                        onClick={() => !isConfirming && selectPerk(idx)}
                                                    />
                                                ) : (
                                                    <PerkCard 
                                                        {...cardProps} 
                                                        isSelected={isSelected}
                                                        onClick={() => !isConfirming && selectPerk(idx)}
                                                    />
                                                )}
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                            )}
                        </Box>
                    </Box>

                    {/* Botões de Ação */}
                    {!isConfirming && (
                        <Box
                            sx={{
                                position: 'fixed',
                                bottom: 32,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 10000
                            }}
                        >
                            <Stack direction="row" spacing={2}>
                                {/* Botão de Recusar */}
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<CancelIcon />}
                                    onClick={handleDecline}
                                    sx={{
                                        px: 3,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(8px)',
                                        textTransform: 'none',
                                        '&:hover': {
                                            borderColor: 'rgba(255, 100, 100, 0.6)',
                                            background: 'rgba(255, 100, 100, 0.1)',
                                            color: 'rgba(255, 150, 150, 1)'
                                        }
                                    }}
                                >
                                    Recusar
                                </Button>

                                {/* Botão de Confirmar (só aparece se tiver seleção) */}
                                {selectedPerkIndex !== null && (
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<CheckCircleIcon />}
                                        onClick={handleConfirm}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            color: 'white',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(8px)',
                                            textTransform: 'none',
                                            '&:hover': {
                                                borderColor: 'rgba(255, 255, 255, 0.8)',
                                                background: 'rgba(255, 255, 255, 0.15)'
                                            }
                                        }}
                                    >
                                        Confirmar
                                    </Button>
                                )}
                            </Stack>
                        </Box>
                    )}
                </Box>
            )}

            {/* Modal de Substituição */}
            {substitutionModal.newItem && (
                <SubstitutionModal
                    open={substitutionModal.open}
                    type={substitutionModal.type}
                    newItem={substitutionModal.newItem}
                    existingItems={substitutionModal.existingItems}
                    sessionPlayers={sessionPlayers}
                    onSubstitute={handleSubstitute}
                    onDonate={handleDonate}
                    onCancel={handleCancelSubstitution}
                />
            )}
        </>
    )
}
