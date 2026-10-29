/**
 * Correções do catálogo de magias (scripts/applySpellCatalogFixes.ts e scripts/removeDuplicateSpells.ts) contra o emulador do Firestore.
 * Só roda com o emulador ligado; sem ele os testes são ignorados (ver applySpellTypeChanges.emulator.test.ts).
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as Fixes from '../../../scripts/applySpellCatalogFixes'
import type * as Duplicates from '../../../scripts/removeDuplicateSpells'
import { initFirebaseAdmin } from '../../initializeFireOrm'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

const spell = (id: string, extra: Record<string, unknown> = {}) => ({
    id, name: 'Magia de Teste', element: 'FOGO', level: 1, mpCost: 1, type: 'Utilidade (imediato)', execution: 'Padrão', range: 'Curto', stages: [ 'um', 'dois', 'três' ], ...extra
})

describeEmulator('correções do catálogo de magias', () => {
    let fixes: typeof Fixes
    let duplicates: typeof Duplicates
    let db: admin.firestore.Firestore
    const sheetId = 'ficha-fix-teste'
    const ids = [ 'fix-el-a', 'fix-el-b', 'fix-tipo-a', 'fix-tipo-b', 'dup-remove', 'dup-keep', 'dup-remove-2', 'dup-keep-2' ]
    const read = async (id: string) => (await db.collection('spells').doc(id).get()).data() as Record<string, unknown> | undefined

    beforeAll(() => {
        initFirebaseAdmin()
        fixes = jest.requireActual('../../../scripts/applySpellCatalogFixes')
        duplicates = jest.requireActual('../../../scripts/removeDuplicateSpells')
        db = admin.firestore()
    })

    beforeEach(async () => {
        await Promise.all([ ...ids.map(async id => await db.collection('spells').doc(id).delete()), db.collection('charsheets').doc(sheetId).delete() ])
    })

    afterAll(async () => {
        await Promise.all([ ...ids.map(async id => await db.collection('spells').doc(id).delete()), db.collection('charsheets').doc(sheetId).delete() ])
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    describe('elemento e tipo', () => {
        const set = {
            element: [
                { id: 'fix-el-a', name: 'A', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' },
                { id: 'fix-el-b', name: 'B', from: 'NãO-ELEMENTAL', to: 'NÃO-ELEMENTAL' }
            ],
            type: [
                { id: 'fix-tipo-a', name: 'C', from: 'Utilidade (imediato)', to: 'Utilidade (contínuo)' },
                { id: 'fix-tipo-b', name: 'D', from: 'Movimento (imediato)', to: 'Movimento (contínuo)' }
            ]
        }

        beforeEach(async () => {
            await db.collection('spells').doc('fix-el-a').set(spell('fix-el-a', { element: 'NãO-ELEMENTAL' }))
            // editada à mão depois da conferência: não pode ser sobrescrita
            await db.collection('spells').doc('fix-el-b').set(spell('fix-el-b', { element: 'FOGO' }))
            await db.collection('spells').doc('fix-tipo-a').set(spell('fix-tipo-a'))
            await db.collection('spells').doc('fix-tipo-b').set(spell('fix-tipo-b', { type: 'Movimento (imediato)' }))
        })

        test('a simulação só relata: não grava', async () => {
            const report = await fixes.applySpellCatalogFixes({ fixes: set })
            expect(report.element.plan.update.map(change => change.id)).toEqual([ 'fix-el-a' ])
            expect(report.element.plan.conflicts.map(change => change.id)).toEqual([ 'fix-el-b' ])
            expect(report.type.plan.update.map(change => change.id)).toEqual([ 'fix-tipo-a', 'fix-tipo-b' ])
            expect((await read('fix-el-a'))?.['element']).toBe('NãO-ELEMENTAL')
        })

        test('--apply troca só o campo de cada uma, não passa por cima de edição à mão e rodar de novo não faz mal', async () => {
            const report = await fixes.applySpellCatalogFixes({ apply: true, fixes: set })
            expect(report.element.applied.map(change => change.id)).toEqual([ 'fix-el-a' ])
            expect(report.type.applied.map(change => change.id)).toEqual([ 'fix-tipo-a', 'fix-tipo-b' ])

            expect(await read('fix-el-a')).toEqual(spell('fix-el-a', { element: 'NÃO-ELEMENTAL' }))
            expect((await read('fix-el-b'))?.['element']).toBe('FOGO')
            expect((await read('fix-tipo-a'))?.['type']).toBe('Utilidade (contínuo)')
            expect((await read('fix-tipo-a'))?.['element']).toBe('FOGO')

            const again = await fixes.applySpellCatalogFixes({ apply: true, fixes: set })
            expect(again.element.applied).toEqual([])
            expect(again.type.applied).toEqual([])
            expect(again.element.plan.already.map(change => change.id)).toEqual([ 'fix-el-a' ])
        })
    })

    describe('magia repetida', () => {
        const pair = { name: 'Magnetismo de Teste', remove: 'dup-remove', keep: 'dup-keep' }
        const two = [ pair, { name: 'Outra', remove: 'dup-remove-2', keep: 'dup-keep-2' } ]

        test('simulação não apaga; --apply apaga só a repetida, idêntica à que fica, e devolve o documento para o backup', async () => {
            await db.collection('spells').doc('dup-remove').set(spell('dup-remove'))
            await db.collection('spells').doc('dup-keep').set(spell('dup-keep'))

            const dry = await duplicates.removeDuplicateSpells({ duplicates: [ pair ] })
            expect(dry.outcomes.map(outcome => outcome.status)).toEqual([ 'would-remove' ])
            expect(await read('dup-remove')).toBeDefined()

            const real = await duplicates.removeDuplicateSpells({ apply: true, duplicates: [ pair ] })
            expect(real.outcomes.map(outcome => outcome.status)).toEqual([ 'removed' ])
            expect(real.deleted).toEqual([ spell('dup-remove') ])
            expect(await read('dup-remove')).toBeUndefined()
            expect(await read('dup-keep')).toEqual(spell('dup-keep'))

            const again = await duplicates.removeDuplicateSpells({ apply: true, duplicates: [ pair ] })
            expect(again.outcomes.map(outcome => outcome.status)).toEqual([ 'already-removed' ])
        })

        test('conteúdo diferente bloqueia: nada é apagado', async () => {
            await db.collection('spells').doc('dup-remove').set(spell('dup-remove'))
            await db.collection('spells').doc('dup-keep').set(spell('dup-keep', { stages: [ 'editada', 'dois', 'três' ] }))
            const report = await duplicates.removeDuplicateSpells({ apply: true, duplicates: [ pair ] })
            expect(report.outcomes[0]).toMatchObject({ status: 'blocked' })
            expect(await read('dup-remove')).toBeDefined()
        })

        test('ficha que usa o id a apagar bloqueia, e a que usa o id que fica não atrapalha', async () => {
            await db.collection('spells').doc('dup-remove').set(spell('dup-remove'))
            await db.collection('spells').doc('dup-keep').set(spell('dup-keep'))
            await db.collection('charsheets').doc(sheetId).set({ name: 'Ficha', spells: [ 'dup-keep' ] })
            expect((await duplicates.removeDuplicateSpells({ apply: true, duplicates: [ pair ] })).outcomes[0]?.status).toBe('removed')

            await db.collection('spells').doc('dup-remove-2').set(spell('dup-remove-2'))
            await db.collection('spells').doc('dup-keep-2').set(spell('dup-keep-2'))
            await db.collection('charsheets').doc(sheetId).set({ name: 'Ficha', spells: [ 'dup-remove-2' ] })
            const blocked = await duplicates.removeDuplicateSpells({ apply: true, duplicates: [ two[1]! ] })
            expect(blocked.outcomes[0]).toMatchObject({ status: 'blocked' })
            expect(await read('dup-remove-2')).toBeDefined()
        })

        test('sem a magia que ficaria, não apaga a outra', async () => {
            await db.collection('spells').doc('dup-remove').set(spell('dup-remove'))
            const report = await duplicates.removeDuplicateSpells({ apply: true, duplicates: [ pair ] })
            expect(report.outcomes[0]).toMatchObject({ status: 'blocked' })
            expect(await read('dup-remove')).toBeDefined()
        })

        test('--revert recria o documento apagado e não sobrescreve um id que já existe', async () => {
            await db.collection('spells').doc('dup-remove').set(spell('dup-remove'))
            await db.collection('spells').doc('dup-keep').set(spell('dup-keep'))
            const { deleted } = await duplicates.removeDuplicateSpells({ apply: true, duplicates: [ pair ] })

            expect(await duplicates.restoreRemovedSpells(deleted, false)).toEqual({ restored: [ 'dup-remove' ], skipped: [] })
            expect(await read('dup-remove')).toBeUndefined()
            expect(await duplicates.restoreRemovedSpells(deleted, true)).toEqual({ restored: [ 'dup-remove' ], skipped: [] })
            expect(await read('dup-remove')).toEqual(spell('dup-remove'))
            expect(await duplicates.restoreRemovedSpells(deleted, true)).toEqual({ restored: [], skipped: [ 'dup-remove' ] })
        })
    })
})
