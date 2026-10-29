/**
 * Troca da execução "Livre" por "Bônus" (scripts/renameSpellExecution.ts) contra o emulador do Firestore.
 * Só roda com o emulador ligado; sem ele os testes são ignorados (ver applySpellTypeChanges.emulator.test.ts).
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as Script from '../../../scripts/renameSpellExecution'
import { initFirebaseAdmin } from '../../initializeFireOrm'
import { invertSpellTypeChanges } from '../../spellTypeChanges'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

describeEmulator('troca da execução Livre por Bônus', () => {
    let script: typeof Script
    let db: admin.firestore.Firestore
    const ids = [ 'exec-livre', 'exec-livre-min', 'exec-padrao', 'exec-bonus', 'exec-vazia' ]

    const spell = (name: string, execution: string | undefined) => ({
        name, type: 'Ataque (imediato)', level: 2, mpCost: 3, element: 'FOGO', ...(execution === undefined ? {} : { execution }), range: 'Curto', stages: [ 'um', 'dois', 'três' ]
    })
    const read = async (id: string) => (await db.collection('spells').doc(id).get()).data() as Record<string, unknown> | undefined

    beforeAll(() => {
        initFirebaseAdmin()
        script = jest.requireActual('../../../scripts/renameSpellExecution')
        db = admin.firestore()
    })

    beforeEach(async () => {
        await db.collection('spells').doc('exec-livre').set(spell('Livre A', 'Livre'))
        await db.collection('spells').doc('exec-livre-min').set(spell('Livre B', ' livre '))
        await db.collection('spells').doc('exec-padrao').set(spell('Padrão', 'Padrão'))
        await db.collection('spells').doc('exec-bonus').set(spell('Já bônus', 'Bônus'))
        await db.collection('spells').doc('exec-vazia').set(spell('Sem execução', undefined))
    })

    afterAll(async () => {
        await Promise.all(ids.map(async id => await db.collection('spells').doc(id).delete()))
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    test('a simulação acha só as magias com Livre (qualquer caixa) e não grava', async () => {
        const report = await script.renameSpellExecution()

        expect(report.plan.update.map(change => change.id).sort()).toEqual([ 'exec-livre', 'exec-livre-min' ])
        expect(report.applied).toEqual([])
        expect((await read('exec-livre'))?.['execution']).toBe('Livre')
    })

    test('--apply troca só o campo execution e deixa o resto do documento', async () => {
        const before = await read('exec-livre')
        const report = await script.renameSpellExecution({ apply: true })

        expect(report.applied.map(change => change.id).sort()).toEqual([ 'exec-livre', 'exec-livre-min' ])
        expect(await read('exec-livre')).toEqual({ ...before, execution: 'Bônus' })
        expect((await read('exec-livre-min'))?.['execution']).toBe('Bônus')
        expect((await read('exec-padrao'))?.['execution']).toBe('Padrão')
        expect((await read('exec-bonus'))?.['execution']).toBe('Bônus')
        expect(await read('exec-vazia')).not.toHaveProperty('execution')
    })

    test('rodar de novo não faz nada', async () => {
        await script.renameSpellExecution({ apply: true })
        const again = await script.renameSpellExecution({ apply: true })

        expect(again.plan.update).toEqual([])
        expect(again.applied).toEqual([])
    })

    test('magia editada entre a leitura e a gravação é pulada', async () => {
        const changes = await script.findLivreChanges()
        await db.collection('spells').doc('exec-livre').update({ execution: 'Reação' })

        const report = await script.renameSpellExecution({ apply: true, changes })

        expect(report.plan.conflicts.map(change => change.id)).toEqual([ 'exec-livre' ])
        expect((await read('exec-livre'))?.['execution']).toBe('Reação')
        expect(report.applied.map(change => change.id)).toEqual([ 'exec-livre-min' ])
    })

    test('o backup desfaz: volta ao texto que cada magia tinha', async () => {
        const { applied } = await script.renameSpellExecution({ apply: true })
        const reverted = await script.renameSpellExecution({ apply: true, changes: invertSpellTypeChanges(applied) })

        expect(reverted.applied).toHaveLength(2)
        expect((await read('exec-livre'))?.['execution']).toBe('Livre')
        expect((await read('exec-livre-min'))?.['execution']).toBe(' livre ')
    })
})
