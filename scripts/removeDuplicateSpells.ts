/**
 * Apaga do catálogo as magias repetidas de `data/spellCatalogFixes.ts` (`DUPLICATE_SPELLS`: hoje, Magnetismo, que existia duas vezes com o texto idêntico).
 *
 * APAGA NO BANCO, por isso é seguro por padrão:
 *   (sem flags)    simulação: diz o que apagaria e o que impede
 *   --apply        apaga. Para cada par, numa transação: as duas magias têm de existir e ser IDÊNTICAS (menos o id); e nenhuma ficha ou campanha pode mencionar
 *                  o id a apagar (a ficha guarda a magia por id: apagar uma magia em uso a deixaria sem texto). Se algo não bate, o par é pulado e explicado
 *   --backup F     com --apply, guarda em F o documento inteiro que foi apagado (padrão: arquivo na pasta temporária)
 *   --revert F     recria os documentos guardados em F (não sobrescreve: se o id já existe, pula)
 *
 * Rodar (precisa de NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY; para testar contra o emulador, defina FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/removeDuplicateSpells.ts [--apply [--backup arquivo.json]] [--revert arquivo.json --apply]
 */
import admin from 'firebase-admin'
import { readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { initFirebaseAdmin } from '../utils/initializeFireOrm'
import { valueOf } from './applySpellTypeChanges'
import { DUPLICATE_SPELLS, type DuplicateSpell } from './data/spellCatalogFixes'

export interface DuplicateOutcome {
    status: 'removed' | 'would-remove' | 'already-removed' | 'blocked'
    duplicate: DuplicateSpell
    /** Por que está bloqueada (só em `blocked`) */
    reason?: string
}

export interface RemoveDuplicatesReport {
    outcomes: DuplicateOutcome[]
    /** Documentos apagados, inteiros (para o backup) */
    deleted: Array<Record<string, unknown>>
}

type Doc = Record<string, unknown>

/** Os dois conteúdos são iguais, sem olhar o id? */
export const sameSpellContent = (a: Doc, b: Doc): boolean => JSON.stringify({ ...a, id: null }) === JSON.stringify({ ...b, id: null })

/** Onde o id é mencionado fora do catálogo (fichas e campanhas, qualquer campo). Vazio = ninguém usa */
async function findReferences(db: admin.firestore.Firestore, id: string): Promise<string[]> {
    const found: string[] = []
    for (const collection of [ 'charsheets', 'campaigns' ]) {
        const snapshot = await db.collection(collection).get()
        snapshot.docs.filter(doc => JSON.stringify(doc.data()).includes(id)).forEach(doc => found.push(`${collection}/${doc.id}`))
    }
    return found
}

export async function removeDuplicateSpells({ apply = false, duplicates = DUPLICATE_SPELLS }: { apply?: boolean; duplicates?: DuplicateSpell[] } = {}): Promise<RemoveDuplicatesReport> {
    initFirebaseAdmin()
    const db = admin.firestore()
    const collection = db.collection('spells')
    const report: RemoveDuplicatesReport = { outcomes: [], deleted: [] }

    for (const duplicate of duplicates) {
        const [ removeSnap, keepSnap ] = await db.getAll(collection.doc(duplicate.remove), collection.doc(duplicate.keep))
        if (!removeSnap.exists) {
            report.outcomes.push({ status: 'already-removed', duplicate })
            continue
        }
        if (!keepSnap.exists) {
            report.outcomes.push({ status: 'blocked', duplicate, reason: `a magia que ficaria (${duplicate.keep}) não existe: apagar a outra deixaria o catálogo sem ela` })
            continue
        }
        if (!sameSpellContent(removeSnap.data() as Doc, keepSnap.data() as Doc)) {
            report.outcomes.push({ status: 'blocked', duplicate, reason: 'o conteúdo das duas magias é diferente (alguém editou uma delas): apague à mão a que não serve' })
            continue
        }
        const references = await findReferences(db, duplicate.remove)
        if (references.length > 0) {
            report.outcomes.push({ status: 'blocked', duplicate, reason: `o id a apagar é usado em: ${references.join(', ')}` })
            continue
        }
        if (!apply) {
            report.outcomes.push({ status: 'would-remove', duplicate })
            continue
        }

        // Relê as duas dentro da transação: se mudaram desde a conferência, não apaga
        const deleted = await db.runTransaction(async (transaction) => {
            const [ toRemove, toKeep ] = await Promise.all([ transaction.get(collection.doc(duplicate.remove)), transaction.get(collection.doc(duplicate.keep)) ])
            if (!toRemove.exists || !toKeep.exists || !sameSpellContent(toRemove.data() as Doc, toKeep.data() as Doc)) return undefined
            transaction.delete(toRemove.ref)
            return { ...(toRemove.data() as Doc), id: toRemove.id }
        })
        if (deleted) {
            report.deleted.push(deleted)
            report.outcomes.push({ status: 'removed', duplicate })
        } else {
            report.outcomes.push({ status: 'blocked', duplicate, reason: 'as magias mudaram durante a gravação: nada foi apagado' })
        }
    }

    return report
}

/** Recria os documentos de um backup. Não sobrescreve nada: id que já existe é pulado */
export async function restoreRemovedSpells(documents: Doc[], apply: boolean): Promise<{ restored: string[]; skipped: string[] }> {
    initFirebaseAdmin()
    const db = admin.firestore()
    const collection = db.collection('spells')
    const result = { restored: [] as string[], skipped: [] as string[] }

    for (const document of documents) {
        const id = String(document['id'])
        const ref = collection.doc(id)
        const done = await db.runTransaction(async (transaction) => {
            if ((await transaction.get(ref)).exists) return false
            if (apply) transaction.create(ref, document)
            return true
        })
        ;(done ? result.restored : result.skipped).push(id)
    }
    return result
}

export function printReport(report: RemoveDuplicatesReport, apply: boolean): void {
    for (const outcome of report.outcomes) {
        const { duplicate } = outcome
        const line = `${duplicate.name}: apagar ${duplicate.remove}, manter ${duplicate.keep}`
        if (outcome.status === 'removed') console.log(`APAGADA   ${line}`)
        else if (outcome.status === 'would-remove') console.log(`SERIA APAGADA   ${line}`)
        else if (outcome.status === 'already-removed') console.log(`JÁ NÃO EXISTE   ${line}`)
        else console.log(`BLOQUEADA   ${line}\n            motivo: ${outcome.reason ?? 'sem motivo informado'}`)
    }
    if (!apply) console.log('Simulação: nada foi apagado. Use --apply para apagar.')
}

if (require.main === module) {
    const argv = process.argv.slice(2)
    const apply = argv.includes('--apply')
    const revertFile = valueOf(argv, '--revert')

    const run = async (): Promise<void> => {
        if (revertFile) {
            const documents = JSON.parse(readFileSync(revertFile, 'utf8')) as Doc[]
            console.log(apply ? 'Recriando no banco.' : 'Simulação: nada será recriado. Use --apply para recriar.')
            const result = await restoreRemovedSpells(documents, apply)
            console.log(`${apply ? 'Recriadas' : 'Seriam recriadas'}: ${result.restored.length}; puladas (o id já existe): ${result.skipped.length}`)
            return
        }
        console.log(apply ? 'Apagando no banco.' : 'Simulação: nada será apagado. Use --apply para apagar.')
        const report = await removeDuplicateSpells({ apply })
        printReport(report, apply)
        if (apply && report.deleted.length > 0) {
            const backupFile = valueOf(argv, '--backup') ?? join(tmpdir(), `spell-duplicates-backup-${Date.now()}.json`)
            writeFileSync(backupFile, JSON.stringify(report.deleted, null, 2), { mode: 0o600 })
            console.log(`Documentos apagados guardados em ${backupFile} (para recriar: --revert ${backupFile} --apply)`)
        }
        if (report.outcomes.some(outcome => outcome.status === 'blocked')) process.exitCode = 1
    }

    run()
        .then(() => process.exit(process.exitCode ?? 0))
        .catch((error: unknown) => {
            console.error('Erro ao remover as magias repetidas:', error)
            process.exit(1)
        })
}
