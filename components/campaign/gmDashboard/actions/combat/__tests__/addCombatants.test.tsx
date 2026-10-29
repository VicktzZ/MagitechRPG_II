import type { Creature } from '@models'
import { ThemeProvider } from '@mui/material'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import theme from '../../../../../../themes/theme'
import type { PlayerInfo } from '../../types'
import AddCombatantsPanel from '../AddCombatantsPanel'
import ParticipantPicker from '../ParticipantPicker'
import type { ParticipantSelection } from '../useParticipantSelection'

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '')
const noop = (): void => undefined

const players = [
    { id: 'u-ana', name: 'ana', charsheet: { id: 'cs-ana', name: 'Aria Valen', stats: { lp: 30, maxLp: 61 } } },
    { id: 'u-caio', name: 'caio', charsheet: { id: 'cs-caio', name: 'Caio Névoa', stats: { lp: 9, maxLp: 30 } } },
    { id: 'u-gm', name: 'sem ficha' }
] as unknown as PlayerInfo[]
const creatures = [ { id: 'goblin', name: 'Goblin Saqueador', stats: { lp: 20 }, expertises: { Agilidade: { value: 2 } } } ] as unknown as Creature[]

const selection = (overrides: Partial<ParticipantSelection> = {}): ParticipantSelection => ({
    selectedPlayers: [], selectedCreatures: [], creatureQuantities: {}, creatureControllers: {},
    togglePlayer: noop, toggleCreature: noop, setCreatureQuantity: noop, setCreatureController: noop, clear: noop, ...overrides
})

describe('ParticipantPicker', () => {
    it('lista jogadores com ficha e criaturas, com campo de quantidade', () => {
        const html = render(<ParticipantPicker players={players} creatures={creatures} selection={selection()} />)
        expect(html).toContain('Aria Valen')
        expect(html).toContain('Caio Névoa')
        expect(html).not.toContain('sem ficha')
        expect(html).toContain('data-testid="combat-picker-creature-goblin"')
        expect(html).toContain('aria-label="Quantidade de Goblin Saqueador"')
        expect(html).toContain('AGI: 2 | LP: 20')
    })

    it('jogador que já está no combate aparece marcado e desabilitado, com o motivo', () => {
        const html = render(<ParticipantPicker players={players} creatures={creatures} selection={selection()} inCombat={new Set([ 'cs-ana' ])} />)
        const row = html.match(/<div[^>]*data-testid="combat-picker-player-cs-ana"[\s\S]*?<\/div>/)?.[0] ?? ''
        expect(row).toContain('aria-disabled="true"')
        expect(html).toContain('Já está no combate')
        expect(html).not.toMatch(/data-testid="combat-picker-player-cs-caio"[^>]*aria-disabled="true"/)
    })

    it('mostra a marcação e a quantidade da seleção', () => {
        const html = render(<ParticipantPicker players={players} creatures={creatures} selection={selection({ selectedCreatures: [ 'goblin' ], creatureQuantities: { goblin: 4 } })} />)
        expect(html).toMatch(/value="4"/)
    })

    it('cada criatura tem o seletor de quem a controla: o mestre por padrão e os jogadores com ficha como invocador', () => {
        const html = render(<ParticipantPicker players={players} creatures={creatures} selection={selection()} />)
        expect(html).toContain('aria-label="Quem controla Goblin Saqueador"')
        expect(html).toContain('Mestre')
    })

    it('o controlador escolhido aparece no seletor da criatura', () => {
        const html = render(<ParticipantPicker players={players} creatures={creatures} selection={selection({ selectedCreatures: [ 'goblin' ], creatureControllers: { goblin: players[0]!.id } })} />)
        expect(html).toContain(players[0]!.charsheet?.name ?? players[0]!.name)
    })

    it('sem criaturas nem jogadores, diz que não há nenhum', () => {
        const html = render(<ParticipantPicker players={[]} creatures={[]} selection={selection()} />)
        expect(html).toContain('Nenhum jogador com ficha disponível')
        expect(html).toContain('Nenhuma criatura customizada disponível')
    })
})

describe('AddCombatantsPanel', () => {
    const panel = (props: Partial<Parameters<typeof AddCombatantsPanel>[0]> = {}) => render(
        <AddCombatantsPanel players={players} creatures={creatures} inCombat={new Set()} phase="ACTION" onAdd={async () => true} {...props} />
    )

    it('começa fechado: só o botão para adicionar', () => {
        const html = panel()
        expect(html).toContain('data-testid="add-combatants-toggle"')
        expect(html).toContain('Adicionar ao combate')
        expect(html).not.toContain('combat-picker-player')
    })
})
