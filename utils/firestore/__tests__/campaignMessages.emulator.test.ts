/**
 * Mensagens do chat contra o emulador do Firestore (Admin SDK de verdade).
 * Só roda com o emulador ligado; sem ele os testes são ignorados. Para rodar:
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as CampaignMessages from '../campaignMessages'
import { ApiError } from '../../api/errors'
import { initFirebaseAdmin } from '../../initializeFireOrm'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

// O módulo usa o Admin SDK, que só pode ser iniciado depois das variáveis acima: carrega sob demanda
const loadModule = (): typeof CampaignMessages => jest.requireActual('../campaignMessages')

const message = (n: number, overrides: Record<string, unknown> = {}) => ({
    id: `msg-${String(n).padStart(4, '0')}`,
    text: `mensagem ${n}`,
    timestamp: new Date(Date.UTC(2026, 0, 1, 12, 0, 0, n * 10)).toISOString(),
    by: { id: 'ana', name: 'Ana', image: '' },
    type: 'text',
    ...overrides
}) as never

describeEmulator('mensagens do chat (subcoleção)', () => {
    let lib: ReturnType<typeof loadModule>
    let db: admin.firestore.Firestore
    let n = 0
    let campaignId: string

    beforeAll(() => {
        initFirebaseAdmin()
        lib = loadModule()
        db = admin.firestore()
    })

    beforeEach(async () => {
        campaignId = `camp-${++n}-${Date.now()}`
        await db.collection('campaigns').doc(campaignId).set({
            id: campaignId, title: 'Campanha', admin: [ 'gm' ], players: [ { userId: 'ana', charsheetId: 'c1' } ],
            session: { users: [], messages: [], combat: { isActive: false } }
        })
    })

    afterAll(async () => {
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    const idsOf = (messages: Array<{ id: string }>) => messages.map(m => m.id)
    // Documento cru do Firestore: o formato é livre, então sem tipo
    const campaignData = async (): Promise<any> => (await db.collection('campaigns').doc(campaignId).get()).data()

    it('grava uma mensagem como documento próprio, sem tocar na campanha', async () => {
        const before = await campaignData()

        expect(await lib.appendCampaignMessage(campaignId, message(1))).toBe(true)

        const stored = await db.collection('campaigns').doc(campaignId).collection('messages').doc('msg-0001').get()
        expect(stored.data()).toMatchObject({ id: 'msg-0001', text: 'mensagem 1', type: 'text' })
        expect(await campaignData()).toEqual(before)
    })

    it('repetir o envio (mesmo ID) não duplica nem sobrescreve', async () => {
        await lib.appendCampaignMessage(campaignId, message(1))
        expect(await lib.appendCampaignMessage(campaignId, message(1, { text: 'outro texto' }))).toBe(false)

        const { messages } = await lib.listCampaignMessages(campaignId)
        expect(messages).toHaveLength(1)
        expect(messages[0]).toMatchObject({ text: 'mensagem 1' })
    })

    it('campos undefined (ex.: isHTML) não quebram a gravação', async () => {
        await expect(lib.appendCampaignMessage(campaignId, message(1, { isHTML: undefined }))).resolves.toBe(true)
    })

    it('mensagens e alterações da campanha ao mesmo tempo: nenhuma se perde', async () => {
        const ref = db.collection('campaigns').doc(campaignId)
        await Promise.all([
            ...Array.from({ length: 40 }, async (_, i) => await lib.appendCampaignMessage(campaignId, message(i))),
            // o que o combate e as notas fazem: gravar campos da campanha no meio do chat
            ...Array.from({ length: 10 }, async (_, i) => await ref.update({ 'session.combat.round': i + 1, notes: [ { id: `n${i}` } ] }))
        ])

        const { messages } = await lib.listCampaignMessages(campaignId, { limit: 200 })
        expect(messages).toHaveLength(40)
        const campaign = await campaignData()
        expect(campaign?.notes).toHaveLength(1)
        expect(campaign?.session.combat.round).toBeGreaterThanOrEqual(1)
        expect(campaign?.players).toHaveLength(1)
    })

    describe('paginação', () => {
        beforeEach(async () => {
            // 250 mensagens em ordem; as 3 últimas de cada centena compartilham o mesmo horário
            for (let start = 0; start < 250; start += 50) {
                await Promise.all(Array.from({ length: 50 }, async (_, i) => {
                    const k = start + i
                    const sameTime = k % 100 >= 97
                    const sharedTime = new Date(Date.UTC(2026, 0, 1, 12, 0, 0, 1000 + Math.floor(k / 100) * 100)).toISOString()
                    return await lib.appendCampaignMessage(campaignId, message(k, sameTime ? { timestamp: sharedTime } : {}))
                }))
            }
        })

        it('a primeira página traz as 100 mais recentes, da mais antiga para a mais nova', async () => {
            const page = await lib.listCampaignMessages(campaignId, { limit: 100 })
            expect(page.messages).toHaveLength(100)
            expect(page.hasMore).toBe(true)
            const times = page.messages.map(m => m.timestamp)
            expect([ ...times ].sort()).toEqual(times)
        })

        it('percorrer com beforeId devolve todas as 250, sem repetir nem pular — inclusive no empate de horário', async () => {
            const seen: string[] = []
            let beforeId: string | undefined
            let guard = 0
            for (;;) {
                const page = await lib.listCampaignMessages(campaignId, { beforeId, limit: 100 })
                seen.unshift(...idsOf(page.messages))
                if (!page.hasMore) break
                beforeId = page.messages[0].id
                if (++guard > 10) throw new Error('paginação não termina')
            }
            expect(seen).toHaveLength(250)
            expect(new Set(seen).size).toBe(250)
            expect([ ...seen ].sort()).toEqual(Array.from({ length: 250 }, (_, k) => `msg-${String(k).padStart(4, '0')}`))
        })

        it('a última página diz que não há mais', async () => {
            const first = await lib.listCampaignMessages(campaignId, { limit: 200 })
            const last = await lib.listCampaignMessages(campaignId, { beforeId: first.messages[0].id, limit: 200 })
            expect(last.messages).toHaveLength(50)
            expect(last.hasMore).toBe(false)
        })

        it('tamanho de página vindo da query string é limitado', async () => {
            expect((await lib.listCampaignMessages(campaignId, { limit: '5' })).messages).toHaveLength(5)
            expect((await lib.listCampaignMessages(campaignId, { limit: '99999' })).messages).toHaveLength(200)
            expect((await lib.listCampaignMessages(campaignId, { limit: 'abc' })).messages).toHaveLength(100)
        })

        it('beforeId que não existe é 404', async () => {
            await expect(lib.listCampaignMessages(campaignId, { beforeId: 'nao-existe' })).rejects.toMatchObject({ status: 404 })
            await expect(lib.listCampaignMessages(campaignId, { beforeId: 'nao-existe' })).rejects.toBeInstanceOf(ApiError)
        })
    })

    it('apagar as mensagens da campanha limpa a subcoleção toda', async () => {
        await Promise.all(Array.from({ length: 30 }, async (_, i) => await lib.appendCampaignMessage(campaignId, message(i))))
        await lib.deleteCampaignMessages(campaignId)
        expect((await lib.listCampaignMessages(campaignId)).messages).toEqual([])
    })

    describe('migração das mensagens antigas', () => {
        const legacy = (count: number) => Array.from({ length: count }, (_, i) => ({
            id: `old-${i}`, text: `antiga ${i}`, timestamp: new Date(Date.UTC(2025, 0, 1, 0, 0, i)).toISOString(), by: { id: 'ana', name: 'Ana', image: '' }, type: 'text'
        }))
        const setLegacy = async (messages: unknown[]) => await db.collection('campaigns').doc(campaignId).update({ 'session.messages': messages })

        it('simulação só conta: nada é gravado', async () => {
            await setLegacy(legacy(5))
            const report = await lib.migrateLegacyMessages(campaignId)
            expect(report).toMatchObject({ legacy: 5, copied: 0, cleared: false })
            expect((await lib.listCampaignMessages(campaignId)).messages).toHaveLength(0)
            expect((await campaignData()).session.messages).toHaveLength(5)
        })

        it('copia sem esvaziar quando não é pedido; rodar de novo não duplica', async () => {
            await setLegacy(legacy(5))
            expect(await lib.migrateLegacyMessages(campaignId, { apply: true })).toMatchObject({ legacy: 5, copied: 5, alreadyThere: 0, cleared: false })
            expect(await lib.migrateLegacyMessages(campaignId, { apply: true })).toMatchObject({ copied: 0, alreadyThere: 5 })
            expect((await lib.listCampaignMessages(campaignId)).messages).toHaveLength(5)
            expect((await campaignData()).session.messages).toHaveLength(5)
        })

        it('com clear, esvazia a lista antiga só depois de conferir as cópias — e preserva o resto da campanha', async () => {
            await setLegacy(legacy(700)) // mais de uma leva de conferência (300)
            const report = await lib.migrateLegacyMessages(campaignId, { apply: true, clear: true })
            expect(report).toMatchObject({ legacy: 700, copied: 700, cleared: true })

            const campaign = await campaignData()
            expect(campaign?.session.messages).toEqual([])
            expect(campaign?.session.combat).toEqual({ isActive: false })
            expect(campaign?.players).toHaveLength(1)

            const all = await lib.listCampaignMessages(campaignId, { limit: 200 })
            expect(all.messages).toHaveLength(200)
            expect(all.hasMore).toBe(true)
        })

        it('mensagem antiga sem ID válido ganha um ID estável (rodar de novo não duplica)', async () => {
            const by = { id: 'ana', name: 'Ana', image: '' }
            await setLegacy([
                { text: 'sem id', timestamp: '2025-01-01T00:00:00.000Z', by },
                { id: 'tem/barra', text: 'id ruim', timestamp: '2025-01-01T00:00:01.000Z', by }
            ])
            expect(await lib.migrateLegacyMessages(campaignId, { apply: true })).toMatchObject({ copied: 2 })
            expect(await lib.migrateLegacyMessages(campaignId, { apply: true })).toMatchObject({ copied: 0, alreadyThere: 2 })
            const { messages } = await lib.listCampaignMessages(campaignId)
            expect(messages.map(m => m.text)).toEqual([ 'sem id', 'id ruim' ])
            expect(messages.every(m => /^legacy-[0-9a-f]{40}$/.test(m.id))).toBe(true)
        })

        it('campanha sem mensagens antigas: nada a fazer', async () => {
            expect(await lib.migrateLegacyMessages(campaignId, { apply: true, clear: true })).toMatchObject({ legacy: 0, copied: 0, cleared: false })
        })

        it('campanha inexistente é 404', async () => {
            await expect(lib.migrateLegacyMessages('nao-existe', { apply: true })).rejects.toMatchObject({ status: 404 })
        })
    })
})
