/**
 * Habilidades ativadas e passivas de começo de turno (utils/combat/abilityUse.ts, turnPassives.ts, utils/firestore/abilityUses.ts) contra o emulador do Firestore:
 * os usos por dia na ficha (numa transação), o MP e a cura gravados, o efeito no combatente, os limites, o descanso e as passivas do turno. Só roda com o emulador ligado.
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import 'reflect-metadata'
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as AbilityUse from '../../combat/abilityUse'
import type * as TurnPassives from '../../combat/turnPassives'
import type * as AbilityUses from '../abilityUses'
import { Combat, Combatant } from '../../../models/Combat'
import { PASSIVE_CATALOG } from '../../combat/passives/catalog'
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

const skills = (classSkills: string[], subclassSkills: string[] = []) => ({
    class: classSkills.map(name => ({ name })),
    subclass: subclassSkills.map(name => ({ name }))
})

describeEmulator('habilidades ativadas e passivas de turno', () => {
    let abilityUse: typeof AbilityUse
    let turn: typeof TurnPassives
    let uses: typeof AbilityUses
    let db: admin.firestore.Firestore
    let n = 0
    let sheetId: string

    const sheet = async (): Promise<Record<string, any>> => (await db.collection('charsheets').doc(sheetId).get()).data() as Record<string, any>

    const seed = async (patch: Record<string, unknown> = {}): Promise<void> => {
        await db.collection('charsheets').doc(sheetId).set({
            id: sheetId, name: 'Aria', userId: 'user-aria', level: 10,
            skills: skills([ 'Cura Interior' ], [ 'Postura Defensiva', 'Forma Primordial', 'Postura Bestial' ]),
            attributes: { foc: 10 },
            stats: { lp: 20, maxLp: 100, mp: 12, maxMp: 30 },
            ...patch
        })
    }

    const combat = (effects: unknown[] = []): Combat => new Combat({
        isActive: true,
        phase: 'ACTION',
        round: 2,
        combatants: [ new Combatant({ id: sheetId, name: 'Aria', type: 'player', odacId: 'user-aria', currentLp: 20, maxLp: 100, currentMp: 12, maxMp: 30, effects: effects as never }) ]
    })

    const run = async (state: Combat, abilityKey: string, extra: { choiceId?: string; isGM?: boolean; force?: boolean } = {}) =>
        await abilityUse.runAbilityUse({ combat: state, combatant: state.combatants[0]!, abilityKey, isGM: false, force: false, ...extra })

    beforeAll(() => {
        initFirebaseAdmin()
        abilityUse = jest.requireActual('../../combat/abilityUse')
        turn = jest.requireActual('../../combat/turnPassives')
        uses = jest.requireActual('../abilityUses')
        db = admin.firestore()
    })

    beforeEach(async () => {
        n += 1
        sheetId = `sheet-ability-${n}-${Date.now()}`
        await seed()
    })

    describe('usos por dia na ficha', () => {
        it('soma um uso por vez até o limite; passar dele não grava nada', async () => {
            expect(await uses.consumeAbilityDayUse(sheetId, 'class:cura interior', 3)).toBe(1)
            expect(await uses.consumeAbilityDayUse(sheetId, 'class:cura interior', 3)).toBe(2)
            expect(await uses.consumeAbilityDayUse(sheetId, 'class:cura interior', 3)).toBe(3)
            await expect(uses.consumeAbilityDayUse(sheetId, 'class:cura interior', 3)).rejects.toBeInstanceOf(uses.AbilityDayLimitReached)
            expect((await sheet())['abilityUses']).toEqual({ 'class-cura-interior': 3 })
        })

        it('dois cliques juntos não passam do limite', async () => {
            const results = await Promise.allSettled([ 1, 2, 3, 4, 5 ].map(async () => await uses.consumeAbilityDayUse(sheetId, 'class:cura interior', 3)))
            expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(3)
            expect((await sheet())['abilityUses']['class-cura-interior']).toBe(3)
        })

        it('devolve um uso e o descanso renova tudo', async () => {
            await uses.consumeAbilityDayUse(sheetId, 'class:cura interior', 3)
            await uses.consumeAbilityDayUse(sheetId, 'subclass:postura defensiva', 3)
            await uses.refundAbilityDayUse(sheetId, 'class:cura interior')
            // O uso devolvido fica gravado como 0, que a leitura (`readAbilityDayUses`) não conta
            expect((await sheet())['abilityUses']).toEqual({ 'class-cura-interior': 0, 'subclass-postura-defensiva': 1 })

            await uses.resetAbilityDayUses(sheetId)
            expect((await sheet())['abilityUses']).toEqual({})
        })
    })

    describe('usar a habilidade', () => {
        it('Cura Interior: rola a cura, sobe o LP da ficha e do combatente, gasta o Bônus e conta o uso do dia e do combate', async () => {
            const state = combat()
            const outcome = await run(state, 'class:cura interior')

            expect(outcome.ok).toBe(true)
            if (!outcome.ok) return
            const heal = outcome.result.heal!
            expect(heal.notation).toBe('2d6')
            expect(heal.total).toBeGreaterThanOrEqual(2)
            expect(heal.total).toBeLessThanOrEqual(12)
            expect(heal.applied).toBe(heal.total)
            expect(state.combatants[0]!.currentLp).toBe(20 + heal.total)
            expect((await sheet())['stats']['lp']).toBe(20 + heal.total)
            expect(state.combatants[0]!.actions).toMatchObject({ bonus: 0, padrao: 1 })
            expect(state.combatants[0]!.abilityUses).toEqual({ 'class-cura-interior': 1 })
            expect((await sheet())['abilityUses']).toEqual({ 'class-cura-interior': 1 })
            expect(state.logs.at(-1)?.message).toBe(`**Aria** usou **Cura Interior** e curou **${heal.applied} de LP**.`)
            // Não gasta MP
            expect((await sheet())['stats']['mp']).toBe(12)
        })

        it('uma vez por combate: a segunda vez no mesmo combate é recusada, sem gastar mais nada; o mestre libera', async () => {
            const state = combat()
            expect((await run(state, 'class:cura interior')).ok).toBe(true)

            const second = await run(state, 'class:cura interior')
            expect(second).toMatchObject({ ok: false, status: 409, body: { code: 'ABILITY_BLOCKED', block: 'limite', canForce: false } })
            expect((await sheet())['abilityUses']).toEqual({ 'class-cura-interior': 1 })

            const forced = await run(state, 'class:cura interior', { isGM: true, force: true })
            expect(forced.ok).toBe(true)
            expect((await sheet())['abilityUses']).toEqual({ 'class-cura-interior': 2 })
        })

        it('a cura não passa do máximo e conta só o que entrou', async () => {
            await seed({ stats: { lp: 99, maxLp: 100, mp: 12, maxMp: 30 } })
            const state = combat()
            state.combatants[0]!.currentLp = 99
            const outcome = await run(state, 'class:cura interior')

            expect(outcome.ok && outcome.result.heal?.applied).toBe(1)
            expect((await sheet())['stats']['lp']).toBe(100)
        })

        it('Postura Defensiva: gasta 5 MP da ficha, põe o efeito de +3 de AP por 2 turnos e usar de novo troca o efeito', async () => {
            const state = combat()
            const outcome = await run(state, 'subclass:postura defensiva')

            expect(outcome.ok).toBe(true)
            expect((await sheet())['stats']['mp']).toBe(7)
            expect(state.combatants[0]!.currentMp).toBe(7)
            const effects = state.combatants[0]!.effects
            expect(effects).toHaveLength(1)
            expect(effects[0]).toMatchObject({ ability: { key: 'subclass:postura defensiva' }, remaining: 2, appliedAtRound: 2 })
            expect(effects[0]!.snapshot.levels[0]!.modifiers).toEqual([ { kind: 'stat_bonus', target: 'ap', value: 3 } ])

            await run(state, 'subclass:postura defensiva')
            expect(state.combatants[0]!.effects).toHaveLength(1)
            expect((await sheet())['stats']['mp']).toBe(2)
        })

        it('sem MP suficiente não gasta nada nem conta o uso do dia', async () => {
            await seed({ stats: { lp: 20, maxLp: 100, mp: 3, maxMp: 30 } })
            const state = combat()
            const outcome = await run(state, 'subclass:postura defensiva')

            expect(outcome).toMatchObject({ ok: false, status: 409, body: { block: 'sem-mp' } })
            expect((await sheet())['stats']['mp']).toBe(3)
            expect((await sheet())['abilityUses']).toBeUndefined()
            expect(state.combatants[0]!.effects).toHaveLength(0)
        })

        it('3 usos por dia: o quarto é recusado, mesmo em outro combate (a ficha guarda o dia)', async () => {
            await seed({ stats: { lp: 20, maxLp: 100, mp: 30, maxMp: 30 } })
            for (let i = 0; i < 3; i++) expect((await run(combat(), 'subclass:postura defensiva')).ok).toBe(true)

            const fourth = await run(combat(), 'subclass:postura defensiva')
            expect(fourth).toMatchObject({ ok: false, status: 409, body: { block: 'limite' } })

            await uses.resetAbilityDayUses(sheetId)
            expect((await run(combat(), 'subclass:postura defensiva')).ok).toBe(true)
        })

        it('Forma Primordial gasta todo o MP, acaba com as magias sustentadas e vale até o fim do combate', async () => {
            const sustained = { id: 's1', effectId: 'sustained:x', snapshot: { id: 'sustained:x', name: 'Barreira', levels: [] }, level: 1, remaining: 0, indefinite: true, appliedAtRound: 1, sustained: { spellKey: 'x', spellName: 'Barreira', stage: 1, cost: 4, upkeep: 2 } }
            const state = combat([ sustained ])
            const outcome = await run(state, 'subclass:forma primordial')

            expect(outcome.ok && outcome.result.cost).toBe(12)
            expect((await sheet())['stats']['mp']).toBe(0)
            const effects = state.combatants[0]!.effects
            expect(effects.map(effect => effect.snapshot.name)).toEqual([ 'Forma Primordial' ])
            expect(effects[0]).toMatchObject({ indefinite: true, remaining: 0 })
        })

        it('Postura Bestial pede a variação e põe a escolhida', async () => {
            const state = combat()
            expect(await run(state, 'subclass:postura bestial')).toMatchObject({ ok: false, body: { block: 'escolha-ausente' } })
            expect(await run(state, 'subclass:postura bestial', { choiceId: 'tigre' })).toMatchObject({ ok: false, body: { block: 'escolha-invalida' } })

            const outcome = await run(state, 'subclass:postura bestial', { choiceId: 'lobo' })
            expect(outcome.ok && outcome.result.choice).toBe('Postura do Lobo')
            expect(state.combatants[0]!.effects[0]).toMatchObject({ ability: { key: 'subclass:postura bestial', choiceId: 'lobo' } })
        })

        it('habilidade que a ficha não tem é 403; a que não é ativada é 400; ficha inexistente é 404', async () => {
            await seed({ skills: skills([]) })
            expect(await run(combat(), 'class:cura interior')).toMatchObject({ ok: false, status: 403 })
            expect(await run(combat(), 'class:armado')).toMatchObject({ ok: false, status: 400 })

            const state = combat()
            state.combatants[0]!.id = 'nao-existe'
            expect(await run(state, 'class:cura interior')).toMatchObject({ ok: false, status: 404 })
        })

        it('quem tem Necrose não cura (409 HEALING_BLOCKED); o mestre força', async () => {
            const necrose = { id: 'n1', effectId: 'seed-necrose', level: 1, remaining: 3, appliedAtRound: 1, snapshot: { id: 'seed-necrose', name: 'Necrose', levels: [ { level: 1, modifiers: [ { kind: 'no_healing' } ] } ] } }
            const state = combat([ necrose ])
            expect(await run(state, 'class:cura interior')).toMatchObject({ ok: false, status: 409, body: { code: 'HEALING_BLOCKED', canForce: false } })
            // O uso do dia não foi gasto
            expect((await sheet())['abilityUses']).toBeUndefined()

            const forced = await run(state, 'class:cura interior', { isGM: true, force: true })
            expect(forced.ok).toBe(true)
        })

        it('sem a ação disponível avisa mas usa (aviso, nunca trava)', async () => {
            const state = combat()
            state.combatants[0]!.actions = { padrao: 1, bonus: 0, movimento: 1, reacao: 1 }
            const outcome = await run(state, 'class:cura interior')

            expect(outcome.ok && outcome.warnings).toEqual([ 'Aria já não tinha a ação Bônus disponível nesta rodada.' ])
        })
    })

    describe('habilidades de área (lados e alvos marcados)', () => {
        let borinId: string
        const borinSheet = async (): Promise<Record<string, any>> => (await db.collection('charsheets').doc(borinId).get()).data() as Record<string, any>

        const team = (): Combat => new Combat({
            isActive: true,
            phase: 'ACTION',
            round: 2,
            combatants: [
                new Combatant({ id: sheetId, name: 'Aria', type: 'player', odacId: 'user-aria', currentLp: 20, maxLp: 100, currentMp: 30, maxMp: 30, effects: [] as never }),
                new Combatant({ id: borinId, name: 'Borin', type: 'player', odacId: 'user-borin', currentLp: 10, maxLp: 100, currentMp: 5, maxMp: 20, effects: [] as never }),
                new Combatant({ id: 'orc-1', name: 'Orc', type: 'creature', currentLp: 40, maxLp: 40, effects: [] as never }),
                new Combatant({ id: 'goblin-1', name: 'Goblin', type: 'creature', currentLp: 10, maxLp: 10, effects: [] as never })
            ]
        })

        const castArea = async (state: Combat, abilityKey: string, targetIds: unknown, extra: { isGM?: boolean; force?: boolean } = {}) =>
            await abilityUse.runAbilityUse({ combat: state, combatant: state.combatants[0]!, abilityKey, isGM: false, force: false, targetIds, ...extra })

        beforeEach(async () => {
            borinId = `sheet-borin-${n}-${Date.now()}`
            await seed({ skills: skills([], [ 'Chamado à Glória', 'Maldição Debilitante' ]), stats: { lp: 20, maxLp: 100, mp: 30, maxMp: 30 } })
            await db.collection('charsheets').doc(borinId).set({ id: borinId, name: 'Borin', userId: 'user-borin', level: 8, stats: { lp: 10, maxLp: 100, mp: 5, maxMp: 20 } })
        })

        it('Chamado à Glória: gasta 12 MP uma vez, põe o efeito em quem foi marcado e deixa de fora, com aviso, quem é do lado errado', async () => {
            const state = team()
            const outcome = await castArea(state, 'subclass:chamado a gloria', [ sheetId, borinId, 'orc-1' ])

            expect(outcome.ok).toBe(true)
            if (!outcome.ok) return
            expect(outcome.warnings).toEqual([ 'Orc não pode ser atingido por Chamado à Glória (lado errado ou passou do limite de alvos).' ])
            expect(outcome.result.targets?.map(target => target.name)).toEqual([ 'Aria', 'Borin' ])

            // Um gasto só de MP e de ação, na ficha de quem usou
            expect((await sheet())['stats']['mp']).toBe(18)
            expect((await borinSheet())['stats']['mp']).toBe(5)
            expect(state.combatants[0]!.actions).toMatchObject({ padrao: 0, bonus: 1 })

            for (const id of [ sheetId, borinId ]) {
                const effects = state.combatants.find(combatant => combatant.id === id)!.effects
                expect(effects).toHaveLength(1)
                expect(effects[0]).toMatchObject({ ability: { key: 'subclass:chamado a gloria' }, indefinite: true, appliedById: sheetId, appliedByName: 'Aria' })
                expect(effects[0]!.snapshot).toMatchObject({ category: 'heal' })
                expect(effects[0]!.snapshot.levels[0]).toMatchObject({ formula: '1d6' })
            }
            expect(state.combatants[2]!.effects).toHaveLength(0)

            expect(state.combatants[0]!.abilityUses).toEqual({ 'subclass-chamado-a-gloria': 1 })
            expect((await sheet())['abilityUses']).toEqual({ 'subclass-chamado-a-gloria': 1 })
            expect(state.logs.at(-1)?.message).toContain('**Aria** usou **Chamado à Glória** gastando 12 MP em Aria e Borin.')
        })

        it('uma vez por combate: a segunda vez é recusada sem gastar nada', async () => {
            const state = team()
            expect((await castArea(state, 'subclass:chamado a gloria', [ sheetId ])).ok).toBe(true)

            expect(await castArea(state, 'subclass:chamado a gloria', [ borinId ])).toMatchObject({ ok: false, status: 409, body: { block: 'limite' } })
            expect((await sheet())['stats']['mp']).toBe(18)
            expect(state.combatants[1]!.effects).toHaveLength(0)
        })

        it('sem ninguém marcado, ou só gente do lado errado, é 400 e nada é gasto nem conta o uso do dia', async () => {
            for (const targets of [ undefined, [], 'aria', [ 'orc-1', 'goblin-1', 'fantasma' ] ]) {
                const outcome = await castArea(team(), 'subclass:chamado a gloria', targets)
                expect(outcome).toMatchObject({ ok: false, status: 400, body: { code: 'AREA_TARGETS_REQUIRED' } })
            }
            expect((await sheet())['stats']['mp']).toBe(30)
            expect((await sheet())['abilityUses']).toBeUndefined()
        })

        it('Maldição Debilitante pega um inimigo só e é exclusiva: amaldiçoar outro solta o primeiro', async () => {
            const state = team()
            const first = await castArea(state, 'subclass:maldicao debilitante', [ 'orc-1' ])
            expect(first.ok).toBe(true)
            expect(state.combatants[2]!.effects).toHaveLength(1)
            expect(state.combatants[2]!.effects[0]).toMatchObject({ remaining: 3, ability: { key: 'subclass:maldicao debilitante' } })
            expect(state.combatants[2]!.effects[0]!.snapshot.levels[0]!.modifiers).toEqual([ { kind: 'disadvantage', target: 'resistance' } ])

            const second = await castArea(state, 'subclass:maldicao debilitante', [ 'goblin-1' ])
            expect(second.ok).toBe(true)
            expect(state.combatants[2]!.effects).toHaveLength(0)
            expect(state.combatants[3]!.effects).toHaveLength(1)
            expect((await sheet())['stats']['mp']).toBe(14)
        })

        it('só um alvo: o segundo marcado passa do limite e fica de fora com aviso', async () => {
            const state = team()
            const outcome = await castArea(state, 'subclass:maldicao debilitante', [ 'orc-1', 'goblin-1' ])

            expect(outcome.ok && outcome.warnings).toEqual([ 'Goblin não pode ser atingido por Maldição Debilitante (lado errado ou passou do limite de alvos).' ])
            expect(state.combatants[2]!.effects).toHaveLength(1)
            expect(state.combatants[3]!.effects).toHaveLength(0)
        })

        it('o lado marcado pelo mestre decide: um orc aliado entra no Chamado à Glória e sai da Maldição', async () => {
            const allyOrc = team()
            allyOrc.combatants[2]!.side = 'ally'

            const glory = await castArea(allyOrc, 'subclass:chamado a gloria', [ 'orc-1' ])
            expect(glory.ok).toBe(true)
            expect(allyOrc.combatants[2]!.effects).toHaveLength(1)

            const curse = await castArea(allyOrc, 'subclass:maldicao debilitante', [ 'orc-1' ])
            expect(curse).toMatchObject({ ok: false, status: 400, body: { code: 'AREA_TARGETS_REQUIRED' } })
        })

        describe('cura em área (habilidade de teste no catálogo)', () => {
            const key = 'class:cura em grupo'

            beforeEach(() => {
                ;(PASSIVE_CATALOG as Map<string, unknown>).set(key, {
                    key, source: 'class', name: 'Cura em Grupo', mode: 'ativada',
                    activation: { execution: 'Bônus', heal: { dice: '1d4+2' }, area: { affects: 'allies' } }
                })
            })

            afterEach(() => {
                ;(PASSIVE_CATALOG as Map<string, unknown>).delete(key)
            })

            it('rola uma cura por alvo, grava a vida de cada ficha e devolve uma rolagem por alvo', async () => {
                await seed({ skills: skills([ 'Cura em Grupo' ]), stats: { lp: 20, maxLp: 100, mp: 30, maxMp: 30 } })
                const state = team()
                const outcome = await castArea(state, key, [ sheetId, borinId ])

                expect(outcome.ok).toBe(true)
                if (!outcome.ok) return
                expect(outcome.result.heal).toBeNull()
                expect(outcome.result.heals?.map(roll => roll.name)).toEqual([ 'Aria', 'Borin' ])
                for (const roll of outcome.result.heals!) {
                    expect(roll.notation).toBe('1d4+2')
                    expect(roll.total).toBeGreaterThanOrEqual(3)
                    expect(roll.total).toBeLessThanOrEqual(6)
                }
                const [ aria, borin ] = outcome.result.heals!
                expect((await sheet())['stats']['lp']).toBe(20 + aria.applied)
                expect((await borinSheet())['stats']['lp']).toBe(10 + borin.applied)
                expect(state.combatants[0]!.currentLp).toBe(20 + aria.applied)
                expect(state.combatants[1]!.currentLp).toBe(10 + borin.applied)
                expect(outcome.stats.length).toBeGreaterThan(0)
                expect(state.logs.at(-1)?.message).toMatch(/\*\*Aria\*\* usou \*\*Cura em Grupo\*\* em Aria e Borin e curou Aria \(\*\*\d+\*\*\) e Borin \(\*\*\d+\*\*\)\./)
            })

            it('quem tem Necrose fica sem a cura (aviso) e o resto recebe; o mestre cura todos com force', async () => {
                await seed({ skills: skills([ 'Cura em Grupo' ]), stats: { lp: 20, maxLp: 100, mp: 30, maxMp: 30 } })
                const necrose = { id: 'n1', effectId: 'seed-necrose', level: 1, remaining: 3, appliedAtRound: 1, snapshot: { id: 'seed-necrose', name: 'Necrose', levels: [ { level: 1, modifiers: [ { kind: 'no_healing' } ] } ] } }
                const state = team()
                state.combatants[1]!.effects = [ necrose ] as never

                const outcome = await castArea(state, key, [ sheetId, borinId ])
                expect(outcome.ok).toBe(true)
                if (!outcome.ok) return
                expect(outcome.result.heals?.map(roll => roll.name)).toEqual([ 'Aria' ])
                expect(outcome.warnings.some(warning => warning.includes('Borin') && warning.includes('não recebeu a cura'))).toBe(true)
                expect((await borinSheet())['stats']['lp']).toBe(10)

                const forced = await castArea(state, key, [ sheetId, borinId ], { isGM: true, force: true })
                expect(forced.ok && forced.result.heals?.map(roll => roll.name)).toEqual([ 'Aria', 'Borin' ])
                expect((await borinSheet())['stats']['lp']).toBeGreaterThan(10)
            })
        })
    })

    describe('começo do turno', () => {
        it('Regeneração Furiosa: com o LP abaixo de 50% regenera até o teto de 50% e nunca passa dele', async () => {
            await seed({ skills: skills([ 'Regeneração Furiosa' ]), stats: { lp: 48, maxLp: 100, mp: 5, maxMp: 30 } })
            const state = combat()
            state.combatants[0]!.currentLp = 10 // velho: a ficha manda

            const notes = await turn.applyTurnStartPassives(state, state.combatants[0])

            expect((await sheet())['stats']['lp']).toBeGreaterThan(48)
            expect((await sheet())['stats']['lp']).toBeLessThanOrEqual(50)
            expect(state.combatants[0]!.currentLp).toBe((await sheet())['stats']['lp'])
            expect(notes).toMatch(/\*\*Aria\*\* regenerou \*\*\d+ de LP\*\* \(Regeneração Furiosa\)\./)
        })

        it('com 50% ou mais de LP não regenera nada', async () => {
            await seed({ skills: skills([ 'Regeneração Furiosa' ]), stats: { lp: 50, maxLp: 100, mp: 5, maxMp: 30 } })
            const state = combat()
            expect(await turn.applyTurnStartPassives(state, state.combatants[0])).toBe('')
            expect((await sheet())['stats']['lp']).toBe(50)
        })

        it('Ligeireza: furtivo ganha +2 ações de Movimento no começo do turno; sem furtividade nada', async () => {
            await seed({ skills: skills([ 'Ligeireza' ]), stats: { lp: 80, maxLp: 100, mp: 5, maxMp: 30 } })
            const furtivo = { id: 'f1', effectId: 'seed-furtivo', level: 1, remaining: 0, indefinite: true, appliedAtRound: 1, snapshot: { id: 'seed-furtivo', name: 'Furtivo', levels: [] } }

            const hidden = combat([ furtivo ])
            const notes = await turn.applyTurnStartPassives(hidden, hidden.combatants[0])
            expect(hidden.combatants[0]!.actions).toMatchObject({ movimento: 3 })
            expect(notes).toContain('está furtivo: Ligeireza dá +2 ações de Movimento.')

            const visible = combat()
            expect(await turn.applyTurnStartPassives(visible, visible.combatants[0])).toBe('')
            expect(visible.combatants[0]!.actions).toBeUndefined()
        })

        it('Disfarce: entrar em furtividade no próprio turno dá +1 Padrão; no turno dos outros não', async () => {
            await seed({ skills: skills([ 'Disfarce' ]), stats: { lp: 80, maxLp: 100, mp: 5, maxMp: 30 } })
            const furtivo = { id: 'f1', effectId: 'seed-furtivo', level: 1, remaining: 0, indefinite: true, appliedAtRound: 1, snapshot: { id: 'seed-furtivo', name: 'Furtivo', levels: [] } }

            const own = combat([ furtivo ])
            expect(await turn.applyStealthEntryPassives(own, own.combatants[0]!)).toContain('Disfarce dá +1 ação Padrão')
            expect(own.combatants[0]!.actions).toMatchObject({ padrao: 2 })

            const other = combat([ furtivo ])
            other.combatants.unshift(new Combatant({ id: 'goblin-1', name: 'Goblin', type: 'creature', effects: [] }))
            other.currentTurnIndex = 0
            expect(await turn.applyStealthEntryPassives(other, other.combatants[1]!)).toBe('')
        })

        it('criatura e ficha sem as passivas não são tocadas', async () => {
            const state = combat()
            expect(await turn.applyTurnStartPassives(state, undefined)).toBe('')
            state.combatants.push(new Combatant({ id: 'goblin-1', name: 'Goblin', type: 'creature', effects: [] }))
            expect(await turn.applyTurnStartPassives(state, state.combatants[1])).toBe('')
            await seed({ skills: skills([ 'Treinado' ]) })
            expect(await turn.applyTurnStartPassives(state, state.combatants[0])).toBe('')
        })
    })
})
