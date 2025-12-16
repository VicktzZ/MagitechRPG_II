/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { PerkTypeEnum } from '@enums/rogueliteEnum'
import type { Skill, Weapon, Armor, Item, Expertises } from '@models'
import type { SpellDTO } from '@models/dtos/SpellDTO'
import { charsheetEntity } from '@utils/firestoreEntities'
import { applyPerkEffects } from './applyPerkEffects'

type SkillType = Skill['type']
type ExpertiseName = keyof Expertises

/**
 * Remove campos undefined de um objeto (Firestore não aceita undefined)
 */
function removeUndefined<T extends Record<string, any>>(obj: T): T {
    return Object.fromEntries(
        Object.entries(obj).filter(([ _, v ]) => v !== undefined)
    ) as T
}

/**
 * Mapeia o tipo da skill para a chave correta em charsheet.skills
 */
function getSkillKey(skillType: SkillType): string {
    switch (skillType) {
    case 'Linhagem':
        return 'lineage'
    case 'Classe':
        return 'class'
    case 'Subclasse':
        return 'subclass'
    case 'Bônus':
    case 'Profissão':
    case 'Talento':
        return 'bonus'
    case 'Raça':
        return 'race'
    case 'Poder Mágico':
    case 'Exclusivo':
        return 'powers'
    default:
        return 'bonus' // fallback
    }
}

/**
 * Extrai os dados do perk para o formato correto do charsheet
 */
function extractPerkData(perk: any): { type: PerkTypeEnum; data: any } {
    const perkType = perk.perkType as PerkTypeEnum
    const data = perk.data || perk
    
    return { type: perkType, data }
}

/**
 * Converte um perk de arma para o formato Weapon
 */
function perkToWeapon(perk: any): Partial<Weapon> {
    const data = perk.data || perk
    return removeUndefined({
        id: data.id || crypto.randomUUID(),
        name: data.name || perk.name || 'Arma',
        categ: data.categ,
        weight: data.weight ?? 0,
        hands: data.hands ?? 1,
        range: data.range,
        effect: data.effect,
        rarity: perk.rogueliteRarity || perk.rarity || data.rarity || 'Comum',
        description: data.description || perk.description || ''
    })
}

/**
 * Converte um perk de armadura para o formato Armor
 */
function perkToArmor(perk: any): Partial<Armor> {
    const data = perk.data || perk
    return removeUndefined({
        id: data.id || crypto.randomUUID(),
        name: data.name || perk.name || 'Armadura',
        kind: data.kind,
        categ: data.categ,
        type: data.type || 'armor',
        weight: data.weight ?? 0,
        value: data.value ?? 0,
        ap: data.ap ?? data.value ?? 0,
        displacementPenalty: data.displacementPenalty ?? 0,
        accessories: data.accessories || [],
        rarity: perk.rogueliteRarity || perk.rarity || data.rarity || 'Comum',
        description: data.description || perk.description || ''
    })
}

/**
 * Converte um perk de item para o formato Item
 */
function perkToItem(perk: any): Partial<Item> {
    const data = perk.data || perk
    return removeUndefined({
        id: data.id || crypto.randomUUID(),
        name: data.name || perk.name || 'Item',
        kind: data.kind,
        weight: data.weight ?? 0,
        rarity: perk.rogueliteRarity || perk.rarity || data.rarity || 'Comum',
        description: data.description || perk.description || ''
    })
}

/**
 * Converte um perk de habilidade para o formato Skill
 */
function perkToSkill(perk: any): Skill {
    const data = perk.data || perk
    return removeUndefined({
        id: data.id || crypto.randomUUID(),
        name: data.name || perk.name || 'Habilidade',
        description: data.description || perk.description || '',
        type: data.type || 'Bônus',
        origin: data.origin || 'Roguelite',
        level: data.level ?? 1,
        effects: data.effects || [],
        rarity: perk.rogueliteRarity || perk.rarity || data.rarity || 'Comum'
    }) as Skill
}

/**
 * Converte um perk de magia para o formato SpellDTO
 */
function perkToSpell(perk: any): SpellDTO {
    const data = perk.data || perk
    const stages = data.stages || [ '', '', '' ]
    
    return {
        id: data.id || crypto.randomUUID(),
        name: data.name || perk.name,
        element: data.element || 'NÃO-ELEMENTAL',
        level: data.level || 1,
        mpCost: data.mpCost || 0,
        type: data.type || 'Arcana',
        execution: data.execution || 'Padrão',
        range: data.range || 'Pessoal',
        stages: [ stages[0] || '', stages[1] || '', stages[2] || '' ] as [string, string, string]
    }
}

export interface SavePerkResult {
    success: boolean
    field: string
    message: string
}

interface SavePerkOptions {
    perk: any
    charsheetId: string
    campaignCode: string
    campaignMode?: string // Mode da campanha (Roguelite, Classic, etc.)
    currentCharsheet: any // Dados atuais do charsheet para fazer merge
    replacedItemId?: string // ID do item a ser substituído (quando não há espaço)
}

/**
 * Extrai os dados básicos do perk para salvar na sessão
 */
function extractPerkForSession(perk: any): { id: string; rarity: string; name: string; description: string; perkType: string } {
    const data = perk.data || perk
    return {
        id: data.id || perk.id || crypto.randomUUID(),
        rarity: perk.rogueliteRarity || perk.rarity || data.rarity || 'Comum',
        name: data.name || perk.name || 'Perk desconhecido',
        description: data.description || perk.description || '',
        perkType: perk.perkType || data.perkType || 'BONUS'
    }
}

/**
 * Salva um perk selecionado diretamente no Firestore
 * @param options - Opções contendo perk, charsheetId, campaignCode e dados atuais do charsheet
 * @returns Promise com resultado da operação
 */
export async function savePerkToCharsheet(options: SavePerkOptions): Promise<SavePerkResult> {
    const { perk, charsheetId, campaignCode, campaignMode, currentCharsheet, replacedItemId } = options

    // Removida a verificação de modo da campanha - perks podem ser salvos em qualquer campanha

    const { type } = extractPerkData(perk)

    try {
        let updateData: Record<string, any> = {}
        let resultMessage = ''
        let field = ''

        switch (type) {
        case PerkTypeEnum.WEAPON: {
            const weapon = perkToWeapon(perk)
            const currentWeapons = currentCharsheet?.inventory?.weapons || []
            const currentCargo = currentCharsheet?.capacity?.cargo || 0
            
            if (replacedItemId) {
                // Substituição: remove a arma antiga e adiciona a nova
                const filteredWeapons = currentWeapons.filter((w: any) => w.id !== replacedItemId)
                const replacedWeapon = currentWeapons.find((w: any) => w.id === replacedItemId)
                const weightDiff = (weapon.weight || 0) - (replacedWeapon?.weight || 0)
                updateData = { 
                    'inventory.weapons': [ ...filteredWeapons, weapon ],
                    'capacity.cargo': parseFloat((currentCargo + weightDiff).toFixed(1))
                }
                field = 'inventory.weapons'
                resultMessage = replacedWeapon 
                    ? `Arma "${replacedWeapon.name}" substituída por "${weapon.name}"!`
                    : `Arma "${weapon.name}" adicionada ao inventário!`
            } else {
                // Adição normal
                updateData = { 
                    'inventory.weapons': [ ...currentWeapons, weapon ],
                    'capacity.cargo': parseFloat((currentCargo + (weapon.weight || 0)).toFixed(1))
                }
                field = 'inventory.weapons'
                resultMessage = `Arma "${weapon.name}" adicionada ao inventário!`
            }
            break
        }

        case PerkTypeEnum.ARMOR: {
            const armor = perkToArmor(perk)
            const currentArmors = currentCharsheet?.inventory?.armors || []
            const currentCargo = currentCharsheet?.capacity?.cargo || 0
            
            // Encontra a sessão correta pelo campaignCode
            const sessions = currentCharsheet?.session || []
            const sessionIndex = sessions.findIndex((s: any) => s.campaignCode === campaignCode)
            const currentSession = sessionIndex >= 0 ? sessions[sessionIndex] : null
            const baseAP = 5
            const currentSessionAP = currentSession?.stats?.ap || baseAP
            const currentSessionMaxAP = currentSession?.stats?.maxAp || baseAP
            
            if (replacedItemId) {
                // Substituição: remove a armadura antiga e adiciona a nova
                const replacedArmor = currentArmors.find((a: any) => a.id === replacedItemId)
                const filteredArmors = currentArmors.filter((a: any) => a.id !== replacedItemId)
                const weightDiff = (armor.weight || 0) - (replacedArmor?.weight || 0)
                const apDiff = (armor.ap || 0) - (replacedArmor?.ap || 0)
                
                updateData = { 
                    'inventory.armors': [ ...filteredArmors, armor ],
                    'capacity.cargo': parseFloat((currentCargo + weightDiff).toFixed(1))
                }
                
                // Atualiza AP na sessão
                if (sessionIndex >= 0) {
                    const updatedSessions = [ ...sessions ]
                    updatedSessions[sessionIndex] = {
                        ...currentSession,
                        stats: {
                            ...currentSession.stats,
                            ap: currentSessionAP + apDiff,
                            maxAp: currentSessionMaxAP + apDiff
                        }
                    }
                    updateData.session = updatedSessions
                }
                
                field = 'inventory.armors'
                resultMessage = replacedArmor 
                    ? `Armadura "${replacedArmor.name}" substituída por "${armor.name}"! AP ajustado.`
                    : `Armadura "${armor.name}" adicionada ao inventário!`
            } else {
                // Adição normal - incrementa AP
                const armorAP = armor.ap || armor.value || 0
                
                updateData = { 
                    'inventory.armors': [ ...currentArmors, armor ],
                    'capacity.cargo': parseFloat((currentCargo + (armor.weight || 0)).toFixed(1))
                }
                
                // Atualiza AP na sessão
                if (sessionIndex >= 0) {
                    const updatedSessions = [ ...sessions ]
                    updatedSessions[sessionIndex] = {
                        ...currentSession,
                        stats: {
                            ...currentSession.stats,
                            ap: currentSessionAP + armorAP,
                            maxAp: currentSessionMaxAP + armorAP
                        }
                    }
                    updateData.session = updatedSessions
                }
                
                field = 'inventory.armors'
                resultMessage = `Armadura "${armor.name}" adicionada ao inventário! AP +${armorAP}`
            }
            break
        }

        case PerkTypeEnum.ITEM: {
            const item = perkToItem(perk)
            const currentItems = currentCharsheet?.inventory?.items || []
            const currentCargo = currentCharsheet?.capacity?.cargo || 0
            const currentMaxCapacity = currentCharsheet?.capacity?.max || 0
            
            // Itens do tipo "Capacidade" aumentam o peso máximo, não o cargo
            if (item.kind === 'Capacidade') {
                updateData = { 
                    'inventory.items': [ ...currentItems, item ],
                    'capacity.max': currentMaxCapacity + Math.abs(item.weight || 0)
                }
                resultMessage = `Item "${item.name}" adicionado! Capacidade máxima aumentada em ${Math.abs(item.weight || 0)}kg.`
            } else {
                // Outros itens adicionam peso ao cargo
                updateData = { 
                    'inventory.items': [ ...currentItems, item ],
                    'capacity.cargo': parseFloat((currentCargo + (item.weight || 0)).toFixed(1))
                }
                resultMessage = `Item "${item.name}" adicionado ao inventário!`
            }
            field = 'inventory.items'
            break
        }

        case PerkTypeEnum.SKILL: {
            const skill = perkToSkill(perk)
            const skillKey = getSkillKey(skill.type)
            const currentSkills = currentCharsheet?.skills?.[skillKey] || []
            updateData = { [`skills.${skillKey}`]: [ ...currentSkills, skill ] }
            field = `skills.${skillKey}`
            resultMessage = `Habilidade "${skill.name}" adicionada!`
            break
        }

        case PerkTypeEnum.SPELL: {
            const spell = perkToSpell(perk)
            const currentSpells = currentCharsheet?.spells || []
            
            if (replacedItemId) {
                // Substituição: remove a magia antiga e adiciona a nova
                const filteredSpells = currentSpells.filter((s: any) => s.id !== replacedItemId)
                const replacedSpell = currentSpells.find((s: any) => s.id === replacedItemId)
                updateData = { spells: [ ...filteredSpells, spell ] }
                field = 'spells'
                resultMessage = replacedSpell 
                    ? `Magia "${replacedSpell.name}" substituída por "${spell.name}"!`
                    : `Magia "${spell.name}" adicionada!`
            } else {
                // Adição normal
                updateData = { spells: [ ...currentSpells, spell ] }
                field = 'spells'
                resultMessage = `Magia "${spell.name}" adicionada!`
            }
            break
        }

        case PerkTypeEnum.EXPERTISE: {
            const expertiseData = perk.data || perk
            const effects = expertiseData.effects || perk.effects || []
            
            if (effects.length > 0) {
                // Aplica os efeitos
                const { updates, messages } = applyPerkEffects({
                    effects,
                    currentCharsheet,
                    campaignCode
                })
                Object.assign(updateData, updates)
                field = 'expertises'
                resultMessage = messages.length > 0 
                    ? `Perícia aplicada: ${messages.join(', ')}!`
                    : `Perícia "${expertiseData.name}" aplicada!`
            } else {
                // Fallback para o comportamento antigo
                const expertiseName = expertiseData.name as ExpertiseName
                const bonusValue = 1
                const currentValue = currentCharsheet?.expertises?.[expertiseName]?.value || 0
                updateData = { [`expertises.${expertiseName}.value`]: currentValue + bonusValue }
                field = `expertises.${expertiseName}`
                resultMessage = `Perícia "${expertiseName}" aumentada em +${bonusValue}!`
            }
            break
        }

        case PerkTypeEnum.BONUS:
        case PerkTypeEnum.STATS: {
            // Perks de BONUS e STATS aplicam efeitos diretamente
            const perkData = perk.data || perk
            const effects = perkData.effects || perk.effects || []
            
            if (effects.length > 0) {
                const { updates, messages } = applyPerkEffects({
                    effects,
                    currentCharsheet,
                    campaignCode
                })
                Object.assign(updateData, updates)
                field = 'effects'
                resultMessage = messages.length > 0 
                    ? `Efeitos aplicados: ${messages.join(', ')}!`
                    : `Perk "${perkData.name}" aplicado!`
            } else {
                // Perk sem efeitos programáveis - apenas registra
                field = 'perks'
                resultMessage = `Perk "${perkData.name}" registrado!`
            }
            break
        }

        default:
            return {
                success: false,
                field: '',
                message: `Tipo de perk desconhecido: ${type}`
            }
        }

        // Prepara o perk para salvar na sessão
        const perkForSession = extractPerkForSession(perk)
        
        // Verifica se já houve updates na sessão (por applyPerkEffects)
        // Se sim, usa a sessão atualizada; senão, usa a do charsheet
        const existingSessionUpdates = updateData.session
        const sessionsToUse = existingSessionUpdates || currentCharsheet?.session || []
        const sessionIndex = sessionsToUse.findIndex((s: any) => s.campaignCode === campaignCode)
        
        if (sessionIndex >= 0) {
            // Sessão existe - adiciona o perk ao array de perks (preservando stats atualizados)
            const currentSession = sessionsToUse[sessionIndex]
            const currentPerks = currentSession.perks || []
            const updatedSessions = [ ...sessionsToUse ]
            updatedSessions[sessionIndex] = {
                ...currentSession,
                perks: [ ...currentPerks, perkForSession ]
            }
            updateData.session = updatedSessions
        } else {
            // Sessão não existe - cria uma nova com o perk
            const newSession = {
                campaignCode,
                stats: {
                    maxLp: currentCharsheet?.stats?.lp || 100,
                    maxMp: currentCharsheet?.stats?.mp || 50,
                    maxAp: currentCharsheet?.stats?.ap || 5,
                    lp: currentCharsheet?.stats?.lp || 100,
                    mp: currentCharsheet?.stats?.mp || 50,
                    ap: currentCharsheet?.stats?.ap || 5
                },
                perks: [ perkForSession ]
            }
            updateData.session = [ ...sessionsToUse, newSession ]
        }

        // Remove campos undefined antes de salvar no Firestore
        const cleanUpdateData = removeUndefined(updateData)
        
        // Salva no Firestore
        await charsheetEntity.update(charsheetId, cleanUpdateData)
        console.log('[savePerkToCharsheet] Salvo no Firestore:', cleanUpdateData)

        return {
            success: true,
            field,
            message: resultMessage
        }
    } catch (error) {
        console.error('[savePerkToCharsheet] Erro ao salvar perk:', error)
        return {
            success: false,
            field: '',
            message: `Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }
    }
}
