import { PerkTypeEnum, SkillTypeEnum } from '@enums/rogueliteEnum';
import type { RarityType } from '@models/types/string';

export const RARITY_OPTIONS: RarityType[] = [
    'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Único', 'Mágico', 'Amaldiçoado', 'Especial'
];

export const TYPE_OPTIONS = [
    { value: PerkTypeEnum.WEAPON, label: 'Arma' },
    { value: PerkTypeEnum.ARMOR, label: 'Armadura' },
    { value: PerkTypeEnum.ITEM, label: 'Item' },
    { value: PerkTypeEnum.SKILL, label: 'Habilidade' },
    { value: PerkTypeEnum.SPELL, label: 'Magia' },
    { value: PerkTypeEnum.BONUS, label: 'Bônus' },
    { value: PerkTypeEnum.UPGRADE, label: 'Upgrade' },
    { value: PerkTypeEnum.STATS, label: 'Stats' }
];

export const ELEMENT_OPTIONS = [
    'Fogo', 'Água', 'Ar', 'Terra', 'Eletricidade', 'Luz', 'Trevas', 'Não-Elemental',
    'Sangue', 'Vácuo', 'Psíquico', 'Radiação', 'Explosão', 'Tóxico', 'Gelo', 'Planta', 'Metal'
];

export const SPELL_LEVEL_OPTIONS = [ '1', '2', '3', '4' ];

export const EXECUTION_OPTIONS = [ 'Livre', 'Completa', 'Padrão', 'Movimento', 'Reação', 'Bônus' ];

export const ITEM_KIND_OPTIONS = [
    'Especial', 'Utilidade', 'Consumível', 'Item Chave', 'Munição', 
    'Capacidade', 'Padrão', 'Arremessável', 'Equipamento'
];

export const SKILL_TYPE_OPTIONS = [
    { value: SkillTypeEnum.CLASSE, label: 'Classe' },
    { value: SkillTypeEnum.LINHAGEM, label: 'Linhagem' },
    { value: SkillTypeEnum.PROFISSAO, label: 'Profissão' },
    { value: SkillTypeEnum.TALENTO, label: 'Talento' },
    { value: SkillTypeEnum.RACA, label: 'Raça' },
    { value: SkillTypeEnum.SUBCLASSE, label: 'Subclasse' },
    { value: SkillTypeEnum.PODER_MAGICO, label: 'Poder Mágico' },
    { value: SkillTypeEnum.BONUS, label: 'Bônus' }
];

export const DEFAULT_SHOP_CONFIG = {
    itemCount: 5,
    rarities: [] as RarityType[],
    types: [] as string[],
    itemKinds: [] as string[],
    priceMultiplier: 1.0,
    visibleToAll: true,
    visibleToPlayers: [] as string[]
};

export const DEFAULT_PERK_FILTERS = {
    rarities: [],
    type: '',
    element: '',
    spellLevel: '',
    execution: '',
    itemKinds: [],
    skillTypes: []
};
