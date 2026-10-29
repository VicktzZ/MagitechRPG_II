/**
 * Troca de `type` das magias que recuperam mana (scripts/applySpellTypeChanges.ts) contra o emulador do Firestore.
 * Só roda com o emulador ligado; sem ele os testes são ignorados (ver normalizeCharsheets.emulator.test.ts).
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as Script from '../../../scripts/applySpellTypeChanges'
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

describeEmulator('troca do type das magias de Recuperação', () => {
    let script: typeof Script
    let db: admin.firestore.Firestore
    const ids = [ 'tipo-a', 'tipo-b', 'tipo-c', 'tipo-d' ]

    const changes = [
        { id: 'tipo-a', name: 'A', from: 'Ataque (imediato)', to: 'Ataque/Recuperação (imediato)' },
        { id: 'tipo-b', name: 'B', from: 'Suporte (contínuo)', to: 'Recuperação (contínuo)' },
        { id: 'tipo-c', name: 'C', from: 'Cura (Imediato)', to: 'Cura/Recuperação (Imediato)' },
        { id: 'tipo-d', name: 'D (não existe)', from: 'Defesa (imediato)', to: 'Defesa/Recuperação (imediato)' }
    ]
    const spell = (type: string) => ({ name: 'Magia', type, level: '2', mpCost: '3', element: 'FOGO', execution: 'Padrão', range: 'Curto', stages: [ 'um', 'dois', 'três' ] })
    const read = async (id: string) => (await db.collection('spells').doc(id).get()).data() as Record<string, unknown> | undefined

    beforeAll(() => {
        initFirebaseAdmin()
        script = jest.requireActual('../../../scripts/applySpellTypeChanges')
        db = admin.firestore()
    })

    beforeEach(async () => {
        await db.collection('spells').doc('tipo-a').set(spell('Ataque (imediato)'))
        await db.collection('spells').doc('tipo-b').set(spell('Suporte (contínuo)'))
        // editada à mão depois do mapeamento: não pode ser sobrescrita
        await db.collection('spells').doc('tipo-c').set(spell('Cura (Conjurado)'))
        await db.collection('spells').doc('tipo-d').delete()
    })

    afterAll(async () => {
        await Promise.all(ids.map(async id => await db.collection('spells').doc(id).delete()))
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    test('a simulação só relata: não grava', async () => {
        const report = await script.applySpellTypeChanges({ changes })
        expect(report.plan.update.map(c => c.id)).toEqual([ 'tipo-a', 'tipo-b' ])
        expect(report.plan.conflicts.map(c => c.id)).toEqual([ 'tipo-c' ])
        expect(report.plan.missing.map(c => c.id)).toEqual([ 'tipo-d' ])
        expect(report.applied).toEqual([])
        expect((await read('tipo-a'))?.['type']).toBe('Ataque (imediato)')
    })

    test('--apply troca só o type e pula a magia editada à mão', async () => {
        const report = await script.applySpellTypeChanges({ apply: true, changes })
        expect(report.applied.map(c => c.id)).toEqual([ 'tipo-a', 'tipo-b' ])

        expect(await read('tipo-a')).toEqual({ ...spell('Ataque/Recuperação (imediato)') })
        expect((await read('tipo-b'))?.['type']).toBe('Recuperação (contínuo)')
        expect((await read('tipo-c'))?.['type']).toBe('Cura (Conjurado)')
        expect(await read('tipo-d')).toBeUndefined()
    })

    test('rodar de novo não muda nada (idempotente)', async () => {
        await script.applySpellTypeChanges({ apply: true, changes })
        const again = await script.applySpellTypeChanges({ apply: true, changes })
        expect(again.applied).toEqual([])
        expect(again.plan.already.map(c => c.id)).toEqual([ 'tipo-a', 'tipo-b' ])
        expect((await read('tipo-a'))?.['type']).toBe('Ataque/Recuperação (imediato)')
    })

    test('desfazer com as trocas feitas devolve o type antigo', async () => {
        const { applied } = await script.applySpellTypeChanges({ apply: true, changes })
        const undone = await script.applySpellTypeChanges({ apply: true, changes: invertSpellTypeChanges(applied) })
        expect(undone.applied.map(c => c.id)).toEqual([ 'tipo-a', 'tipo-b' ])
        expect((await read('tipo-a'))?.['type']).toBe('Ataque (imediato)')
        expect((await read('tipo-b'))?.['type']).toBe('Suporte (contínuo)')
    })
})

describeEmulator('renomear magias pelo mesmo script (campo name) e leitura em fatias', () => {
    let script: typeof Script
    let db: admin.firestore.Firestore
    const bulkIds = Array.from({ length: 305 }, (_unused, index) => `renomear-lote-${index}`)
    const spell = (name: string, type = 'Ataque (imediato)') => ({ name, type, level: '1', mpCost: '1', element: 'FOGO', execution: 'Padrão', range: 'Curto', stages: [ 'um', 'dois', 'três' ] })
    const read = async (id: string) => (await db.collection('spells').doc(id).get()).data() as Record<string, unknown> | undefined

    beforeAll(() => {
        initFirebaseAdmin()
        script = jest.requireActual('../../../scripts/applySpellTypeChanges')
        db = admin.firestore()
    })

    afterAll(async () => {
        await Promise.all([ 'renomear-a', 'renomear-b', ...bulkIds ].map(async id => await db.collection('spells').doc(id).delete()))
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    test('com field "name" só o nome muda: o type fica como está, e quem foi editado à mão é conflito', async () => {
        await db.collection('spells').doc('renomear-a').set(spell('Voo', 'Ataque (imediato/Área)'))
        await db.collection('spells').doc('renomear-b').set(spell('Nome editado à mão'))
        const changes = [
            { id: 'renomear-a', name: 'Voo', from: 'Voo', to: 'Rajada Repulsiva' },
            { id: 'renomear-b', name: 'Onda', from: 'Onda', to: 'Golpe de Onda' }
        ]

        const simulation = await script.applySpellTypeChanges({ changes, field: 'name' })
        expect(simulation.plan.update.map(change => change.id)).toEqual([ 'renomear-a' ])
        expect(simulation.plan.conflicts.map(change => change.id)).toEqual([ 'renomear-b' ])
        expect((await read('renomear-a'))?.['name']).toBe('Voo')

        const applied = await script.applySpellTypeChanges({ changes, field: 'name', apply: true })
        expect(applied.applied.map(change => change.id)).toEqual([ 'renomear-a' ])
        expect(await read('renomear-a')).toMatchObject({ name: 'Rajada Repulsiva', type: 'Ataque (imediato/Área)', level: '1', element: 'FOGO' })
        expect((await read('renomear-b'))?.['name']).toBe('Nome editado à mão')

        // rodar de novo não faz mal, e desfazer devolve o nome
        expect((await script.applySpellTypeChanges({ changes, field: 'name', apply: true })).applied).toEqual([])
        const undo = await script.applySpellTypeChanges({ changes: invertSpellTypeChanges(applied.applied), field: 'name', apply: true })
        expect(undo.applied.map(change => change.id)).toEqual([ 'renomear-a' ])
        expect((await read('renomear-a'))?.['name']).toBe('Voo')
    })

    test('mais de 300 trocas de uma vez: a leitura em lote vai em fatias e todas são vistas', async () => {
        const batch = db.batch()
        for (const id of bulkIds) batch.set(db.collection('spells').doc(id), spell(`Antigo ${id}`))
        await batch.commit()
        const changes = bulkIds.map(id => ({ id, name: `Antigo ${id}`, from: `Antigo ${id}`, to: `Novo ${id}` }))

        const report = await script.applySpellTypeChanges({ changes, field: 'name', apply: true })
        expect(report.plan.update).toHaveLength(305)
        expect(report.applied).toHaveLength(305)
        expect((await read(bulkIds[304]!))?.['name']).toBe(`Novo ${bulkIds[304]}`)
    })
})
