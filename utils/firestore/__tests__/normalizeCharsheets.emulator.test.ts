/**
 * Migração das fichas antigas (scripts/normalizeCharsheets.ts) contra o emulador do Firestore.
 * Só roda com o emulador ligado; sem ele os testes são ignorados (ver campaignMessages.emulator.test.ts).
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as Migration from '../../../scripts/normalizeCharsheets'
import { initFirebaseAdmin } from '../../initializeFireOrm'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

const loadMigration = (): typeof Migration => jest.requireActual('../../../scripts/normalizeCharsheets')

describeEmulator('migração das fichas antigas', () => {
    let migration: typeof Migration
    let db: admin.firestore.Firestore
    const ids: string[] = []

    const sheet = async (id: string, overrides: Record<string, unknown> = {}) => {
        ids.push(id)
        await db.collection('charsheets').doc(id).set({
            id, userId: 'dono', name: id, level: 4, anotacoes: 'ok', elementalMastery: '', age: 20,
            inventory: { items: [], weapons: [], armors: [], money: 12.5 },
            skills: { class: [], bonus: [], powers: [] },
            session: [ { campaignCode: 'ABC', stats: { lp: 1 }, perks: [ { id: 'p1' }, { id: 'p2' } ] } ],
            ...overrides
        })
    }
    const read = async (id: string) => (await db.collection('charsheets').doc(id).get()).data() as Record<string, any>

    beforeAll(() => {
        initFirebaseAdmin()
        migration = loadMigration()
        db = admin.firestore()
    })

    afterAll(async () => {
        await Promise.all(ids.map(async id => await db.collection('charsheets').doc(id).delete()))
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    test('a simulação só conta: não grava', async () => {
        await sheet('mig-sim', { elementalMastery: null, inventory: { items: { 0: { id: 'i', name: 'Poção' } }, weapons: [], armors: [], money: 1 } })
        const report = await migration.normalizeCharsheets({ charsheetId: 'mig-sim' })
        expect(report.changed).toEqual([ 'mig-sim' ])
        expect(report.byPath).toEqual({ elementalMastery: 1, 'inventory.items': 1 })
        const stored = await read('mig-sim')
        expect(stored['elementalMastery']).toBeNull()
        expect(Array.isArray(stored['inventory'].items)).toBe(false)
    })

    test('--apply corrige só o formato, guarda o valor antigo e não mexe no resto', async () => {
        await sheet('mig-apply', {
            anotacoes: null,
            inventory: { items: { 0: { id: 'i', name: 'Poção' }, 1: { id: 'sem-nome' } }, weapons: { 0: { id: 'w', name: 'Pistola' } }, armors: [], money: 12.5 },
            session: [ { campaignCode: 'ABC', perks: { 0: { id: 'p1' }, 1: { id: 'p2' } } } ]
        })
        const report = await migration.normalizeCharsheets({ apply: true, charsheetId: 'mig-apply' })
        expect(report.changed).toEqual([ 'mig-apply' ])
        expect(report.backup['mig-apply']?.['anotacoes']).toBeNull()

        const stored = await read('mig-apply')
        expect(stored['anotacoes']).toBe('')
        expect(stored['inventory'].items).toHaveLength(2)          // o item sem nome continua
        expect(stored['inventory'].weapons[0].ammo).toBe('Não consome')
        expect(stored['inventory'].money).toBe(12.5)
        expect(stored['session'][0].perks).toHaveLength(2)         // nenhuma vantagem perdida
        expect(stored['level']).toBe(4)
    })

    test('ficha já no formato certo não é tocada e rodar de novo não muda nada', async () => {
        await sheet('mig-ok')
        const before = JSON.stringify(await read('mig-ok'))
        expect((await migration.normalizeCharsheets({ apply: true, charsheetId: 'mig-ok' })).changed).toEqual([])
        expect(JSON.stringify(await read('mig-ok'))).toBe(before)

        await sheet('mig-twice', { elementalMastery: 0 })
        expect((await migration.normalizeCharsheets({ apply: true, charsheetId: 'mig-twice' })).changed).toEqual([ 'mig-twice' ])
        expect((await migration.normalizeCharsheets({ apply: true, charsheetId: 'mig-twice' })).changed).toEqual([])
    })
})
