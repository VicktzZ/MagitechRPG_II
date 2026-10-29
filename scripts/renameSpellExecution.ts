/**
 * Troca a execução "Livre" das magias do catálogo por "Bônus" (regra do combate: o antigo "Livre" é a ação Bônus). Só o campo `execution`
 * é tocado, e só nas magias em que ele é "Livre" (qualquer caixa); o resto do documento fica como está.
 *
 * ESCREVE NO BANCO, por isso é seguro por padrão:
 *   (sem flags)    simulação: lista o que trocaria
 *   --apply        grava. Cada magia é relida numa transação e só é trocada se a `execution` ainda for a que foi lida (se alguém editou a
 *                  magia no meio, ela é pulada). Rodar de novo não faz mal: o que já é "Bônus" não aparece
 *   --backup F     com --apply, guarda em F as trocas feitas (padrão: arquivo na pasta temporária); serve para desfazer
 *   --revert F     desfaz as trocas guardadas em F (só nas magias que ainda estão com "Bônus")
 *
 * O app aceita "Livre" e "Bônus" como a mesma execução (`getSpellExecution`, `executionSlot`), então esta troca pode rodar antes ou depois do código.
 *
 * Rodar (precisa de NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY; para testar contra o emulador, defina
 * FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/renameSpellExecution.ts [--apply [--backup arquivo.json]] [--revert arquivo.json]
 */
import admin from 'firebase-admin'
import { readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { initFirebaseAdmin } from '../utils/initializeFireOrm'
import { invertSpellTypeChanges, planSpellTypeChanges, type SpellTypeChange, type SpellTypePlan } from '../utils/spellTypeChanges'

export const OLD_EXECUTION = 'livre'
export const NEW_EXECUTION = 'Bônus'

export interface RenameExecutionOptions {
    apply?: boolean
    /** Trocas a aplicar (padrão: todas as magias com "Livre" no banco agora); `from`/`to` são os textos de `execution` */
    changes?: SpellTypeChange[]
}

export interface RenameExecutionReport {
    plan: SpellTypePlan
    /** Trocas gravadas (só com `apply`) */
    applied: SpellTypeChange[]
    /** Puladas porque a `execution` mudou entre a leitura e a gravação (só com `apply`) */
    skipped: SpellTypeChange[]
}

/** As magias do catálogo cuja execução é "Livre" (qualquer caixa e espaços), como trocas para "Bônus" */
export async function findLivreChanges(): Promise<SpellTypeChange[]> {
    initFirebaseAdmin()
    const snapshot = await admin.firestore().collection('spells').select('name', 'execution').get()

    return snapshot.docs
        .map(doc => ({ id: doc.id, name: String(doc.get('name') ?? doc.id), from: doc.get('execution') as unknown }))
        .filter((spell): spell is { id: string; name: string; from: string } => typeof spell.from === 'string' && spell.from.trim().toLowerCase() === OLD_EXECUTION)
        .map(spell => ({ ...spell, to: NEW_EXECUTION }))
}

export async function renameSpellExecution({ apply = false, changes }: RenameExecutionOptions = {}): Promise<RenameExecutionReport> {
    const wanted = changes ?? await findLivreChanges()
    initFirebaseAdmin()
    const db = admin.firestore()
    const collection = db.collection('spells')

    const snapshots = wanted.length > 0 ? await db.getAll(...wanted.map(change => collection.doc(change.id))) : []
    const current = new Map<string, string | undefined>(
        snapshots.filter(snapshot => snapshot.exists).map(snapshot => [ snapshot.id, (snapshot.data() as { execution?: string }).execution ])
    )

    const plan = planSpellTypeChanges(wanted, current)
    const report: RenameExecutionReport = { plan, applied: [], skipped: [] }
    if (!apply) return report

    for (const change of plan.update) {
        const ref = collection.doc(change.id)
        const done = await db.runTransaction(async (transaction) => {
            const data = (await transaction.get(ref)).data() as { execution?: string } | undefined
            if (data?.execution !== change.from) return false
            transaction.update(ref, { execution: change.to })
            return true
        })
        ;(done ? report.applied : report.skipped).push(change)
    }

    return report
}

function printReport(report: RenameExecutionReport, apply: boolean): void {
    const { plan } = report
    const row = (change: SpellTypeChange): { magia: string; de: string; para: string } => ({ magia: change.name, de: change.from, para: change.to })

    if (plan.update.length > 0) {
        console.log(apply ? 'Trocadas:' : 'Seriam trocadas:')
        console.table((apply ? report.applied : plan.update).map(row))
    }
    console.log([
        `${apply ? report.applied.length : plan.update.length} ${apply ? 'trocada(s)' : 'a trocar'}`,
        `${plan.already.length} já trocada(s)`,
        `${plan.conflicts.length} em conflito`,
        `${plan.missing.length} inexistente(s)`,
        `${report.skipped.length} pulada(s) no meio da gravação`
    ].join(' · '))
    plan.conflicts.forEach(change => console.log(`  CONFLITO ${change.name}: a execução agora é "${change.current}" (esperado "${change.from}" ou "${change.to}"); não foi mexida`))
    plan.missing.forEach(change => console.log(`  INEXISTENTE ${change.name} (${change.id})`))
}

function valueOf(argv: string[], flag: string): string | undefined {
    const index = argv.indexOf(flag)
    return index >= 0 ? argv[index + 1] : undefined
}

if (require.main === module) {
    const argv = process.argv.slice(2)
    const apply = argv.includes('--apply')
    const revertFile = valueOf(argv, '--revert')

    const changes = revertFile ? invertSpellTypeChanges(JSON.parse(readFileSync(revertFile, 'utf8')) as SpellTypeChange[]) : undefined

    console.log(apply ? 'Gravando no banco.' : 'Simulação: nada será gravado. Use --apply para gravar.')

    renameSpellExecution({ apply, changes })
        .then((report) => {
            printReport(report, apply)

            if (apply && !revertFile && report.applied.length > 0) {
                const backupFile = valueOf(argv, '--backup') ?? join(tmpdir(), `spell-execution-backup-${Date.now()}.json`)
                writeFileSync(backupFile, JSON.stringify(report.applied, null, 2), { mode: 0o600 })
                console.log(`Trocas feitas guardadas em ${backupFile} (para desfazer: --revert ${backupFile} --apply)`)
            }
            process.exit(0)
        })
        .catch((error: unknown) => {
            console.error('Erro ao trocar a execução:', error)
            process.exit(1)
        })
}
