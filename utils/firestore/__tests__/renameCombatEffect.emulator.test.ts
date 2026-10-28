/**
 * Renomear o efeito "Visão na Penumbra" para "Visão Aprimorada" (scripts/renameCombatEffect.ts) contra o emulador do Firestore.
 * Só roda com o emulador ligado; sem ele os testes são ignorados (ver applySpellTypeChanges.emulator.test.ts).
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as Script from '../../../scripts/renameCombatEffect'
import { initFirebaseAdmin } from '../../initializeFireOrm'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

describeEmulator('renomear o efeito Visão na Penumbra', () => {
    let script: typeof Script
    let db: admin.firestore.Firestore
    const effect = { name: 'Visão na Penumbra', category: 'buff', scope: 'global', levels: [ { level: 1, formula: '0', duration: 3 } ] }
    const read = async (id: string) => (await db.collection('combatEffects').doc(id).get()).data() as Record<string, unknown> | undefined

    beforeAll(() => {
        initFirebaseAdmin()
        script = jest.requireActual('../../../scripts/renameCombatEffect')
        db = admin.firestore()
    })

    beforeEach(async () => {
        await db.collection('combatEffects').doc('seed-visao-penumbra').set(effect)
        await db.collection('combatEffects').doc('clone-do-mestre').set({ ...effect, scope: 'campaign' })
    })

    afterAll(async () => {
        await Promise.all([ 'seed-visao-penumbra', 'clone-do-mestre' ].map(async id => await db.collection('combatEffects').doc(id).delete()))
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    test('a simulação diz o que faria e não grava', async () => {
        const report = await script.renameCombatEffect()

        expect(report).toMatchObject({ status: 'update', current: 'Visão na Penumbra', applied: false })
        expect((await read('seed-visao-penumbra'))?.['name']).toBe('Visão na Penumbra')
    })

    test('--apply troca só o nome e deixa o resto do documento e as cópias dos mestres', async () => {
        const report = await script.renameCombatEffect({ apply: true })

        expect(report).toMatchObject({ status: 'update', applied: true })
        expect(await read('seed-visao-penumbra')).toEqual({ ...effect, name: 'Visão Aprimorada' })
        expect((await read('clone-do-mestre'))?.['name']).toBe('Visão na Penumbra')
    })

    test('rodar de novo não faz nada', async () => {
        await script.renameCombatEffect({ apply: true })
        const again = await script.renameCombatEffect({ apply: true })

        expect(again).toMatchObject({ status: 'already', applied: false })
    })

    test('nome editado à mão é conflito e não é tocado', async () => {
        await db.collection('combatEffects').doc('seed-visao-penumbra').update({ name: 'Visão Noturna' })
        const report = await script.renameCombatEffect({ apply: true })

        expect(report).toMatchObject({ status: 'conflict', current: 'Visão Noturna', applied: false })
        expect((await read('seed-visao-penumbra'))?.['name']).toBe('Visão Noturna')
    })

    test('--revert volta o nome antigo', async () => {
        await script.renameCombatEffect({ apply: true })
        const report = await script.renameCombatEffect({ apply: true, revert: true })

        expect(report).toMatchObject({ status: 'update', applied: true, to: 'Visão na Penumbra' })
        expect((await read('seed-visao-penumbra'))?.['name']).toBe('Visão na Penumbra')
    })

    test('sem o documento, é inexistente', async () => {
        await db.collection('combatEffects').doc('seed-visao-penumbra').delete()
        const report = await script.renameCombatEffect({ apply: true })

        expect(report).toMatchObject({ status: 'missing', applied: false })
    })
})
