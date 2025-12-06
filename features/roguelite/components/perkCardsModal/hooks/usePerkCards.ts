import { useState, useEffect, useCallback } from 'react'
import { create as createRandom } from 'random-seed'
import type { RarityType } from '@models/types/string'
import type { PerkTypeEnum } from '@enums/rogueliteEnum'

interface UsePerkCardsOptions {
    open: boolean
    level?: number
    perkAmount?: number
    initialFilters?: {
        rarities?: string[]
        type?: string
        element?: string
        spellLevel?: string
        execution?: string
        itemKinds?: string[]
        skillTypes?: string[]
    }
}

interface UsePerkCardsReturn {
    userSeed: string
    rollCount: number
    isVisible: boolean
    selectedRarities: RarityType[]
    selectedType: PerkTypeEnum | ''
    // Filtros de magia
    selectedElement: string
    selectedSpellLevel: string
    selectedExecution: string
    // Filtros de item
    selectedItemKinds: string[]
    // Filtros de habilidade
    selectedSkillTypes: string[]
    rolled: any[]
    loading: boolean
    error: string | null
    // Seleção de perk
    selectedPerkIndex: number | null
    isConfirming: boolean
    setSelectedRarities: (rarities: RarityType[]) => void
    setSelectedType: (type: PerkTypeEnum | '') => void
    setSelectedElement: (element: string) => void
    setSelectedSpellLevel: (level: string) => void
    setSelectedExecution: (execution: string) => void
    setSelectedItemKinds: (kinds: string[]) => void
    setSelectedSkillTypes: (types: string[]) => void
    handleReroll: () => void
    toggleVisibility: () => void
    selectPerk: (index: number) => void
    confirmSelection: () => Promise<any | null>
}

function getOrCreateSeed(): string {
    if (typeof window !== 'undefined') {
        let storedSeed = localStorage.getItem('roguelite-user-seed')
        if (!storedSeed) {
            storedSeed = Math.random().toString(36).substring(2, 15) + '-1'
            localStorage.setItem('roguelite-user-seed', storedSeed)
        }
        return storedSeed
    }
    return Math.random().toString(36).substring(2, 15) + '-1'
}

/**
 * Incrementa o número no final do seed (ex: "abc123-1" -> "abc123-2")
 */
function incrementSeed(): string {
    if (typeof window === 'undefined') return ''
    
    const currentSeed = localStorage.getItem('roguelite-user-seed') || ''
    const parts = currentSeed.split('-')
    
    // Se já tem um número no final, incrementa
    const lastPart = parts[parts.length - 1]
    const num = parseInt(lastPart)
    
    let newSeed: string
    if (!isNaN(num) && parts.length >= 2) {
        // Incrementa o número existente
        parts[parts.length - 1] = (num + 1).toString()
        newSeed = parts.join('-')
    } else {
        // Adiciona -1 ao final
        newSeed = currentSeed + '-1'
    }
    
    localStorage.setItem('roguelite-user-seed', newSeed)
    console.log('[usePerkCards] Seed incrementado:', currentSeed, '->', newSeed)
    return newSeed
}

// Pesos base por raridade (mesmos do perkRarityRoller)
function getRarityWeights(level?: number): Record<string, number> {
    if (!level) {
        return {
            'Comum': 60,
            'Incomum': 20,
            'Raro': 10,
            'Épico': 6,
            'Lendário': 3,
            'Único': 0.75,
            'Mágico': 0.25,
            'Amaldiçoado': 0,
            'Especial': 0
        }
    }

    const levelMultiplier = Math.min(level / 20, 1)
    return {
        'Comum': Math.max(60 - Math.floor(levelMultiplier * 40), 20),
        'Incomum': Math.max(20 - Math.floor(levelMultiplier * 10), 5),
        'Raro': Math.min(10 + Math.floor(levelMultiplier * 10), 20),
        'Épico': Math.min(6 + Math.floor(levelMultiplier * 9), 15),
        'Lendário': level >= 5 ? Math.min(3 + Math.floor(levelMultiplier * 7), 10) : 0,
        'Único': level >= 10 ? Math.min(1 + Math.floor(levelMultiplier * 4), 5) : 0,
        'Mágico': 0,
        'Amaldiçoado': 0,
        'Especial': 0
    }
}

function selectWeightedPerks(perks: any[], count: number, seed: string, rollNumber: number, level?: number): any[] {
    if (perks.length <= count) return perks
    
    const combinedSeed = `${seed}-${rollNumber}`
    const rng = createRandom(combinedSeed)
    const weights = getRarityWeights(level)
    
    const result: any[] = []
    const availablePerks = [ ...perks ]
    
    for (let i = 0; i < count && availablePerks.length > 0; i++) {
        // Agrupa perks por raridade
        const perksByRarity: Record<string, any[]> = {}
        availablePerks.forEach(perk => {
            const rarity = perk.rogueliteRarity || 'Comum'
            if (!perksByRarity[rarity]) {
                perksByRarity[rarity] = []
            }
            perksByRarity[rarity].push(perk)
        })
        
        // Calcula peso total apenas das raridades disponíveis
        const totalWeight = Object.keys(perksByRarity).reduce((sum, rarity) => {
            return sum + (weights[rarity] || 0)
        }, 0)
        
        if (totalWeight === 0) {
            // Fallback: shuffle uniforme se não houver pesos
            const randomIndex = Math.floor(rng.random() * availablePerks.length)
            const selected = availablePerks.splice(randomIndex, 1)[0]
            result.push(selected)
        } else {
            // Seleciona raridade baseada no peso
            let roll = rng.random() * totalWeight
            let selectedRarity = 'Comum'
            
            for (const [ rarity, weight ] of Object.entries(weights)) {
                if (perksByRarity[rarity] && weight > 0) {
                    roll -= weight
                    if (roll <= 0) {
                        selectedRarity = rarity
                        break
                    }
                }
            }
            
            // Seleciona um perk aleatório da raridade escolhida
            const perksOfSelectedRarity = perksByRarity[selectedRarity]
            if (perksOfSelectedRarity && perksOfSelectedRarity.length > 0) {
                const randomIndex = Math.floor(rng.random() * perksOfSelectedRarity.length)
                const selectedPerk = perksOfSelectedRarity[randomIndex]
                
                // Remove da lista de disponíveis
                const perkIndex = availablePerks.findIndex(p => p === selectedPerk)
                if (perkIndex !== -1) {
                    availablePerks.splice(perkIndex, 1)
                    result.push(selectedPerk)
                }
            }
        }
    }
    
    return result
}

function shufflePerks(perks: any[], count: number, seed: string, rollNumber: number, level?: number): any[] {
    // Usa seleção ponderada em vez de shuffle uniforme
    return selectWeightedPerks(perks, count, seed, rollNumber, level)
}

export function usePerkCards({ open, level, perkAmount = 5, initialFilters }: UsePerkCardsOptions): UsePerkCardsReturn {
    const [ userSeed ] = useState<string>(getOrCreateSeed)
    const [ rollCount, setRollCount ] = useState(0)
    const [ isVisible, setIsVisible ] = useState(true)
    const [ selectedRarities, setSelectedRarities ] = useState<RarityType[]>(
        (initialFilters?.rarities as RarityType[]) || []
    )
    const [ selectedType, setSelectedType ] = useState<PerkTypeEnum | ''>(
        (initialFilters?.type as PerkTypeEnum) || ''
    )
    // Filtros de magia
    const [ selectedElement, setSelectedElement ] = useState<string>(initialFilters?.element || '')
    const [ selectedSpellLevel, setSelectedSpellLevel ] = useState<string>(initialFilters?.spellLevel || '')
    const [ selectedExecution, setSelectedExecution ] = useState<string>(initialFilters?.execution || '')
    // Filtros de item
    const [ selectedItemKinds, setSelectedItemKinds ] = useState<string[]>(initialFilters?.itemKinds || [])
    // Filtros de habilidade
    const [ selectedSkillTypes, setSelectedSkillTypes ] = useState<string[]>(initialFilters?.skillTypes || [])
    const [ allPerks, setAllPerks ] = useState<any[]>([])
    const [ rolled, setRolled ] = useState<any[]>([])
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState<string | null>(null)
    // Seleção de perk
    const [ selectedPerkIndex, setSelectedPerkIndex ] = useState<number | null>(null)
    const [ isConfirming, setIsConfirming ] = useState(false)

    // Atualiza os filtros quando initialFilters muda (ex: quando GM oferece perks)
    useEffect(() => {
        console.log('[usePerkCards] initialFilters recebido:', initialFilters)
        if (initialFilters) {
            if (initialFilters.rarities) setSelectedRarities(initialFilters.rarities as RarityType[])
            if (initialFilters.type) setSelectedType(initialFilters.type as PerkTypeEnum)
            if (initialFilters.element) setSelectedElement(initialFilters.element)
            if (initialFilters.spellLevel) setSelectedSpellLevel(initialFilters.spellLevel)
            if (initialFilters.execution) setSelectedExecution(initialFilters.execution)
            if (initialFilters.itemKinds) setSelectedItemKinds(initialFilters.itemKinds)
            if (initialFilters.skillTypes) {
                console.log('[usePerkCards] Aplicando skillTypes:', initialFilters.skillTypes)
                setSelectedSkillTypes(initialFilters.skillTypes)
            }
        }
    }, [ initialFilters ])

    const fetchPerks = useCallback(async (
        raritiesToUse?: RarityType[],
        typeToUse?: string,
        elementToUse?: string,
        spellLevelToUse?: string,
        executionToUse?: string,
        itemKindsToUse?: string[],
        skillTypesToUse?: string[]
    ) => {
        setLoading(true)
        setError(null)
        
        try {
            const params = new URLSearchParams()
            
            // Multi-select de raridades
            if (raritiesToUse && raritiesToUse.length > 0) {
                params.append('rarities', raritiesToUse.join(','))
            }
            // Se não há tipo selecionado, buscar todas as coleções
            if (typeToUse) {
                params.append('perkType', typeToUse)
            } else {
                params.append('collections', 'weapons,armors,items,spells,skills,perks')
            }
            if (level !== undefined) params.append('level', level.toString())
            
            // Filtros de magia
            if (elementToUse) params.append('element', elementToUse)
            if (spellLevelToUse) params.append('spellLevel', spellLevelToUse)
            if (executionToUse) params.append('execution', executionToUse)
            
            // Filtros de item (multi-select)
            if (itemKindsToUse && itemKindsToUse.length > 0) {
                params.append('itemKinds', itemKindsToUse.join(','))
            }
            
            // Filtros de habilidade (multi-select)
            if (skillTypesToUse && skillTypesToUse.length > 0) {
                params.append('skillTypes', skillTypesToUse.join(','))
            }

            const url = `/api/roguelite/perks?${params.toString()}`
            console.log('[usePerkCards] URL:', url)
            const response = await fetch(url)
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('[usePerkCards] Erro na API:', response.status, errorData)
                throw new Error(errorData.message || errorData.error || 'Erro ao buscar perks')
            }
            
            const result = await response.json()
            let perks: any[] = []
            
            if (Array.isArray(result)) {
                perks = result
            } else if (result.data) {
                perks = result.data
            } else {
                Object.values(result).forEach((value: any) => {
                    if (Array.isArray(value)) {
                        perks.push(...value)
                    }
                })
            }
            
            console.log('[usePerkCards] perks recebidos:', perks.length, 'raridades:', [ ...new Set(perks.map(p => p.rogueliteRarity)) ])
            setAllPerks(perks)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
            setAllPerks([])
            setRolled([])
        } finally {
            setLoading(false)
        }
    }, [ level ])

    useEffect(() => {
        if (open) {
            // Usa valores de initialFilters como fallback para evitar problemas de timing
            const effectiveRarities = selectedRarities.length > 0 ? selectedRarities : (initialFilters?.rarities as RarityType[] | undefined)
            const effectiveType = selectedType || initialFilters?.type
            const effectiveElement = selectedElement || initialFilters?.element
            const effectiveSpellLevel = selectedSpellLevel || initialFilters?.spellLevel
            const effectiveExecution = selectedExecution || initialFilters?.execution
            const effectiveItemKinds = selectedItemKinds.length > 0 ? selectedItemKinds : initialFilters?.itemKinds
            const effectiveSkillTypes = selectedSkillTypes.length > 0 ? selectedSkillTypes : initialFilters?.skillTypes
            
            console.log('[usePerkCards] Chamando fetchPerks com:', {
                skillTypes: effectiveSkillTypes,
                type: effectiveType,
                initialFilters
            })
            
            fetchPerks(
                effectiveRarities?.length ? effectiveRarities : undefined,
                effectiveType || undefined,
                effectiveElement || undefined,
                effectiveSpellLevel || undefined,
                effectiveExecution || undefined,
                effectiveItemKinds?.length ? effectiveItemKinds : undefined,
                effectiveSkillTypes?.length ? effectiveSkillTypes : undefined
            )
        }
    }, [ open, selectedRarities, selectedType, selectedElement, selectedSpellLevel, selectedExecution, selectedItemKinds, selectedSkillTypes, initialFilters, fetchPerks ])

    useEffect(() => {
        if (allPerks.length > 0) {
            const shuffled = shufflePerks(allPerks, perkAmount, userSeed, rollCount, level)
            console.log('[usePerkCards] shuffled:', shuffled.length, 'raridades:', [ ...new Set(shuffled.map(p => p.rogueliteRarity)) ])
            setRolled(shuffled)
            setError(null)
        } else if (!loading) {
            // Se terminou de carregar e não há perks, mostrar erro amigável
            setRolled([])
            setError('Nenhuma vantagem encontrada com os filtros selecionados')
        }
    }, [ allPerks, rollCount, perkAmount, userSeed, level, loading ])

    const handleReroll = useCallback(() => {
        setRollCount(prev => prev + 1)
    }, [])

    const toggleVisibility = useCallback(() => {
        setIsVisible(prev => !prev)
    }, [])

    const selectPerk = useCallback((index: number) => {
        setSelectedPerkIndex(prev => prev === index ? null : index)
    }, [])

    const confirmSelection = useCallback(async (): Promise<any | null> => {
        if (selectedPerkIndex === null) return null
        
        const selectedPerk = rolled[selectedPerkIndex]
        setIsConfirming(true)
        
        // Aguarda a animação (0.8s para acompanhar o fadeOut mais rápido)
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // NÃO incrementa o seed aqui - será feito após todo o fluxo completar
        // O estado de confirmação permanece até que o fluxo seja concluído externamente
        
        return selectedPerk
    }, [ selectedPerkIndex, rolled ])

    /**
     * Finaliza o fluxo de seleção - chamado apenas quando todo o processo é concluído
     * (após seleção normal ou após substituição)
     */
    const finalizeSelection = useCallback(() => {
        // Incrementa o seed para a próxima vez que o usuário escolher uma vantagem
        incrementSeed()
        
        setIsConfirming(false)
        setSelectedPerkIndex(null)
    }, [])

    /**
     * Reseta o estado de confirmação sem incrementar seed
     * Usado quando o usuário cancela a substituição
     */
    const resetConfirmation = useCallback(() => {
        setIsConfirming(false)
        setSelectedPerkIndex(null)
    }, [])

    return {
        userSeed,
        rollCount,
        isVisible,
        selectedRarities,
        selectedType,
        selectedElement,
        selectedSpellLevel,
        selectedExecution,
        selectedItemKinds,
        selectedSkillTypes,
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
        setSelectedSkillTypes,
        handleReroll,
        toggleVisibility,
        selectPerk,
        confirmSelection,
        finalizeSelection,
        resetConfirmation
    }
}
