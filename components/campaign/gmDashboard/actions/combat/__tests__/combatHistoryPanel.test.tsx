import { ThemeProvider } from '@mui/material'
import type { CombatEventItem } from '@utils/combat/history'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import theme from '../../../../../../themes/theme'
import CombatHistoryPanel from '../CombatHistoryPanel'
import { useCombatHistory } from '../useCombatHistory'

jest.mock('@services', () => ({ campaignService: { getCombatEvents: jest.fn(), undoCombatEvent: jest.fn() } }))
jest.mock('../useCombatHistory', () => ({ useCombatHistory: jest.fn() }))

const mockedHistory = useCombatHistory as jest.MockedFunction<typeof useCombatHistory>
const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '')
const noop = (): void => undefined

const event = (patch: Partial<CombatEventItem>): CombatEventItem => ({
    id: '000001793191782-aaaaaaaa', action: 'apply_damage', label: 'Dano aplicado', byName: 'Mestre', at: '2026-10-28T12:00:00.000Z', summary: [ 'Goblin: Vida 20 → 12' ], undone: false, ...patch
})

describe('CombatHistoryPanel', () => {
    it('sem eventos (ou antes da primeira resposta) não aparece', () => {
        mockedHistory.mockReturnValue({ events: null, failed: false })
        expect(render(<CombatHistoryPanel campaignId="c1" signature="x" onChanged={noop} />)).toBe('')

        mockedHistory.mockReturnValue({ events: [], failed: false })
        expect(render(<CombatHistoryPanel campaignId="c1" signature="x" onChanged={noop} />)).toBe('')
    })

    it('falha na consulta: o histórico some e o combate segue', () => {
        mockedHistory.mockReturnValue({ events: null, failed: true })
        expect(render(<CombatHistoryPanel campaignId="c1" signature="x" onChanged={noop} />)).toBe('')
    })

    it('com eventos mostra o cabeçalho e o botão para desfazer o último', () => {
        mockedHistory.mockReturnValue({ events: [ event({}) ], failed: false })
        const html = render(<CombatHistoryPanel campaignId="c1" signature="x" onChanged={noop} />)

        expect(html).toContain('Histórico do combate')
        expect(html).toContain('Desfazer último')
        expect(html).toContain('aria-label="Expandir o histórico"')
    })

    it('quando todos já foram desfeitos não há "Desfazer último"', () => {
        mockedHistory.mockReturnValue({ events: [ event({ undone: true }) ], failed: false })
        const html = render(<CombatHistoryPanel campaignId="c1" signature="x" onChanged={noop} />)

        expect(html).toContain('Histórico do combate')
        expect(html).not.toContain('Desfazer último')
    })
})
