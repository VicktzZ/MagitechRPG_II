/**
 * Magia Guiada na resolução do ataque (utils/combat/guidedHits.ts) contra o emulador do Firestore: a sequência de acertos de magia mora no combatente, sobe a cada acerto no mesmo alvo
 * com a mesma magia, e zera ao errar, ao atacar com arma, ao trocar de alvo ou magia (recomeça em 1) e ao sofrer dano. Só roda com o emulador ligado.
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import 'reflect-metadata'
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as GuidedHits from '../../combat/guidedHits'
import type { PendingAttackData } from '../../combat/pendingAttacks'
import { Combat, Combatant } from '../../../models/Combat'
import { initFirebaseAdmin } from '../../initializeFireOrm'

jest.mock('@enums', () => ({
    MessageType: { TEXT: 'text', ROLL: 'roll', DICE: 'dice', ERROR: 'error', SYSTEM: 'system', EXPERTISE: 'expertise', COMBAT_LOG: 'combat_log' },
    PusherEvent: {}
}))

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

describeEmulator('Magia Guiada na resolução do ataque', () => {
    let guided: typeof GuidedHits
    let db: admin.firestore.Firestore
    let n = 0
    let sheetId: string

    const seed = async (skills: Array<{ name: string }> = [ { name: 'Magia Guiada' } ]): Promise<void> => {
        await db.collection('charsheets').doc(sheetId).set({
            id: sheetId, name: 'Aria', userId: 'user-aria', level: 10,
            skills: { class: skills, subclass: [] },
            attributes: { foc: 10 },
            stats: { lp: 80, maxLp: 100, mp: 30, maxMp: 40 }
        })
    }

    const attackOf = (patch: Partial<PendingAttackData> = {}): PendingAttackData => ({
        id: 'atk-1', attackerId: sheetId, attackerName: 'Aria', targetId: 'goblin', targetName: 'Goblin', source: 'spell', name: 'Brasa Voraz', kind: 'magico',
        attackTotal: 20, rolls: [], bonus: 0, createdAt: '2026-10-30T12:00:00.000Z', ...patch
    })

    const combat = (): Combat => new Combat({
        isActive: true,
        phase: 'ACTION',
        round: 2,
        combatants: [
            new Combatant({ id: sheetId, name: 'Aria', type: 'player', odacId: 'user-aria', currentLp: 80, maxLp: 100, currentMp: 30, maxMp: 40 }),
            new Combatant({ id: 'goblin', name: 'Goblin', type: 'creature', currentLp: 30, maxLp: 30 }),
            new Combatant({ id: 'orc', name: 'Orc', type: 'creature', currentLp: 30, maxLp: 30 })
        ]
    })

    const aria = (state: Combat): Combatant => state.combatants[0]!

    beforeAll(() => {
        initFirebaseAdmin()
        guided = jest.requireActual('../../combat/guidedHits')
        db = admin.firestore()
    })

    beforeEach(async () => {
        n += 1
        sheetId = `sheet-guided-${n}-${Date.now()}`
        await seed()
    })

    it('a primeira magia que acerta abre a sequência em 1', async () => {
        const state = combat()
        await guided.applyGuidedHits(state, attackOf(), { hit: true, dealt: 5 })
        expect(aria(state).guided).toEqual({ targetId: 'goblin', spellKey: 'Brasa Voraz', hits: 1 })
    })

    it('acertar o mesmo alvo com a mesma magia soma um acerto por vez e para em 3', async () => {
        const state = combat()
        for (let i = 0; i < 5; i += 1) await guided.applyGuidedHits(state, attackOf(), { hit: true, dealt: 5 })
        expect(aria(state).guided?.hits).toBe(3)
    })

    it('outro alvo ou outra magia recomeça em 1', async () => {
        const state = combat()
        await guided.applyGuidedHits(state, attackOf(), { hit: true, dealt: 5 })
        await guided.applyGuidedHits(state, attackOf(), { hit: true, dealt: 5 })
        expect(aria(state).guided?.hits).toBe(2)

        await guided.applyGuidedHits(state, attackOf({ targetId: 'orc', targetName: 'Orc' }), { hit: true, dealt: 5 })
        expect(aria(state).guided).toEqual({ targetId: 'orc', spellKey: 'Brasa Voraz', hits: 1 })

        await guided.applyGuidedHits(state, attackOf({ targetId: 'orc', targetName: 'Orc', name: 'Raio' }), { hit: true, dealt: 5 })
        expect(aria(state).guided).toEqual({ targetId: 'orc', spellKey: 'Raio', hits: 1 })
    })

    it('errar zera a sequência', async () => {
        const state = combat()
        await guided.applyGuidedHits(state, attackOf(), { hit: true, dealt: 5 })
        await guided.applyGuidedHits(state, attackOf(), { hit: false, dealt: 0 })
        expect(aria(state).guided).toBeUndefined()
    })

    it('atacar com arma zera a sequência', async () => {
        const state = combat()
        await guided.applyGuidedHits(state, attackOf(), { hit: true, dealt: 5 })
        await guided.applyGuidedHits(state, attackOf({ source: 'weapon', name: 'Adaga', kind: 'fisico' }), { hit: true, dealt: 4 })
        expect(aria(state).guided).toBeUndefined()
    })

    it('sofrer dano zera a sequência de quem foi atingido', async () => {
        const state = combat()
        aria(state).guided = { targetId: 'goblin', spellKey: 'Brasa Voraz', hits: 2 }
        await guided.applyGuidedHits(state, attackOf({ attackerId: 'goblin', attackerName: 'Goblin', targetId: sheetId, targetName: 'Aria', source: 'manual', name: 'Machadada', kind: 'fisico' }), { hit: true, dealt: 7 })
        expect(aria(state).guided).toBeUndefined()
    })

    it('quem não tem a habilidade não abre sequência', async () => {
        await seed([])
        const state = combat()
        await guided.applyGuidedHits(state, attackOf(), { hit: true, dealt: 5 })
        expect(aria(state).guided).toBeUndefined()
    })
})
