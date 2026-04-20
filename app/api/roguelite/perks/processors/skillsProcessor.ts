import { PerkTypeEnum } from '@enums/rogueliteEnum'
import { skillRepository } from '@repositories'
import { calculateSkillRarity } from '@utils/calculatePerksRarity'
import type { ProcessorFilters, ProcessedItem } from './types'

export async function processSkills(filters: ProcessorFilters): Promise<ProcessedItem[]> {
    let skills = await skillRepository.find()
    
    console.log('[skillsProcessor] Total skills carregadas:', skills.length)
    console.log('[skillsProcessor] Filtros recebidos:', { skillTypes: filters.skillTypes, perkType: filters.perkType })
    console.log('[skillsProcessor] Tipos únicos de skills:', [ ...new Set(skills.map((s: any) => s.type)) ])
    
    // Filtrar skills por nível do usuário
    if (filters.userLevel !== undefined && filters.userLevel > 0) {
        const beforeFilter = skills.length
        skills = skills.filter(skill => {
            const skillLevel = (skill as any).level
            return skillLevel === undefined || skillLevel <= filters.userLevel!
        })
        console.log('[skillsProcessor] Filtro de nível aplicado:', { userLevel: filters.userLevel, antes: beforeFilter, depois: skills.length })
    }
    
    // Adicionar raridade calculada baseada no tipo e nível
    let processedSkills = skills.map(skill => {
        const skillObj = skill as any
        const calculatedRarity = calculateSkillRarity(
            skillObj.type, 
            skillObj.level, 
            skillObj.rarity
        )
        return {
            ...skillObj,
            rogueliteRarity: calculatedRarity,
            perkType: PerkTypeEnum.SKILL
        }
    })
    
    // Filtro por múltiplas raridades (multi-select)
    if (filters.rarities && filters.rarities.length > 0) {
        processedSkills = processedSkills.filter(skill => filters.rarities!.includes(skill.rogueliteRarity))
    } else if (filters.rarity) {
        processedSkills = processedSkills.filter(skill => skill.rogueliteRarity === filters.rarity)
    }
    
    // Filtro por tipos de habilidade (multi-select)
    // Nota: 'Poder Mágico' é tratado separadamente pelo powersProcessor
    // Nota: 'Bônus' (genérico da collection perks) é tratado pelo perksProcessor
    if (filters.skillTypes && filters.skillTypes.length > 0) {
        const beforeFilter = processedSkills.length
        // Remove tipos que são tratados por outros processadores
        const skillTypesForThisProcessor = filters.skillTypes.filter(t => t !== 'Poder Mágico')
        if (skillTypesForThisProcessor.length > 0) {
            processedSkills = processedSkills.filter(skill => 
                skillTypesForThisProcessor.includes(skill.type)
            )
            console.log('[skillsProcessor] Filtro de skillTypes aplicado:', { 
                tipos: skillTypesForThisProcessor, 
                antes: beforeFilter, 
                depois: processedSkills.length 
            })
        } else {
            // Se só 'Poder Mágico' foi selecionado, retorna array vazia (powers vêm do outro processor)
            processedSkills = []
        }
    }
    
    console.log('[skillsProcessor] Retornando', processedSkills.length, 'skills')
    
    if (filters.levelRequired) {
        const level = parseInt(filters.levelRequired)
        if (!isNaN(level)) {
            processedSkills = processedSkills.filter(skill => 
                skill.level === undefined || skill.level === level
            )
        }
    }
    
    return processedSkills as ProcessedItem[]
}
