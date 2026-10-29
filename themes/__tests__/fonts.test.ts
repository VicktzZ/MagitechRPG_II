import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { font } from '../tokens'

const fontsDir = join(__dirname, '../../public/fonts')
const css = readFileSync(join(fontsDir, 'fonts.css'), 'utf8')
const ledger = readFileSync(join(fontsDir, 'LICENSES.md'), 'utf8')

const declaredFamilies = Array.from(css.matchAll(/font-family:\s*['"]?([^'";]+?)['"]?;/g)).map(match => match[1]!)
const files = Array.from(css.matchAll(/url\(([^)]+)\)/g)).map(match => match[1]!.replace(/['"]/g, ''))

/** Primeira família de uma pilha de `font-family`: `"Chakra Petch", system-ui` → `Chakra Petch` */
const firstFamily = (stack: string): string => stack.split(',')[0]!.replace(/["']/g, '').trim()

describe('fontes carregadas em public/fonts/fonts.css', () => {
    it.each(files)('o arquivo %s existe', file => {
        expect(existsSync(join(fontsDir, file))).toBe(true)
    })

    it('cada família dos tokens tem @font-face', () => {
        const stacks = [ font.display, font.text, font.mono, ...Object.values(font.dice) ]
        for (const stack of stacks) {
            expect(declaredFamilies).toContain(firstFamily(stack))
        }
    })

    it('toda família carregada consta em LICENSES.md', () => {
        const unique = Array.from(new Set(declaredFamilies))
        for (const family of unique) {
            const label = /^D\d+$/.test(family) ? 'dPoly' : family
            expect({ family, listed: ledger.includes(label) }).toEqual({ family, listed: true })
        }
    })

    it('as fontes sem licença comprovada não voltam', () => {
        for (const banned of [ 'Sakana', 'WBZ', 'Apocalypse', 'Runes', 'Robus', 'DarkFuture', 'Appears', 'Ysgarth', 'FM' ]) {
            expect(declaredFamilies).not.toContain(banned)
        }
    })
})
