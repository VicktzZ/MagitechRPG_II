import { ThemeProvider } from '@mui/material'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import theme from '../../../../../themes/theme'
import AcquiredPerksList from '../AcquiredPerksList'
import type { PlayerWithPerks } from '../usePlayersWithPerks'

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>)

const player = (name: string, perkNames: string[]): PlayerWithPerks => ({
    charsheetId: `cs-${name}`,
    charsheetName: name,
    level: 6,
    perks: perkNames.map((perk, index) => ({ id: `p${index}`, name: perk, description: `${perk}: descrição`, rarity: 'Comum', perkType: 'attribute' })) as PlayerWithPerks['perks'],
    userImage: null,
    userName: `Jogador de ${name}`
})

describe('AcquiredPerksList (conteúdo do modal "Vantagens adquiridas")', () => {
    it('um acordeão por jogador, com nome, nível e a contagem de vantagens', () => {
        const html = render(<AcquiredPerksList players={[ player('Aria Valen', [ 'Vigor', 'Foco' ]), player('Borin', [ 'Sorte' ]) ]} pending={false} />)

        expect(html).toContain('data-testid="acquired-perks"')
        expect(html).toContain('Vantagens obtidas por cada jogador nesta campanha')
        expect(html).toContain('Aria Valen')
        expect(html).toContain('Nível 6 • Jogador de Aria Valen')
        expect(html).toContain('2 vantagens')
        expect(html).toContain('1 vantagem')
        expect(html).not.toContain('1 vantagens')
        expect(html).not.toContain('acquired-perks-empty')
    })

    it('sem ninguém com vantagem, diz isso (o modal abre em qualquer modo de campanha)', () => {
        const html = render(<AcquiredPerksList players={[]} pending={false} />)

        expect(html).toContain('data-testid="acquired-perks-empty"')
        expect(html).toContain('Nenhuma vantagem adquirida ainda')
        expect(html).toContain('As vantagens aparecerão aqui quando os jogadores as selecionarem')
    })

    it('enquanto as fichas chegam, mostra esqueletos e não diz que está vazio', () => {
        const html = render(<AcquiredPerksList players={[]} pending />)

        expect(html).toContain('MuiSkeleton-root')
        expect(html).not.toContain('Nenhuma vantagem adquirida ainda')
    })
})
