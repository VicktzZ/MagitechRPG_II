/**
 * Cria no catálogo um lote de magias NOVAS (`data/utilitySupportMovementSpells.ts`: 10 Utilidade, 10 Suporte, 10 Movimento).
 * Diferente de `seedSpellBatch` (que sobrescreve por id), este script só CRIA: nunca altera uma magia que já existe.
 *
 * ESCREVE NO BANCO, por isso é seguro por padrão:
 *   (sem flags)    simulação: lê o catálogo, confere colisões de id e de nome e diz o que criaria
 *   --apply        grava. Aborta SEM gravar nada se algum id ou nome já existir (ou se o lote repetir algum). Cada magia é criada numa
 *                  transação que falha se o documento já existir (corrida com outra gravação), e depois TODAS são relidas e comparadas campo a campo
 *   --batch NOME   qual lote (padrão: utility-support-movement)
 *   --backup F     com --apply, guarda em F os ids criados (padrão: arquivo na pasta temporária); serve para desfazer
 *   --revert F     apaga as magias criadas e guardadas em F. Só apaga o documento cujo nome ainda é o gravado, e é para fazer ANTES de alguém aprender a magia
 *                  (a ficha guarda a magia por id: apagar uma magia que já está numa ficha a deixa sem texto)
 *
 * Rodar (precisa de NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY; para testar contra o emulador, defina FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/createSpellBatch.ts [--apply [--backup arquivo.json]] [--revert arquivo.json --apply]
 */
import admin from 'firebase-admin'
import { readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { initFirebaseAdmin } from '../utils/initializeFireOrm'
import { planSpellBatch, type SpellBatchPlan } from '../utils/spellBatchPlan'
import type { SeedSpell } from './data/manaRecoverySpells'
import { UTILITY_SUPPORT_MOVEMENT_SPELLS } from './data/utilitySupportMovementSpells'

export const SPELL_BATCHES: Record<string, SeedSpell[]> = {
    'utility-support-movement': UTILITY_SUPPORT_MOVEMENT_SPELLS
}

export interface CreateSpellBatchReport {
    plan: SpellBatchPlan<SeedSpell>
    /** Ids criados (só com `apply`) */
    created: Array<{ id: string; name: string }>
    /** Ids que a conferência final achou diferentes do lote (só com `apply`): deve ser vazio */
    mismatches: string[]
    /** Total de magias no catálogo antes e depois (só `after` com `apply`) */
    catalogSize: { before: number; after?: number }
}

/** O documento como o catálogo guarda (os mesmos campos de `Spell`, sem nada a mais) */
export const spellDocument = (spell: SeedSpell): Record<string, unknown> => ({
    id: spell.id,
    element: spell.element,
    name: spell.name,
    level: spell.level,
    mpCost: spell.mpCost,
    type: spell.type,
    execution: spell.execution,
    range: spell.range,
    stages: [ ...spell.stages ]
})

const sameDocument = (stored: Record<string, unknown> | undefined, expected: Record<string, unknown>): boolean =>
    stored !== undefined && Object.keys(expected).every(key => JSON.stringify(stored[key]) === JSON.stringify(expected[key]))

export async function createSpellBatch({ apply = false, batch = UTILITY_SUPPORT_MOVEMENT_SPELLS }: { apply?: boolean; batch?: SeedSpell[] } = {}): Promise<CreateSpellBatchReport> {
    initFirebaseAdmin()
    const db = admin.firestore()
    const collection = db.collection('spells')

    const snapshot = await collection.select('id', 'name').get()
    const existing = snapshot.docs.map(doc => ({ id: doc.id, name: String((doc.data() as { name?: unknown }).name ?? '') }))
    const plan = planSpellBatch(batch, existing)
    const report: CreateSpellBatchReport = { plan, created: [], mismatches: [], catalogSize: { before: existing.length } }
    if (!apply || !plan.ok) return report

    for (const spell of batch) {
        const ref = collection.doc(spell.id)
        await db.runTransaction(async (transaction) => {
            // `create` falha se o documento existir: ninguém sobrescreve nada
            transaction.create(ref, spellDocument(spell))
        })
        report.created.push({ id: spell.id, name: spell.name })
    }

    // Releitura: cada documento criado tem de estar igual ao lote
    const stored = await db.getAll(...batch.map(spell => collection.doc(spell.id)))
    stored.forEach((doc, index) => {
        const spell = batch[index]
        if (spell && !sameDocument(doc.data(), spellDocument(spell))) report.mismatches.push(spell.id)
    })
    report.catalogSize.after = (await collection.select('id').get()).size
    return report
}

/** Apaga as magias de um backup, só se o nome ainda for o gravado. Devolve o que apagou e o que pulou */
export async function revertSpellBatch(created: Array<{ id: string; name: string }>, apply: boolean): Promise<{ deleted: string[]; skipped: string[] }> {
    initFirebaseAdmin()
    const db = admin.firestore()
    const collection = db.collection('spells')
    const result = { deleted: [] as string[], skipped: [] as string[] }

    for (const entry of created) {
        const ref = collection.doc(entry.id)
        const done = await db.runTransaction(async (transaction) => {
            const current = (await transaction.get(ref)).data() as { name?: string } | undefined
            if (current?.name !== entry.name) return false
            if (apply) transaction.delete(ref)
            return true
        })
        ;(done ? result.deleted : result.skipped).push(entry.id)
    }
    return result
}

export function printReport(report: CreateSpellBatchReport, apply: boolean): void {
    const { plan } = report
    console.log(`Catálogo antes: ${report.catalogSize.before} magias.`)
    if (plan.idCollisions.length > 0) { console.log('Colisão de ID (já existe):'); console.table(plan.idCollisions) }
    if (plan.nameCollisions.length > 0) { console.log('Colisão de NOME (já existe em outro id):'); console.table(plan.nameCollisions) }
    if (plan.duplicatesInBatch.length > 0) console.log('Repetido dentro do lote:', plan.duplicatesInBatch.join('; '))
    if (!plan.ok) {
        console.log('ABORTADO: nada foi gravado.')
        return
    }
    console.log(apply ? `Criadas (${report.created.length}):` : `Seriam criadas (${plan.create.length}):`)
    console.table((apply ? report.created : plan.create).map(spell => ({ id: spell.id, nome: spell.name })))
    if (apply) {
        console.log(report.mismatches.length === 0 ? 'Releitura conferida: todos os documentos são iguais ao lote.' : `DIVERGÊNCIA na releitura: ${report.mismatches.join(', ')}`)
        console.log(`Catálogo depois: ${report.catalogSize.after} magias.`)
    }
}

const valueOf = (argv: string[], flag: string): string | undefined => {
    const index = argv.indexOf(flag)
    return index >= 0 ? argv[index + 1] : undefined
}

if (require.main === module) {
    const argv = process.argv.slice(2)
    const apply = argv.includes('--apply')
    const revertFile = valueOf(argv, '--revert')
    const batchName = valueOf(argv, '--batch') ?? 'utility-support-movement'
    const batch = SPELL_BATCHES[batchName]

    const run = async (): Promise<void> => {
        if (revertFile) {
            const created = JSON.parse(readFileSync(revertFile, 'utf8')) as Array<{ id: string; name: string }>
            console.log(apply ? 'Apagando no banco.' : 'Simulação: nada será apagado. Use --apply para apagar.')
            const result = await revertSpellBatch(created, apply)
            console.log(`${apply ? 'Apagadas' : 'Seriam apagadas'}: ${result.deleted.length}; puladas (nome mudou ou já não existem): ${result.skipped.length}`)
            return
        }
        if (!batch) throw new Error(`Lote desconhecido: ${batchName}. Disponíveis: ${Object.keys(SPELL_BATCHES).join(', ')}`)
        console.log(apply ? 'Gravando no banco.' : 'Simulação: nada será gravado. Use --apply para gravar.')
        const report = await createSpellBatch({ apply, batch })
        printReport(report, apply)

        if (apply && report.plan.ok && report.created.length > 0) {
            const backupFile = valueOf(argv, '--backup') ?? join(tmpdir(), `spell-batch-${batchName}-${Date.now()}.json`)
            writeFileSync(backupFile, JSON.stringify(report.created, null, 2), { mode: 0o600 })
            console.log(`Ids criados guardados em ${backupFile} (para desfazer: --revert ${backupFile} --apply)`)
        }
        if (!report.plan.ok || report.mismatches.length > 0) process.exitCode = 1
    }

    run()
        .then(() => process.exit(process.exitCode ?? 0))
        .catch((error: unknown) => {
            console.error('Erro ao criar o lote de magias:', error)
            process.exit(1)
        })
}
