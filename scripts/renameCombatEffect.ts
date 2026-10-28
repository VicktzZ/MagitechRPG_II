/**
 * Troca o nome do efeito global "Visão na Penumbra" por "Visão Aprimorada" no catálogo de efeitos de combate (regra do combate: a visão de cada
 * combatente é Normal, Aprimorada ou Verdadeira; a Aprimorada é o antigo efeito, flag `dim_vision`). Só o campo `name` do documento
 * `combatEffects/seed-visao-penumbra` é tocado; os outros efeitos e as cópias que os mestres fizeram em campanhas (outros ids) ficam como estão.
 *
 * ESCREVE NO BANCO, por isso é seguro por padrão:
 *   (sem flags)  simulação: diz o que faria
 *   --apply      grava, numa transação: só troca se o nome ainda for o que foi lido ("Visão na Penumbra"). Rodar de novo não faz mal
 *   --revert     com --apply, desfaz (volta para "Visão na Penumbra"; só se o nome ainda for "Visão Aprimorada")
 *
 * O combate já em andamento guarda uma cópia do efeito aplicado (`snapshot.name`), que segue com o nome antigo até o efeito acabar; o motor decide pela
 * flag `dim_vision`, não pelo nome, então nada muda na regra.
 *
 * Rodar (precisa de NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY; para testar contra o emulador, defina
 * FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/renameCombatEffect.ts [--apply] [--revert]
 */
import admin from 'firebase-admin'
import { initFirebaseAdmin } from '../utils/initializeFireOrm'

export const EFFECT_ID = 'seed-visao-penumbra'
export const OLD_NAME = 'Visão na Penumbra'
export const NEW_NAME = 'Visão Aprimorada'

export type RenameStatus = 'update' | 'already' | 'conflict' | 'missing'

const normalize = (value: unknown): string => (typeof value === 'string' ? value : '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

/** O que fazer com o efeito, dado o nome que ele tem agora (`undefined`: o documento não existe) */
export function planRename(currentName: string | undefined, from: string, to: string): RenameStatus {
    if (currentName === undefined) return 'missing'
    if (normalize(currentName) === normalize(to)) return 'already'
    if (normalize(currentName) === normalize(from)) return 'update'
    return 'conflict'
}

export interface RenameEffectOptions {
    apply?: boolean
    /** Desfaz: volta o nome antigo */
    revert?: boolean
}

export interface RenameEffectReport {
    status: RenameStatus
    from: string
    to: string
    /** Nome que o documento tinha ao ser lido (`undefined` se não existe) */
    current?: string
    /** Gravou (só com `apply`, e só se o nome não mudou entre a leitura e a gravação) */
    applied: boolean
}

export async function renameCombatEffect({ apply = false, revert = false }: RenameEffectOptions = {}): Promise<RenameEffectReport> {
    const from = revert ? NEW_NAME : OLD_NAME
    const to = revert ? OLD_NAME : NEW_NAME

    initFirebaseAdmin()
    const db = admin.firestore()
    const ref = db.collection('combatEffects').doc(EFFECT_ID)

    const snapshot = await ref.get()
    const current = snapshot.exists ? String((snapshot.data() as { name?: unknown }).name ?? '') : undefined
    const status = planRename(current, from, to)
    const report: RenameEffectReport = { status, from, to, ...(current === undefined ? {} : { current }), applied: false }
    if (!apply || status !== 'update') return report

    report.applied = await db.runTransaction(async (transaction) => {
        const data = (await transaction.get(ref)).data() as { name?: string } | undefined
        if (data?.name !== current) return false
        transaction.update(ref, { name: to })
        return true
    })
    return report
}

function printReport(report: RenameEffectReport, apply: boolean): void {
    const text: Record<RenameStatus, string> = {
        update: !apply
            ? `Renomearia "${report.from}" → "${report.to}".`
            : report.applied ? `Renomeado: "${report.from}" → "${report.to}".` : 'Pulado: o nome mudou entre a leitura e a gravação; nada foi gravado.',
        already: `Nada a fazer: o efeito já se chama "${report.to}".`,
        conflict: `CONFLITO: o efeito se chama "${report.current}" (esperado "${report.from}" ou "${report.to}"); não foi mexido.`,
        missing: `INEXISTENTE: não há o efeito ${EFFECT_ID} no catálogo.`
    }
    console.log(text[report.status])
}

if (require.main === module) {
    const argv = process.argv.slice(2)
    const apply = argv.includes('--apply')
    const revert = argv.includes('--revert')

    console.log(apply ? 'Gravando no banco.' : 'Simulação: nada será gravado. Use --apply para gravar.')

    renameCombatEffect({ apply, revert })
        .then((report) => {
            printReport(report, apply)
            process.exit(0)
        })
        .catch((error: unknown) => {
            console.error('Erro ao renomear o efeito:', error)
            process.exit(1)
        })
}
