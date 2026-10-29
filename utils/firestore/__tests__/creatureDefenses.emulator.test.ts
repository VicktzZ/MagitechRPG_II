/**
 * Defesas das criaturas num documento privado (utils/firestore/gmData.ts) e a migração das antigas (scripts/moveCreatureDefenses.ts) contra o
 * emulador do Firestore. Só roda com o emulador ligado; sem ele os testes são ignorados (ver gmNotes.emulator.test.ts).
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import { mkdtempSync, readFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import admin from 'firebase-admin'
import type * as GmData from '../gmData'
import type * as Script from '../../../scripts/moveCreatureDefenses'
import { initFirebaseAdmin } from '../../initializeFireOrm'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

const fire = { elementalMastery: 'Fogo', weaknesses: [ 'Cortante' ], damageModifiers: [ { kind: 'resistance', element: 'Fogo', value: '25%' } ] }

describeEmulator('defesas das criaturas em gmData', () => {
    let lib: typeof GmData
    let script: typeof Script
    let db: admin.firestore.Firestore
    let n = 0
    let campaignId: string
    let dir: string

    const campaignRef = () => db.collection('campaigns').doc(campaignId)
    const creaturesOf = async () => ((await campaignRef().get()).data() as { custom: { creatures: Array<Record<string, unknown>> } }).custom.creatures

    beforeAll(() => {
        initFirebaseAdmin()
        lib = jest.requireActual('../gmData')
        script = jest.requireActual('../../../scripts/moveCreatureDefenses')
        db = admin.firestore()
        dir = mkdtempSync(join(tmpdir(), 'defenses-'))
    })

    beforeEach(async () => {
        campaignId = `camp-def-${++n}-${Date.now()}`
        await campaignRef().set({
            id: campaignId,
            admin: [ 'gm' ],
            custom: {
                effects: [ 'fica' ],
                creatures: [ { id: 'goblin', name: 'Goblin', ...fire }, { id: 'orc', name: 'Orc' }, { id: 'a/b', name: 'Barra', elementalMastery: 'Ar', weaknesses: [], damageModifiers: [] } ]
            }
        })
    })

    afterAll(async () => {
        rmSync(dir, { recursive: true, force: true })
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    describe('gravar e ler', () => {
        it('grava as defesas limpas, com quem gravou e o horário do servidor', async () => {
            const raw = { elementalMastery: '  Fogo ', weaknesses: [ 'Cortante', 'cortante' ], damageModifiers: [ { kind: 'resistance' as const, value: '10%' } ] }
            await lib.saveCreatureDefenses(campaignId, 'goblin', raw, 'gm')

            const data = (await campaignRef().collection('gmData').doc(lib.creatureDefensesDocId('goblin')).get()).data()
            expect(data).toMatchObject({
                kind: 'creatureDefenses',
                creatureId: 'goblin',
                elementalMastery: 'Fogo',
                weaknesses: [ 'Cortante' ],
                damageModifiers: [ { kind: 'resistance', value: '10%' } ],
                updatedBy: 'gm'
            })
            expect(data?.['updatedAt']).toBeInstanceOf(admin.firestore.Timestamp)
            expect(await lib.getCreatureDefenses(campaignId, 'goblin')).toEqual({ elementalMastery: 'Fogo', weaknesses: [ 'Cortante' ], damageModifiers: [ { kind: 'resistance', value: '10%' } ] })
        })

        it('gravar de novo sobrescreve o documento inteiro', async () => {
            await lib.saveCreatureDefenses(campaignId, 'goblin', { elementalMastery: 'Fogo', weaknesses: [ 'Cortante' ], damageModifiers: [] }, 'gm')
            await lib.saveCreatureDefenses(campaignId, 'goblin', { elementalMastery: '', weaknesses: [], damageModifiers: [] }, 'gm')
            expect(await lib.getCreatureDefenses(campaignId, 'goblin')).toEqual({ elementalMastery: '', weaknesses: [], damageModifiers: [] })
        })

        it('criatura sem documento privado devolve null (valem os campos antigos dela)', async () => {
            expect(await lib.getCreatureDefenses(campaignId, 'orc')).toBeNull()
        })

        it('id de criatura com "/" cabe num id de documento e volta pelo creatureId', async () => {
            await lib.saveCreatureDefenses(campaignId, 'a/b', { elementalMastery: 'Ar', weaknesses: [], damageModifiers: [] }, 'gm')
            expect(await lib.readCreatureDefenses(campaignId)).toEqual({ 'a/b': { elementalMastery: 'Ar', weaknesses: [], damageModifiers: [] } })
        })

        it('readCreatureDefenses lista só as defesas, ignorando documentos de outro tipo', async () => {
            await lib.saveCreatureDefenses(campaignId, 'goblin', { elementalMastery: 'Fogo', weaknesses: [], damageModifiers: [] }, 'gm')
            await lib.saveCreatureDefenses(campaignId, 'orc', { elementalMastery: 'Terra', weaknesses: [ 'Água' ], damageModifiers: [] }, 'gm')
            await campaignRef().collection('gmData').doc('awareness').set({ kind: 'awareness', pairs: [] })

            const all = await lib.readCreatureDefenses(campaignId)
            expect(Object.keys(all).sort()).toEqual([ 'goblin', 'orc' ])
            expect(all['orc']?.weaknesses).toEqual([ 'Água' ])
        })

        it('apagar a criatura apaga o documento; apagar a campanha limpa a subcoleção inteira', async () => {
            await lib.saveCreatureDefenses(campaignId, 'goblin', { elementalMastery: 'Fogo', weaknesses: [], damageModifiers: [] }, 'gm')
            await lib.saveCreatureDefenses(campaignId, 'orc', { elementalMastery: 'Terra', weaknesses: [], damageModifiers: [] }, 'gm')

            await lib.deleteCreatureDefenses(campaignId, 'goblin')
            expect(await lib.getCreatureDefenses(campaignId, 'goblin')).toBeNull()
            expect(await lib.getCreatureDefenses(campaignId, 'orc')).not.toBeNull()

            await lib.deleteGmData(campaignId)
            expect((await campaignRef().collection('gmData').get()).size).toBe(0)
        })
    })

    describe('mover as defesas das criaturas antigas', () => {
        it('a simulação diz o que moveria e não grava nada', async () => {
            const report = await script.moveCreatureDefenses({ campaignId })

            expect(report.campaigns).toHaveLength(1)
            expect(report.campaigns[0]).toMatchObject({ campaignId, applied: false })
            expect(report.campaigns[0]?.moves.map(move => move.creatureId).sort()).toEqual([ 'a/b', 'goblin' ])
            expect((await creaturesOf())[0]).toMatchObject({ id: 'goblin', elementalMastery: 'Fogo' })
            expect((await campaignRef().collection('gmData').get()).size).toBe(0)
        })

        it('--apply cria o documento privado, tira os campos da criatura e deixa o resto da campanha como estava', async () => {
            const file = join(dir, `backup-${campaignId}.json`)
            const report = await script.moveCreatureDefenses({ campaignId, apply: true, backupFile: file })

            expect(report.campaigns[0]).toMatchObject({ applied: true })
            const creatures = await creaturesOf()
            expect(creatures.find(creature => creature['id'] === 'goblin')).toEqual({ id: 'goblin', name: 'Goblin' })
            expect(creatures.find(creature => creature['id'] === 'orc')).toEqual({ id: 'orc', name: 'Orc' })
            expect(creatures.find(creature => creature['id'] === 'a/b')).toEqual({ id: 'a/b', name: 'Barra' })
            expect(((await campaignRef().get()).data() as { custom: { effects: unknown[] } }).custom.effects).toEqual([ 'fica' ])
            expect(await lib.getCreatureDefenses(campaignId, 'goblin')).toEqual(fire)
            expect((await lib.getCreatureDefenses(campaignId, 'a/b'))?.elementalMastery).toBe('Ar')
            expect(await lib.getCreatureDefenses(campaignId, 'orc')).toBeNull()

            const backup = JSON.parse(readFileSync(file, 'utf8')) as { campaigns: Record<string, Record<string, unknown>> }
            expect(backup.campaigns[campaignId]?.['goblin']).toEqual(fire)
        })

        it('rodar de novo não faz nada', async () => {
            await script.moveCreatureDefenses({ campaignId, apply: true })
            const again = await script.moveCreatureDefenses({ campaignId, apply: true })
            expect(again.campaigns).toEqual([])
        })

        it('documento privado que já existe NÃO é sobrescrito: vale o que o mestre editou depois; a criatura só perde os campos', async () => {
            await lib.saveCreatureDefenses(campaignId, 'goblin', { elementalMastery: 'Água', weaknesses: [], damageModifiers: [] }, 'gm')

            const report = await script.moveCreatureDefenses({ campaignId, apply: true })
            expect(report.campaigns[0]?.moves.find(move => move.creatureId === 'goblin')).toMatchObject({ keptExisting: true })
            expect((await lib.getCreatureDefenses(campaignId, 'goblin'))?.elementalMastery).toBe('Água')
            expect((await creaturesOf())[0]).toEqual({ id: 'goblin', name: 'Goblin' })
        })

        it('--campaign mexe só nessa campanha', async () => {
            const otherId = `${campaignId}-outra`
            await db.collection('campaigns').doc(otherId).set({ id: otherId, admin: [ 'gm' ], custom: { creatures: [ { id: 'x', name: 'X', elementalMastery: 'Ar' } ] } })

            await script.moveCreatureDefenses({ campaignId, apply: true })
            const other = ((await db.collection('campaigns').doc(otherId).get()).data() as { custom: { creatures: Array<Record<string, unknown>> } }).custom.creatures
            expect(other[0]).toMatchObject({ elementalMastery: 'Ar' })
        })

        it('a criatura criada já sem os campos não é tocada', async () => {
            await campaignRef().update({ 'custom.creatures': [ { id: 'novo', name: 'Novo' } ] })
            const report = await script.moveCreatureDefenses({ campaignId, apply: true })
            expect(report.campaigns).toEqual([])
        })
    })

    describe('desfazer a migração', () => {
        it('devolve os campos à criatura e apaga o documento privado', async () => {
            const file = join(dir, `revert-${campaignId}.json`)
            await script.moveCreatureDefenses({ campaignId, apply: true, backupFile: file })

            const dry = await script.revertCreatureDefenses({ backupFile: file })
            expect(dry.restored).toHaveLength(2)
            expect(await lib.getCreatureDefenses(campaignId, 'goblin')).not.toBeNull()

            const report = await script.revertCreatureDefenses({ backupFile: file, apply: true })
            expect(report.skipped).toEqual([])
            expect((await creaturesOf()).find(creature => creature['id'] === 'goblin')).toEqual({ id: 'goblin', name: 'Goblin', ...fire })
            expect(await lib.getCreatureDefenses(campaignId, 'goblin')).toBeNull()
        })

        it('pula a criatura cujas defesas o mestre editou depois da migração, dizendo por quê', async () => {
            const file = join(dir, `revert-edit-${campaignId}.json`)
            await script.moveCreatureDefenses({ campaignId, apply: true, backupFile: file })
            await lib.saveCreatureDefenses(campaignId, 'goblin', { elementalMastery: 'Gelo', weaknesses: [], damageModifiers: [] }, 'gm')

            const report = await script.revertCreatureDefenses({ backupFile: file, apply: true })
            expect(report.skipped).toHaveLength(1)
            expect(report.skipped[0]).toMatchObject({ creatureId: 'goblin' })
            expect(report.skipped[0]?.reason).toContain('editou')
            expect((await lib.getCreatureDefenses(campaignId, 'goblin'))?.elementalMastery).toBe('Gelo')
            expect((await creaturesOf()).find(creature => creature['id'] === 'goblin')).toEqual({ id: 'goblin', name: 'Goblin' })
            expect((await creaturesOf()).find(creature => creature['id'] === 'a/b')).toMatchObject({ elementalMastery: 'Ar' })
        })
    })
})
