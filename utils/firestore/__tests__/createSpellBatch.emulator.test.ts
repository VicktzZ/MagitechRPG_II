/**
 * Criação de um lote de magias novas (scripts/createSpellBatch.ts) contra o emulador do Firestore.
 * Só roda com o emulador ligado; sem ele os testes são ignorados (ver applySpellTypeChanges.emulator.test.ts).
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as Script from '../../../scripts/createSpellBatch'
import type { SeedSpell } from '../../../scripts/data/manaRecoverySpells'
import { initFirebaseAdmin } from '../../initializeFireOrm'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

const spell = (id: string, name: string): SeedSpell => ({
    id,
    element: 'LUZ',
    name,
    level: 1,
    mpCost: 1,
    type: 'Utilidade (imediato)',
    execution: 'Padrão',
    range: 'Curto',
    stages: [ 'estágio um', 'estágio dois', 'estágio três' ]
})

describeEmulator('criação de um lote de magias novas', () => {
    let script: typeof Script
    let db: admin.firestore.Firestore
    const batch = [ spell('lote-a', 'Lote Alfa Teste'), spell('lote-b', 'Lote Beta Teste') ]
    const ids = [ ...batch.map(entry => entry.id), 'lote-existente', 'lote-outro-id' ]
    const read = async (id: string) => (await db.collection('spells').doc(id).get()).data() as Record<string, unknown> | undefined

    beforeAll(() => {
        initFirebaseAdmin()
        script = jest.requireActual('../../../scripts/createSpellBatch')
        db = admin.firestore()
    })

    beforeEach(async () => {
        await Promise.all(ids.map(async id => await db.collection('spells').doc(id).delete()))
    })

    afterAll(async () => {
        await Promise.all(ids.map(async id => await db.collection('spells').doc(id).delete()))
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    test('a simulação só relata: não grava', async () => {
        const report = await script.createSpellBatch({ batch })
        expect(report.plan.ok).toBe(true)
        expect(report.plan.create.map(entry => entry.id)).toEqual([ 'lote-a', 'lote-b' ])
        expect(report.created).toEqual([])
        expect(await read('lote-a')).toBeUndefined()
    })

    test('--apply cria os documentos com os campos do catálogo e a releitura confere', async () => {
        const report = await script.createSpellBatch({ apply: true, batch })
        expect(report.created.map(entry => entry.id)).toEqual([ 'lote-a', 'lote-b' ])
        expect(report.mismatches).toEqual([])
        expect(report.catalogSize.after).toBe(report.catalogSize.before + 2)

        const stored = await read('lote-a')
        expect(stored).toEqual({
            id: 'lote-a',
            element: 'LUZ',
            name: 'Lote Alfa Teste',
            level: 1,
            mpCost: 1,
            type: 'Utilidade (imediato)',
            execution: 'Padrão',
            range: 'Curto',
            stages: [ 'estágio um', 'estágio dois', 'estágio três' ]
        })
        expect(typeof stored?.['level']).toBe('number')
    })

    test('id que já existe aborta o lote inteiro: nada é criado e o documento existente fica como está', async () => {
        await db.collection('spells').doc('lote-b').set({ id: 'lote-b', name: 'Feita à mão', type: 'Ataque (imediato)' })
        const report = await script.createSpellBatch({ apply: true, batch })
        expect(report.plan.ok).toBe(false)
        expect(report.plan.idCollisions.map(entry => entry.id)).toEqual([ 'lote-b' ])
        expect(report.created).toEqual([])
        expect(await read('lote-a')).toBeUndefined()
        expect((await read('lote-b'))?.['name']).toBe('Feita à mão')
    })

    test('nome que já existe em outro id também aborta, sem acento nem caixa', async () => {
        await db.collection('spells').doc('lote-outro-id').set({ id: 'lote-outro-id', name: 'lote ALFA teste', type: 'Ataque (imediato)' })
        const report = await script.createSpellBatch({ apply: true, batch })
        expect(report.plan.ok).toBe(false)
        expect(report.plan.nameCollisions).toEqual([ { id: 'lote-a', name: 'Lote Alfa Teste', existingId: 'lote-outro-id' } ])
        expect(await read('lote-a')).toBeUndefined()
        expect(await read('lote-b')).toBeUndefined()
    })

    test('rodar --apply de novo não sobrescreve nada: aborta por colisão de id', async () => {
        await script.createSpellBatch({ apply: true, batch })
        await db.collection('spells').doc('lote-a').update({ type: 'Ataque (imediato)' })
        const second = await script.createSpellBatch({ apply: true, batch })
        expect(second.plan.ok).toBe(false)
        expect(second.created).toEqual([])
        expect((await read('lote-a'))?.['type']).toBe('Ataque (imediato)')
    })

    test('--revert apaga só as magias cujo nome ainda é o gravado e simula sem --apply', async () => {
        const report = await script.createSpellBatch({ apply: true, batch })
        await db.collection('spells').doc('lote-b').update({ name: 'Renomeada depois' })

        const dry = await script.revertSpellBatch(report.created, false)
        expect(dry).toEqual({ deleted: [ 'lote-a' ], skipped: [ 'lote-b' ] })
        expect(await read('lote-a')).toBeDefined()

        const real = await script.revertSpellBatch(report.created, true)
        expect(real).toEqual({ deleted: [ 'lote-a' ], skipped: [ 'lote-b' ] })
        expect(await read('lote-a')).toBeUndefined()
        expect((await read('lote-b'))?.['name']).toBe('Renomeada depois')
    })
})
