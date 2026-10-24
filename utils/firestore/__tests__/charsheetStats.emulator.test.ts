/**
 * Dano e cura rápidos contra o emulador do Firestore (Admin SDK de verdade): a transação é o que impede que duas
 * variações simultâneas se percam. Só roda com o emulador ligado; sem ele os testes são ignorados. Para rodar:
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as CharsheetStats from '../charsheetStats'
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
const loadModule = (): typeof CharsheetStats => jest.requireActual('../charsheetStats')

describeEmulator('dano e cura rápidos (transação)', () => {
    let lib: ReturnType<typeof loadModule>
    let db: admin.firestore.Firestore
    let n = 0
    let id: string

    const stats = async () => (await db.collection('charsheets').doc(id).get()).data()?.['stats']

    beforeAll(() => {
        initFirebaseAdmin()
        lib = loadModule()
        db = admin.firestore()
    })

    beforeEach(async () => {
        id = `cs-${++n}-${Date.now()}`
        await db.collection('charsheets').doc(id).set({
            id,
            name: 'Aria',
            userId: 'ana',
            stats: { lp: 30, maxLp: 40, mp: 10, maxMp: 20, ap: 4, maxAp: 8 },
            combatMpSpent: 3,
            inventory: { money: 120 }
        })
    })

    afterAll(async () => {
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    it('aplica dano, devolve antes e depois e grava só o campo alterado', async () => {
        const result = await lib.adjustCharsheetStats(id, { lp: -7 })
        expect(result).toEqual({ lp: { before: 30, after: 23 } })

        const sheet = (await db.collection('charsheets').doc(id).get()).data()
        expect(sheet?.['stats']).toEqual({ lp: 23, maxLp: 40, mp: 10, maxMp: 20, ap: 4, maxAp: 8 })
        expect(sheet?.['inventory']).toEqual({ money: 120 })
        expect(sheet?.['combatMpSpent']).toBe(3)
    })

    it('ajusta vários pontos vitais de uma vez', async () => {
        await lib.adjustCharsheetStats(id, { lp: -10, mp: 5, ap: -1 })
        expect(await stats()).toMatchObject({ lp: 20, mp: 15, ap: 3 })
    })

    it('respeita os limites: zero embaixo e o máximo em cima', async () => {
        await lib.adjustCharsheetStats(id, { lp: -999, mp: 999 })
        expect(await stats()).toMatchObject({ lp: 0, mp: 20 })
    })

    it('quem está acima do máximo não é rebaixado pela cura', async () => {
        await db.collection('charsheets').doc(id).update({ 'stats.lp': 55 })
        const result = await lib.adjustCharsheetStats(id, { lp: 5 })
        expect(result.lp).toEqual({ before: 55, after: 55 })
        expect((await stats()).lp).toBe(55)
    })

    // A transação disputa o mesmo documento: o emulador as enfileira e o teste leva alguns segundos
    it('variações simultâneas não se perdem (30 danos de 1 ao mesmo tempo)', async () => {
        const results = await Promise.allSettled(Array.from({ length: 30 }, async () => await lib.adjustCharsheetStats(id, { lp: -1 })))
        const applied = results.filter(result => result.status === 'fulfilled').length

        // Cada transação que terminou tirou exatamente 1 (nenhuma sobrescreveu outra): o que sobrou bate com a conta
        expect(applied).toBeGreaterThan(0)
        expect((await stats()).lp).toBe(30 - applied)
    }, 60000)

    it('várias variações de MP seguidas somam sem erro', async () => {
        for (let i = 0; i < 12; i++) await lib.adjustCharsheetStats(id, { mp: -1 })
        expect((await stats()).mp).toBe(0)
    })

    it('uma mudança do jogador no meio não é desfeita: a variação soma ao valor de agora', async () => {
        await db.collection('charsheets').doc(id).update({ 'stats.lp': 12 })
        await lib.adjustCharsheetStats(id, { lp: -2 })
        expect((await stats()).lp).toBe(10)
    })

    it('ficha inexistente dá 404', async () => {
        await expect(lib.adjustCharsheetStats('nao-existe', { lp: -1 })).rejects.toMatchObject({ status: 404 })
        await expect(lib.adjustCharsheetStats('nao-existe', { lp: -1 })).rejects.toBeInstanceOf(ApiError)
    })

    it('ficha sem stats (sistema customizado sem MP) não vira NaN', async () => {
        await db.collection('charsheets').doc(id).update({ stats: { lp: 5, maxLp: 10 } })
        const result = await lib.adjustCharsheetStats(id, { mp: 3 })
        expect(result.mp).toEqual({ before: 0, after: 0 })
        expect(Number.isNaN((await stats()).mp)).toBe(false)
    })
})
