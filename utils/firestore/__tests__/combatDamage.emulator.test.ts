/**
 * Dano e cura em combatente (utils/firestore/combatDamage.ts) contra o emulador do Firestore: a vida do jogador vai para a ficha **só no campo `stats.lp`**
 * (o resto da ficha, inclusive o que mudou depois da leitura, fica como está). Só roda com o emulador ligado; sem ele os testes são ignorados.
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import 'reflect-metadata'
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as Damage from '../combatDamage'
import { Combat, Combatant } from '../../../models/Combat'
import { initFirebaseAdmin } from '../../initializeFireOrm'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

describeEmulator('dano e cura em combatente', () => {
    let lib: typeof Damage
    let db: admin.firestore.Firestore
    let n = 0
    let sheetId: string

    const combat = (): Combat => new Combat({
        isActive: true,
        phase: 'ACTION',
        combatants: [
            new Combatant({ id: sheetId, name: 'Aria', type: 'player', odacId: 'user-aria', currentLp: 20, maxLp: 25, effects: [] }),
            new Combatant({ id: 'goblin-1', name: 'Goblin', type: 'creature', currentLp: 12, maxLp: 12, effects: [] })
        ]
    })
    const sheet = async (): Promise<Record<string, any>> => (await db.collection('charsheets').doc(sheetId).get()).data() as Record<string, any>

    beforeAll(() => {
        initFirebaseAdmin()
        lib = jest.requireActual('../combatDamage')
        db = admin.firestore()
    })

    beforeEach(async () => {
        n += 1
        sheetId = `sheet-dmg-${n}-${Date.now()}`
        await db.collection('charsheets').doc(sheetId).set({ id: sheetId, name: 'Aria', stats: { lp: 20, maxLp: 25, mp: 7, maxMp: 10 }, inventory: { money: 50 } })
    })

    it('dano em jogador: LP do combatente e só stats.lp da ficha; o resto da ficha fica', async () => {
        const state = combat()
        // a ficha mudou depois da leitura do combate (o jogador gastou MP e achou dinheiro)
        await db.collection('charsheets').doc(sheetId).update({ 'stats.mp': 2, 'inventory.money': 80 })

        const change = await lib.damageCombatant(state, sheetId, 8)

        expect(change).toMatchObject({ oldLp: 20 })
        expect(state.combatants[0]!.currentLp).toBe(12)
        const saved = await sheet()
        expect(saved['stats']).toMatchObject({ lp: 12, mp: 2, maxLp: 25 })
        expect(saved['inventory']).toEqual({ money: 80 })
    })

    it('dano nunca passa de zero e mostra o nocaute nas estatísticas', async () => {
        const state = combat()
        const change = (await lib.damageCombatant(state, sheetId, 99))!

        expect(state.combatants[0]!.currentLp).toBe(0)
        expect((await sheet())['stats']['lp']).toBe(0)
        expect(lib.damageStats(state.combatants[1], change, 99)).toEqual([
            { charsheetId: sheetId, userId: 'user-aria', charsheetName: 'Aria', inc: { 'combat.damageTaken': 99, 'combat.knockouts': 1 } },
            { gm: true, inc: { damageDealt: 99 } }
        ])
    })

    it('dano em criatura só mexe no combatente (não há ficha) e conta o abate de quem é jogador', async () => {
        const state = combat()
        const change = (await lib.damageCombatant(state, 'goblin-1', 20))!

        expect(state.combatants[1]!.currentLp).toBe(0)
        expect(lib.damageStats(state.combatants[0], change, 20)).toEqual([
            { charsheetId: sheetId, userId: 'user-aria', charsheetName: 'Aria', inc: { 'combat.damageDealt': 20, 'combat.kills': 1 } }
        ])
    })

    it('alvo que não está no combate devolve null e não grava nada', async () => {
        expect(await lib.damageCombatant(combat(), 'ninguem', 5)).toBeNull()
        expect(await lib.healCombatant(combat(), 'ninguem', 5)).toBeNull()
        expect((await sheet())['stats']['lp']).toBe(20)
    })

    it('cura vai até o máximo, nunca reduz LP acima dele e grava só stats.lp', async () => {
        const state = combat()
        await lib.healCombatant(state, sheetId, 99)
        expect(state.combatants[0]!.currentLp).toBe(25)
        expect((await sheet())['stats']['lp']).toBe(25)

        state.combatants[0]!.currentLp = 30 // sobrecura
        await lib.healCombatant(state, sheetId, 5)
        expect(state.combatants[0]!.currentLp).toBe(30)
    })

    it('Sobrecura deixa a cura passar do máximo (até a margem) e Fragilidade baixa o teto (Fase 6.3)', async () => {
        const effect = (name: string, modifiers: Array<Record<string, unknown>>): any =>
            ({ id: name, effectId: name, level: 1, remaining: 3, snapshot: { name, levels: [ { level: 1, modifiers } ] } })

        const state = combat()
        state.combatants[0]!.effects = [ effect('Sobrecura', [ { kind: 'overflow_stat', target: 'lp', value: '+50%' } ]) ]
        await lib.healCombatant(state, sheetId, 99)
        expect(state.combatants[0]!.currentLp).toBe(37) // 25 + 50% = 37,5, para baixo
        expect((await sheet())['stats']['lp']).toBe(37)

        const fragile = combat()
        fragile.combatants[0]!.effects = [ effect('Fragilidade', [ { kind: 'stat_penalty', target: 'maxLp', value: '-40%' } ]) ]
        await lib.healCombatant(fragile, sheetId, 99)
        expect(fragile.combatants[0]!.currentLp).toBe(20) // teto 15 < LP atual 20: a cura não sobe e também não corta
        fragile.combatants[0]!.currentLp = 10
        await lib.healCombatant(fragile, sheetId, 99)
        expect(fragile.combatants[0]!.currentLp).toBe(15)
    })

    it('estatísticas de cura: valor efetivo, recebido por jogador e feito pelo mestre', async () => {
        const state = combat()
        const change = (await lib.healCombatant(state, sheetId, 99))!

        expect(lib.healStats(undefined, change)).toEqual([
            { charsheetId: sheetId, userId: 'user-aria', charsheetName: 'Aria', inc: { 'combat.healingReceived': 5 } },
            { gm: true, inc: { healingDone: 5 } }
        ])
        const none = (await lib.healCombatant(state, sheetId, 5))!
        expect(lib.healStats(undefined, none)).toEqual([])
    })

    afterAll(async () => {
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })
})
