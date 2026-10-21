/**
 * Move as mensagens antigas do chat (lista `session.messages` dentro do documento da campanha)
 * para a subcoleção `campaigns/{id}/messages`.
 *
 * Por que: o chat novo lê e grava na subcoleção. As mensagens que ainda estão na lista aparecem
 * normalmente (o app junta as duas fontes), mas continuam pesando no documento da campanha — todo
 * cliente as baixa a cada alteração. Migrar e esvaziar a lista resolve isso.
 *
 * ESCREVE NO BANCO, por isso é seguro por padrão:
 *   (sem flags)   simulação: só conta as mensagens antigas de cada campanha
 *   --apply       copia para a subcoleção (idempotente: rodar de novo não duplica)
 *   --clear       com --apply, esvazia a lista antiga DEPOIS de conferir que todas as cópias existem
 *                 e que a lista não mudou desde a leitura (senão mantém e avisa)
 *   --campaign X  só a campanha de ID X (comece por uma)
 *
 * Rodar (precisa das variáveis NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY;
 * para testar contra o emulador, defina FIRESTORE_EMULATOR_HOST):
 *   npx ts-node -r tsconfig-paths/register -O '{"module":"commonjs"}' scripts/migrateCampaignMessages.ts [--apply [--clear]] [--campaign ID]
 */
import admin from 'firebase-admin'
import { migrateLegacyMessages, type MigrationReport } from '../utils/firestore/campaignMessages'
import { initFirebaseAdmin } from '../utils/initializeFireOrm'

export interface MigrateOptions {
    apply?: boolean
    clear?: boolean
    campaignId?: string
}

/** Campanhas que ainda têm mensagens na lista antiga (ou só a pedida) */
async function campaignIdsWithLegacyMessages(campaignId?: string): Promise<string[]> {
    if (campaignId) return [ campaignId ]

    const snapshot = await admin.firestore().collection('campaigns').select('session.messages').get()
    return snapshot.docs
        .filter(doc => ((doc.data() as { session?: { messages?: unknown[] } }).session?.messages ?? []).length > 0)
        .map(doc => doc.id)
}

export async function migrateCampaignMessages({ apply = false, clear = false, campaignId }: MigrateOptions = {}): Promise<MigrationReport[]> {
    initFirebaseAdmin()

    const reports: MigrationReport[] = []
    for (const id of await campaignIdsWithLegacyMessages(campaignId)) {
        reports.push(await migrateLegacyMessages(id, { apply, clear }))
    }
    return reports
}

function parseArgs(argv: string[]): MigrateOptions {
    const campaignIndex = argv.indexOf('--campaign')
    return {
        apply: argv.includes('--apply'),
        clear: argv.includes('--clear'),
        campaignId: campaignIndex >= 0 ? argv[campaignIndex + 1] : undefined
    }
}

if (require.main === module) {
    const options = parseArgs(process.argv.slice(2))

    if (options.clear && !options.apply) {
        console.error('--clear só vale junto com --apply.')
        process.exit(1)
    }

    console.log(options.apply
        ? `Migrando (${options.clear ? 'copia e esvazia a lista antiga' : 'só copia'})...`
        : 'Simulação: nada será gravado. Use --apply para copiar.')

    migrateCampaignMessages(options)
        .then((reports) => {
            console.table(reports.map(r => ({ campanha: r.campaignId, antigas: r.legacy, copiadas: r.copied, 'já estavam': r.alreadyThere, esvaziada: r.cleared, aviso: r.note ?? '' })))
            console.log(`${reports.length} campanha(s) com mensagens antigas; ${reports.reduce((sum, r) => sum + r.legacy, 0)} mensagem(ns) no total.`)
            process.exit(reports.some(r => r.note) ? 2 : 0)
        })
        .catch((error: unknown) => {
            console.error('Erro na migração:', error)
            process.exit(1)
        })
}
