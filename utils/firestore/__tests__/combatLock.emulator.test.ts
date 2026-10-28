/**
 * Trava das ações de combate contra o emulador do Firestore (Admin SDK de verdade): é a transação que garante que só uma ação por vez
 * leia, mude e grave o combate de uma campanha. Só roda com o emulador ligado; sem ele os testes são ignorados. Para rodar:
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as CombatLock from '../combatLock'
import type * as CombatantStats from '../combatantStats'
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

// Os módulos usam o Admin SDK, que só pode ser iniciado depois das variáveis acima: carregam sob demanda
const loadLock = (): typeof CombatLock => jest.requireActual('../combatLock')
const loadStats = (): typeof CombatantStats => jest.requireActual('../combatantStats')

const sleep = async (ms: number): Promise<void> => await new Promise(resolve => setTimeout(resolve, ms))

describeEmulator('trava das ações de combate', () => {
    let lock: ReturnType<typeof loadLock>
    let db: admin.firestore.Firestore
    let n = 0
    let id: string

    const lockDoc = async () => (await db.collection('campaigns').doc(id).collection('locks').doc('combat').get())

    beforeAll(() => {
        initFirebaseAdmin()
        lock = loadLock()
        db = admin.firestore()
    })

    beforeEach(async () => {
        id = `camp-lock-${++n}-${Date.now()}`
        await db.collection('campaigns').doc(id).set({ id, counter: 0, session: { combat: { isActive: true, round: 1, combatants: [], logs: [] } } })
    })

    afterAll(async () => {
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    it('serializa ações que chegam juntas: ler, esperar e gravar sem uma apagar a outra', async () => {
        const increment = async () => await lock.withCombatLock(id, async () => {
            const current = ((await db.collection('campaigns').doc(id).get()).data()?.['counter'] ?? 0) as number
            await sleep(40)
            await db.collection('campaigns').doc(id).update({ counter: current + 1 })
        })

        await Promise.all([ increment(), increment(), increment(), increment(), increment() ])

        expect((await db.collection('campaigns').doc(id).get()).data()?.['counter']).toBe(5)
    })

    it('sem a trava as mesmas ações se perdem (controle do teste)', async () => {
        const increment = async () => {
            const current = ((await db.collection('campaigns').doc(id).get()).data()?.['counter'] ?? 0) as number
            await sleep(40)
            await db.collection('campaigns').doc(id).update({ counter: current + 1 })
        }

        await Promise.all([ increment(), increment(), increment() ])

        expect((await db.collection('campaigns').doc(id).get()).data()?.['counter']).toBeLessThan(3)
    })

    it('solta a trava ao fim, com sucesso ou com erro', async () => {
        await lock.withCombatLock(id, async () => { await sleep(1) })
        expect((await lockDoc()).exists).toBe(false)

        await expect(lock.withCombatLock(id, async () => { throw new Error('falhou no meio') })).rejects.toThrow('falhou no meio')
        expect((await lockDoc()).exists).toBe(false)

        // e a próxima ação passa na hora
        await expect(lock.withCombatLock(id, async () => 'ok', { waitMs: 200 })).resolves.toBe('ok')
    })

    it('devolve o resultado da ação', async () => {
        await expect(lock.withCombatLock(id, async () => 42)).resolves.toBe(42)
    })

    it('com a trava ocupada, espera a vez e desiste com 409 COMBAT_BUSY depois do prazo', async () => {
        const held = await lock.acquireCombatLock(id)
        const started = Date.now()

        const attempt = lock.acquireCombatLock(id, { waitMs: 400 })
        await expect(attempt).rejects.toMatchObject({ status: 409, code: 'COMBAT_BUSY' })
        await expect(attempt).rejects.toBeInstanceOf(ApiError)
        expect(Date.now() - started).toBeGreaterThanOrEqual(350)

        await held.release()
    })

    it('quem espera passa assim que a trava é solta', async () => {
        const held = await lock.acquireCombatLock(id)
        const waiting = lock.acquireCombatLock(id, { waitMs: 3000 })

        await sleep(150)
        await held.release()

        const second = await waiting
        expect((await lockDoc()).exists).toBe(true)
        await second.release()
        expect((await lockDoc()).exists).toBe(false)
    })

    it('a trava esquecida vence sozinha no prazo', async () => {
        await lock.acquireCombatLock(id, { leaseMs: 80 }) // nunca solta: a função "caiu"
        await sleep(160)

        const next = await lock.acquireCombatLock(id, { waitMs: 200 })
        await next.release()
    })

    it('soltar uma trava vencida não derruba a trava de quem a pegou depois', async () => {
        const old = await lock.acquireCombatLock(id, { leaseMs: 80 })
        await sleep(160)
        const current = await lock.acquireCombatLock(id, { leaseMs: 5000 })

        await old.release()

        // a trava de `current` continua valendo: outra ação ainda espera
        await expect(lock.acquireCombatLock(id, { waitMs: 150 })).rejects.toMatchObject({ code: 'COMBAT_BUSY' })
        await current.release()
    })

    it('o ajuste rápido de vida da criatura espera a trava do combate', async () => {
        await db.collection('campaigns').doc(id).update({
            custom: { creatures: [ { id: 'goblin', name: 'Goblin', stats: { lp: 20, maxLp: 25, mp: 4, maxMp: 8, ap: 1 } } ] },
            'session.combat': {
                isActive: true,
                round: 1,
                currentTurnIndex: 0,
                combatants: [ { id: 'goblin-1', name: 'Goblin A', type: 'creature', currentLp: 9, maxLp: 20, effects: [], hasActed: false } ],
                logs: []
            }
        })

        const held = await lock.acquireCombatLock(id)
        let done = false
        const adjust = loadStats().adjustCombatantVitals(id, 'goblin-1', { lp: -4 }).then(result => { done = true; return result })

        await sleep(200)
        expect(done).toBe(false)

        await held.release()
        await expect(adjust).resolves.toEqual({ lp: { before: 9, after: 5 } })
    })
})
