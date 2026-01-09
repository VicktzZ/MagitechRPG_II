'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { RPGSystem, EnabledFields } from '@models/entities'

// Campos mapeados para a ficha de personagem
type CharsheetField = 
    | 'attributes' 
    | 'expertises' 
    | 'skills' 
    | 'traits' 
    | 'inventory' 
    | 'spells' 
    | 'passives' 
    | 'notes' 
    | 'dices' 
    | 'classes' 
    | 'races' 
    | 'lineages' 
    | 'occupations' 
    | 'subclasses'

interface SelectedSystemContextValue {
    selectedSystem: RPGSystem | null
    setSelectedSystem: (system: RPGSystem | null) => void
    isDefaultSystem: boolean
    loading: boolean
    // Helper para verificar se um campo está habilitado
    isFieldEnabled: (field: CharsheetField) => boolean
    // Helper para obter atributos do sistema
    getAttributes: () => RPGSystem['attributes']
    // Helper para obter perícias do sistema
    getExpertises: () => RPGSystem['expertises']
    // Helper para obter classes do sistema
    getClasses: () => RPGSystem['classes']
    // Helper para obter raças do sistema
    getRaces: () => RPGSystem['races']
    // Helper para obter linhagens do sistema
    getLineages: () => RPGSystem['lineages']
    // Helper para obter traços do sistema
    getTraits: () => RPGSystem['traits']
    // Helper para obter nome do conceito
    getConceptName: (concept: keyof RPGSystem['conceptNames']) => string
}

const SelectedSystemContext = createContext<SelectedSystemContextValue | null>(null)

export function SelectedSystemProvider({ 
    children, 
    initialSystemId 
}: { 
    children: ReactNode
    initialSystemId?: string 
}) {
    const [ selectedSystem, setSelectedSystem ] = useState<RPGSystem | null>(null)
    const [ loading, setLoading ] = useState(!!initialSystemId)

    useEffect(() => {
        if (initialSystemId) {
            setLoading(true)
            fetch(`/api/rpg-system/${initialSystemId}`)
                .then(res => res.json())
                .then(data => {
                    setSelectedSystem(data)
                })
                .catch(err => {
                    console.error('Erro ao carregar sistema:', err)
                    setSelectedSystem(null)
                })
                .finally(() => setLoading(false))
        }
    }, [ initialSystemId ])

    const isDefaultSystem = !selectedSystem

    // Mapeia campos da ficha para campos do EnabledFields
    const isFieldEnabled = (field: CharsheetField): boolean => {
        if (isDefaultSystem) return true // Sistema padrão tem todos os campos habilitados
        
        const enabledFields = selectedSystem?.enabledFields
        if (!enabledFields) return true
        
        // Mapeamento de campos da ficha para campos do sistema
        const fieldMap: Record<CharsheetField, keyof EnabledFields | boolean> = {
            attributes: true, // Atributos sempre habilitados
            expertises: true, // Perícias sempre habilitadas
            skills: true, // Habilidades sempre habilitadas
            traits: enabledFields.traits,
            inventory: true, // Inventário sempre habilitado
            spells: enabledFields.spells,
            passives: true, // Passivas sempre habilitadas
            notes: true, // Notas sempre habilitadas
            dices: true, // Dados sempre habilitados
            classes: enabledFields.class,
            races: enabledFields.race,
            lineages: enabledFields.lineage,
            occupations: enabledFields.occupation,
            subclasses: enabledFields.subclass
        }
        
        const result = fieldMap[field]
        if (typeof result === 'boolean') return result
        return true
    }

    const getAttributes = () => {
        if (isDefaultSystem) return [] // Retorna vazio para usar os atributos padrão do Magitech
        return selectedSystem?.attributes || []
    }

    const getExpertises = () => {
        if (isDefaultSystem) return []
        return selectedSystem?.expertises || []
    }

    const getClasses = () => {
        if (isDefaultSystem) return []
        return selectedSystem?.classes || []
    }

    const getRaces = () => {
        if (isDefaultSystem) return []
        return selectedSystem?.races || []
    }

    const getLineages = () => {
        if (isDefaultSystem) return []
        return selectedSystem?.lineages || []
    }

    const getTraits = () => {
        if (isDefaultSystem) return { positive: [], negative: [] }
        return selectedSystem?.traits || { positive: [], negative: [] }
    }

    const getConceptName = (concept: keyof RPGSystem['conceptNames']): string => {
        const defaultNames: RPGSystem['conceptNames'] = {
            lineage: 'Linhagem',
            occupation: 'Profissão',
            class: 'Classe',
            subclass: 'Subclasse',
            race: 'Raça',
            trait: 'Traço',
            spell: 'Magia',
            skill: 'Habilidade'
        }
        
        if (isDefaultSystem) return defaultNames[concept]
        return selectedSystem?.conceptNames?.[concept] || defaultNames[concept]
    }

    return (
        <SelectedSystemContext.Provider value={{
            selectedSystem,
            setSelectedSystem,
            isDefaultSystem,
            loading,
            isFieldEnabled,
            getAttributes,
            getExpertises,
            getClasses,
            getRaces,
            getLineages,
            getTraits,
            getConceptName
        }}>
            {children}
        </SelectedSystemContext.Provider>
    )
}

export function useSelectedSystem() {
    const context = useContext(SelectedSystemContext)
    if (!context) {
        throw new Error('useSelectedSystem must be used within SelectedSystemProvider')
    }
    return context
}

export { SelectedSystemContext }
