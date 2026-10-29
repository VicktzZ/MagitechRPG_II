/**
 * A matriz de percepção num documento privado do mestre (utils/firestore/gmData.ts: `gmData/awareness`) e o que cada jogador escondido pode saber dela
 * (utils/firestore/playerData.ts: `playerData/{userId}`) contra o emulador do Firestore. Só roda com o emulador ligado; sem ele os testes são ignorados
 * (ver gmNotes.emulator.test.ts).
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as GmData from '../gmData'
import type * as PlayerData from '../playerData'
import type { UnseenData } from '../../combat/awareness'
import { hiddenNoticesByUser } from '../../combat/awarenessSecrets'
import { initFirebaseAdmin } from '../../initializeFireOrm'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

const entry = (patch: Partial<UnseenData> = {}): UnseenData => ({
    id: 'u1', hiderId: 'cs-ana', hiderName: 'Aria', observerId: 'goblin-1', observerName: 'Goblin', cause: 'furtivo', createdAt: '2026-10-29T12:00:00.000Z', ...patch
})

const combatants = [
    { id: 'cs-ana', type: 'player' as const, odacId: 'u-ana' },
    { id: 'cs-bia', type: 'player' as const, odacId: 'u-bia' },
    { id: 'goblin-1', type: 'creature' as const }
]

describeEmulator('matriz de percepção em gmData e avisos em playerData', () => {
    let gm: typeof GmData
    let players: typeof PlayerData
    let db: admin.firestore.Firestore
    let n = 0
    let campaignId: string

    const gmDoc = () => db.collection('campaigns').doc(campaignId).collection('gmData').doc('awareness')
    const playerCollection = () => db.collection('campaigns').doc(campaignId).collection('playerData')
    const playerIds = async () => (await playerCollection().get()).docs.map(doc => doc.id).sort()

    beforeAll(() => {
        initFirebaseAdmin()
        gm = jest.requireActual('../gmData')
        players = jest.requireActual('../playerData')
        db = admin.firestore()
    })

    beforeEach(async () => {
        campaignId = `camp-aw-${++n}-${Date.now()}`
        await db.collection('campaigns').doc(campaignId).set({ id: campaignId, admin: [ 'gm' ], players: [] })
    })

    describe('gmData/awareness', () => {
        it('sem documento a leitura devolve null (matriz vazia não tem documento)', async () => {
            expect(await gm.readAwareness(campaignId)).toBeNull()
        })

        it('grava e lê a matriz, com o `kind` e quem gravou', async () => {
            await gm.saveAwareness(campaignId, [ entry(), entry({ id: 'u2', observerId: 'goblin-2', observerName: 'Goblin (2)', cause: 'invisivel' }) ], 'gm')

            const stored = await gm.readAwareness(campaignId)
            expect(stored?.map(item => [ item.id, item.cause ])).toEqual([ [ 'u1', 'furtivo' ], [ 'u2', 'invisivel' ] ])

            const raw = (await gmDoc().get()).data() as Record<string, unknown>
            expect(raw['kind']).toBe('awareness')
            expect(raw['updatedBy']).toBe('gm')
        })

        it('regravar troca a matriz inteira (o servidor já juntou o que valia)', async () => {
            await gm.saveAwareness(campaignId, [ entry(), entry({ id: 'u2', observerId: 'goblin-2' }) ], 'gm')
            await gm.saveAwareness(campaignId, [ entry({ id: 'u3', observerId: 'goblin-3' }) ], 'gm')

            expect((await gm.readAwareness(campaignId))?.map(item => item.id)).toEqual([ 'u3' ])
        })

        it('matriz vazia apaga o documento, e apagar o que não existe não dá erro', async () => {
            await gm.saveAwareness(campaignId, [ entry() ], 'gm')
            await gm.saveAwareness(campaignId, [], 'gm')

            expect((await gmDoc().get()).exists).toBe(false)
            expect(await gm.readAwareness(campaignId)).toBeNull()
            await expect(gm.saveAwareness(campaignId, [], 'gm')).resolves.toBeUndefined()
        })

        it('um documento com outro `kind` ou lixo não vira matriz', async () => {
            await gmDoc().set({ kind: 'outra-coisa', entries: [ entry() ] })
            expect(await gm.readAwareness(campaignId)).toBeNull()

            await gmDoc().set({ kind: 'awareness', entries: [ entry(), { id: 'ruim' } ] })
            expect((await gm.readAwareness(campaignId))?.map(item => item.id)).toEqual([ 'u1' ])
        })

        it('não mexe nas defesas das criaturas, que moram na mesma subcoleção', async () => {
            await gm.saveCreatureDefenses(campaignId, 'goblin', { elementalMastery: 'Fogo', weaknesses: [], damageModifiers: [] }, 'gm')
            await gm.saveAwareness(campaignId, [ entry() ], 'gm')
            await gm.saveAwareness(campaignId, [], 'gm')

            expect((await gm.getCreatureDefenses(campaignId, 'goblin'))?.elementalMastery).toBe('Fogo')
            expect(await gm.readCreatureDefenses(campaignId)).toHaveProperty('goblin')
        })

        it('excluir os dados do mestre leva a matriz junto', async () => {
            await gm.saveAwareness(campaignId, [ entry() ], 'gm')
            await gm.deleteGmData(campaignId)

            expect(await gm.readAwareness(campaignId)).toBeNull()
        })
    })

    describe('playerData/{userId}', () => {
        it('cada jogador escondido ganha o próprio documento com de quem está fora da vista, e só com isso', async () => {
            const notices = hiddenNoticesByUser(combatants, [
                entry(),
                entry({ id: 'u2', hiderId: 'cs-bia', hiderName: 'Borin', observerId: 'goblin-1', cause: 'outro' })
            ])
            await players.syncHiddenNotices(campaignId, notices)

            expect(await playerIds()).toEqual([ 'u-ana', 'u-bia' ])
            const ana = (await playerCollection().doc('u-ana').get()).data() as Record<string, unknown>
            expect(ana['kind']).toBe('awareness')
            expect(ana['hiddenFrom']).toEqual([ { hiderId: 'cs-ana', observerName: 'Goblin', cause: 'furtivo' } ])
            // nada do resto da matriz (ids dos pares, quem mais está escondido) vaza para o documento do jogador
            expect(JSON.stringify(ana)).not.toContain('cs-bia')
            expect(JSON.stringify(ana)).not.toContain('u2')
        })

        it('quem deixou de estar escondido perde o documento, e quem continua o mantém atualizado', async () => {
            await players.syncHiddenNotices(campaignId, hiddenNoticesByUser(combatants, [
                entry(),
                entry({ id: 'u2', hiderId: 'cs-bia', hiderName: 'Borin', observerId: 'goblin-1' })
            ]))
            // Borin foi revelado; Aria passou a ser invisível
            await players.syncHiddenNotices(campaignId, hiddenNoticesByUser(combatants, [ entry({ cause: 'invisivel' }) ]))

            expect(await playerIds()).toEqual([ 'u-ana' ])
            const ana = (await playerCollection().doc('u-ana').get()).data() as { hiddenFrom: Array<{ cause: string }> }
            expect(ana.hiddenFrom[0]?.cause).toBe('invisivel')
        })

        it('o fim do combate (matriz vazia) apaga todos os documentos', async () => {
            await players.syncHiddenNotices(campaignId, hiddenNoticesByUser(combatants, [ entry() ]))
            await players.syncHiddenNotices(campaignId, hiddenNoticesByUser(combatants, []))

            expect(await playerIds()).toEqual([])
        })

        it('criatura escondida não gera documento (não há jogador a avisar)', async () => {
            await players.syncHiddenNotices(campaignId, hiddenNoticesByUser(combatants, [ entry({ hiderId: 'goblin-1', observerId: 'cs-ana', observerName: 'Aria' }) ]))

            expect(await playerIds()).toEqual([])
        })

        it('excluir a campanha apaga os documentos dos jogadores', async () => {
            await players.syncHiddenNotices(campaignId, hiddenNoticesByUser(combatants, [ entry() ]))
            await players.deletePlayerData(campaignId)

            expect(await playerIds()).toEqual([])
        })
    })
})
