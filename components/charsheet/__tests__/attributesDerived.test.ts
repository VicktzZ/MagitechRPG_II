import { calculateInitialStats, calculateOverall } from '../Attributes'

// Attributes importa componentes de tela que carregam CSS/canvas (fora do alcance do jest em node):
// aqui só interessam as funções puras exportadas por ele.
jest.mock('@components/misc', () => ({ RadarChart: () => null }))
jest.mock('@layout', () => ({ LinearProgressWithLabel: () => null }))
jest.mock('../LevelAndInfo', () => ({ __esModule: true, default: () => null }))
jest.mock('../subcomponents/Attribute', () => ({ __esModule: true, default: () => null }))

describe('calculateOverall', () => {
    const attributes = { vig: 10, foc: 5, des: 15, log: 0, sab: 5, car: 5 }
    const expertises = {
        Atletismo: { value: 3, defaultAttribute: 'vig' },
        Magia: { value: 2, defaultAttribute: 'foc' }
    }

    it('soma os seis atributos, o valor das perícias e o nível', () => {
        expect(calculateOverall({ attributes, expertises, level: 4 })).toBe(40 + 5 + 4)
    })

    it('ignora campos ausentes, nulos ou que não são números', () => {
        expect(calculateOverall({})).toBe(0)
        expect(calculateOverall({ attributes: null, expertises: null, level: null })).toBe(0)
        expect(calculateOverall({
            attributes: { vig: 'x', foc: undefined, des: 2 },
            expertises: { A: null, B: { defaultAttribute: 'vig' }, C: { value: 'oi' }, D: { value: 1 } },
            level: 1
        })).toBe(2 + 1 + 1)
    })

    it('em sistema customizado soma só as chaves de atributo do sistema', () => {
        const custom = { forca: 4, agilidade: 6, vig: 99 }
        expect(calculateOverall({
            attributes: custom,
            expertises: {},
            level: 2,
            attributeKeys: [ 'forca', 'agilidade' ]
        })).toBe(4 + 6 + 2)
    })
})

describe('calculateInitialStats', () => {
    it('soma raça, classe e atributo', () => {
        const stats = calculateInitialStats({ race: 'Humano', classe: 'Combatente', vig: 5, foc: 3, des: 25 })
        expect(stats.lp).toBeGreaterThanOrEqual(0)
        expect(stats.limited).toEqual([])
    })

    it('nunca devolve valor negativo e informa o que foi limitado (Ciborgue + Combatente com FOC 0)', () => {
        const stats = calculateInitialStats({ race: 'Ciborgue', classe: 'Combatente', vig: 0, foc: 0, des: 0 })
        expect(stats.lp).toBeGreaterThanOrEqual(0)
        expect(stats.mp).toBeGreaterThanOrEqual(0)
        expect(stats.ap).toBeGreaterThanOrEqual(0)
        expect(stats.limited).toContain('MP')
        expect(stats.mp).toBe(0)
    })

    it('raça e classe desconhecidas (ficha em branco) contam só os atributos', () => {
        expect(calculateInitialStats({ vig: 4, foc: 2, des: 20 })).toEqual({ lp: 4, mp: 2, ap: 2, limited: [] })
        expect(calculateInitialStats({})).toEqual({ lp: 0, mp: 0, ap: 0, limited: [] })
    })

    it('aumentar o atributo tira o aviso', () => {
        const base = { race: 'Ciborgue', classe: 'Combatente', vig: 0, des: 0 }
        expect(calculateInitialStats({ ...base, foc: 0 }).limited).toContain('MP')
        expect(calculateInitialStats({ ...base, foc: 20 }).limited).not.toContain('MP')
    })
})
