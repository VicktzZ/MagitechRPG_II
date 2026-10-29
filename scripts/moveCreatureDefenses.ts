/**
 * Tira das criaturas da campanha as defesas que eram segredo do mestre mas moravam num documento que qualquer membro lê
 * (`campaign.custom.creatures[].elementalMastery | weaknesses | damageModifiers`) e as leva para `campaigns/{id}/gmData` (regra do Firestore só para o
 * mestre, `utils/firestore/gmData.ts`). A criatura criada ou salva depois da mudança já nasce assim; este script é para as antigas.
 *
 * ESCREVE NO BANCO, por isso é seguro por padrão:
 *   (sem flags)         simulação: diz o que faria em cada campanha
 *   --apply             grava, uma transação por campanha: cria o documento privado e tira os campos da criatura. Só mexe numa criatura que AINDA carrega os
 *                       campos no momento da gravação. Rodar de novo não faz mal. Documento privado que já existe NÃO é sobrescrito (o que o mestre editou depois vale)
 *   --backup ARQUIVO    com --apply, guarda em ARQUIVO (JSON) os valores que saíram de cada criatura, para poder desfazer
 *   --campaign ID       só essa campanha
 *   --revert ARQUIVO    com --apply, desfaz a partir do backup: devolve os campos à criatura e apaga o documento privado, mas SÓ se o documento ainda tem os
 *                       valores do backup (se o mestre editou depois, a criatura é pulada e o aviso diz qual)
 *
 * IMPORTANTE: a regra do Firestore (`firestore.rules`, bloco `gmData`) e o código novo têm de estar em produção ANTES de rodar com --apply; sem a regra o
 * navegador do mestre não lê o documento privado e as defesas some da tela dele.
 *
 * Rodar (precisa de NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY; para testar contra o emulador, defina
 * FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -T -r tsconfig-paths/register -O '{"module":"commonjs","moduleResolution":"node10"}' scripts/moveCreatureDefenses.ts [--apply] [--backup F] [--campaign ID] [--revert F]
 */
import { readFileSync, writeFileSync } from 'fs'
import admin from 'firebase-admin'
import { CREATURE_SECRET_FIELDS, sanitizeCreatureDefenses, stripCreatureDefenses, type CreatureDefenses } from '../utils/combat/creatureSecrets'
import { creatureDefensesDocId } from '../utils/firestore/gmData'
import { initFirebaseAdmin } from '../utils/initializeFireOrm'

type Raw = Record<string, unknown>

const isRecord = (value: unknown): value is Raw => typeof value === 'object' && value !== null && !Array.isArray(value)
const hasEmbedded = (creature: unknown): boolean => isRecord(creature) && CREATURE_SECRET_FIELDS.some(field => field in creature)
const sameDefenses = (a: CreatureDefenses, b: CreatureDefenses): boolean => JSON.stringify(a) === JSON.stringify(b)

/** Os valores brutos dos campos de defesa que a criatura carrega (é o que o backup guarda e a reversão devolve) */
export function embeddedValues(creature: Raw): Raw {
    const values: Raw = {}
    for (const field of CREATURE_SECRET_FIELDS) if (field in creature) values[field] = creature[field]
    return values
}

export interface CreatureMove {
    creatureId: string
    /** Valores que saíram da criatura */
    removed: Raw
    /** Já existe documento privado: ele vale, a criatura só perde os campos */
    keptExisting: boolean
}

export interface CampaignMovePlan {
    /** A lista de criaturas como deve ficar na campanha (a mesma, se não há o que mover) */
    creatures: unknown[]
    moves: CreatureMove[]
}

/**
 * O que fazer com as criaturas de uma campanha: as que ainda carregam algum campo de defesa perdem os campos; cada uma ganha o documento privado,
 * salvo se já tem (`existingIds`). Criatura sem `id` não dá para ligar a um documento: fica como está.
 */
export function planCampaignMove(creatures: unknown, existingIds: ReadonlySet<string>): CampaignMovePlan {
    if (!Array.isArray(creatures)) return { creatures: [], moves: [] }

    const moves: CreatureMove[] = []
    const next = creatures.map(creature => {
        if (!isRecord(creature) || !hasEmbedded(creature) || typeof creature['id'] !== 'string' || !creature['id']) return creature
        moves.push({ creatureId: creature['id'], removed: embeddedValues(creature), keptExisting: existingIds.has(creature['id']) })
        return stripCreatureDefenses(creature)
    })
    return { creatures: moves.length > 0 ? next : creatures, moves }
}

export interface MoveOptions {
    apply?: boolean
    /** Só esta campanha */
    campaignId?: string
    /** Arquivo onde guardar o que saiu das criaturas (só com `apply`) */
    backupFile?: string
}

export interface CampaignMoveReport {
    campaignId: string
    moves: CreatureMove[]
    /** Gravou (só com `apply`, e só se algo ainda havia a mover na hora da gravação) */
    applied: boolean
}

export interface MoveReport {
    campaigns: CampaignMoveReport[]
    scanned: number
}

type BackupFile = Record<string, Record<string, Raw>>

export async function moveCreatureDefenses({ apply = false, campaignId, backupFile }: MoveOptions = {}): Promise<MoveReport> {
    initFirebaseAdmin()
    const db = admin.firestore()

    const refs = campaignId
        ? [ db.collection('campaigns').doc(campaignId) ]
        : (await db.collection('campaigns').select('custom.creatures').get()).docs.map(doc => doc.ref)

    const report: MoveReport = { campaigns: [], scanned: refs.length }
    const backup: BackupFile = {}
    const createdAt = new Date().toISOString()

    for (const ref of refs) {
        const gmData = ref.collection('gmData')

        const outcome = await db.runTransaction(async (transaction) => {
            const snapshot = await transaction.get(ref)
            if (!snapshot.exists) return { moves: [] as CreatureMove[], applied: false }

            const existing = await transaction.get(gmData.where('kind', '==', 'creatureDefenses'))
            const existingIds = new Set(existing.docs.map(doc => String((doc.data() as { creatureId?: unknown }).creatureId ?? '')))

            const plan = planCampaignMove((snapshot.data() as { custom?: { creatures?: unknown } }).custom?.creatures, existingIds)
            if (plan.moves.length === 0 || !apply) return { moves: plan.moves, applied: false }

            const createdBy = 'moveCreatureDefenses'
            for (const move of plan.moves) {
                if (move.keptExisting) continue
                const defenses = sanitizeCreatureDefenses(move.removed)
                transaction.set(gmData.doc(creatureDefensesDocId(move.creatureId)), {
                    kind: 'creatureDefenses',
                    creatureId: move.creatureId,
                    ...defenses,
                    updatedBy: createdBy,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                })
            }
            transaction.update(ref, { 'custom.creatures': plan.creatures })
            return { moves: plan.moves, applied: true }
        })

        if (outcome.moves.length > 0) report.campaigns.push({ campaignId: ref.id, moves: outcome.moves, applied: outcome.applied })
        if (outcome.applied) {
            backup[ref.id] = Object.fromEntries(outcome.moves.map(move => [ move.creatureId, move.removed ]))
            // Reescrito a cada campanha gravada: se o script cair no meio, o que já foi movido continua com backup em disco
            if (backupFile) writeFileSync(backupFile, JSON.stringify({ createdAt, campaigns: backup }, null, 2))
        }
    }

    return report
}

export interface RevertReport {
    restored: Array<{ campaignId: string; creatureId: string }>
    skipped: Array<{ campaignId: string; creatureId: string; reason: string }>
}

/** Desfaz a partir do backup: devolve os campos à criatura e apaga o documento privado, se ele ainda tem os valores do backup */
export async function revertCreatureDefenses({ backupFile, apply = false }: { backupFile: string; apply?: boolean }): Promise<RevertReport> {
    const parsed = JSON.parse(readFileSync(backupFile, 'utf8')) as { campaigns?: BackupFile }
    const campaigns = parsed.campaigns ?? {}

    initFirebaseAdmin()
    const db = admin.firestore()
    const report: RevertReport = { restored: [], skipped: [] }

    for (const [ campaignId, creatures ] of Object.entries(campaigns)) {
        const ref = db.collection('campaigns').doc(campaignId)

        for (const [ creatureId, removed ] of Object.entries(creatures)) {
            const docRef = ref.collection('gmData').doc(creatureDefensesDocId(creatureId))

            const outcome = await db.runTransaction(async (transaction) => {
                const [ campaignSnapshot, docSnapshot ] = await Promise.all([ transaction.get(ref), transaction.get(docRef) ])
                if (!campaignSnapshot.exists) return 'a campanha não existe mais'

                const list = (campaignSnapshot.data() as { custom?: { creatures?: unknown } }).custom?.creatures
                const index = Array.isArray(list) ? list.findIndex(creature => isRecord(creature) && creature['id'] === creatureId) : -1
                if (!Array.isArray(list) || index < 0) return 'a criatura não existe mais'
                if (hasEmbedded(list[index])) return 'a criatura já carrega os campos (nada a devolver)'
                if (!docSnapshot.exists) return 'o documento privado não existe mais'
                if (!sameDefenses(sanitizeCreatureDefenses(docSnapshot.data()), sanitizeCreatureDefenses(removed))) {
                    return 'o mestre editou as defesas depois da migração (o documento privado já não tem os valores do backup)'
                }
                if (!apply) return null

                const next = [ ...list ]
                next[index] = { ...(list[index] as Raw), ...removed }
                transaction.update(ref, { 'custom.creatures': next })
                transaction.delete(docRef)
                return null
            })

            if (outcome === null) report.restored.push({ campaignId, creatureId })
            else report.skipped.push({ campaignId, creatureId, reason: outcome })
        }
    }
    return report
}

if (require.main === module) {
    const argv = process.argv.slice(2)
    const valueOf = (flag: string): string | undefined => {
        const index = argv.indexOf(flag)
        return index >= 0 ? argv[index + 1] : undefined
    }
    const apply = argv.includes('--apply')
    const revertFile = valueOf('--revert')

    console.log(apply ? 'Gravando no banco.' : 'Simulação: nada será gravado. Use --apply para gravar.')

    const run = revertFile
        ? revertCreatureDefenses({ backupFile: revertFile, apply }).then((report) => {
            for (const item of report.restored) console.log(`${apply ? 'Devolvida' : 'Devolveria'}: campanha ${item.campaignId}, criatura ${item.creatureId}`)
            for (const item of report.skipped) console.log(`PULADA: campanha ${item.campaignId}, criatura ${item.creatureId}: ${item.reason}`)
            console.log(`${report.restored.length} ${apply ? 'devolvida(s)' : 'a devolver'}, ${report.skipped.length} pulada(s).`)
        })
        : moveCreatureDefenses({ apply, campaignId: valueOf('--campaign'), backupFile: valueOf('--backup') }).then((report) => {
            for (const campaign of report.campaigns) {
                const names = campaign.moves.map(move => `${move.creatureId}${move.keptExisting ? ' (documento privado já existia)' : ''}`).join(', ')
                console.log(`${campaign.applied ? 'Movidas' : 'Moveria'} ${campaign.moves.length} criatura(s) da campanha ${campaign.campaignId}: ${names}`)
            }
            const total = report.campaigns.reduce((sum, campaign) => sum + campaign.moves.length, 0)
            console.log(`${report.scanned} campanha(s) lida(s); ${total} criatura(s) ${apply ? 'movida(s)' : 'a mover'} em ${report.campaigns.length} campanha(s).`)
        })

    run
        .then(() => { process.exit(0) })
        .catch((error: unknown) => {
            console.error('Erro ao mover as defesas das criaturas:', error)
            process.exit(1)
        })
}
