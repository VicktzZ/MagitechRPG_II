import { buildRemovalUpdate } from '../inventoryRemoval'

const sheet = (overrides: Record<string, unknown> = {}) => ({
    inventory: {
        weapons: [ { id: 'w1', name: 'Pistola', weight: 2 }, { id: 'w2', name: 'Pistola', weight: 2 } ],
        armors: [ { id: 'a1', name: 'Colete', weight: 6, ap: 3 }, { id: 'a2', name: 'Capacete', weight: 2, value: 1 } ],
        items: [ { id: 'i1', name: 'Ração', weight: 0.5, quantity: 4, kind: 'Consumível' }, { id: 'i2', name: 'Mochila', weight: 3, quantity: 1, kind: 'Capacidade' } ]
    },
    stats: { ap: 9, maxAp: 9 },
    capacity: { max: 40, cargo: 14.5 },
    ...overrides
}) as never

describe('buildRemovalUpdate', () => {
    it('arma: sai da lista (só a de mesmo id) e a carga diminui pelo peso', () => {
        const update = buildRemovalUpdate(sheet(), { id: 'w2', name: 'Pistola', weight: 2 }, 'weapon')
        expect(update['inventory.weapons']).toEqual([ { id: 'w1', name: 'Pistola', weight: 2 } ])
        expect(update['capacity.cargo']).toBe(12.5)
        expect(update['stats.ap']).toBeUndefined()
    })

    it('armadura: tira os pontos de armadura (ap, ou value nas fichas antigas), atual e máximo, nunca abaixo da base 5', () => {
        const colete = buildRemovalUpdate(sheet(), { id: 'a1', name: 'Colete', weight: 6, ap: 3 }, 'armor')
        expect(colete).toMatchObject({ 'stats.ap': 6, 'stats.maxAp': 6, 'capacity.cargo': 8.5 })
        const capacete = buildRemovalUpdate(sheet(), { id: 'a2', name: 'Capacete', weight: 2, value: 1 }, 'armor')
        expect(capacete).toMatchObject({ 'stats.ap': 8, 'stats.maxAp': 8 })
        const pesada = buildRemovalUpdate(sheet({ stats: { ap: 6, maxAp: 6 } }), { id: 'a1', weight: 6, ap: 4 }, 'armor')
        expect(pesada).toMatchObject({ 'stats.ap': 5, 'stats.maxAp': 5 })
    })

    it('item: a carga diminui pelo peso vezes a quantidade', () => {
        const update = buildRemovalUpdate(sheet(), { id: 'i1', name: 'Ração', weight: 0.5, quantity: 4, kind: 'Consumível' }, 'item')
        expect(update['inventory.items']).toEqual([ { id: 'i2', name: 'Mochila', weight: 3, quantity: 1, kind: 'Capacidade' } ])
        expect(update['capacity.cargo']).toBe(12.5)
    })

    it('item de Capacidade: diminui a capacidade máxima e não mexe na carga', () => {
        const update = buildRemovalUpdate(sheet(), { id: 'i2', name: 'Mochila', weight: 3, quantity: 1, kind: 'Capacidade' }, 'item')
        expect(update['capacity.max']).toBe(37)
        expect('capacity.cargo' in update).toBe(false)
    })

    it('a carga nunca fica negativa e arredonda em uma casa', () => {
        expect(buildRemovalUpdate(sheet({ capacity: { max: 40, cargo: 1 } }), { id: 'w1', weight: 2 }, 'weapon')['capacity.cargo']).toBe(0)
        expect(buildRemovalUpdate(sheet({ capacity: { max: 40, cargo: 10.04 } }), { id: 'w1', weight: 0.33 }, 'weapon')['capacity.cargo']).toBe(9.7)
    })

    it('lê listas gravadas como objeto', () => {
        const update = buildRemovalUpdate(sheet({ inventory: { weapons: { 0: { id: 'w1', weight: 1 } }, armors: [], items: [] } }), { id: 'w1', weight: 1 }, 'weapon')
        expect(update['inventory.weapons']).toEqual([])
    })
})
