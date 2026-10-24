/**
 * Corrige o FORMATO das fichas antigas no banco (listas gravadas como objeto de chaves numéricas,
 * `elementalMastery`/`anotacoes` nulos, perícias soltas, armas sem munição...), com a mesma função que a
 * tela usa ao abrir a ficha (`normalizeCharsheet`). Não muda nenhum valor escolhido pelo jogador e não apaga nada
 * (nem item sem nome). A tela já funciona sem esta migração; ela só deixa o banco no formato que o app espera.
 *
 * ESCREVE NO BANCO, por isso é seguro por padrão:
 *   (sem flags)   simulação: lista, por caminho, quantas fichas mudariam (não imprime nome nem conteúdo)
 *   --apply       grava. Cada ficha é relida e regravada numa transação (se alguém a alterou no meio, vale o que está
 *                 no banco agora) e só os caminhos que mudam são tocados; `updatedAt` não é alterado
 *   --backup F    com --apply, guarda em F os valores antigos dos caminhos alterados (padrão: arquivo na pasta temporária)
 *   --charsheet X só a ficha de ID X (comece por uma)
 *
 * Rodar (precisa de NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY; para testar
 * contra o emulador, defina FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/normalizeCharsheets.ts [--apply [--backup arquivo.json]] [--charsheet ID]
 */
import admin from 'firebase-admin'
import { writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { planNormalization } from '../utils/charsheetNormalize'
import { initFirebaseAdmin } from '../utils/initializeFireOrm'

export interface NormalizeOptions {
    apply?: boolean
    backupFile?: string
    charsheetId?: string
}

export interface NormalizeReport {
    /** Fichas lidas */
    total: number
    /** Fichas que mudariam (simulação) ou mudaram (--apply) */
    changed: string[]
    /** Quantas fichas mudam em cada caminho */
    byPath: Record<string, number>
    /** Caminhos gravados por ficha */
    paths: Record<string, string[]>
    /** Valores antigos dos caminhos gravados (só com --apply), para desfazer */
    backup: Record<string, Record<string, unknown>>
}

/** Valor atual de um caminho "a.b" num documento (para o backup) */
function valueAtPath(data: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => (current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined), data)
}

export async function normalizeCharsheets({ apply = false, charsheetId }: NormalizeOptions = {}): Promise<NormalizeReport> {
    initFirebaseAdmin()
    const db = admin.firestore()

    const docs = charsheetId
        ? [ await db.collection('charsheets').doc(charsheetId).get() ].filter(doc => doc.exists)
        : (await db.collection('charsheets').get()).docs

    const report: NormalizeReport = { total: docs.length, changed: [], byPath: {}, paths: {}, backup: {} }
    const register = (id: string, fields: Record<string, unknown>): void => {
        const paths = Object.keys(fields)
        if (paths.length === 0) return
        report.paths[id] = paths
        paths.forEach(path => { report.byPath[path] = (report.byPath[path] ?? 0) + 1 })
    }

    for (const doc of docs) {
        const plan = planNormalization(doc.data() as Record<string, unknown>)
        if (Object.keys(plan).length === 0) continue

        if (!apply) {
            register(doc.id, plan)
            report.changed.push(doc.id)
            continue
        }

        // Relê dentro da transação: o plano é refeito sobre o que está no banco agora, então uma edição
        // simultânea do jogador não é desfeita
        const applied = await db.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(doc.ref)
            const current = snapshot.data() as Record<string, unknown> | undefined
            if (!current) return null
            const fresh = planNormalization(current)
            if (Object.keys(fresh).length === 0) return null

            transaction.update(doc.ref, fresh)
            return { fresh, before: Object.fromEntries(Object.keys(fresh).map(path => [ path, valueAtPath(current, path) ?? null ])) }
        })
        if (!applied) continue

        report.backup[doc.id] = applied.before
        register(doc.id, applied.fresh)
        report.changed.push(doc.id)
    }

    return report
}

function parseArgs(argv: string[]): NormalizeOptions {
    const valueOf = (flag: string): string | undefined => {
        const index = argv.indexOf(flag)
        return index >= 0 ? argv[index + 1] : undefined
    }
    return {
        apply: argv.includes('--apply'),
        backupFile: valueOf('--backup'),
        charsheetId: valueOf('--charsheet')
    }
}

if (require.main === module) {
    const options = parseArgs(process.argv.slice(2))

    console.log(options.apply
        ? 'Gravando: o formato das fichas antigas será corrigido.'
        : 'Simulação: nada será gravado. Use --apply para gravar.')

    normalizeCharsheets(options)
        .then((report) => {
            console.table(Object.entries(report.byPath).sort((a, b) => b[1] - a[1]).map(([ caminho, fichas ]) => ({ caminho, fichas })))
            console.log(`${report.changed.length} de ${report.total} ficha(s) ${options.apply ? 'corrigida(s)' : 'seriam corrigidas'}.`)

            if (options.apply && report.changed.length > 0) {
                const backupFile = options.backupFile ?? join(tmpdir(), `charsheets-normalize-backup-${Date.now()}.json`)
                writeFileSync(backupFile, JSON.stringify(report.backup, null, 2), { mode: 0o600 })
                console.log(`Valores antigos guardados em ${backupFile}`)
            }
            process.exit(0)
        })
        .catch((error: unknown) => {
            console.error('Erro na migração:', error)
            process.exit(1)
        })
}
