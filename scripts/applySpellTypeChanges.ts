/**
 * Troca o `type` das magias que recuperam mana (categoria "Recuperação"), conforme `data/manaRecoveryTypes.ts`.
 * Só o campo `type` é tocado; o resto do documento fica como está.
 *
 * ESCREVE NO BANCO, por isso é seguro por padrão:
 *   (sem flags)    simulação: lista o que trocaria, o que já está trocado e o que não dá para trocar
 *   --apply        grava. Cada magia é relida numa transação e só é trocada se o `type` ainda for o antigo (se alguém
 *                  editou a magia no meio, ela é pulada e aparece em "conflitos"). Rodar de novo não faz mal
 *   --backup F     com --apply, guarda em F as trocas feitas (padrão: arquivo na pasta temporária); serve para desfazer
 *   --revert F     desfaz as trocas guardadas em F (só nas magias que ainda estão com o `type` novo)
 *
 * Rodar (precisa de NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY; para testar
 * contra o emulador, defina FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/applySpellTypeChanges.ts [--apply [--backup arquivo.json]] [--revert arquivo.json]
 */
import admin from 'firebase-admin'
import { readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { initFirebaseAdmin } from '../utils/initializeFireOrm'
import { invertSpellTypeChanges, planSpellTypeChanges, type SpellTypeChange, type SpellTypePlan } from '../utils/spellTypeChanges'
import { MANA_RECOVERY_TYPE_CHANGES } from './data/manaRecoveryTypes'

export interface ApplySpellTypeOptions {
    apply?: boolean
    /** Trocas a aplicar (padrão: as de Recuperação) */
    changes?: SpellTypeChange[]
    /** O campo da magia que as trocas mexem: `type` (padrão) ou `name` (renomear, `scripts/applySpellRenames.ts`). Só ele é lido e gravado */
    field?: 'type' | 'name'
}

export interface ApplySpellTypeReport {
    plan: SpellTypePlan
    /** Trocas gravadas (só com `apply`) */
    applied: SpellTypeChange[]
    /** Puladas porque o `type` mudou entre a leitura e a gravação (só com `apply`) */
    skipped: SpellTypeChange[]
}

export async function applySpellTypeChanges({ apply = false, changes = MANA_RECOVERY_TYPE_CHANGES, field = 'type' }: ApplySpellTypeOptions = {}): Promise<ApplySpellTypeReport> {
    initFirebaseAdmin()
    const db = admin.firestore()
    const collection = db.collection('spells')

    // O Firestore limita a leitura em lote; vai em fatias
    const snapshots: admin.firestore.DocumentSnapshot[] = []
    for (let start = 0; start < changes.length; start += 300) {
        snapshots.push(...await db.getAll(...changes.slice(start, start + 300).map(change => collection.doc(change.id))))
    }
    const currentTypes = new Map<string, string | undefined>(
        snapshots.filter(snapshot => snapshot.exists).map(snapshot => [ snapshot.id, (snapshot.data() as Record<string, string | undefined>)[field] ])
    )

    const plan = planSpellTypeChanges(changes, currentTypes)
    const report: ApplySpellTypeReport = { plan, applied: [], skipped: [] }
    if (!apply) return report

    for (const change of plan.update) {
        const ref = collection.doc(change.id)
        const done = await db.runTransaction(async (transaction) => {
            const current = (await transaction.get(ref)).data() as Record<string, string | undefined> | undefined
            if (current?.[field] !== change.from) return false
            transaction.update(ref, { [field]: change.to })
            return true
        })
        ;(done ? report.applied : report.skipped).push(change)
    }

    return report
}

export function printReport(report: ApplySpellTypeReport, apply: boolean, field: 'type' | 'name' = 'type'): void {
    const { plan } = report
    const row = (change: SpellTypeChange): { magia: string; de: string; para: string } => ({ magia: field === 'name' ? change.id : change.name, de: change.from, para: change.to })

    if (plan.update.length > 0) {
        console.log(apply ? 'Trocadas:' : 'Seriam trocadas:')
        console.table((apply ? report.applied : plan.update).map(row))
    }
    const counts = [
        `${apply ? report.applied.length : plan.update.length} ${apply ? 'trocada(s)' : 'a trocar'}`,
        `${plan.already.length} já trocada(s)`,
        `${plan.conflicts.length} em conflito`,
        `${plan.missing.length} inexistente(s)`,
        `${report.skipped.length} pulada(s) no meio da gravação`
    ]
    console.log(counts.join(' · '))
    plan.conflicts.forEach(change => console.log(`  CONFLITO ${change.name}: o ${field} agora é "${change.current}" (esperado "${change.from}" ou "${change.to}"); não foi mexida`))
    plan.missing.forEach(change => console.log(`  INEXISTENTE ${change.name} (${change.id})`))
}

export function valueOf(argv: string[], flag: string): string | undefined {
    const index = argv.indexOf(flag)
    return index >= 0 ? argv[index + 1] : undefined
}

if (require.main === module) {
    const argv = process.argv.slice(2)
    const apply = argv.includes('--apply')
    const revertFile = valueOf(argv, '--revert')

    const changes = revertFile
        ? invertSpellTypeChanges(JSON.parse(readFileSync(revertFile, 'utf8')) as SpellTypeChange[])
        : MANA_RECOVERY_TYPE_CHANGES

    console.log(apply ? 'Gravando no banco.' : 'Simulação: nada será gravado. Use --apply para gravar.')

    applySpellTypeChanges({ apply, changes })
        .then((report) => {
            printReport(report, apply)

            if (apply && !revertFile && report.applied.length > 0) {
                const backupFile = valueOf(argv, '--backup') ?? join(tmpdir(), `spell-types-backup-${Date.now()}.json`)
                writeFileSync(backupFile, JSON.stringify(report.applied, null, 2), { mode: 0o600 })
                console.log(`Trocas feitas guardadas em ${backupFile} (para desfazer: --revert ${backupFile} --apply)`)
            }
            process.exit(0)
        })
        .catch((error: unknown) => {
            console.error('Erro ao trocar os tipos:', error)
            process.exit(1)
        })
}
