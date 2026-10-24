import { ThemeProvider } from '@mui/material'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import theme from '../../../../../themes/theme'
import { removalDescription } from '../ConfirmRemoveDialog'
import InventoryItemCard from '../InventoryItemCard'
import InventoryItemList from '../InventoryItemList'
import InventorySummary from '../InventorySummary'
import InventoryToolbar from '../InventoryToolbar'
import { capacityState, collectEntries } from '../inventoryList'

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '')
const noop = (): void => undefined
const asyncNoop = async (): Promise<void> => undefined

const cardActions = { canDonate: true, onWeaponHit: asyncNoop, onWeaponDamage: asyncNoop, onDonate: noop, onRemove: noop }
const pistola = { id: 'w1', name: 'Pistola', weight: 2, rarity: 'Raro', kind: 'Pistola', categ: 'Leve', range: 'Curto', hit: 'des', effect: { value: '1d8', critValue: '2d8', critChance: '19-20' } }
const colete = { id: 'a1', name: 'Colete', weight: 6, ap: 3, rarity: 'Comum', kind: 'Leve' }
const racao = { id: 'i1', name: 'Ração', weight: 0.5, quantity: 4, rarity: 'Comum', kind: 'Consumível' }

describe('InventorySummary', () => {
    const summary = (weight: number, max: number, extra: Record<string, unknown> = {}) => render(
        <InventorySummary
            totalItems={8}
            counts={{ weapon: 3, armor: 2, item: 3 }}
            totalWeight={weight}
            maxCapacity={max}
            weightUnitSuffix=" kg"
            capacity={capacityState(weight, max)}
            armorAp={4}
            heaviest={collectEntries({ armors: [ colete ], items: [ racao ] })}
            {...extra}
        />
    )

    it('mostra o peso contra a capacidade e o estado por extenso', () => {
        const html = summary(14.5, 40)
        expect(html).toContain('14,5')
        expect(html).toContain('/ 40 kg')
        expect(html).toContain('Dentro da capacidade')
        expect(html).toContain('aria-label="Peso carregado"')
        expect(html).not.toContain('capacity-hint')
    })

    it('perto do limite: avisa e sugere o que largar', () => {
        const html = summary(17, 20)
        expect(html).toContain('Perto do limite')
        expect(html).toContain('Para aliviar: Colete (6 kg), Ração (2 kg)')
    })

    it('sobrecarga: diz quanto passou', () => {
        const html = summary(25, 20)
        expect(html).toContain('Sobrecarga')
        expect(html).toContain('5 kg acima da capacidade')
    })

    it('mostra a contagem por tipo e os pontos de armadura só quando há', () => {
        const html = summary(10, 40)
        expect(html).toContain('Armas')
        expect(html).toContain('Armaduras')
        expect(html).toContain('+4 AP')
        expect(summary(10, 40, { armorAp: 0 })).not.toContain('+4 AP')
    })
})

describe('InventoryToolbar', () => {
    const toolbar = (props: Record<string, unknown> = {}) => render(
        <InventoryToolbar
            activeTab="all"
            onTabChange={noop}
            searchQuery=""
            onSearchChange={noop}
            sort="type"
            onSortChange={noop}
            counts={{ all: 8, weapons: 3, armors: 2, items: 3 }}
            shown={8}
            isFiltering={false}
            {...props}
        />
    )

    it('tem filtro por tipo com contagem, busca e ordem', () => {
        const html = toolbar()
        for (const tab of [ 'all', 'weapons', 'armors', 'items' ]) expect(html).toContain(`data-testid="inventory-tab-${tab}"`)
        expect(html).toContain('aria-label="Buscar item"')
        expect(html).toContain('aria-label="Ordenar inventário"')
        expect(html).toContain('Mais pesados')
        expect(html).not.toContain('inventory-shown')
    })

    it('com busca ativa mostra o contador e o botão de limpar', () => {
        const html = toolbar({ searchQuery: 'pis', isFiltering: true, shown: 2 })
        expect(html).toContain('2 de 8 itens')
        expect(html).toContain('aria-label="Limpar busca de itens"')
    })
})

describe('InventoryItemCard', () => {
    const card = (item: unknown, type: 'weapon' | 'armor' | 'item') => render(<InventoryItemCard item={item} type={type} weightUnitSuffix=" kg" {...cardActions} />)

    it('arma: dano e peso na linha, e acerto e dano à vista', () => {
        const html = card(pistola, 'weapon')
        expect(html).toContain('1d8')
        expect(html).toContain('2 kg')
        expect(html).toContain('Raro')
        expect(html).toContain('aria-label="Rolar acerto de Pistola"')
        expect(html).toContain('aria-label="Rolar dano de Pistola"')
        expect(html).not.toContain('Rolar dano crítico')
    })

    it('armadura: pontos de armadura na linha', () => {
        const html = card(colete, 'armor')
        expect(html).toContain('+3')
        expect(html).toContain('AP')
        expect(html).not.toContain('Rolar acerto')
    })

    it('item: quantidade e peso total', () => {
        const html = card(racao, 'item')
        expect(html).toContain('x4')
        expect(html).toContain('2 kg')
    })

    it('item de Capacidade não mostra peso', () => {
        const html = card({ ...racao, id: 'i2', name: 'Mochila', kind: 'Capacidade', quantity: 1, weight: 3 }, 'item')
        expect(html).toContain('data-testid="inventory-item-weight"')
        expect(html).not.toContain('3 kg')
    })

    it('começa fechado (detalhes só ao abrir) e o botão tem aria-expanded', () => {
        const html = card(pistola, 'weapon')
        expect(html).toContain('aria-expanded="false"')
        expect(html).not.toContain('inventory-item-details')
        expect(html).not.toContain('Remover Pistola')
    })

    it('não quebra com item antigo sem os campos de efeito', () => {
        expect(() => card({ id: 'w9', name: 'Cano velho', weight: 1 }, 'weapon')).not.toThrow()
    })
})

describe('InventoryItemList', () => {
    const list = (entries: ReturnType<typeof collectEntries>, props: Record<string, unknown> = {}) => render(
        <InventoryItemList entries={entries} isFiltering={false} onClearFilters={noop} weightUnitSuffix=" kg" {...cardActions} {...props} />
    )

    it('mostra os itens da lista, os de mesmo nome também', () => {
        const html = list(collectEntries({ weapons: [ pistola, { ...pistola, id: 'w2' } ] }))
        expect(html.match(/data-testid="inventory-item"/g)).toHaveLength(2)
    })

    it('vazio: avisa que o inventário está vazio', () => {
        const html = list([])
        expect(html).toContain('Inventário vazio')
        expect(html).not.toContain('Limpar busca e filtros')
    })

    it('filtro sem resultado: oferece limpar', () => {
        const html = list([], { isFiltering: true })
        expect(html).toContain('Nenhum item encontrado')
        expect(html).toContain('Limpar busca e filtros')
    })
})

describe('ConfirmRemoveDialog', () => {
    it('explica o que acontece; armadura avisa dos pontos de armadura', () => {
        expect(removalDescription('armor')).toContain('pontos de armadura')
        expect(removalDescription('armor')).toContain('Não dá para desfazer')
        expect(removalDescription('weapon')).not.toContain('pontos de armadura')
        expect(removalDescription(undefined)).toContain('deixa de pesar')
    })
})
