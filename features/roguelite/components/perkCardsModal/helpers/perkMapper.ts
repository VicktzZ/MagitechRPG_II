import { PerkTypeEnum } from '@enums/rogueliteEnum'
import type { PerkCardProps, PerkAttribute } from '../../perkCardModule/types'

interface PerkData {
    name?: string
    title?: string
    description?: string
    rarity?: string
    rogueliteRarity?: string
    perkType?: PerkTypeEnum
    element?: string
    data?: any
    effects?: any[]
    level?: number
    id?: string
    stages?: string[]
}

export function mapPerkSubtitle(perk: PerkData): string {
    const perkType = perk.perkType
    const data = perk.data || perk

    switch (perkType) {
    case PerkTypeEnum.ITEM: {
        const itemKind = data?.kind
        const kindLabels: Record<string, string> = {
            'Padrão': 'Item Padrão',
            'Utilidade': 'Utensílio',
            'Capacidade': 'Item de Capacidade',
            'Especial': 'Item Especial'
        }
        return kindLabels[ itemKind ] ?? itemKind ?? 'Item'
    }
    case PerkTypeEnum.WEAPON: {
        const wCateg = data?.categ?.split('(')?.[1]?.slice(0, -1) ?? data?.categ
        return data?.weaponKind ? `${data.weaponKind} (${wCateg})` : data?.categ ?? 'Arma'
    }
    case PerkTypeEnum.EXPERTISE:
        return `Bônus em ${perk.effects?.[ 0 ]?.expertiseName ?? 'Perícia'}`
    case PerkTypeEnum.SKILL: {
        const skillType = data?.type
        return skillType ? `Habilidade de ${skillType}` : 'Poder Mágico'
    }
    case PerkTypeEnum.SPELL: {
        const spellElement = data?.element ?? 'Neutro'
        const spellLevel = data?.level ?? 1
        return `Magia de ${spellElement} (Nível ${spellLevel})`
    }
    default:
        return perkType ?? ''
    }
}

export function mapPerkDescription(perk: PerkData): string {
    if (perk.perkType === PerkTypeEnum.SPELL) {
        const data = perk.data || perk
        return data?.stages?.[ 0 ] ?? perk.description ?? 'Sem descrição'
    }
    return perk.description ?? 'Sem descrição'
}

export function mapSpellAttributes(perk: PerkData): PerkAttribute[] | undefined {
    const spellData = perk.data || perk
    const attrs: PerkAttribute[] = []

    if (spellData?.type) {
        attrs.push({ label: 'Tipo', value: spellData.type })
    }
    if (spellData?.range) {
        attrs.push({ label: 'Alcance', value: spellData.range })
    }
    if (spellData?.execution) {
        attrs.push({ label: 'Execução', value: spellData.execution })
    }
    if (spellData?.mpCost !== undefined) {
        attrs.push({ label: 'Custo', value: `${spellData.mpCost} MP` })
    }

    return attrs.length > 0 ? attrs : undefined
}

export function mapSkillAttributes(perk: PerkData): PerkAttribute[] {
    const skillData = perk.data || perk
    const attrs: PerkAttribute[] = [
        {
            label: 'Tipo',
            value: skillData?.type === 'Habilidade' ? 'Bônus' : skillData?.type ?? 'Bônus'
        }
    ]

    if (skillData?.origin) {
        attrs.push({ label: 'Origem', value: skillData.origin })
    }
    if (skillData?.type === 'Bônus' && skillData?.effects?.length > 0) {
        attrs.push({ label: 'Bônus', value: `+${skillData.effects[ 0 ]} perícia` })
    }
    if (skillData?.level) {
        attrs.push({ label: 'Nível', value: skillData.level })
    }

    return attrs
}

export function mapItemAttributes(perk: PerkData): PerkAttribute[] | undefined {
    const itemData = perk.data || perk
    const attrs: PerkAttribute[] = []

    if (itemData?.kind) {
        attrs.push({ label: 'Tipo', value: itemData.kind })
    }
    if (itemData?.kind === 'Equipamento' && itemData?.space) {
        attrs.push({ label: 'Espaço', value: itemData.space })
    }
    if (itemData?.weight !== undefined) {
        attrs.push({ label: 'Peso', value: `${itemData.weight} kg` })
    }

    return attrs.length > 0 ? attrs : undefined
}

export function mapPerkAttributes(perk: PerkData): PerkAttribute[] | undefined {
    switch (perk.perkType) {
    case PerkTypeEnum.SPELL:
        return mapSpellAttributes(perk)
    case PerkTypeEnum.SKILL:
        return mapSkillAttributes(perk)
    case PerkTypeEnum.ITEM:
        return mapItemAttributes(perk)
    default:
        return undefined
    }
}

function getSpellElement(perk: PerkData): string | undefined {
    if (perk.perkType !== PerkTypeEnum.SPELL) return perk.element
    
    // Para SPELLs, o elemento pode estar em data.element ou perk.element
    const data = perk.data || perk
    return data?.element ?? perk.element
}

function getSpellLevel(perk: PerkData): number | undefined {
    if (perk.perkType !== PerkTypeEnum.SPELL) return perk.level
    
    // Para SPELLs, o level pode estar em data.level ou perk.level
    const data = perk.data || perk
    return data?.level ?? perk.level
}

function getSpellStages(perk: PerkData): string[] | undefined {
    if (perk.perkType !== PerkTypeEnum.SPELL) return undefined
    
    const data = perk.data || perk
    return data?.stages ?? perk.stages
}

function getSpellMpCost(perk: PerkData): number | undefined {
    if (perk.perkType !== PerkTypeEnum.SPELL) return undefined
    
    const data = perk.data || perk
    return data?.mpCost ?? (perk as any).mpCost
}

export function mapPerkToCardProps(perk: PerkData, icon: React.ReactNode): Omit<PerkCardProps, 'bgImage'> {
    return {
        title: perk.name ?? perk.title ?? 'Sem nome',
        subtitle: mapPerkSubtitle(perk),
        description: mapPerkDescription(perk),
        rarity: (perk.rogueliteRarity ?? perk.rarity ?? 'Comum') as any,
        perkType: perk.perkType,
        element: getSpellElement(perk) as any,
        icon,
        level: getSpellLevel(perk),
        stages: getSpellStages(perk),
        mpCost: getSpellMpCost(perk),
        weapon: perk.perkType === PerkTypeEnum.WEAPON ? (perk.data || perk) : undefined,
        armor: perk.perkType === PerkTypeEnum.ARMOR ? (perk.data || perk) : undefined,
        attributes: mapPerkAttributes(perk)
    }
}
