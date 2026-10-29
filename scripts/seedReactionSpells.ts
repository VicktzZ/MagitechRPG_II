import { REACTION_SPELLS } from './data/reactionSpells'
import { seedSpellBatch, type SeedSpellBatchResult } from './seedSpellBatch'

export type SeedReactionSpellsResult = SeedSpellBatchResult

/** Popula o catálogo com o lote de magias de reação (idempotente). */
export async function seedReactionSpells(): Promise<SeedReactionSpellsResult> {
    return await seedSpellBatch(REACTION_SPELLS)
}
