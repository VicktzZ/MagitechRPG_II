/** Uma troca de `type` de uma magia do catálogo (`from` é o `type` esperado hoje no banco; só troca se for esse) */
export interface SpellTypeChange {
    id: string
    name: string
    from: string
    to: string
}

export interface SpellTypePlan {
    /** `type` ainda é o antigo: pode trocar */
    update: SpellTypeChange[]
    /** `type` já é o novo: nada a fazer (rodar de novo não faz mal) */
    already: SpellTypeChange[]
    /** `type` é outro texto (alguém editou a magia): não mexe e avisa */
    conflicts: Array<SpellTypeChange & { current: string }>
    /** a magia não existe mais no catálogo */
    missing: SpellTypeChange[]
}

/**
 * Decide, para cada troca de `type`, o que fazer olhando o `type` que a magia tem agora.
 * Pura: quem chama lê o banco e entrega `currentTypes` (id → type; id ausente = magia inexistente).
 */
export function planSpellTypeChanges(changes: SpellTypeChange[], currentTypes: ReadonlyMap<string, string | undefined>): SpellTypePlan {
    const plan: SpellTypePlan = { update: [], already: [], conflicts: [], missing: [] }

    for (const change of changes) {
        if (!currentTypes.has(change.id)) {
            plan.missing.push(change)
            continue
        }

        const current = currentTypes.get(change.id) ?? ''
        if (current === change.from) plan.update.push(change)
        else if (current === change.to) plan.already.push(change)
        else plan.conflicts.push({ ...change, current })
    }

    return plan
}

/** Desfaz as trocas: o mesmo plano com `from` e `to` invertidos */
export function invertSpellTypeChanges(changes: SpellTypeChange[]): SpellTypeChange[] {
    return changes.map(change => ({ ...change, from: change.to, to: change.from }))
}
