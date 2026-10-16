import { MANA_RECOVERY_SPELLS } from './data/manaRecoverySpells'
import { seedSpellBatch, type SeedSpellBatchResult } from './seedSpellBatch'

export type SeedManaRecoverySpellsResult = SeedSpellBatchResult

/** Popula o catálogo com o lote de magias de recuperação de mana (idempotente). */
export async function seedManaRecoverySpells(): Promise<SeedManaRecoverySpellsResult> {
    return await seedSpellBatch(MANA_RECOVERY_SPELLS)
}
