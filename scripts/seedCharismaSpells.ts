import { CHARISMA_SPELLS } from './data/charismaSpells'
import { seedSpellBatch, type SeedSpellBatchResult } from './seedSpellBatch'

export type SeedCharismaSpellsResult = SeedSpellBatchResult

/** Popula o catálogo com o lote de magias de Carisma (idempotente). */
export async function seedCharismaSpells(): Promise<SeedCharismaSpellsResult> {
    return await seedSpellBatch(CHARISMA_SPELLS)
}
