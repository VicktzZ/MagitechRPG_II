// @eslint-disable @typescript-eslint/no-use-before-define
import { create, type RandomSeed } from 'random-seed'
import { defaultArmors } from '@constants/defaultArmors'
import { defaultItems } from '@constants/defaultItems'
import { defaultWeapons } from '@constants/defaultWeapons'
import { skills } from '@constants/skills'
import { PerkTypeEnum } from '@enums/rogueliteEnum'
import type { Armor, Weapon } from '@models'
import type { RarityType } from '@models/types/string'
import { type Perk } from '../models'
import { defaultPerks } from '../consts/defaultPerks'

// Probabilidades base por raridade (soma 100)
function getRarityWeights (level?: number): Record<RarityType, number> {
    if (!level) {
        return {
            Comum: 60,
            Incomum: 20,
            Raro: 10,
            Épico: 6,
            Lendário: 3,
            Único: 0.75,
            Mágico: 0.25,
            Amaldiçoado: 0,
            Especial: 0
        }
    }

    // Ajusta pesos baseado no nível (quanto maior o nível, mais raridades superiores)
    const levelMultiplier = Math.min(level / 20, 1) // Normaliza para 0-1

    // Aplica restrições de nível por raridade
    const baseWeights = {
        Comum: Math.max(60 - Math.floor(levelMultiplier * 40), 20), // Mínimo 20%
        Incomum: Math.max(20 - Math.floor(levelMultiplier * 10), 5), // Mínimo 5%
        Raro: Math.min(10 + Math.floor(levelMultiplier * 10), 20),
        Épico: Math.min(6 + Math.floor(levelMultiplier * 9), 15),
        Lendário: level >= 5 ? Math.min(3 + Math.floor(levelMultiplier * 7), 10) : 0, // Restrito nível ≥5
        Único: level >= 10 ? Math.min(1 + Math.floor(levelMultiplier * 4), 5) : 0, // Restrito nível ≥10
        Mágico: level >= 10 ? 0 : 0, // Restrito nível ≥10 (mantém 0 por enquanto)
        Amaldiçoado: 0,
        Especial: 0
    }

    return baseWeights
}

export function rollRarity(rng: RandomSeed, level?: number): RarityType {
    const weights = getRarityWeights(level)
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
    let roll = rng(totalWeight)
    for (const [ r, w ] of Object.entries(weights)) {
        roll -= w
        if (roll <= 0) return r as RarityType
    }
    return 'Comum'
}

/**
 * Seleciona um perk de uma lista baseado em pesos individuais
 * @param perks - Lista de funções de perks disponíveis
 * @param rng - Função RNG
 * @returns Perk selecionado ou undefined se lista vazia
 */
function selectPerkByWeight<T>(perks: Array<() => Perk<T>>, rng: RandomSeed): Perk<T> | undefined {
    if (perks.length === 0) return undefined
    if (perks.length === 1) return perks[0]() // Executa a função para obter o perk
    
    // Gera instâncias dos perks para calcular pesos
    const perkInstances = perks.map(perkFn => perkFn())
    
    // Calcula peso total (padrão 50 se não definido)
    const totalWeight = perkInstances.reduce((sum, perk) => sum + (perk.weight ?? 50), 0)
    
    // Rola um número aleatório
    let roll = rng(totalWeight)
    
    // Seleciona o perk baseado no peso
    for (const perk of perkInstances) {
        const perkWeight = perk.weight ?? 50
        roll -= perkWeight
        if (roll <= 0) return perk
    }
    
    // Fallback: retorna último perk
    return perkInstances[perkInstances.length - 1]
}

/**
 * Retorna o bônus de dano para armas baseado na raridade
 */
function getWeaponDamageBonus(rarity: RarityType): number {
    switch (rarity) {
    case 'Incomum':
        return 2
    case 'Raro':
        return 4
    case 'Épico':
        return 6
    case 'Lendário':
        return 8
    case 'Único':
        return 10
    default:
        return 0 // Comum e outras não têm bônus
    }
}

/**
 * Retorna o bônus de defesa para armaduras baseado na raridade
 * Adiciona +1 AP para cada nível de raridade acima de Comum
 */
function getArmorDefenseBonus(rarity: RarityType): number {
    switch (rarity) {
    case 'Incomum':
        return 1
    case 'Raro':
        return 2
    case 'Épico':
        return 3
    case 'Lendário':
        return 4
    case 'Único':
        return 5
    default:
        return 0 // Comum e outras não têm bônus
    }
}

interface PerkFilters {
    rarities?: RarityType[]
    types?: PerkTypeEnum[]
}

export function rollRandomPerks(seed: string, level?: number, filters?: PerkFilters): Array<Perk<any>> {
    const rng = create(seed)
    const result: Array<Perk<any>> = []

    // Coleções de todos os itens
    const allWeapons = [
        ...Object.values(defaultWeapons).flat()
    ].filter(weapon => {
        // Restrição: armas magic/special só para jogadores nível ≥10
        if (level != null && level < 10) {
            return !weapon.categ?.includes('Mágica') && !weapon.categ?.includes('Especial')
        }
        return true
    })
    const allArmors = Object.values(defaultArmors).flat()
    const allItems = Object.values(defaultItems).flat()
    const allSkills = [
        ...skills.lineage,
        ...skills.occupation,
        ...skills.bonus,
        ...skills.race,
        ...Object.values(skills.class).flat(),
        ...Object.values(skills.subclass).flat()
    ].filter(skill => {
        // Se a habilidade não tem nível definido ou o nível do usuário não foi informado,
        // ela pode aparecer normalmente como perk.
        if (!('level' in skill) || skill.level == null || level == null) return true

        // Regra: habilidades com nível superior ao nível do usuário NÃO podem ser sorteadas.
        return skill.level <= level
    })

    // Combina todos os tipos em um array para seleção aleatória
    const allItemsCombined = [
        ...allWeapons.map(item => ({ ...item, perkType: PerkTypeEnum.WEAPON })),
        ...allArmors.map(item => ({ ...item, perkType: PerkTypeEnum.ARMOR })),
        ...allItems.map(item => ({ ...item, perkType: PerkTypeEnum.ITEM })),
        ...allSkills.map(item => ({ ...item, perkType: PerkTypeEnum.SKILL, rarity: undefined }))
    ]

    for (let i = 0; i < 5; i++) {
        // Primeiro rola a raridade para decidir se usa defaultPerk
        const rolledRarity = rollRarity(rng, level)
        
        // Verifica se há defaultPerks disponíveis para essa raridade
        const availableDefaultPerks = defaultPerks[rolledRarity] || []
        const shouldUseDefaultPerk = availableDefaultPerks.length > 0 && rng(100) < 30 // 30% de chance
        
        // Se deve usar defaultPerk, seleciona baseado em peso e adiciona ao resultado
        if (shouldUseDefaultPerk) {
            const selectedPerk = selectPerkByWeight(availableDefaultPerks, rng)
            if (selectedPerk) {
                result.push(selectedPerk)
                continue // Pula para próxima iteração
            }
        }
        
        // Lógica original para armas/armaduras/itens/habilidades
        const baseItem = allItemsCombined[Math.floor(rng(allItemsCombined.length))]
        let rarity: RarityType
        let processedData = baseItem

        // Regra 1: Habilidades de "Linhagem", "Profissão" ou "Raça" são sempre "Comum"
        if (baseItem.perkType === PerkTypeEnum.SKILL) {
            const skillData = baseItem
            let skillRarity: RarityType

            if (skillData.type === 'Linhagem' || skillData.type === 'Profissão' || skillData.type === 'Raça') skillRarity = 'Comum'
            else if (skillData.type === 'Classe') {
                switch (skillData.level) {
                case 0:
                case 1:
                    skillRarity = 'Comum'
                    break
                case 5:
                    skillRarity = 'Incomum'
                    break
                case 10:
                    skillRarity = 'Raro'
                    break
                case 15:
                    skillRarity = 'Épico'
                    break
                case 20:
                    // Restrição: Lendário só disponível nível ≥5
                    skillRarity = (level != null && level >= 5) ? 'Lendário' : 'Épico'
                    break
                default:
                    skillRarity = rollRarity(rng, level)
                    break
                }
            } else if (skillData.type === 'Subclasse') {
                switch (skillData.level) {
                case 10:
                    skillRarity = 'Épico'
                    break
                case 15:
                    // Restrição: Lendário só disponível nível ≥5
                    skillRarity = (level != null && level >= 5) ? 'Lendário' : 'Épico'
                    break
                case 20:
                    // Restrição: Único só disponível nível ≥10
                    skillRarity = (level != null && level >= 10) ? 'Único' : 
                        (level != null && level >= 5) ? 'Lendário' : 'Épico'
                    break
                default:
                    // Para outros níveis, usa raridade normal
                    skillRarity = rollRarity(rng, level)
                    break
                }
            } else {
                // Para outras habilidades, usa raridade normal
                skillRarity = rollRarity(rng, level)
            }

            rarity = skillRarity
            processedData = { ...skillData, rarity }
        } else {
            // Para armas, armaduras e itens, usa raridade normal
            rarity = rollRarity(rng, level)
            processedData = { ...baseItem, rarity }
        }

        // Regra 2: Aplica bônus de dano para armas baseado na raridade
        if (baseItem.perkType === PerkTypeEnum.WEAPON && processedData.effect) {
            const weaponData = processedData as Weapon
            const damageBonus = getWeaponDamageBonus(rarity)

            if (damageBonus > 0) {
                // Extrai o valor base do dano (ex: "5d20" -> "5d20")
                const baseDamage = weaponData.effect?.value || ''

                // Aplica o bônus de dano
                processedData.effect = {
                    ...weaponData.effect,
                    value: `${baseDamage}+${damageBonus}`,
                    originalValue: baseDamage, // Guarda valor original para referência
                    damageBonus,
                    critBonus: damageBonus * 2 // Bônus no crit é o dobro
                }
            }
        }

        // Regra 3: Aplica bônus de defesa para armaduras baseado na raridade
        if (baseItem.perkType === PerkTypeEnum.ARMOR) {
            const armorData = processedData as Armor
            const defenseBonus = getArmorDefenseBonus(rarity)

            if (defenseBonus > 0) {
                // Guarda o valor base de defesa
                const baseDefense = armorData.value || 0

                // Aplica o bônus de defesa
                processedData = {
                    ...armorData,
                    value: baseDefense + defenseBonus,
                    originalValue: baseDefense, // Guarda valor original para referência
                    defenseBonus
                } as any
            }
        }

        // Se já tem raridade especial ou rogueliteRarity definida, verifica se deve manter
        if (
            (baseItem as any).rarity &&
            ((baseItem as any).rarity === 'Mágico' ||
                (baseItem as any).rarity === 'Amaldiçoado' ||
                (baseItem as any).rarity === 'Especial')
        ) {
            // Apenas 20% de chance de manter raridade especial (exceto para habilidades que devem ser Comum)
            // E APENAS SE o nível permitir
            const canKeepSpecialRarity = 
                baseItem.perkType !== PerkTypeEnum.SKILL && 
                rng(100) < 20 && 
                level != null && level >= 10 // Restrição: raridades especiais só nível ≥10
            
            if (canKeepSpecialRarity) {
                result.push({
                    name: (baseItem as any).name ?? 'Item',
                    description: (baseItem as any).description ?? 'Um item aleatório obtido no modo Roguelite.',
                    rarity: (baseItem as any).rarity,
                    perkType: baseItem.perkType,
                    data: processedData,
                    id: ''
                })
            } else {
                // Se não mantiver, verifica se tem rogueliteRarity definida com restrições
                const itemRarity = getItemRarity(baseItem, rarity, level)
                result.push({
                    name: (baseItem as any).name ?? 'Item',
                    description: (baseItem as any).description ?? 'Um item aleatório obtido no modo Roguelite.',
                    rarity: itemRarity,
                    perkType: baseItem.perkType,
                    data: { ...processedData, rarity: itemRarity },
                    id: ''
                })
            }
        } else {
            // Caso contrário, verifica se tem rogueliteRarity definida com restrições
            const itemRarity = getItemRarity(baseItem, rarity, level)
            result.push({
                name: (baseItem as any).name ?? 'Item',
                description: (baseItem as any).description ?? 'Um item aleatório obtido no modo Roguelite.',
                rarity: itemRarity,
                perkType: baseItem.perkType,
                data: { ...processedData, rarity: itemRarity },
                id: ''
            })
        }
    }

    // Processa habilidades bônus (perícias usadas como perk genérico)
    for (const skillData of skills.bonus) {
        // Regra de nível: não incluir habilidades acima do nível atual do usuário
        if (level != null && skillData.level != null && skillData.level > level) {
            continue
        }

        const skillRarity = rollRarity(rng, level)

        // Adiciona bônus de perícia baseado na raridade
        const expertiseBonus = getExpertiseBonus(skillRarity)

        result.push({
            name: skillData.name,
            description: skillData.description ?? 'Uma habilidade especial obtida no modo Roguelite.',
            rarity: skillRarity,
            perkType: PerkTypeEnum.SKILL,
            data: {
                name: skillData.name,
                description: skillData.description ?? 'Uma habilidade especial obtida no modo Roguelite.',
                type: skillData.type,
                origin: skillData.origin,
                effects: [ expertiseBonus ] // Array de números conforme o tipo Skill
            },
            id: ''
        })
    }

    // Aplica filtros se fornecidos
    if (filters) {
        let filteredResult = result

        // Filtra por raridade
        if (filters.rarities && filters.rarities.length > 0) {
            filteredResult = filteredResult.filter(perk => 
                filters.rarities!.includes(perk.rarity)
            )
        }

        // Filtra por tipo
        if (filters.types && filters.types.length > 0) {
            filteredResult = filteredResult.filter(perk => 
                filters.types!.includes(perk.perkType)
            )
        }

        // Se não houver resultados após filtragem, retorna array vazio
        if (filteredResult.length === 0) {
            return []
        }

        return filteredResult
    }

    return result
}

/**
 * Retorna o bônus de perícia baseado na raridade
 */
function getExpertiseBonus(rarity: RarityType): number {
    switch (rarity) {
    case 'Comum':
        return 1
    case 'Incomum':
        return 2
    case 'Raro':
        return 3
    case 'Épico':
        return 4
    case 'Lendário':
        return 5
    default:
        return 0 // Único e outras não têm bônus padrão
    }
}

/**
 * Verifica se o item tem rogueliteRarity e aplica restrições de nível
 */
function getItemRarity(baseItem: any, rolledRarity: RarityType ): RarityType {
    // Se o item não tem rogueliteRarity, usa a raridade rolada
    if (!baseItem.rogueliteRarity) return rolledRarity
    
    // rogueliteRarity SEMPRE tem precedência sobre a raridade rolada
    // (ignora restrições de nível para manter a raridade fixa do item)
    return baseItem.rogueliteRarity as RarityType
}

/**
 * Retorna ícone com base na raridade para uso no PerkCard.
 */
export function iconForRarity(rarity: RarityType) {
    switch (rarity) {
    case 'Único':
        return 'LocalFireDepartment'
    case 'Mágico':
    case 'Especial':
    case 'Amaldiçoado':
        return 'Whatshot'
    default:
        return 'AutoAwesome'
    }
}
