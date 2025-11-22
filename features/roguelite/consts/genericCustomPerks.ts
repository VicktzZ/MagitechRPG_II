import { PerkTypeEnum } from '@enums/rogueliteEnum';
import type { Perk } from '../models';

const curaInstantanea = [
    {
        "name": "Cura instantânea",
        "description": "Cura 10 de LP.",
        "rarity": "Comum",
        "perkType": PerkTypeEnum.STATS,
        "weight": 70,
        "effects": [
            {
                "type": "heal",
                "target": "lp",
                "value": 10,
                "description": "Cura instantânea de 10 pontos de vida"
            }
        ]
    },
    {
        "name": "Cura instantânea II",
        "description": "Cura 15 de LP.",
        "rarity": "Incomum",
        "perkType": PerkTypeEnum.STATS,
        "weight": 60,
        "effects": [
            {
                "type": "heal",
                "target": "lp",
                "value": 15,
                "description": "Cura instantânea de 15 pontos de vida"
            }
        ]
    },
    {
        "name": "Cura instantânea III",
        "description": "Cura 20 de LP.",
        "rarity": "Raro",
        "perkType": PerkTypeEnum.STATS,
        "weight": 50,
        "effects": [
            {
                "type": "heal",
                "target": "lp",
                "value": 20,
                "description": "Cura instantânea de 20 pontos de vida"
            }
        ]
    },
    {
        "name": "Cura instantânea IV",
        "description": "Cura 25 de LP.",
        "rarity": "Épico",
        "perkType": PerkTypeEnum.STATS,
        "weight": 40,
        "effects": [
            {
                "type": "heal",
                "target": "lp",
                "value": 25,
                "description": "Cura instantânea de 25 pontos de vida"
            }
        ]
    },
    {
        "name": "Cura instantânea V",
        "description": "Cura 30 de LP.",
        "rarity": "Lendário",
        "perkType": PerkTypeEnum.STATS,
        "weight": 30,
        "effects": [
            {
                "type": "heal",
                "target": "lp",
                "value": 30,
                "description": "Cura instantânea de 30 pontos de vida"
            }
        ]
    }
]

const manaInstantanea = [
    {
        "name": "Mana instantânea",
        "description": "Restaura 5 de MP.",
        "rarity": "Comum",
        "perkType": PerkTypeEnum.STATS,
        "weight": 70,
        "effects": [
            {
                "type": "heal",
                "target": "mp",
                "value": 5,
                "description": "Restaura instantânea de 5 pontos de mana"
            }
        ]
    },
    {
        "name": "Mana instantânea II",
        "description": "Restaura 10 de MP.",
        "rarity": "Incomum",
        "perkType": PerkTypeEnum.STATS,
        "weight": 60,
        "effects": [
            {
                "type": "heal",
                "target": "mp",
                "value": 10,
                "description": "Restaura instantânea de 10 pontos de mana"
            }
        ]
    },
    {
        "name": "Mana instantânea III",
        "description": "Restaura 15 de MP.",
        "rarity": "Raro",
        "perkType": PerkTypeEnum.STATS,
        "weight": 50,
        "effects": [
            {
                "type": "heal",
                "target": "mp",
                "value": 15,
                "description": "Restaura instantânea de 15 pontos de mana"
            }
        ]
    },
    {
        "name": "Mana instantânea IV",
        "description": "Restaura 20 de MP.",
        "rarity": "Épico",
        "perkType": PerkTypeEnum.STATS,
        "weight": 40,
        "effects": [
            {
                "type": "heal",
                "target": "mp",
                "value": 20,
                "description": "Restaura instantânea de 20 pontos de mana"
            }
        ]
    },
    {
        "name": "Mana instantânea V",
        "description": "Restaura 25 de MP.",
        "rarity": "Lendário",
        "perkType": PerkTypeEnum.STATS,
        "weight": 30,
        "effects": [
            {
                "type": "heal",
                "target": "mp",
                "value": 25,
                "description": "Restaura instantânea de 25 pontos de mana"
            }
        ]
    }
]

const acrescimoFinanceiro = [
    {
        "name": "Acréscimo Financeiro",
        "description": "Adiciona +10 de dinheiro",
        "rarity": "Comum",
        "perkType": PerkTypeEnum.BONUS,
        "weight": 75,
        "effects": [
            {
                "type": "add",
                "target": "money",
                "value": 10,
                "description": "Adiciona +10 de dinheiro"
            }
        ]
    },
    {
        "name": "Acréscimo Financeiro II",
        "description": "Adiciona +25 de dinheiro",
        "rarity": "Incomum",
        "perkType": PerkTypeEnum.BONUS,
        "weight": 65,
        "effects": [
            {
                "type": "add",
                "target": "money",
                "value": 25,
                "description": "Adiciona +25 de dinheiro"
            }
        ]
    },
    {
        "name": "Acréscimo Financeiro III",
        "description": "Adiciona +50 de dinheiro",
        "rarity": "Raro",
        "perkType": PerkTypeEnum.BONUS,
        "weight": 55,
        "effects": [
            {
                "type": "add",
                "target": "money",
                "value": 50,
                "description": "Adiciona +50 de dinheiro"
            }
        ]
    },
    {
        "name": "Acréscimo Financeiro IV",
        "description": "Adiciona +100 de dinheiro",
        "rarity": "Épico",
        "perkType": PerkTypeEnum.BONUS,
        "weight": 45,
        "effects": [
            {
                "type": "add",
                "target": "money",
                "value": 100,
                "description": "Adiciona +100 de dinheiro"
            }
        ]
    },
    {
        "name": "Acréscimo Financeiro V",
        "description": "Adiciona +200 de dinheiro",
        "rarity": "Lendário",
        "perkType": PerkTypeEnum.BONUS,
        "weight": 35,
        "effects": [
            {
                "type": "add",
                "target": "money",
                "value": 200,
                "description": "Adiciona +200 de dinheiro"
            }
        ]
    }
]

const especializacao = [
    {
        name: 'Especialização',
        description: 'Aumenta em +1 o bônus de {expertise}.',
        rarity: 'Comum',
        perkType: PerkTypeEnum.EXPERTISE,
        weight: 90,
        effects: [
            {
                type: 'add',
                target: 'expertise',
                value: 1,
                expertiseName: '{expertise}',
                description: 'Aumenta em +1 o bônus de {expertise}'
            }
        ]
    },
    {
        name: 'Especialização',
        description: 'Aumenta em +2 o bônus de {expertise}.',
        rarity: 'Incomum',
        perkType: PerkTypeEnum.EXPERTISE,
        weight: 80,
        effects: [
            {
                type: 'add',
                target: 'expertise',
                value: 2,
                expertiseName: '{expertise}',
                description: 'Aumenta em +2 o bônus de {expertise}'
            }
        ]
    },
    {
        name: 'Especialização',
        description: 'Aumenta em +3 o bônus de {expertise}.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.EXPERTISE,
        weight: 70,
        effects: [
            {
                type: 'add',
                target: 'expertise',
                value: 3,
                expertiseName: '{expertise}',
                description: 'Aumenta em +3 o bônus de {expertise}'
            }
        ]
    },
    {
        name: 'Especialização',
        description: 'Aumenta em +4 o bônus de {expertise}.',
        rarity: 'Épico',
        perkType: PerkTypeEnum.EXPERTISE,
        weight: 60,
        effects: [
            {
                type: 'add',
                target: 'expertise',
                value: 4,
                expertiseName: '{expertise}',
                description: 'Aumenta em +4 o bônus de {expertise}'
            }
        ]
    },
    {
        name: 'Especialização',
        description: 'Aumenta em +5 o bônus de {expertise}.',
        rarity: 'Lendário',
        perkType: PerkTypeEnum.EXPERTISE,
        weight: 50,
        effects: [
            {
                type: 'add',
                target: 'expertise',
                value: 5,
                expertiseName: '{expertise}',
                description: 'Aumenta em +5 o bônus de {expertise}'
            }
        ]
    },
]



export const genericCustomPerks: Record<string, Perk> = [
    ...manaInstantanea,
    ...curaInstantanea,
    ...acrescimoFinanceiro,
    ...especializacao,
    {
        name: 'Aumento de Dano de Arma',
        description: 'Aumenta o ataque da sua arma em +2.',
        rarity: 'Comum',
        perkType: PerkTypeEnum.UPGRADE,
        weight: 50
    },
    {
        name: 'Aumento de Dano de Arma II',
        description: 'Aumenta o ataque da sua arma em +5.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.UPGRADE,
        weight: 20
    },
    {
        name: 'Modificação Bélica',
        description: 'Aumenta o grau de dado da arma (2d4 -> 2d6, 2d6 -> 2d8 ...). Limitado a d12.',
        rarity: 'Incomum',
        perkType: PerkTypeEnum.UPGRADE,
        weight: 40
    },
    {
        name: 'Rajada Automática',
        description: 'armas semiautomáticas podem desferir uma rajada de duas balas.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.BONUS,
        weight: 30
    },

    { 
        name: 'Munição Extra',
        description: 'Dobra o tamanho do pente da arma.',
        rarity: 'Comum',
        perkType: PerkTypeEnum.UPGRADE,
        weight: 30
    },
    {
        name: 'Municiamento de Mestre',
        description: 'Aumenta a eficiência da munição em 100%.',
        rarity: 'Comum',
        perkType: PerkTypeEnum.UPGRADE,
        weight: 30
    },
    { 
        name: 'Aumentar Raridade',
        description: 'Aumenta a raridade da arma ou armadura.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.UPGRADE,
        weight: 30
    },
    { 
        name: 'Duplicar Item',
        description: 'Duplica o item, arma ou armadura selecionada.',
        rarity: 'Épico',
        perkType: PerkTypeEnum.BONUS,
        weight: 30
    },
    { 
        name: 'Golpe Cortante',
        description: 'Ataques de armas corpo-a-corpo tem 100% de chance de causar sangramento simples.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.SKILL,
        weight: 30
    },
    { 
        name: 'Rápido no Gatilho',
        description: 'Pode empunhar e trocar de armas como ação livre.',
        rarity: 'Comum',
        perkType: PerkTypeEnum.SKILL,
        weight: 60
    },
    { 
        name: 'Acerto Crítico',
        description: 'Diminui a margem de crítico da arma em -1.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.SKILL,
        weight: 30
    },
    { 
        name: 'Magia Máxima',
        description: 'Coloca a magia selecionada no estágio máximo.',
        rarity: 'Épico',
        perkType: PerkTypeEnum.UPGRADE,
        weight: 20
    },
    { 
        name: 'Fogo Ardente',
        description: 'Magias de fogo têm 100% de chance de causar queimadura simples.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.SKILL,
        weight: 40
    },
    { 
        name: 'Rajada Gélida',
        description: 'Magias de água têm 100% de chance de causar congelamento.',
        rarity: 'Épico',
        perkType: PerkTypeEnum.SKILL,
        weight: 20
    },
    { 
        name: 'Vento Cortante',
        description: 'Magias de ar têm 100% de chance de causar sangramento simples.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.SKILL,
        weight: 40
    },
    { 
        name: 'Magia Inerte',
        description: 'Magias que falham não consomem MP',
        rarity: 'Épico',
        perkType: PerkTypeEnum.SKILL,
        weight: 35
    },
    { 
        name: 'Magismo Crítico',
        description: 'Diminui a margem de crítico de magia em -1.',
        rarity: 'Lendário',
        perkType: PerkTypeEnum.SKILL,
        weight: 20
    },
    { 
        name: 'Magnetismo Pessoal',
        description: 'Armas e itens do tipo "Arremessável" retornam para sua mão no final do turno.',
        rarity: 'Incomum',
        perkType: PerkTypeEnum.SKILL,
        weight: 30
    },
    { 
        name: 'Efeito Inicial',
        description: 'Seu primeiro ataque no combate causa +5 de dano.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.SKILL,
        weight: 30
    },
    { 
        name: 'Casca de Ferro',
        description: 'O primeiro ataque causado a você no combate tem seu dano reduzido em -5. ',
        rarity: 'Incomum',
        perkType: PerkTypeEnum.SKILL,
        weight: 30
    },
    { 
        name: 'Resiliência Mental',
        description: 'Dano mental é reduzido pela metade.',
        rarity: 'Épico',
        perkType: PerkTypeEnum.SKILL,
        weight: 30
    },
    { 
        name: 'Mochileiro',
        description: 'Dobra sua capacidade de peso.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.BONUS,
        weight: 50
    },
    { 
        name: 'Arsenal Mágico',
        description: 'Dobra seus espaços de magia.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.BONUS,
        weight: 40
    },
    { 
        name: 'Arcanismo Total',
        description: 'Coloca todas suas magias no estágio máximo, porém não pode mais atacar com armas.',
        rarity: 'Amaldiçoado',
        perkType: PerkTypeEnum.SKILL,
        weight: 25,
    },
    { 
        name: 'Redução Mágica',
        description: 'Reduz o custo de MP da magia selecionada pela metade.',
        rarity: 'Épico',
        perkType: PerkTypeEnum.BONUS,
        weight: 10,
        effects: [
            {
                type: 'reduce',
                target: 'mpCost',
                value: 0.5,
                description: 'Reduz o custo de MP da magia selecionada pela metade'
            }
        ]
    },
    {
        name: 'Crítico Extra',
        description: 'Adiciona +1x no multiplicador de crítico total.',
        rarity: 'Lendário',
        perkType: PerkTypeEnum.SKILL,
        weight: 10
    },
    {
        name: 'Grande Passo',
        description: 'Aumenta o deslocamento base em +3m.',
        rarity: 'Incomum',
        perkType: PerkTypeEnum.SKILL,
        weight: 40
    },
    { 
        name: 'Magismo',
        description: 'Adiciona o bônus de Magia em ataques mágicos.',
        rarity: 'Épico',
        perkType: PerkTypeEnum.SKILL,
        weight: 10
    },
    { 
        name: 'Luta-livre',
        description: 'Adiciona o bônus de Luta em ataques corpo-a-corpo.',
        rarity: 'Épico',
        perkType: PerkTypeEnum.SKILL,
        weight: 10
    },
    { 
        name: 'Poder da Mente',
        description: 'Adiciona o bônus de Conhecimento em ataques.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.SKILL,
        weight: 40
    },
    { 
        name: 'Curativo Extra',
        description: 'Magias e habilidades de cura conferem um adicional de +2d4 LP.',
        rarity: 'Incomum',
        perkType: PerkTypeEnum.SKILL,
        weight: 50
    },
    { 
        name: 'Cura Crítica',
        description: 'Dobra a cura causada por itens, magias e habilidades.',
        rarity: 'Lendário',
        perkType: PerkTypeEnum.SKILL,
        weight: 10
    },
    { 
        name: 'Bem me quer, mal me quer',
        description: 'Magias, itens e habilidades de cura em área causam o equivalente da cura em dano para inimigos.',
        rarity: 'Raro',
        perkType: PerkTypeEnum.SKILL,
        weight: 40
    }
];

