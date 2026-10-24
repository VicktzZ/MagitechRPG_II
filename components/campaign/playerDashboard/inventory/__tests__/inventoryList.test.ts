import { armorPoints, capacityState, carriedWeight, collectEntries, countByType, entryWeight, filterAndSortEntries, heaviestEntries, rarityRank, totalArmorPoints, withoutItem } from '../inventoryList'

const w = (id: string, name: string, weight = 1, extra: Record<string, unknown> = {}) => ({ id, name, weight, rarity: 'Comum', kind: 'Pistola', effect: { value: '1d8' }, ...extra })
const a = (id: string, name: string, weight = 5, extra: Record<string, unknown> = {}) => ({ id, name, weight, rarity: 'Comum', kind: 'Leve', ap: 3, ...extra })
const i = (id: string, name: string, weight = 0.5, quantity = 1, extra: Record<string, unknown> = {}) => ({ id, name, weight, quantity, rarity: 'Comum', kind: 'Consumível', ...extra })

const inventory = {
    weapons: [ w('w1', 'Pistola', 2), w('w2', 'Faca', 0.5, { rarity: 'Raro' }) ],
    armors: [ a('a1', 'Colete', 6), a('a2', 'Capacete', 2, { ap: undefined, value: 1, rarity: 'Lendário' }) ],
    items: [ i('i1', 'Ração', 0.5, 4), i('i2', 'Mochila', 3, 1, { kind: 'Capacidade', rarity: 'Incomum' }), i('i3', 'Corda', 2) ]
} as never

describe('collectEntries', () => {
    it('junta armas, armaduras e itens, com tipo e chave única', () => {
        const entries = collectEntries(inventory)
        expect(entries).toHaveLength(7)
        expect(entries.map(e => e.type)).toEqual([ 'weapon', 'weapon', 'armor', 'armor', 'item', 'item', 'item' ])
        expect(new Set(entries.map(e => e.key)).size).toBe(7)
    })

    it('mostra os dois itens quando só o nome se repete (duas pistolas são duas pistolas)', () => {
        const entries = collectEntries({ weapons: [ w('w1', 'Pistola'), w('w9', 'Pistola') ] } as never)
        expect(entries).toHaveLength(2)
        expect(new Set(entries.map(e => e.key)).size).toBe(2)
    })

    it('o mesmo id gravado duas vezes aparece uma vez', () => {
        expect(collectEntries({ items: [ i('i1', 'Ração'), i('i1', 'Ração') ] } as never)).toHaveLength(1)
    })

    it('item sem id nunca é escondido, nem os repetidos', () => {
        expect(collectEntries({ items: [ { name: 'Pedra' }, { name: 'Pedra' } ] } as never)).toHaveLength(2)
    })

    it('lê listas gravadas como objeto e ignora vazios', () => {
        expect(collectEntries({ weapons: { 0: w('w1', 'Pistola') } } as never)).toHaveLength(1)
        expect(collectEntries(undefined)).toEqual([])
        expect(collectEntries({ weapons: [ null ] } as never)).toEqual([])
    })
})

describe('peso e armadura', () => {
    const entries = collectEntries(inventory)

    it('item pesa peso x quantidade; item de Capacidade não pesa (soma à capacidade máxima)', () => {
        expect(entryWeight(entries.find(e => e.item.name === 'Ração')!)).toBe(2)
        expect(entryWeight(entries.find(e => e.item.name === 'Mochila')!)).toBe(0)
        expect(entryWeight(entries.find(e => e.item.name === 'Pistola')!)).toBe(2)
    })

    it('soma o peso carregado', () => {
        // pistola 2 + faca 0,5 + colete 6 + capacete 2 + ração 2 + corda 2
        expect(carriedWeight(entries)).toBe(14.5)
    })

    it('pontos de armadura: ap, ou value nas fichas antigas', () => {
        expect(armorPoints({ ap: 3 })).toBe(3)
        expect(armorPoints({ value: 2 })).toBe(2)
        expect(armorPoints({})).toBe(0)
        expect(totalArmorPoints(entries)).toBe(4)
    })

    it('conta por tipo', () => {
        expect(countByType(entries)).toEqual({ weapon: 2, armor: 2, item: 3 })
    })
})

describe('filterAndSortEntries', () => {
    const entries = collectEntries(inventory)
    const names = (list: ReturnType<typeof filterAndSortEntries>) => list.map(e => e.item.name)

    it('por padrão agrupa por tipo e ordena pelo nome dentro dele', () => {
        expect(names(filterAndSortEntries(entries))).toEqual([ 'Faca', 'Pistola', 'Capacete', 'Colete', 'Corda', 'Mochila', 'Ração' ])
    })

    it('filtra pela aba', () => {
        expect(names(filterAndSortEntries(entries, { tab: 'weapons' }))).toEqual([ 'Faca', 'Pistola' ])
        expect(names(filterAndSortEntries(entries, { tab: 'armors' }))).toEqual([ 'Capacete', 'Colete' ])
        expect(names(filterAndSortEntries(entries, { tab: 'items' }))).toEqual([ 'Corda', 'Mochila', 'Ração' ])
    })

    it('busca sem acento nem caixa, também por tipo do item e raridade', () => {
        expect(names(filterAndSortEntries(entries, { query: 'RACAO' }))).toEqual([ 'Ração' ])
        expect(names(filterAndSortEntries(entries, { query: 'consumível' }))).toEqual([ 'Corda', 'Ração' ])
        expect(names(filterAndSortEntries(entries, { query: 'lendario' }))).toEqual([ 'Capacete' ])
        expect(filterAndSortEntries(entries, { query: 'xyz' })).toEqual([])
    })

    it('ordena por nome, por peso e por raridade', () => {
        expect(names(filterAndSortEntries(entries, { sort: 'name' }))).toEqual([ 'Capacete', 'Colete', 'Corda', 'Faca', 'Mochila', 'Pistola', 'Ração' ])
        expect(names(filterAndSortEntries(entries, { sort: 'weight-desc' })).slice(0, 3)).toEqual([ 'Colete', 'Capacete', 'Corda' ])
        expect(names(filterAndSortEntries(entries, { sort: 'rarity-desc' })).slice(0, 3)).toEqual([ 'Capacete', 'Faca', 'Mochila' ])
    })

    it('não altera a lista recebida', () => {
        const before = entries.map(e => e.key)
        filterAndSortEntries(entries, { sort: 'weight-desc' })
        expect(entries.map(e => e.key)).toEqual(before)
    })

    it('raridade desconhecida fica no meio da escala', () => {
        expect(rarityRank('Comum')).toBeLessThan(rarityRank('Algo novo'))
        expect(rarityRank('Algo novo')).toBeLessThan(rarityRank('Lendário'))
    })
})

describe('heaviestEntries e capacityState', () => {
    it('os mais pesados primeiro, sem os que não pesam', () => {
        const entries = collectEntries(inventory)
        expect(heaviestEntries(entries, 3).map(e => e.item.name)).toEqual([ 'Colete', 'Capacete', 'Corda' ])
        expect(heaviestEntries(entries, 10).some(e => e.item.name === 'Mochila')).toBe(false)
    })

    it('capacidade: ok, perto do limite (>80%) e sobrecarga (>100%); sem limite nunca avisa', () => {
        expect(capacityState(40, 100)).toMatchObject({ state: 'ok', percent: 40 })
        expect(capacityState(80, 100).state).toBe('ok')
        expect(capacityState(81, 100).state).toBe('near')
        expect(capacityState(100, 100).state).toBe('near')
        expect(capacityState(100.5, 100).state).toBe('over')
        expect(capacityState(50, 0)).toEqual({ percent: 0, state: 'ok' })
    })
})

describe('withoutItem', () => {
    it('com id, tira o de mesmo id', () => {
        expect(withoutItem([ { id: 'a', name: 'A' }, { id: 'b', name: 'B' } ], { id: 'a', name: 'A' })).toEqual([ { id: 'b', name: 'B' } ])
    })

    it('sem id, tira só aquele (pela referência) e não os outros sem id', () => {
        const x = { name: 'Pedra' }
        const y = { name: 'Pedra' }
        const list = [ x, y, { id: 'z', name: 'Z' } ]
        expect(withoutItem(list, y)).toEqual([ x, { id: 'z', name: 'Z' } ])
        expect(withoutItem(list, y)[0]).toBe(x)
    })

    it('sem id e sem a referência, tira o primeiro de mesmo nome', () => {
        expect(withoutItem([ { name: 'Pedra' }, { name: 'Pedra' } ], { name: 'Pedra' })).toHaveLength(1)
    })

    it('item que não está na lista não tira nada', () => {
        expect(withoutItem([ { id: 'a' } ], { id: 'b' })).toEqual([ { id: 'a' } ])
        expect(withoutItem([ { name: 'A' } ], { name: 'Outro' })).toEqual([ { name: 'A' } ])
    })
})
