import { Spell } from '@models/entities'
import type { Element, RangeType } from '@models/types/string'
import { spellRepository } from '@repositories'
import type { SeedSpell } from './data/manaRecoverySpells'

export interface SeedSpellBatchResult {
    created: number
    updated: number
    total: number
    spells: Array<{ id: string; name: string; action: 'created' | 'updated' }>
}

/**
 * Grava um lote de magias no catálogo.
 *
 * Idempotente: os IDs são fixos, então rodar de novo NÃO duplica — as magias que já
 * existem são sobrescritas com a versão do código.
 */
export async function seedSpellBatch(batch: SeedSpell[]): Promise<SeedSpellBatchResult> {
    const result: SeedSpellBatchResult = {
        created: 0,
        updated: 0,
        total: batch.length,
        spells: []
    }

    for (const def of batch) {
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
