import { z } from 'zod'

// Enums e tipos básicos
const GameModes = z.enum([ 'Apocalypse', 'Classic' ])

const Genders = z.enum([ 'Masculino', 'Feminino', 'Não-binário', 'Outro', 'Não definido' ])

const Elements = z.enum([
    'Fogo',
    'Água',
    'Terra',
    'Ar',
    'Eletricidade',
    'Trevas',
    'Luz',
    'Não-elemental',
    ''
])

const Races = z.enum([ 'Humano', 'Ciborgue', 'Autômato', 'Humanoide', 'Mutante', 'Magia-viva' ])

const Classes = z.enum([
    'Combatente',
    'Especialista',
    'Feiticeiro',
    'Bruxo',
    'Monge',
    'Druida',
    'Arcano',
    'Ladino'
])

const FinancialConditions = z.enum([
    'Miserável',
    'Pobre',
    'Estável',
    'Rico'
])

// Schemas para objetos aninhados
const AttributesSchema = z.object({
    vig: z.number().int().min(0).max(30, 'O valor máximo para atributos é 30')
        .refine(val => val >= 0 && val <= 30, {
            message: 'Vigor deve estar entre 0 e 30'
        })
        .default(0),

    des: z.number().int().min(0).max(30, 'O valor máximo para atributos é 30')
        .refine(val => val >= 0 && val <= 30, {
            message: 'Destreza deve estar entre 0 e 30'
        })
        .default(0),

    foc: z.number().int().min(0).max(30, 'O valor máximo para atributos é 30')
        .refine(val => val >= 0 && val <= 30, {
            message: 'Foco deve estar entre 0 e 30'
        })
        .default(0),

    log: z.number().int().min(0).max(30, 'O valor máximo para atributos é 30')
        .refine(val => val >= 0 && val <= 30, {
            message: 'Lógica deve estar entre 0 e 30'
        })
        .default(0),

    sab: z.number().int().min(0).max(30, 'O valor máximo para atributos é 30')
        .refine(val => val >= 0 && val <= 30, {
            message: 'Sabedoria deve estar entre 0 e 30'
        })
        .default(0),

    car: z.number().int().min(0).max(30, 'O valor máximo para atributos é 30')
        .refine(val => val >= 0 && val <= 30, {
            message: 'Carisma deve estar entre 0 e 30'
        })
        .default(0),

    // Pontos de vida/mana/ação
    lp: z.number().int().min(0, 'Pontos de vida não podem ser negativos')
        .default(0),

    mp: z.number().int().min(0, 'Pontos de mana não podem ser negativos')
        .default(0),

    ap: z.number().int().min(0, 'Pontos de ação não podem ser negativos')
        .default(0),

    // Campos para valores máximos
    maxLp: z.number().int().min(0, 'Valor máximo de vida inválido')
        .default(0),

    maxMp: z.number().int().min(0, 'Valor máximo de mana inválido')
        .default(0),

    maxAp: z.number().int().min(0, 'Valor máximo de ação inválido')
        .default(0)
})

const PointsSchema = z.object({
    attributes: z.number().int().refine(val => val === 0, {
        message: 'Você deve gastar seus pontos de atributo'
    }).default(0),
    expertises: z.number().int().refine(val => val === 0, {
        message: 'Você deve gastar seus pontos de perícia'
    }).default(0),
    skills: z.number().int().min(0, 'Pontos de habilidade não podem ser negativos')
        .default(0),

    magics: z.number().int().min(0, 'Pontos de magia não podem ser negativos')
        .default(0)
}).refine(
    data => data.attributes >= 0 && data.expertises >= 0 && data.skills >= 0 &&
        data.magics >= 0,
    {
        message: 'Todos os pontos devem ser positivos',
        path: [ 'points' ]
    }
)

const SkillSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'O nome da habilidade é obrigatório'),
    description: z.string().min(1, 'A descrição da habilidade é obrigatória'),
    type: z.string(),
    origin: z.string().optional(),
    effects: z.array(z.number().int()).optional(),
    level: z.number().int().min(0, 'O nível deve ser maior ou igual a 0').optional()
})

const SkillsSchema = z.object({
    class: z.array(SkillSchema).optional().default([]).refine(
        skills => new Set(skills.map(s => s.name)).size === skills.length,
        { message: 'Habilidades de classe não podem ter nomes duplicados' }
    ),
    subclass: z.array(SkillSchema).optional().default([]).refine(
        skills => new Set(skills.map(s => s.name)).size === skills.length,
        { message: 'Habilidades de subclasse não podem ter nomes duplicados' }
    ),
    bonus: z.array(SkillSchema).optional().default([]).refine(
        skills => new Set(skills.map(s => s.name)).size === skills.length,
        { message: 'Habilidades bônus não podem ter nomes duplicados' }
    ),
    powers: z.array(SkillSchema).optional().default([]).refine(
        skills => new Set(skills.map(s => s.name)).size === skills.length,
        { message: 'Poderes não podem ter nomes duplicados' }
    )
})

const AmmoCounterSchema = z.object({
    current: z.number().int().min(0).default(0),
    max: z.number().int().min(0).default(0)
})

const CapacitySchema = z.object({
    cargo: z.coerce.number().min(0).default(0),
    max: z.coerce.number().min(0).default(5.0)
})

const PassiveSchema = z.object({
    id: z.string().min(1, 'O ID da habilidade passiva é obrigatório'),
    title: z.string().min(1, 'O título da habilidade passiva é obrigatório'),
    description: z.string(),
    occasion: z.enum([
        'Início do turno',
        'Final do turno',
        'Ao ser atacado',
        'Ao atacar',
        'Ao usar magia',
        'Ao sofrer dano',
        'Ao causar dano',
        'Sempre ativo',
        'Quando curar',
        'Ao se deslocar',
        'Condição específica',
        'Personalizado'
    ]),
    custom: z.boolean().optional()
})

const StatusSchema = z.object({
    name: z.string().min(1, 'O nome do status é obrigatório'),
    description: z.string().optional(),
    type: z.string(),
    duration: z.number().int().min(0).optional().default(0),
    effect: z.array(z.string()).optional().default([])
})

const DiceSchema = z.object({
    name: z.string().min(1, 'O nome do dado é obrigatório'),
    color: z.string(),
    createdAt: z.string(),
    description: z.string().optional(),
    dices: z.array(z.object({ faces: z.number().int(), quantity: z.number().int() })),
    effects: z.array(z.object({})).optional().default([]),
    modifiers: z.array(z.object({})).optional().default([])
})

const ModsSchema = z.object({
    attributes: z.object({
        des: z.number().int().default(0),
        vig: z.number().int().default(0),
        log: z.number().int().default(0),
        sab: z.number().int().default(0),
        foc: z.number().int().default(0),
        car: z.number().int().default(0)
    }),
    discount: z.number().int().default(-10)
})

// Schema base para itens do inventário
const BaseItemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'O nome do item é obrigatório'),
    description: z.string().optional(),
    weight: z.number().min(0, 'O peso não pode ser negativo').default(0),
    value: z.number().min(0, 'O valor não pode ser negativo').default(0),
    rarity: z.string().default('Comum'),
    kind: z.string().optional(),
    quantity: z.number().int().min(1, 'A quantidade mínima é 1').default(1)
})

// Enum para schema de armas
const AmmoEnum = z.enum([
    '9mm',
    'Calibre .50',
    'Calibre 12',
    'Calibre 22', 
    'Bateria de lítio',
    'Amplificador de partículas',
    'Cartucho de fusão',
    'Servomotor iônico',
    'Flecha',
    'Combustível', 
    'Foguete', 
    'Granada',
    'Serra de metal',
    'Bateria de Cádmio com Óxido de Grafeno',
    'Não consome'
])

// Schema para armas
const WeaponSchema = BaseItemSchema.extend({
    ammo: AmmoEnum,
    categ: z.string().min(1, 'A categoria da arma é obrigatória'),
    range: z.string().optional(),
    accessories: z.array(z.string()).default([]),
    bonus: z.string(),
    hit: z.string(),
    effect: z.object({
        effectType: z.string().optional(),
        critChance: z.number().optional(),
        critValue: z.string()
            .min(1, { message: 'Valor crítico é obrigatório' })
            .regex(/^\d+d\d+(?:[+-](?:\d+|\d+d\d+))*$/, 
                { message: 'Formato deve ser XdY, opcionalmente com modificadores (ex: 2d4+1, 2d4+2d4)' }),
        value: z.string()
            .min(1, { message: 'Valor de dano é obrigatório' })
            .regex(/^\d+d\d+(?:[+-](?:\d+|\d+d\d+))*$/, 
                { message: 'Formato deve ser XdY, opcionalmente com modificadores (ex: 2d4+1, 2d4+2d4)' })
    }).optional()
})

// Schema para armaduras
const ArmorSchema = BaseItemSchema.extend({
    categ: z.string().min(1, 'A categoria da armadura é obrigatória'),
    displacementPenalty: z.number().int().default(0),
    value: z.number().min(0, 'O valor de defesa não pode ser negativo').default(0)
})

// Schema para itens comuns
const CommonItemSchema = BaseItemSchema.extend({
    effects: z.array(z.any()).default([])
})

// Schema para qualquer item do inventário
const InventoryItemSchema = z.union([
    WeaponSchema,
    ArmorSchema,
    CommonItemSchema
])

const MagicSchema = z.object({
    id: z.string(),
    elemento: z.string().min(1, 'O elemento da magia é obrigatório'),
    nome: z.string().min(1, 'O nome da magia é obrigatório'),
    custo: z.coerce.number().min(0, 'O custo da magia não pode ser negativo').default(0),
    nível: z.coerce.number().min(0, 'O nível da magia não pode ser negativo').default(0),
    tipo: z.string().min(1, 'O tipo da magia é obrigatório'),
    execução: z.string().min(1, 'A execução da magia é obrigatória'),
    alcance: z.string().min(1, 'O alcance da magia é obrigatório'),
    estágio1: z.string().optional(),
    estágio2: z.string().optional(),
    estágio3: z.string().optional(),
    maestria: z.string().optional()
})

const ExpertiseValueSchema = z.object({
    value: z.number().int().min(-10, 'O valor da perícia não pode ser menor que -10')
        .max(10, 'O valor máximo para uma perícia é 10')
        .default(0),
    defaultAttribute: z.union([
        z.enum([ 'vig', 'des', 'foc', 'log', 'sab', 'car' ]),
        z.null()
    ]).optional().nullable().refine((value) => {
        if (value === null) {
            return true;
        }
        return typeof value === 'string';
    }, {
        message: 'O atributo base deve ser um valor válido ou nulo',
        path: [ 'defaultAttribute' ]
    })
})

const ExpertisesSchema = z.record(ExpertiseValueSchema).superRefine((expertises, ctx) => {
    Object.entries(expertises).forEach(([ name, expertise ]) => {
        if (typeof expertise !== 'object' || expertise === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Perícia '${name}' deve ser um objeto com valor e atributo base`,
                path: [ 'expertises', name ]
            })
        }
    })
})

const SessionInfoSchema = z.object({
    campaignCode: z.string(),
    attributes: z.object({
        maxLp: z.number().int().min(0),
        maxMp: z.number().int().min(0)
    })
})

// Schema principal da Charsheet
export const charsheetSchema = z.object({
    id: z.string().optional(),
    playerName: z.string().min(1, 'O nome do jogador é obrigatório'),
    mode: GameModes.default('Classic'),
    userId: z.string().min(1, 'ID do usuário é obrigatório'),
    name: z.string().min(1, 'O nome do personagem é obrigatório'),
    age: z.number().int().min(0, 'A idade deve ser um número positivo'),
    class: Classes,
    race: Races,
    lineage: z.string().min(1, 'A linhagem é obrigatória'),
    ORMLevel: z.number().int().min(0).default(0),
    inventory: z.object({
        items: z.array(InventoryItemSchema).optional().default([]).refine(
            items => new Set(items.map(i => i.name)).size === items.length,
            { message: 'Não pode haver itens com nomes duplicados' }
        ),
        weapons: z.array(WeaponSchema).optional().default([]).refine(
            weapons => new Set(weapons.map(w => w.name)).size === weapons.length,
            { message: 'Não pode haver armas com nomes duplicados' }
        ),
        armors: z.array(ArmorSchema).optional().default([]).refine(
            armors => new Set(armors.map(a => a.name)).size === armors.length,
            { message: 'Não pode haver armaduras com nomes duplicados' }
        ),
        money: z.number().int().min(0, 'O dinheiro não pode ser negativo').default(0)
    }).refine(
        inventory => {
            const totalWeight = [
                ...inventory.items,
                ...inventory.weapons,
                ...inventory.armors
            ].reduce((sum, item) => sum + (item.weight * (item.quantity || 1)), 0);

            return totalWeight >= 0; // Validação adicional pode ser adicionada aqui
        },
        {
            message: 'Peso total do inventário inválido',
            path: [ 'inventory' ]
        }
    ),
    displacement: z.number().int().min(0).default(0),
    magics: z.array(MagicSchema).optional().default([]),
    anotacoes: z.string().optional(),
    magicsSpace: z.number().int().min(0).default(0),
    mpLimit: z.number().int().min(0).default(0),
    overall: z.number().int().min(0).default(0),
    gender: Genders,
    elementalMastery: Elements,
    level: z.number().int().min(0).default(0),
    subclass: z.string().optional(),
    financialCondition: FinancialConditions,
    expertises: ExpertisesSchema.default({}).refine(
        expertises => {
            // Garante que todas as perícias tenham valores válidos
            return Object.values(expertises).every(expertise =>
                typeof expertise === 'object' &&
                expertise !== null &&
                'value' in expertise &&
                'defaultAttribute' in expertise
            )
        },
        {
            message: 'Todas as perícias devem ter um valor e um atributo base válidos',
            path: [ 'expertises' ]
        }
    ),
    traits: z.array(z.string()).refine(
        traits => traits.length >= 2,
        {
            message: 'O personagem deve possuir ao menos um traço positivo e um negativo',
            path: [ 'traits' ]
        }
    ),
    session: z.array(SessionInfoSchema).optional().default([]),
    skills: SkillsSchema,
    points: PointsSchema,
    attributes: AttributesSchema,
    ammoCounter: AmmoCounterSchema,
    capacity: CapacitySchema.default({ cargo: 1.0, max: 5.0 }),
    passives: z.array(PassiveSchema).optional().default([]),
    status: z.array(StatusSchema).optional().default([]),
    dices: z.array(DiceSchema).optional().default([]),
    mods: ModsSchema.default({
        attributes: { des: 0, vig: 0, log: 0, sab: 0, foc: 0, car: 0 },
        discount: -10
    })
})

// Tipo inferido do schema
export type CharsheetType = z.infer<typeof charsheetSchema>
