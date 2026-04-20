import type { ProcessorFilters, ProcessedItem } from './types';
import type { RarityType } from '@models/types/string';

// Perícias disponíveis no jogo (baseado em models/Expertises.ts)
const EXPERTISES = [
    'Agilidade', 'Atletismo', 'Competência', 'Comunicação', 'Condução',
    'Conhecimento', 'Controle', 'Concentração', 'Criatividade', 'Culinária',
    'Diplomacia', 'Eficácia', 'Enganação', 'Engenharia', 'Fortitude',
    'Força', 'Furtividade', 'Intimidação', 'Intuição', 'Interrogação',
    'Investigação', 'Ladinagem', 'Liderança', 'Luta', 'Magia',
    'Medicina', 'Percepção', 'Persuasão', 'Pontaria', 'Reflexos',
    'RES Física', 'RES Mágica', 'RES Mental', 'Sorte', 'Sobrevivência',
    'Tática', 'Tecnologia', 'Vontade'
];

// Mapeamento de raridade para bônus de perícia
const RARITY_TO_BONUS: Record<RarityType, number> = {
    'Comum': 1,
    'Incomum': 2,
    'Raro': 3,
    'Épico': 4,
    'Lendário': 5,
    'Único': 5,
    'Mágico': 3,
    'Amaldiçoado': 2,
    'Especial': 3
};

/**
 * Processa e cria perks de Especialização (perícia)
 * Estes perks são dinâmicos e escolhem uma perícia aleatória ao serem criados
 */
export async function processExpertise(filters: ProcessorFilters): Promise<ProcessedItem[]> {
    console.log('[processExpertise] Processando perks de Especialização');
    
    const results: ProcessedItem[] = [];
    
    // Filtrar raridades (se especificado)
    const raritiesToUse: RarityType[] = filters.rarities && filters.rarities.length > 0
        ? filters.rarities
        : [ 'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário' ];

    // Criar múltiplos perks de Especialização para cada raridade
    for (const rarity of raritiesToUse) {
        const bonus = RARITY_TO_BONUS[rarity];
        const romanNumerals = [ 'I', 'II', 'III', 'IV', 'V' ];
        const level = bonus;
        
        // Criar 3 perks de Especialização com perícias diferentes para variedade
        for (let i = 0; i < 3; i++) {
            // Escolher uma perícia aleatória
            const randomExpertise = EXPERTISES[Math.floor(Math.random() * EXPERTISES.length)];
            
            const perk: ProcessedItem = {
                id: `especializacao-${rarity.toLowerCase()}-${randomExpertise.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${Math.random()}`,
                name: `Especialização ${romanNumerals[bonus - 1] || level}`,
                // Subtítulo SUPER destacado mostrando o bônus E a perícia
                subtitle: `+${bonus} em ${randomExpertise} (+${level})`,
                description: `+${bonus} pontos em ${randomExpertise}.\n\nAumenta permanentemente sua perícia de ${randomExpertise}, tornando você mais habilidoso e dominando técnicas avançadas que poucos conseguem alcançar.`,
                rarity,
                perkType: 'PERÍCIA',
                // Atributos para exibição visual SUPER DESTACADA no card
                attributes: [
                    {
                        label: 'Bônus',  // Usa "Bônus" para ativar a seção especial do GenericAttributes
                        value: `+${bonus}`,  // Valor GIGANTE destacado
                        type: 'bonus'
                    },
                    {
                        label: 'Perícia Afetada',
                        value: randomExpertise,
                        type: 'expertise'
                    },
                    {
                        label: 'Nível',
                        value: romanNumerals[bonus - 1] || String(level),
                        type: 'level'
                    }
                ],
                metadata: {
                    expertiseName: randomExpertise,
                    bonus,
                    level,
                    specializationType: 'expertise'
                },
                effects: [
                    {
                        type: 'add',
                        target: `expertises.${randomExpertise}`,
                        value: bonus,
                        expertiseName: randomExpertise,
                        description: `+${bonus} em ${randomExpertise}`
                    }
                ]
            };

            results.push(perk);
        }
    }

    console.log(`[processExpertise] Criados ${results.length} perks de Especialização`);
    
    return results;
}
