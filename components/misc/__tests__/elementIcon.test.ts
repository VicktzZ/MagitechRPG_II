import { element } from '../../../themes/tokens'
import { elementGlyphs, resolveElement } from '../elementGlyphs'

describe('glifos de elemento', () => {
    it('há um glifo para cada um dos 13 elementos do catálogo', () => {
        expect(Object.keys(elementGlyphs).sort()).toEqual(Object.keys(element).sort())
    })

    it('cada glifo é um caminho SVG não vazio, dentro da grade de 24px', () => {
        for (const [ name, path ] of Object.entries(elementGlyphs)) {
            expect({ name, path: /^M[\d.\- A-Za-z,]+$/.test(path) }).toEqual({ name, path: true })
            const numbers = (path.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
            expect(Math.max(...numbers)).toBeLessThanOrEqual(24)
        }
    })

    it('glifos diferentes entre si', () => {
        expect(new Set(Object.values(elementGlyphs)).size).toBe(13)
    })
})

describe('resolveElement', () => {
    it.each([
        [ 'FOGO', 'FOGO' ],
        [ 'fogo', 'FOGO' ],
        [ 'Água', 'ÁGUA' ],
        [ 'AGUA', 'ÁGUA' ],
        [ 'psiquico', 'PSÍQUICO' ],
        [ 'NÃO-ELEMENTAL', 'NÃO-ELEMENTAL' ],
        [ 'nao elementar', 'NÃO-ELEMENTAL' ],
        [ 'NEUTRO', 'NÃO-ELEMENTAL' ],
        [ 'GELO', 'NÃO-ELEMENTAL' ],
        [ undefined, 'NÃO-ELEMENTAL' ],
        [ null, 'NÃO-ELEMENTAL' ]
    ])('%s → %s', (input, expected) => {
        expect(resolveElement(input as string | null | undefined)).toBe(expected)
    })
})
