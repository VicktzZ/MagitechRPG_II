import { Spell } from '@models/entities'
import type { Element, RangeType } from '@models/types/string'
import { spellRepository } from '@repositories'
import { MANA_RECOVERY_SPELLS } from './data/manaRecoverySpells'

export interface SeedManaRecoverySpellsResult {
    created: number
    updated: number
    total: number
    spells: Array<{ id: string; name: string; action: 'created' | 'updated' }>
}

/**
 * Popula o catálogo de magias com o lote de recuperação de mana.
 *
 * Idempotente: os IDs são fixos, então rodar de novo NÃO duplica — as magias
 * que já existem são sobrescritas com a versão deste código.
 */
export async function seedManaRecoverySpells(): Promise<SeedManaRecoverySpellsResult> {
    const result: SeedManaRecoverySpellsResult = {
        created: 0,
        updated: 0,
        total: MANA_RECOVERY_SPELLS.length,
        spells: []
    }

    for (const def of MANA_RECOVERY_SPELLS) {
        const entity = new Spell({
            ...def,
            // O banco guarda elemento em maiúsculas e alcance abreviado ("Curto"); os tipos
            // `Element`/`RangeType` são só nominais e não refletem esse formato
            element: def.element as unknown as Element,
            range: def.range as unknown as RangeType,
            stages: [ ...def.stages ]
        })

        const existing = await spellRepository.findById(def.id)

        if (existing) {
            await spellRepository.update(entity)
            result.updated++
            result.spells.push({ id: def.id, name: def.name, action: 'updated' })
        } else {
            await spellRepository.create(entity)
            result.created++
            result.spells.push({ id: def.id, name: def.name, action: 'created' })
        }
    }

    return result
}
