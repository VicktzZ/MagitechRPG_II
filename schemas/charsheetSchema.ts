import { z } from 'zod'
import { DICE_NOTATION_MESSAGE, isDiceNotation } from '@utils/diceNotation'

/**
 * Schema do formulário da ficha.
 *
 * Regra de ouro: o schema valida o que o jogador digita, não a história do banco. Ficha antiga com
 * formato fora do padrão (lista gravada como objeto, perícia sem atributo base, arma sem munição...) tem de
 * continuar salvável — por isso quase tudo tem `.passthrough()` (o Zod descarta chaves desconhecidas, e uma
 * chave descartada no submit era apagada do banco) e `buildCharsheetSchema` tem dois modos:
 *
 * - `create`: a ficha nova precisa fechar (pontos de atributo e de perícia gastos, atributo ≤ 30, perícia ≤ 10);
 * - `edit`: ficha já criada. Pontos para gastar não bloqueiam (o level-up concede pontos na hora), e os tetos só
 *   barram quem AUMENTA acima do teto — o valor que já estava salvo acima dele continua válido.
 */

export type CharsheetSchemaMode = 'create' | 'edit'

export interface CharsheetSchemaOptions {
    mode?: CharsheetSchemaMode
    /** Valores da ficha como foi carregada (só no modo `edit`); lido na hora de validar, então pode mudar depois de salvar */
    getBaseline?: () => unknown
}

export const ATTRIBUTE_CAP = 30
export const EXPERTISE_CAP = 10

const ATTRIBUTE_LABELS: Record<string, string> = {
    vig: 'Vigor', des: 'Destreza', foc: 'Foco', log: 'Lógica', sab: 'Sabedoria', car: 'Carisma'
}

// Texto que o banco pode ter como null/ausente vira ''
const text = z.preprocess(value => value ?? '', z.string())

const attribute = z.number().int().min(0, 'Atributos não podem ser negativos').default(0)

// Atributos de sistemas customizados (chaves além de vig/des/foc/log/sab/car) sobrevivem pelo catchall
const AttributesSchema = z.object({
    vig: attribute, des: attribute, foc: attribute, log: attribute, sab: attribute, car: attribute
}).catchall(z.number().int())

// Decimais valem: o app grava `ap` e dinheiro fracionados (a loja e o mestre usam passo 0,1)
const StatsSchema = z.object({
    lp: z.number().min(0, 'Pontos de vida não podem ser negativos').default(0),
    mp: z.number().min(0, 'Pontos de mana não podem ser negativos').default(0),
    ap: z.number().min(0, 'Pontos de ação não podem ser negativos').default(0),
    maxLp: z.number().min(0, 'Valor máximo de vida inválido').default(0),
    maxMp: z.number().min(0, 'Valor máximo de mana inválido').default(0),
    maxAp: z.number().min(0, 'Valor máximo de ação inválido').default(0)
}).passthrough()

const PointsSchema = z.object({
    attributes: z.number().int().default(0),
    expertises: z.number().int().default(0),
    skills: z.number().int().default(0),
    magics: z.number().int().default(0)
}).passthrough()

const SkillSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'O nome da habilidade é obrigatório'),
    description: text,
    type: text,
    origin: z.string().nullish(),
    effects: z.array(z.any()).nullish(),
    level: z.number().min(0, 'O nível deve ser maior ou igual a 0').nullish()
}).passthrough()

const skillList = z.array(SkillSchema).nullish().transform(list => list ?? [])

const SkillsSchema = z.object({
    class: skillList,
    subclass: skillList,
    bonus: skillList,
    powers: skillList,
    lineage: skillList,
    race: skillList,
    occupation: skillList
}).passthrough()

const AmmoCounterSchema = z.object({
    current: z.number().int().min(0, 'Munição atual não pode ser negativa').default(0),
    max: z.number().int().min(0, 'Munição máxima não pode ser negativa').default(0)
}).passthrough()

const CapacitySchema = z.object({
    cargo: z.coerce.number().min(0, 'Carga não pode ser negativa').default(0),
    max: z.coerce.number().min(0, 'Capacidade máxima não pode ser negativa').default(5.0)
}).passthrough()

const PassiveSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'O título da habilidade passiva é obrigatório'),
    description: text,
    // O seletor da tela limita as opções; o banco aceita qualquer texto (ocasião personalizada)
    occasion: z.string(),
    custom: z.boolean().optional()
}).passthrough()

const StatusEntrySchema = z.object({
    name: z.string().min(1, 'O nome do status é obrigatório'),
    description: z.string().nullish(),
    type: text,
    duration: z.number().min(0).nullish(),
    effect: z.array(z.any()).nullish()
}).passthrough()

const DiceSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'O nome do dado é obrigatório'),
    color: text,
    createdAt: text,
    description: z.string().nullish(),
    dices: z.array(z.object({ faces: z.number().int(), quantity: z.number().int() }).passthrough()),
    effects: z.array(z.any()).nullish(),
    modifiers: z.array(z.any()).nullish(),
    lastRolled: z.string().nullish()
}).passthrough()

const ModsSchema = z.object({
    attributes: z.object({
        des: z.number().default(0),
        vig: z.number().default(0),
        log: z.number().default(0),
        sab: z.number().default(0),
        foc: z.number().default(0),
        car: z.number().default(0)
    }).catchall(z.number()),
    discount: z.number().default(-10)
}).passthrough()

// Itens do inventário
const BaseItemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'O nome do item é obrigatório'),
    description: z.string().nullish(),
    weight: z.number().default(0),
    value: z.number().min(0, 'O valor não pode ser negativo').default(0),
    rarity: z.string().default('Comum'),
    kind: z.string().nullish(),
    quantity: z.number().int().min(1, 'A quantidade mínima é 1').default(1)
}).passthrough()

const damageDice = z.string().default('').refine(
    value => value.trim() === '' || isDiceNotation(value),
    { message: DICE_NOTATION_MESSAGE }
)

// Munição é texto livre: o modal de arma oferece opções (Dardo, Ácido...) que o enum antigo não conhecia
const WeaponSchema = BaseItemSchema.extend({
    ammo: z.string().default('Não consome'),
    categ: text,
    range: z.string().nullish(),
    accessories: z.array(z.any()).default([]),
    bonus: text,
    hit: text,
    effect: z.object({
        effectType: z.string().nullish(),
        critChance: z.coerce.number().optional(),
        critValue: damageDice,
        value: damageDice
    }).passthrough().nullish()
})

const ArmorSchema = BaseItemSchema.extend({
    categ: text,
    displacementPenalty: z.number().default(0)
})

// `inventory.items` é só item comum: um `union` com arma e armadura fazia o item sem `ammo` acusar
// "Required" de campos que ele nem tem
const CommonItemSchema = BaseItemSchema.extend({
    effects: z.array(z.any()).nullish()
})

const MagicSchema = z.object({
    id: z.string().optional(),
    element: text,
    name: z.string().min(1, 'O nome da magia é obrigatório'),
    cost: z.coerce.number().min(0, 'O custo da magia não pode ser negativo').default(0),
    level: z.coerce.number().min(0, 'O nível da magia não pode ser negativo').default(0),
    type: text,
    execution: text,
    range: text,
    stages: z.array(z.string().nullable()).default([]),
    mastery: z.string().nullish()
}).passthrough()

// Valor e atributo base; os tetos são conferidos no schema principal (dependem do valor salvo)
const ExpertiseValueSchema = z.object({
    value: z.number().int().default(0),
    // Qualquer string: atributos de sistemas customizados (rac, tec, con...)
    defaultAttribute: z.string().nullable().optional()
}).passthrough()

const SessionInfoSchema = z.object({
    campaignCode: z.string(),
    stats: z.object({
        maxLp: z.number().min(0, 'LP máximo não pode ser negativo').optional(),
        maxMp: z.number().min(0, 'MP máximo não pode ser negativo').optional(),
        maxAp: z.number().min(0, 'AP máximo não pode ser negativo').optional(),
        lp: z.number().min(0, 'LP não pode ser negativo').optional(),
        mp: z.number().min(0, 'MP não pode ser negativo').optional(),
        ap: z.number().min(0, 'AP não pode ser negativo').optional()
    }).passthrough().optional(),
    // Vantagens que a campanha entrega: o formulário não as edita, mas não pode perdê-las
    perks: z.array(z.any()).optional()
}).passthrough()

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

const asNumber = (value: unknown): number | undefined =>
    typeof value === 'number' && Number.isFinite(value) ? value : undefined

const pointsIssue = (kind: 'atributo' | 'perícia', value: number): string =>
    value > 0
        ? `Você ainda possui ${value} ponto(s) de ${kind} para gastar`
        : `Você gastou ${Math.abs(value)} ponto(s) de ${kind} a mais`

export function buildCharsheetSchema({ mode = 'create', getBaseline }: CharsheetSchemaOptions = {}) {
    const creating = mode === 'create'

    const object = z.object({
        id: z.string().optional(),
        playerName: creating ? z.string().min(1, 'O nome do jogador é obrigatório') : z.string().optional(),
        mode: z.string().default('Classic'),
        userId: creating ? z.string().min(1, 'ID do usuário é obrigatório') : z.string().optional(),
        name: z.string().min(1, 'O nome do personagem é obrigatório'),
        // A data é definida no envio (e pelo servidor), não congelada na hora em que o módulo foi importado
        createdAt: z.string().optional(),
        systemId: z.string().nullish(),
        age: z.preprocess(
            value => (value === '' || value === null || value === undefined || (typeof value === 'number' && Number.isNaN(value))) ? 0 : value,
            z.coerce.number().int('A idade deve ser um número inteiro').min(0, 'A idade deve ser um número positivo')
        ),
        class: text,
        race: text,
        lineage: text,
        ORMLevel: z.number().int().min(0, 'Nível de ORM não pode ser negativo').default(0),
        inventory: z.object({
            items: z.array(CommonItemSchema).nullish().transform(list => list ?? []),
            weapons: z.array(WeaponSchema).nullish().transform(list => list ?? []),
            armors: z.array(ArmorSchema).nullish().transform(list => list ?? []),
            money: z.number().min(0, 'O dinheiro não pode ser negativo').default(0)
        }).passthrough(),
        displacement: z.number().min(0, 'Deslocamento não pode ser negativo').default(0),
        spellStages: z.preprocess(value => value ?? {}, z.record(z.coerce.number().int().min(1).max(3))),
        spells: z.array(MagicSchema).default([]),
        anotacoes: text,
        spellSpace: z.number().int().min(0, 'Espaço de magias não pode ser negativo').default(0),
        mpLimit: z.number().int().min(0, 'Limite de MP não pode ser negativo').default(0),
        overall: z.number().min(0, 'Overall não pode ser negativo').default(0),
        // Gênero e maestria aceitam qualquer texto (sistemas customizados)
        gender: z.preprocess(value => value || 'Não definido', z.string()),
        elementalMastery: text,
        level: z.number().int().min(0, 'Nível não pode ser negativo').default(0),
        subclass: text,
        // Opcional: sistemas customizados não usam
        financialCondition: text,
        expertises: z.record(ExpertiseValueSchema).default({}),
        traits: z.array(z.string()).default([]),
        session: z.array(SessionInfoSchema).nullish().transform(list => list ?? []),
        skills: SkillsSchema,
        points: PointsSchema,
        attributes: AttributesSchema,
        stats: StatsSchema,
        ammoCounter: AmmoCounterSchema,
        capacity: CapacitySchema.default({ cargo: 1.0, max: 5.0 }),
        passives: z.array(PassiveSchema).nullish().transform(list => list ?? []),
        status: z.array(z.union([ z.string(), StatusEntrySchema ])).nullish().transform(list => list ?? []),
        dices: z.array(DiceSchema).nullish().transform(list => list ?? []),
        mods: ModsSchema.default({
            attributes: { des: 0, vig: 0, log: 0, sab: 0, foc: 0, car: 0 },
            discount: -10
        }),
        // Recursos definidos pelo sistema (Bateria, O2, Estresse...) e o máximo pessoal de cada um
        customResources: z.preprocess(value => value ?? {}, z.record(z.number())),
        customResourceMaxes: z.preprocess(value => value ?? {}, z.record(z.number())),
        occupation: text,
        customFields: z.preprocess(value => value ?? {}, z.record(z.union([ z.string(), z.number(), z.boolean() ])))
    }).passthrough()

    return object.superRefine((data, ctx) => {
        const baseline = !creating ? getBaseline?.() : undefined
        const base = isRecord(baseline) ? baseline : {}

        // ── Campos obrigatórios do sistema padrão ────────────────
        // Classe, raça e linhagem (profissão, no modo Apocalypse) têm `*` na tela. Sistema customizado pode desligá-los, então só o padrão exige.
        if (creating && !data.systemId) {
            const required: Array<[ 'class' | 'race' | 'lineage', string ]> = [
                [ 'class', 'Escolha a classe do personagem' ],
                [ 'race', 'Escolha a raça do personagem' ],
                [ 'lineage', data.mode === 'Apocalypse' ? 'Escolha a profissão do personagem' : 'Escolha a linhagem do personagem' ]
            ]
            for (const [ key, message ] of required) {
                if (String(data[key]).trim() === '') ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [ key ] })
            }
        }

        // ── Pontos ───────────────────────────────────────────────
        const points = data.points
        const basePoints = isRecord(base['points']) ? base['points'] : {}
        if (creating) {
            // ficha nova só fecha com tudo gasto
            if (points.attributes !== 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: pointsIssue('atributo', points.attributes), path: [ 'points', 'attributes' ] })
            if (points.expertises !== 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: pointsIssue('perícia', points.expertises), path: [ 'points', 'expertises' ] })
            if (points.skills < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Pontos de habilidade não podem ser negativos', path: [ 'points', 'skills' ] })
            if (points.magics < 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Pontos de magia não podem ser negativos', path: [ 'points', 'magics' ] })
        } else {
            // ficha criada: pontos sobrando são aviso na tela. Só barra gastar mais do que tem (e só se piorou)
            const checks: Array<[ 'attributes' | 'expertises' | 'skills' | 'magics', string ]> = [
                [ 'attributes', 'Você gastou mais pontos de atributo do que possui' ],
                [ 'expertises', 'Você gastou mais pontos de perícia do que possui' ],
                [ 'skills', 'Pontos de habilidade não podem ser negativos' ],
                [ 'magics', 'Pontos de magia não podem ser negativos' ]
            ]
            for (const [ key, message ] of checks) {
                const floor = Math.min(0, asNumber(basePoints[key]) ?? 0)
                if (points[key] < floor) ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [ 'points', key ] })
            }
        }

        // ── Tetos de atributo ────────────────────────────────────
        const baseAttributes = isRecord(base['attributes']) ? base['attributes'] : {}
        for (const key of Object.keys(ATTRIBUTE_LABELS)) {
            const value = asNumber((data.attributes as Record<string, unknown>)[key])
            if (value === undefined) continue
            const cap = Math.max(ATTRIBUTE_CAP, asNumber(baseAttributes[key]) ?? 0)
            if (value > cap) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${ATTRIBUTE_LABELS[key]} deve estar entre 0 e ${ATTRIBUTE_CAP}`, path: [ 'attributes', key ] })
            }
        }

        // ── Tetos de perícia ─────────────────────────────────────
        const baseExpertises = isRecord(base['expertises']) ? base['expertises'] : {}
        for (const [ name, expertise ] of Object.entries(data.expertises)) {
            const value = expertise.value
            const baseExpertise = baseExpertises[name]
            const baseValue = isRecord(baseExpertise) ? asNumber(baseExpertise['value']) : undefined
            const max = Math.max(EXPERTISE_CAP, baseValue ?? 0)
            const min = Math.min(-EXPERTISE_CAP, baseValue ?? 0)
            if (value > max) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `O valor máximo para uma perícia é ${EXPERTISE_CAP}`, path: [ 'expertises', name, 'value' ] })
            if (value < min) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `O valor da perícia não pode ser menor que -${EXPERTISE_CAP}`, path: [ 'expertises', name, 'value' ] })
        }
    })
}

/** Schema da criação de ficha (o mais rígido). A edição usa `createCharsheetResolver` com `mode: 'edit'`. */
export const charsheetSchema = buildCharsheetSchema({ mode: 'create' })

export type CharsheetType = z.infer<typeof charsheetSchema>
