/**
 * Anotações privadas do mestre contra o emulador do Firestore (Admin SDK de verdade): gravar, sobrescrever, apagar com
 * texto vazio e apagar a subcoleção junto com a campanha. Só roda com o emulador ligado; sem ele os testes são
 * ignorados. Para rodar:
 *   (cd tests/firestore-rules && npm install)   # uma vez, instala o firebase-tools
 *   npm run test:emulator
 */
/* eslint-disable @typescript-eslint/dot-notation -- noPropertyAccessFromIndexSignature (tsconfig.test) exige colchetes em process.env */
import { generateKeyPairSync } from 'crypto'
import admin from 'firebase-admin'
import type * as GmNotes from '../gmNotes'
import { initFirebaseAdmin } from '../../initializeFireOrm'

const hasEmulator = Boolean(process.env['FIRESTORE_EMULATOR_HOST'])
const describeEmulator = hasEmulator ? describe : describe.skip

if (hasEmulator) {
    const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
    process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] = 'demo-magitech'
    process.env['FIREBASE_CLIENT_EMAIL'] = 'emulator@demo-magitech.iam.gserviceaccount.com'
    process.env['FIREBASE_PRIVATE_KEY'] = privateKey
}

// O módulo usa o Admin SDK, que só pode ser iniciado depois das variáveis acima: carrega sob demanda
const loadModule = (): typeof GmNotes => jest.requireActual('../gmNotes')

describeEmulator('anotações privadas do mestre', () => {
    let lib: ReturnType<typeof loadModule>
    let db: admin.firestore.Firestore
    let n = 0
    let campaignId: string

    const noteRef = (charsheetId: string) => db.collection('campaigns').doc(campaignId).collection('gmNotes').doc(charsheetId)

    beforeAll(() => {
        initFirebaseAdmin()
        lib = loadModule()
        db = admin.firestore()
    })

    beforeEach(async () => {
        campaignId = `camp-notes-${++n}-${Date.now()}`
        await db.collection('campaigns').doc(campaignId).set({ id: campaignId, name: 'Teste', admin: [ 'gm' ] })
    })

    afterAll(async () => {
        await Promise.all(admin.apps.map(async app => await app?.delete()))
    })

    it('grava a anotação com o texto, quem gravou e o horário do servidor', async () => {
        expect(await lib.saveGmNote(campaignId, 'ficha-a', 'O barão é o espião.', 'gm')).toBe(true)

        const data = (await noteRef('ficha-a').get()).data()
        expect(data?.['text']).toBe('O barão é o espião.')
        expect(data?.['updatedBy']).toBe('gm')
        expect(data?.['updatedAt']).toBeInstanceOf(admin.firestore.Timestamp)
        expect(await lib.getGmNote(campaignId, 'ficha-a')).toEqual({ text: 'O barão é o espião.', updatedBy: 'gm' })
    })

    it('grava o texto exatamente como veio (espaços e quebras de linha incluídos)', async () => {
        const text = '  linha 1\n\n  linha 3  '
        await lib.saveGmNote(campaignId, 'ficha-a', text, 'gm')
        expect((await lib.getGmNote(campaignId, 'ficha-a'))?.text).toBe(text)
    })

    it('gravar de novo sobrescreve a anotação da mesma ficha e não mexe nas outras', async () => {
        await lib.saveGmNote(campaignId, 'ficha-a', 'primeira', 'gm')
        await lib.saveGmNote(campaignId, 'ficha-b', 'da outra', 'gm')
        await lib.saveGmNote(campaignId, 'ficha-a', 'segunda', 'gm2')

        expect(await lib.getGmNote(campaignId, 'ficha-a')).toEqual({ text: 'segunda', updatedBy: 'gm2' })
        expect(await lib.getGmNote(campaignId, 'ficha-b')).toEqual({ text: 'da outra', updatedBy: 'gm' })
    })

    it('texto vazio ou só de espaços apaga o documento (sem anotação, sem documento)', async () => {
        await lib.saveGmNote(campaignId, 'ficha-a', 'algo', 'gm')
        expect(await lib.saveGmNote(campaignId, 'ficha-a', '', 'gm')).toBe(false)
        expect((await noteRef('ficha-a').get()).exists).toBe(false)

        await lib.saveGmNote(campaignId, 'ficha-a', 'algo', 'gm')
        expect(await lib.saveGmNote(campaignId, 'ficha-a', '  \n ', 'gm')).toBe(false)
        expect((await noteRef('ficha-a').get()).exists).toBe(false)
    })

    it('apagar o que não existe não dá erro', async () => {
        expect(await lib.saveGmNote(campaignId, 'ficha-sem-nota', '', 'gm')).toBe(false)
        expect(await lib.getGmNote(campaignId, 'ficha-sem-nota')).toBeNull()
    })

    it('não grava nada no documento da campanha (a anotação mora só na subcoleção)', async () => {
        await lib.saveGmNote(campaignId, 'ficha-a', 'segredo', 'gm')
        const campaign = (await db.collection('campaigns').doc(campaignId).get()).data()
        expect(campaign).toEqual({ id: campaignId, name: 'Teste', admin: [ 'gm' ] })
    })

    it('apagar as anotações da campanha leva todas, e só as dela', async () => {
        const other = `${campaignId}-outra`
        await db.collection('campaigns').doc(other).set({ id: other, admin: [ 'gm' ] })
        await lib.saveGmNote(campaignId, 'ficha-a', 'a', 'gm')
        await lib.saveGmNote(campaignId, 'ficha-b', 'b', 'gm')
        await lib.saveGmNote(other, 'ficha-a', 'de outra campanha', 'gm')

        await lib.deleteGmNotes(campaignId)

        expect(await lib.getGmNote(campaignId, 'ficha-a')).toBeNull()
        expect(await lib.getGmNote(campaignId, 'ficha-b')).toBeNull()
        expect(await lib.getGmNote(other, 'ficha-a')).toEqual({ text: 'de outra campanha', updatedBy: 'gm' })
    })

    it('apagar as anotações de uma campanha sem nenhuma não dá erro', async () => {
        await expect(lib.deleteGmNotes(campaignId)).resolves.toBeUndefined()
    })
})
