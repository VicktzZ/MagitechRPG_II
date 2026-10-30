/**
 * Reagir no meio do ataque (utils/combat/attackReactionUse.ts) contra o emulador do Firestore: a reação imediata paga na hora (MP e usos gravados na ficha), a armada só paga se a
 * condição se cumprir na resolução, o contra-ataque abre a oportunidade e o efeito do Xeque-Mate vai para quem foi atingido. Só roda com o emulador ligado.
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import 'reflect-metadata'
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as AbilityUse from '../../combat/abilityUse'
import type * as ReactionUse from '../../combat/attackReactionUse'
import type { PendingAttackData } from '../../combat/pendingAttacks'
import { Combat, Combatant } from '../../../models/Combat'
import { initFirebaseAdmin } from '../../initializeFireOrm'

// diceRoller importa o barril de @enums, que puxa subscriptionEnum.ts (o ts-jest barra um erro de tipo antigo dele)
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

const SUBCLASS = [ 'Barreira de Ki', 'Metamorfose Adaptativa', 'Resposta Tática', 'Reflexos Táticos', 'Xeque-Mate' ]

describeEmulator('reagir no meio do ataque', () => {
    let reactionUse: typeof ReactionUse
    let abilityUse: typeof AbilityUse
    let db: admin.firestore.Firestore
    let n = 0
    let sheetId: string

    const sheet = async (): Promise<Record<string, any>> => (await db.collection('charsheets').doc(sheetId).get()).data() as Record<string, any>

    const seed = async (patch: Record<string, unknown> = {}): Promise<void> => {
        await db.collection('charsheets').doc(sheetId).set({
            id: sheetId, name: 'Aria', userId: 'user-aria', level: 15,
            skills: { class: [], subclass: SUBCLASS.map(name => ({ name })) },
            attributes: { foc: 10 },
            stats: { lp: 80, maxLp: 100, mp: 30, maxMp: 40 },
            ...patch
        })
    }

    const attackOf = (patch: Partial<PendingAttackData> = {}): PendingAttackData => ({
        id: 'atk-1', attackerId: 'goblin', attackerName: 'Goblin', targetId: sheetId, targetName: 'Aria', source: 'manual', name: 'Machadada', kind: 'fisico',
        attackTotal: 20, rolls: [], bonus: 0, melee: true, damageRolled: 12, createdAt: '2026-10-30T12:00:00.000Z', ...patch
    })

    const combat = (pending: PendingAttackData = attackOf()): Combat => new Combat({
        isActive: true,
        phase: 'ACTION',
        round: 2,
        combatants: [
            new Combatant({ id: sheetId, name: 'Aria', type: 'player', odacId: 'user-aria', currentLp: 80, maxLp: 100, currentMp: 30, maxMp: 40 }),
            new Combatant({ id: 'goblin', name: 'Goblin', type: 'creature', currentLp: 30, maxLp: 30 })
        ],
        pendingAttacks: [ pending ]
    })

    const aria = (state: Combat): Combatant => state.combatants[0]!

    const react = async (state: Combat, abilityKey: string, extra: { isGM?: boolean; force?: boolean } = {}) =>
        await reactionUse.runAttackReaction({ combat: state, pending: state.pendingAttacks![0]!, reactor: aria(state), abilityKey, isGM: false, force: false, ...extra })

    beforeAll(() => {
        initFirebaseAdmin()
        reactionUse = jest.requireActual('../../combat/attackReactionUse')
        abilityUse = jest.requireActual('../../combat/abilityUse')
        db = admin.firestore()
    })

    beforeEach(async () => {
        n += 1
        sheetId = `sheet-react-${n}-${Date.now()}`
        await seed()
    })

    describe('reação imediata (Barreira de Ki)', () => {
        it('gasta o MP e a Reação, conta o uso, guarda a reação no ataque com os efeitos do catálogo e anuncia no log', async () => {
            const state = combat()
            const outcome = await react(state, 'subclass:barreira de ki')

            expect(outcome.ok).toBe(true)
            if (!outcome.ok) return
            expect(outcome.reaction).toMatchObject({ key: 'subclass:barreira de ki', by: sheetId, armed: false })
            expect(state.pendingAttacks![0]!.reactions).toHaveLength(1)
            expect(state.pendingAttacks![0]!.reactions![0]!.effects).toContainEqual({ kind: 'apBonus', value: 10 })

            expect((await sheet())['stats']['mp']).toBe(22)
            expect(aria(state).currentMp).toBe(22)
            expect(aria(state).actions).toMatchObject({ reacao: 0, padrao: 1 })
            expect(aria(state).abilityUses).toEqual({ 'subclass-barreira-de-ki': 1 })
            expect(state.logs.at(-1)?.message).toBe('**Aria** reagiu ao ataque de **Goblin** com **Barreira de Ki** gastando 8 MP.')
        })

        it('sem MP suficiente recusa e não grava nada', async () => {
            await seed({ stats: { lp: 80, maxLp: 100, mp: 5, maxMp: 40 } })
            const state = combat()
            const outcome = await react(state, 'subclass:barreira de ki')

            expect(outcome).toMatchObject({ ok: false, status: 409, body: { code: 'REACTION_BLOCKED', block: 'sem-mp' } })
            expect(state.pendingAttacks![0]!.reactions).toBeUndefined()
            expect((await sheet())['stats']['mp']).toBe(5)
            expect(aria(state).actions?.reacao).not.toBe(0)
        })

        it('já reagiu a este ataque com a mesma habilidade: recusa e não cobra de novo', async () => {
            const state = combat()
            await react(state, 'subclass:barreira de ki')
            state.pendingAttacks = [ state.pendingAttacks![0]! ]
            const second = await react(state, 'subclass:barreira de ki')

            expect(second).toMatchObject({ ok: false, body: { block: 'ja-reagiu' } })
            expect((await sheet())['stats']['mp']).toBe(22)
        })

        it('a ficha sem a habilidade leva 403; habilidade que não é reação, 400', async () => {
            await seed({ skills: { class: [ { name: 'Cura Interior' } ], subclass: [] } })
            const state = combat()
            expect(await react(state, 'subclass:barreira de ki')).toMatchObject({ ok: false, status: 403, body: { block: 'sem-habilidade' } })
            expect(await react(state, 'class:cura interior')).toMatchObject({ ok: false, status: 400, body: { block: 'nao-e-reacao' } })
        })

        it('ficha que não existe: 404', async () => {
            const state = combat()
            state.combatants[0]!.id = 'fantasma'
            expect(await react(state, 'subclass:barreira de ki')).toMatchObject({ ok: false, status: 404 })
        })

        it('sem a Reação disponível a reação vale, com aviso (gastar ação nunca trava)', async () => {
            const state = combat()
            aria(state).actions = { padrao: 1, bonus: 1, movimento: 1, reacao: 0 }
            const outcome = await react(state, 'subclass:barreira de ki')

            expect(outcome.ok).toBe(true)
            if (outcome.ok) expect(outcome.warnings.join(' ')).toContain('já não tinha a ação Reação')
        })
    })

    describe('limites por dia (Xeque-Mate)', () => {
        it('gasta 20 MP e o uso do dia; o segundo uso do dia é recusado, e o mestre libera', async () => {
            const first = combat()
            expect((await react(first, 'subclass:xeque-mate')).ok).toBe(true)
            expect((await sheet())['abilityUses']).toEqual({ 'subclass-xeque-mate': 1 })
            expect((await sheet())['stats']['mp']).toBe(10)

            await seed({ abilityUses: { 'subclass-xeque-mate': 1 }, stats: { lp: 80, maxLp: 100, mp: 30, maxMp: 40 } })
            const second = combat()
            expect(await react(second, 'subclass:xeque-mate')).toMatchObject({ ok: false, status: 409, body: { block: 'limite' } })
            expect((await sheet())['stats']['mp']).toBe(30)

            const forced = combat()
            expect((await react(forced, 'subclass:xeque-mate', { isGM: true, force: true })).ok).toBe(true)
            expect((await sheet())['abilityUses']).toEqual({ 'subclass-xeque-mate': 2 })
        })
    })

    describe('reação armada (Metamorfose Adaptativa)', () => {
        it('ao reagir só confere: nada é gasto até a resolução', async () => {
            const state = combat()
            const outcome = await react(state, 'subclass:metamorfose adaptativa')

            expect(outcome.ok).toBe(true)
            expect(state.pendingAttacks![0]!.reactions![0]).toMatchObject({ armed: true, when: [ 'damaged' ] })
            expect((await sheet())['stats']['mp']).toBe(30)
            expect(aria(state).actions?.reacao).not.toBe(0)
            expect(aria(state).abilityUses).toBeUndefined()
            expect(state.logs.at(-1)?.message).toContain('se prepara para reagir')
        })

        it('na resolução, se houve dano, paga os 3 MP, a Reação e o uso do combate', async () => {
            const state = combat()
            await react(state, 'subclass:metamorfose adaptativa')
            const result = await reactionUse.settleAttackReactions(state, state.pendingAttacks![0]!, { hit: true, dealt: 6, melee: true, defense: 'none' })

            expect(result.warnings).toEqual([])
            expect((await sheet())['stats']['mp']).toBe(27)
            expect(aria(state).currentMp).toBe(27)
            expect(aria(state).actions?.reacao).toBe(0)
            expect(aria(state).abilityUses).toEqual({ 'subclass-metamorfose-adaptativa': 1 })
            expect(state.logs.at(-1)?.message).toBe('**Aria** usou **Metamorfose Adaptativa** gastando 3 MP.')
        })

        it('na resolução, se não houve dano, nada é gasto e o log diz', async () => {
            const state = combat()
            await react(state, 'subclass:metamorfose adaptativa')
            await reactionUse.settleAttackReactions(state, state.pendingAttacks![0]!, { hit: false, dealt: 0, melee: true })

            expect((await sheet())['stats']['mp']).toBe(30)
            expect(aria(state).abilityUses).toBeUndefined()
            expect(state.logs.at(-1)?.message).toContain('não precisou de Metamorfose Adaptativa')
        })

        it('se o MP acabou entre a reação e a resolução, a reação não vale e vira aviso', async () => {
            const state = combat()
            await react(state, 'subclass:metamorfose adaptativa')
            await seed({ stats: { lp: 80, maxLp: 100, mp: 2, maxMp: 40 } })
            const result = await reactionUse.settleAttackReactions(state, state.pendingAttacks![0]!, { hit: true, dealt: 6, melee: true })

            expect(result.warnings.join(' ')).toContain('não deu para pagar o custo')
            expect((await sheet())['stats']['mp']).toBe(2)
            expect(aria(state).abilityUses).toBeUndefined()
        })

        it('se o uso do combate já estava no limite ao armar, recusa na hora', async () => {
            const state = combat()
            aria(state).abilityUses = { 'subclass-metamorfose-adaptativa': 3 }
            expect(await react(state, 'subclass:metamorfose adaptativa')).toMatchObject({ ok: false, body: { block: 'limite' } })
        })
    })

    describe('contra-ataque', () => {
        it('Resposta Tática: o ataque corpo a corpo errou, paga a Reação e abre a oportunidade com +5 no acerto', async () => {
            const state = combat()
            await react(state, 'subclass:resposta tatica')
            await reactionUse.settleAttackReactions(state, state.pendingAttacks![0]!, { hit: false, dealt: 0, melee: true })

            expect(aria(state).actions?.reacao).toBe(0)
            expect(state.opportunities).toHaveLength(1)
            expect(state.opportunities![0]).toMatchObject({
                moverId: 'goblin', moverName: 'Goblin', reactorId: sheetId, reactorName: 'Aria',
                counter: { abilityKey: 'subclass:resposta tatica', source: 'Resposta Tática', hitBonus: 5, meleeOnly: true }
            })
            expect(state.logs.some(log => log.message?.includes('ganhou um contra-ataque contra **Goblin**'))).toBe(true)
        })

        it('Resposta Tática: se o ataque acertou, não há contra-ataque e nada é gasto', async () => {
            const state = combat()
            await react(state, 'subclass:resposta tatica')
            await reactionUse.settleAttackReactions(state, state.pendingAttacks![0]!, { hit: true, dealt: 8, melee: true })

            expect(state.opportunities ?? []).toHaveLength(0)
            expect(aria(state).actions?.reacao).not.toBe(0)
        })

        it('Resposta Tática contra ataque à distância é recusada ao reagir', async () => {
            const state = combat(attackOf({ melee: undefined }))
            expect(await react(state, 'subclass:resposta tatica')).toMatchObject({ ok: false, body: { block: 'nao-se-aplica' } })
        })

        it('Xeque-Mate: o contra-ataque abre mesmo com o ataque errando, com crítico garantido e +6d6', async () => {
            const state = combat()
            await react(state, 'subclass:xeque-mate')
            await reactionUse.settleAttackReactions(state, state.pendingAttacks![0]!, { hit: false, dealt: 0, melee: true })

            expect(state.opportunities![0]!.counter).toMatchObject({ guaranteedCrit: true, extraDice: '6d6', meleeOnly: false, source: 'Xeque-Mate' })
            expect(state.opportunities![0]!.counter!.onHit).toBeDefined()
        })

        it('Reflexos Táticos: a esquiva anulou o dano → contra-ataque; esquivar e falhar não dá', async () => {
            const dodged = combat()
            await react(dodged, 'subclass:reflexos taticos')
            await reactionUse.settleAttackReactions(dodged, dodged.pendingAttacks![0]!, { hit: true, dealt: 0, melee: true, defense: 'dodge' })
            expect(dodged.opportunities).toHaveLength(1)
            expect(aria(dodged).abilityUses).toEqual({ 'subclass-reflexos-taticos': 1 })

            const failed = combat()
            await react(failed, 'subclass:reflexos taticos')
            await reactionUse.settleAttackReactions(failed, failed.pendingAttacks![0]!, { hit: true, dealt: 7, melee: true, defense: 'dodge' })
            expect(failed.opportunities ?? []).toHaveLength(0)
        })

        it('Reflexos Táticos: Retaliação — levou dano corpo a corpo sem esquivar → contra-ataque', async () => {
            const state = combat()
            await react(state, 'subclass:reflexos taticos')
            await reactionUse.settleAttackReactions(state, state.pendingAttacks![0]!, { hit: true, dealt: 7, melee: true, defense: 'resist' })
            expect(state.opportunities).toHaveLength(1)
        })

        it('o contra-ataque que acerta aplica o choque do Xeque-Mate em quem foi atingido', async () => {
            const state = combat()
            const counterAttack = attackOf({
                id: 'atk-2', attackerId: sheetId, attackerName: 'Aria', targetId: 'goblin', targetName: 'Goblin', source: 'weapon', name: 'Espada', melee: undefined,
                counter: { abilityKey: 'subclass:xeque-mate', source: 'Xeque-Mate', guaranteedCrit: true, extraDice: '6d6', meleeOnly: false,
                    onHit: { duration: { unit: 'rodadas', amount: 1 }, description: 'Estado de choque', modifiers: [ { kind: 'disadvantage', target: 'attack' }, { kind: 'disadvantage', target: 'resistance' } ] } }
            })
            const note = reactionUse.applyCounterOnHit(state, counterAttack)

            expect(note).toContain('ficou sob **Xeque-Mate**')
            const goblin = state.combatants[1]!
            expect(goblin.effects).toHaveLength(1)
            expect(goblin.effects[0]).toMatchObject({ ability: { key: 'subclass:xeque-mate' }, appliedById: sheetId })
            expect(goblin.effects[0]!.snapshot.levels[0]!.modifiers).toEqual([ { kind: 'disadvantage', target: 'attack' }, { kind: 'disadvantage', target: 'resistance' } ])

            // aplicar de novo troca o choque anterior, não empilha
            reactionUse.applyCounterOnHit(state, counterAttack)
            expect(goblin.effects).toHaveLength(1)
        })

        it('ataque comum, sem contra-ataque, não aplica nada', () => {
            expect(reactionUse.applyCounterOnHit(combat(), attackOf())).toBeNull()
        })
    })

    describe('habilidade de reação não se usa pelo quadrado', () => {
        it('use_ability recusa Barreira de Ki (REACTION_ONLY) e não cobra nada', async () => {
            const state = combat()
            const outcome = await abilityUse.runAbilityUse({ combat: state, combatant: aria(state), abilityKey: 'subclass:barreira de ki', isGM: false, force: false })

            expect(outcome).toMatchObject({ ok: false, status: 400, body: { code: 'REACTION_ONLY' } })
            expect((await sheet())['stats']['mp']).toBe(30)
        })
    })
})
