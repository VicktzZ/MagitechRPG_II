/**
 * Limite de MP por turno.
 *
 * Um personagem só pode gastar em magias, em cada rodada de combate (o gasto zera quando
 * a rodada vira, ou seja, quando todos os presentes passaram o turno), até:
 *
 *     ⌈(Nível + Foco) ÷ 2⌉ + Nível de ORM   (+ bônus de perks/mestre)
 *
 * É independente do MP máximo: o MP máximo continua sendo o teto total, e o limite
 * só impede despejar o pool inteiro em um único turno. Fora do combate não há limite.
 */

export interface MpLimitSheet {
    level?: number | null
    ORMLevel?: number | null
    /** Bônus ao limite por turno (perks/mestre) — o valor base é calculado, não salvo */
    mpLimit?: number | null
    attributes?: { foc?: number | null } | null
    /** Fichas de sistemas customizados não usam Foco/ORM */
    systemId?: string | null
}

const toInt = (value: unknown): number => {
    const n = Number(value)
    return Number.isFinite(n) ? Math.floor(n) : 0
}

/** Parte calculada do limite: ⌈(Nível + Foco) ÷ 2⌉ + Nível de ORM */
export function calculateBaseMpLimit(level: unknown, foc: unknown, ormLevel: unknown): number {
    const lvl = Math.max(0, toInt(level))
    const focus = Math.max(0, toInt(foc))
    const orm = Math.max(0, toInt(ormLevel))
    return Math.ceil((lvl + focus) / 2) + orm
}

/** Limite total por turno: parte calculada + bônus (`mpLimit`) */
export function getMpLimit(sheet: MpLimitSheet): number {
    const base = calculateBaseMpLimit(sheet.level, sheet.attributes?.foc, sheet.ORMLevel)
    return base + Math.max(0, toInt(sheet.mpLimit))
}

/**
 * Se o limite vale para esta ficha. Não vale no Roguelite (fichas nascem com nível,
 * ORM e Foco zerados), em sistemas customizados, nem em fichas ainda sem nível/ORM
 * (o cálculo daria 0 e bloquearia qualquer magia).
 */
export function isMpLimitEnforced(sheet: MpLimitSheet, campaignMode?: string | null): boolean {
    if (campaignMode === 'Roguelite') return false
    if (sheet.systemId) return false
    return calculateBaseMpLimit(sheet.level, sheet.attributes?.foc, sheet.ORMLevel) > 0
}

export interface MpSpendInput {
    /** MP já gasto nesta rodada */
    spent: number
    /** MP desta conjuração; negativo estorna (conjuração que falhou) */
    amount: number
    limit: number
    enforced: boolean
    /** Liberado pelo mestre até a rodada virar */
    override?: boolean
}

export type MpSpendResult =
    | { allowed: true; spent: number }
    | { allowed: false; spent: number; limit: number; message: string }

export function formatMpLimitExceeded(spent: number, amount: number, limit: number): string {
    const remaining = Math.max(0, limit - spent)
    return `Limite de MP por turno excedido: você já gastou ${spent} de ${limit} MP (restam ${remaining}) e esta conjuração custa ${amount} MP.`
}

/**
 * Decide se uma conjuração cabe no limite. Conta o gasto bruto: recuperar MP durante
 * o turno NÃO devolve limite (evita loops com magias de recuperação).
 */
export function evaluateMpSpend({ spent, amount, limit, enforced, override = false }: MpSpendInput): MpSpendResult {
    const current = Math.max(0, toInt(spent))
    const cost = toInt(amount)

    if (cost < 0) {
        return { allowed: true, spent: Math.max(0, current + cost) }
    }

    if (enforced && !override && current + cost > limit) {
        return { allowed: false, spent: current, limit, message: formatMpLimitExceeded(current, cost, limit) }
    }

    return { allowed: true, spent: current + cost }
}
