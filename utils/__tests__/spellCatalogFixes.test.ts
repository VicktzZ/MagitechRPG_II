import { BATCH_DURATION_TYPE_FIXES, DUPLICATE_SPELLS, ELEMENT_CASE_FIXES } from '../../scripts/data/spellCatalogFixes'

describe('correções do catálogo de 29/10/2026 (scripts/data/spellCatalogFixes.ts)', () => {
    it('são 9 correções de elemento, todas de NãO-ELEMENTAL para NÃO-ELEMENTAL, sem id repetido', () => {
        expect(ELEMENT_CASE_FIXES).toHaveLength(9)
        expect(new Set(ELEMENT_CASE_FIXES.map(fix => fix.id)).size).toBe(9)
        expect(ELEMENT_CASE_FIXES.every(fix => fix.from === 'NãO-ELEMENTAL' && fix.to === 'NÃO-ELEMENTAL')).toBe(true)
        // o valor novo é o que o filtro de elemento e a API esperam (tudo em maiúsculas)
        expect(ELEMENT_CASE_FIXES.every(fix => fix.to === fix.to.toUpperCase())).toBe(true)
    })

    it('as correções de tipo do lote novo trocam só "imediato" por "contínuo" e não repetem id', () => {
        expect(new Set(BATCH_DURATION_TYPE_FIXES.map(fix => fix.id)).size).toBe(BATCH_DURATION_TYPE_FIXES.length)
        for (const fix of BATCH_DURATION_TYPE_FIXES) {
            expect(fix.from).toContain('imediato')
            expect(fix.to).toBe(fix.from.replace('imediato', 'contínuo'))
        }
    })

    it('Magnetismo: apaga a f3d e mantém a f4d, que são ids diferentes', () => {
        expect(DUPLICATE_SPELLS).toEqual([ { name: 'Magnetismo', remove: '67806103878f9dc617521f3d', keep: '67806103878f9dc617521f4d' } ])
        expect(DUPLICATE_SPELLS.every(entry => entry.remove !== entry.keep)).toBe(true)
    })
})
