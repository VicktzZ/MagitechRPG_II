/**
 * Dano e cura rápidos de criatura em combate contra o emulador do Firestore (Admin SDK de verdade): a transação é o que
 * impede que cliques seguidos se percam, e a gravação tem de mexer só no combate. Só roda com o emulador ligado; sem ele
 * os testes são ignorados. Para rodar:
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
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

// O módulo usa o Admin SDK, que só pode ser iniciado depois das variáveis acima: carrega sob demanda
const loadModule = (): typeof CombatantStats => jest.requireActual('../combatantStats')

describeEmulator('dano e cura rápidos de criatura em combate (transação)', () => {
    let lib: ReturnType<typeof loadModule>
    let db: admin.firestore.Firestore
    let n = 0
    let id: string

    const campaign = async () => (await db.collection('campaigns').doc(id).get()).data()
    const combatants = async () => (await campaign())?.['session'].combat.combatants as Array<Record<string, unknown>>
    const goblin = async (name = 'goblin-1') => (await combatants()).find(c => c['id'] === name)

    const seed = async (combatOverrides: Record<string, unknown> = {}) => {
        id = `camp-combat-${++n}-${Date.now()}`
        await db.collection('campaigns').doc(id).set({
            id,
            name: 'Teste',
            admin: [ 'gm' ],
            players: [ { userId: 'ana', charsheetId: 'cs-ana' } ],
            custom: { creatures: [ { id: 'goblin', name: 'Goblin', stats: { lp: 20, maxLp: 25, mp: 4, maxMp: 8, ap: 1 } } ] },
            session: {
                users: [ 'gm', 'ana' ],
                combat: {
                    isActive: true,
                    round: 2,
                    currentTurnIndex: 1,
                    combatants: [
                        { id: 'cs-ana', name: 'Aria', type: 'player', currentLp: 38, maxLp: 45, effects: [], hasActed: false },
                        { id: 'goblin-1', name: 'Goblin A', type: 'creature', currentLp: 9, maxLp: 20, currentMp: 2, maxMp: 6, effects: [ { id: 'e1' } ], hasActed: true },
                        { id: 'goblin-2', name: 'Goblin B', type: 'creature', currentLp: 20, maxLp: 20, effects: [], hasActed: false }
                    ],
                    logs: [ { type: 'turn', message: 'Rodada 2' } ],
                    ...combatOverrides
                }
            }
        })
    }

    beforeAll(() => {
        initFirebaseAdmin()
        lib = loadModule()
        db = admin.firestore()
    })

    beforeEach(async () => { await seed() })

    afterAll(async () => {
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    it('aplica dano, devolve antes e depois e grava no combatente', async () => {
        const changes = await lib.adjustCombatantVitals(id, 'goblin-1', { lp: -4 })
        expect(changes).toEqual({ lp: { before: 9, after: 5 } })
        expect(await goblin()).toMatchObject({ currentLp: 5, maxLp: 20, currentMp: 2, maxMp: 6 })
    })

    it('mexe só no combatente alvo: os outros, o combate e o resto da campanha ficam como estavam', async () => {
        const before = await campaign()
        await lib.adjustCombatantVitals(id, 'goblin-1', { lp: -4, mp: 1 })
        const after = await campaign()

        const [ ana, , other ] = (before?.['session'].combat.combatants as unknown[])
        const list = await combatants()
        expect(list[0]).toEqual(ana)
        expect(list[2]).toEqual(other)
        expect(list[1]).toMatchObject({ id: 'goblin-1', name: 'Goblin A', type: 'creature', hasActed: true, effects: [ { id: 'e1' } ], currentLp: 5, currentMp: 3 })

        expect(after?.['session'].combat).toMatchObject({ isActive: true, round: 2, currentTurnIndex: 1, logs: [ { type: 'turn', message: 'Rodada 2' } ] })
        expect(after?.['session'].users).toEqual([ 'gm', 'ana' ])
        expect(after?.['players']).toEqual(before?.['players'])
        expect(after?.['custom']).toEqual(before?.['custom'])
    })

    it('dano nunca leva abaixo de zero e cura para no máximo', async () => {
        await lib.adjustCombatantVitals(id, 'goblin-1', { lp: -999 })
        expect((await goblin())?.['currentLp']).toBe(0)

        await lib.adjustCombatantVitals(id, 'goblin-1', { lp: 999, mp: 999 })
        expect(await goblin()).toMatchObject({ currentLp: 20, currentMp: 6 })
    })

    it('várias variações de uma vez, vida e mana', async () => {
        const changes = await lib.adjustCombatantVitals(id, 'goblin-1', { lp: -2, mp: -2 })
        expect(changes).toEqual({ lp: { before: 9, after: 7 }, mp: { before: 2, after: 0 } })
        expect(await goblin()).toMatchObject({ currentLp: 7, currentMp: 0 })
    })

    it('cliques simultâneos não se perdem: cada variação soma ao valor de agora', async () => {
        await Promise.all(Array.from({ length: 6 }, async () => await lib.adjustCombatantVitals(id, 'goblin-1', { lp: -1 })))
        expect((await goblin())?.['currentLp']).toBe(3)
    }, 30000) // as transações se enfileiram no emulador (com a suíte inteira rodando passa de 5 s, o padrão do Jest)

    it('ajustes simultâneos de combatentes diferentes também se somam sem apagar um ao outro', async () => {
        await Promise.all([
            lib.adjustCombatantVitals(id, 'goblin-1', { lp: -3 }),
            lib.adjustCombatantVitals(id, 'goblin-2', { lp: -5 }),
            lib.adjustCombatantVitals(id, 'goblin-1', { lp: -2 }),
            lib.adjustCombatantVitals(id, 'goblin-2', { lp: -5 })
        ])
        expect((await goblin('goblin-1'))?.['currentLp']).toBe(4)
        expect((await goblin('goblin-2'))?.['currentLp']).toBe(10)
    }, 30000)

    it('criatura que entrou no combate sem mana: parte da criatura de origem e grava atual e máximo no combatente', async () => {
        const changes = await lib.adjustCombatantVitals(id, 'goblin-2', { mp: -1 })
        expect(changes).toEqual({ mp: { before: 4, after: 3 } })
        expect(await goblin('goblin-2')).toMatchObject({ currentMp: 3, maxMp: 8, currentLp: 20 })
    })

    it('combatente cuja criatura tem sufixo no id (cópias) encontra a criatura de origem', async () => {
        await db.collection('campaigns').doc(id).update({
            'session.combat.combatants': [ { id: 'goblin-7', name: 'Goblin G', type: 'creature', effects: [] } ]
        })
        const changes = await lib.adjustCombatantVitals(id, 'goblin-7', { lp: -5 })
        expect(changes).toEqual({ lp: { before: 20, after: 15 } })
        expect(await goblin('goblin-7')).toMatchObject({ currentLp: 15, maxLp: 25 })
    })

    it('recusa jogador (a vida dele é da ficha) e não grava nada', async () => {
        const before = await campaign()
        await expect(lib.adjustCombatantVitals(id, 'cs-ana', { lp: -5 })).rejects.toMatchObject({ status: 400 })
        expect(((await campaign())?.['session'].combat.combatants as unknown[])).toEqual(before?.['session'].combat.combatants)
    })

    it('recusa combatente que não existe (404) e combate encerrado ou ausente (400)', async () => {
        await expect(lib.adjustCombatantVitals(id, 'nao-existe', { lp: -1 })).rejects.toBeInstanceOf(ApiError)
        await expect(lib.adjustCombatantVitals(id, 'nao-existe', { lp: -1 })).rejects.toMatchObject({ status: 404 })

        await db.collection('campaigns').doc(id).update({ 'session.combat.isActive': false })
        await expect(lib.adjustCombatantVitals(id, 'goblin-1', { lp: -1 })).rejects.toMatchObject({ status: 400 })
        expect((await goblin())?.['currentLp']).toBe(9)

        await db.collection('campaigns').doc(id).update({ 'session.combat': admin.firestore.FieldValue.delete() })
        await expect(lib.adjustCombatantVitals(id, 'goblin-1', { lp: -1 })).rejects.toMatchObject({ status: 400 })
    })

    it('campanha inexistente dá 404', async () => {
        await expect(lib.adjustCombatantVitals('campanha-que-nao-existe', 'goblin-1', { lp: -1 })).rejects.toMatchObject({ status: 404 })
    })
})
