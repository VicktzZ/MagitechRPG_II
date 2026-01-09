import { useState, useEffect } from 'react';
import type { RPGSystem } from '@models/entities';

interface UseRPGSystemOptions {
    systemId?: string;
}

interface UseRPGSystemReturn {
    system: RPGSystem | null;
    loading: boolean;
    error: string | null;
    isDefaultSystem: boolean;
}

/**
 * Hook para carregar e gerenciar um sistema de RPG
 * Se systemId não for fornecido, usa o sistema padrão Magitech
 */
export function useRPGSystem({ systemId }: UseRPGSystemOptions): UseRPGSystemReturn {
    const [ system, setSystem ] = useState<RPGSystem | null>(null);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const isDefaultSystem = !systemId;

    useEffect(() => {
        async function fetchSystem() {
            if (!systemId) {
                setSystem(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/rpg-system/${systemId}`);
                
                if (!response.ok) {
                    throw new Error('Sistema não encontrado');
                }

                const data = await response.json();
                setSystem(data);
            } catch (err: any) {
                console.error('Erro ao carregar sistema de RPG:', err);
                setError(err.message);
                setSystem(null);
            } finally {
                setLoading(false);
            }
        }

        fetchSystem();
    }, [ systemId ]);

    return {
        system,
        loading,
        error,
        isDefaultSystem
    };
}

/**
 * Verifica se um campo específico está habilitado no sistema
 */
export function isFieldEnabled(system: RPGSystem | null, fieldKey: string): boolean {
    // Se não há sistema customizado, todos os campos do Magitech estão habilitados
    if (!system) return true;
    
    const enabledFields = system.enabledFields;
    if (!enabledFields) return true;

    switch (fieldKey) {
    case 'traits':
        return enabledFields.traits;
    case 'lineage':
        return enabledFields.lineage;
    case 'occupation':
        return enabledFields.occupation;
    case 'subclass':
        return enabledFields.subclass;
    case 'elementalMastery':
        return enabledFields.elementalMastery;
    case 'financialCondition':
        return enabledFields.financialCondition;
    case 'spells':
        return enabledFields.spells;
    case 'race':
        return enabledFields.race;
    case 'class':
        return enabledFields.class;
    default:
        return true;
    }
}

/**
 * Retorna os atributos do sistema (customizados ou padrão Magitech)
 */
export function getSystemAttributes(system: RPGSystem | null) {
    if (!system || system.attributes.length === 0) {
        // Retorna atributos padrão do Magitech
        return [
            { key: 'des', name: 'Destreza', abbreviation: 'DES' },
            { key: 'vig', name: 'Vigor', abbreviation: 'VIG' },
            { key: 'log', name: 'Lógica', abbreviation: 'LOG' },
            { key: 'sab', name: 'Sabedoria', abbreviation: 'SAB' },
            { key: 'foc', name: 'Foco', abbreviation: 'FOC' },
            { key: 'car', name: 'Carisma', abbreviation: 'CAR' }
        ];
    }
    
    return system.attributes;
}
