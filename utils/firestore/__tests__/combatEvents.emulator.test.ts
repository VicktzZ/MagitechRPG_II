/**
 * Histórico do combate e "Desfazer" contra o emulador do Firestore (Admin SDK de verdade): o evento gravado, o limite de eventos, a vida e a mana
 * das fichas devolvidas só se ainda estão como o evento deixou, e o conflito. Só roda com o emulador ligado; sem ele os testes são ignorados.
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import 'reflect-metadata'
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as Events from '../combatEvents'
import type * as Undo from '../combatUndo'
import type * as History from '../../combat/history'
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

const loadEvents = (): typeof Events => jest.requireActual('../combatEvents')
const loadUndo = (): typeof Undo => jest.requireActual('../combatUndo')
const loadHistory = (): typeof History => jest.requireActual('../../combat/history')

describeEmulator('histórico do combate (eventos e desfazer)', () => {
    let events: ReturnType<typeof loadEvents>
    let undo: ReturnType<typeof loadUndo>
    let history: ReturnType<typeof loadHistory>
    let db: admin.firestore.Firestore
    let n = 0
    let campaignId: string
    let sheetId: string

    const fighter = (id: string, patch: Partial<Combatant> = {}): Combatant =>
        new Combatant({ id, name: id.toUpperCase(), type: 'player', currentLp: 20, maxLp: 20, currentMp: 10, maxMp: 10, effects: [], ...patch })
    const makeCombat = (): Combat => new Combat({ isActive: true, phase: 'ACTION', round: 1, currentTurnIndex: 0, combatants: [ fighter(sheetId), fighter('goblin', { type: 'creature' }) ], logs: [] })

    const sheetStats = async (): Promise<Record<string, number>> => (await db.collection('charsheets').doc(sheetId).get()).data()?.['stats']

    /** Registra um evento como a rota faz: foto de antes, a mudança e a foto de depois */
    const record = async (combat: Combat, mutate: (combat: Combat) => void, sheetChange?: { lp?: number; mp?: number }): Promise<string> => {
        const before = history.snapshotCombat(combat)
        const sheetsBefore = await events.readPlayerVitals(combat)
        mutate(combat)
        if (sheetChange) await db.collection('charsheets').doc(sheetId).update(Object.fromEntries(Object.entries(sheetChange).map(([ key, value ]) => [ `stats.${key}`, value ])))
        const after = history.snapshotCombat(combat)
        const changes = history.diffSnapshots(before, after)
        const sheets = history.diffSheetVitals(sheetsBefore, await events.readPlayerVitals(combat))
        return await events.recordCombatEvent(campaignId, {
            action: 'apply_damage',
            label: 'Dano aplicado',
            byUserId: 'gm',
            byName: 'Mestre',
            changes,
            sheets,
            summary: history.summarizeChanges(changes, { [sheetId]: 'Aria', goblin: 'Goblin' }, sheets)
        })
    }

    beforeAll(() => {
        events = loadEvents()
        undo = loadUndo()
        history = loadHistory()
        initFirebaseAdmin()
        db = admin.firestore()
    })

    beforeEach(async () => {
        n += 1
        campaignId = `camp-events-${n}-${Date.now()}`
        sheetId = `sheet-${n}-${Date.now()}`
        await db.collection('campaigns').doc(campaignId).set({ id: campaignId, admin: [ 'gm' ] })
        await db.collection('charsheets').doc(sheetId).set({ id: sheetId, name: 'Aria', stats: { lp: 20, maxLp: 20, mp: 10, maxMp: 10 } })
    })

    it('grava o evento, lista do mais novo ao mais antigo e lê as mudanças de volta', async () => {
        const combat = makeCombat()
        const first = await record(combat, c => { c.combatants[1]!.currentLp = 12 })
        await new Promise(resolve => setTimeout(resolve, 5))
        const second = await record(combat, c => { c.round = 2 })

        const list = await events.listCombatEvents(campaignId)
        expect(list.map(item => item.id)).toEqual([ second, first ])
        expect(list[1]).toMatchObject({ label: 'Dano aplicado', byName: 'Mestre', undone: false, summary: [ 'Goblin: Vida 20 → 12' ] })

        const full = await events.getCombatEvent(campaignId, first)
        expect(full?.changes).toEqual([ { scope: 'field', id: 'goblin', field: 'currentLp', before: 20, after: 12 } ])
    })

    it('não lê id que não é de evento', async () => {
        expect(events.isCombatEventId('../locks/combat')).toBe(false)
        expect(await events.getCombatEvent(campaignId, '../locks/combat')).toBeNull()
    })

    it('guarda só os últimos eventos', async () => {
        const combat = makeCombat()
        for (let index = 0; index < events.MAX_COMBAT_EVENTS + 3; index++) {
            const input = { action: 'next_turn', label: `Evento ${index}`, byUserId: 'gm', byName: 'Mestre', changes: [], sheets: [], summary: [] }
            await events.recordCombatEvent(campaignId, input, new Date(Date.now() + index))
        }

        const stored = await db.collection('campaigns').doc(campaignId).collection('combatEvents').get()
        expect(stored.size).toBe(events.MAX_COMBAT_EVENTS)
        expect(combat.round).toBe(1)
        expect((await events.listCombatEvents(campaignId, 100))[0]?.label).toBe(`Evento ${events.MAX_COMBAT_EVENTS + 2}`)
    })

    it('desfaz o dano no combate e na ficha, e marca o evento como desfeito', async () => {
        const combat = makeCombat()
        const id = await record(combat, c => { c.combatants[0]!.currentLp = 11 }, { lp: 11 })
        expect(await sheetStats()).toMatchObject({ lp: 11 })

        const event = (await events.getCombatEvent(campaignId, id))!
        const outcome = await undo.undoCombatEvent(combat, event, false)

        expect(outcome.ok).toBe(true)
        expect(combat.combatants[0]!.currentLp).toBe(20)
        expect(await sheetStats()).toMatchObject({ lp: 20, mp: 10 })
        if (outcome.ok) expect(outcome.log.message).toBe('↩️ O mestre desfez: **Dano aplicado**.')

        await events.markCombatEventUndone(campaignId, id, 'Mestre')
        expect((await events.listCombatEvents(campaignId))[0]).toMatchObject({ undone: true, undoneByName: 'Mestre' })
    })

    it('o que mudou depois e não tem a ver com o evento fica como está', async () => {
        const combat = makeCombat()
        const id = await record(combat, c => { c.combatants[1]!.currentLp = 12 })
        combat.combatants[0]!.mpSpentThisTurn = 4

        const outcome = await undo.undoCombatEvent(combat, (await events.getCombatEvent(campaignId, id))!, false)

        expect(outcome.ok).toBe(true)
        expect(combat.combatants[1]!.currentLp).toBe(20)
        expect(combat.combatants[0]!.mpSpentThisTurn).toBe(4)
    })

    it('campo que mudou de novo depois é conflito: nada é desfeito, e com force sobrescreve', async () => {
        const combat = makeCombat()
        const id = await record(combat, c => { c.combatants[1]!.currentLp = 12 })
        combat.combatants[1]!.currentLp = 5 // outro golpe no goblin
        const event = (await events.getCombatEvent(campaignId, id))!

        const refused = await undo.undoCombatEvent(combat, event, false)
        expect(refused).toEqual({ ok: false, conflicts: [ 'GOBLIN: Vida mudou de novo' ] })
        expect(combat.combatants[1]!.currentLp).toBe(5)

        const forced = await undo.undoCombatEvent(combat, event, true)
        expect(forced.ok).toBe(true)
        expect(combat.combatants[1]!.currentLp).toBe(20)
    })

    it('a ficha que mudou de novo depois (o jogador gastou MP) é conflito e não é sobrescrita sem force', async () => {
        const combat = makeCombat()
        const id = await record(combat, c => { c.combatants[0]!.currentMp = 6 }, { mp: 6 })
        await db.collection('charsheets').doc(sheetId).update({ 'stats.mp': 3 }) // gastou mais MP depois
        const event = (await events.getCombatEvent(campaignId, id))!

        const refused = await undo.undoCombatEvent(combat, event, false)
        expect(refused.ok).toBe(false)
        expect(await sheetStats()).toMatchObject({ mp: 3 })

        await undo.undoCombatEvent(combat, event, true)
        expect(await sheetStats()).toMatchObject({ mp: 10 })
    })

    it('apaga o histórico todo', async () => {
        await events.recordCombatEvent(campaignId, { action: 'end', label: 'Combate encerrado', byUserId: 'gm', byName: 'Mestre', changes: [], sheets: [], summary: [] })
        await events.deleteCombatEvents(campaignId)

        expect(await events.listCombatEvents(campaignId)).toEqual([])
    })
})
