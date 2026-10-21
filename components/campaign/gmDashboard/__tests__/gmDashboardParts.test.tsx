import { ThemeProvider } from '@mui/material'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import theme from '../../../../themes/theme'
import { color } from '../../../../themes/tokens'
import CampaignStatsStrip from '../CampaignStatsStrip'
import DeleteCreatureDialog from '../DeleteCreatureDialog'
import StatMeter from '../StatMeter'

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>)

describe('StatMeter', () => {
    it('é um medidor nomeado, com valor, mínimo e máximo', () => {
        const html = render(<StatMeter label="LP" ariaLabel="Vida de Aria Valen" value={38} max={45} barColor={color.lp} />)
        expect(html).toContain('role="meter"')
        expect(html).toContain('aria-label="Vida de Aria Valen"')
        expect(html).toContain('aria-valuenow="38"')
        expect(html).toContain('aria-valuemin="0"')
        expect(html).toContain('aria-valuemax="45"')
        expect(html).toContain('38/45')
    })

    it('acima do máximo, a barra para em 100% mas o texto mostra o valor real', () => {
        const html = render(<StatMeter label="LP" ariaLabel="Vida" value={50} max={45} barColor={color.lp} />)
        expect(html).toContain('width:100%')
        expect(html).toContain('50/45')
        expect(html).toContain('aria-valuenow="45"')
        expect(html).toContain('aria-valuetext="50 de 45"')
    })

    it('com máximo zero não divide por zero e a barra fica vazia', () => {
        const html = render(<StatMeter label="AP" ariaLabel="Armadura" value={0} max={0} barColor={color.ap} />)
        expect(html).toContain('width:0%')
        expect(html).not.toContain('NaN')
    })
})

describe('CampaignStatsStrip', () => {
    it('resume jogadores, nível médio e maior nível, sem chip fora de combate', () => {
        const html = render(<CampaignStatsStrip totalPlayers={3} averageLevel={5} highestLevel={7} />)
        expect(html).toContain('jogadores')
        expect(html).toContain('nível médio')
        expect(html).toContain('maior nível')
        expect(html).not.toContain('Combate')
    })

    it('com combate ativo mostra o chip com a rodada', () => {
        const html = render(<CampaignStatsStrip totalPlayers={1} averageLevel={5} highestLevel={5} combatRound={7} />)
        expect(html).toContain('Combate · R7')
        expect(html).toContain('jogador')
        expect(html).not.toContain('jogadores')
    })

    it('sem fichas, só o total de jogadores (sem níveis zerados)', () => {
        const html = render(<CampaignStatsStrip totalPlayers={2} averageLevel={0} highestLevel={0} />)
        expect(html).not.toContain('nível médio')
    })

    it('enquanto as fichas chegam, mostra um esqueleto', () => {
        const html = render(<CampaignStatsStrip totalPlayers={0} averageLevel={0} highestLevel={0} loading />)
        expect(html).toContain('MuiSkeleton')
        expect(html).not.toContain('jogadores')
    })
})

describe('DeleteCreatureDialog', () => {
    const build = (deleting = false): ReactElement => DeleteCreatureDialog({
        open: true,
        creatureName: 'Lobo das Cinzas',
        deleting,
        onConfirm: () => {},
        onCancel: () => {}
    })
    const content = (dialog: ReactElement): string => render(<>{dialog.props.children}</>)

    it('pergunta antes de excluir e cita a criatura em negrito', () => {
        const html = content(build())
        expect(html).toContain('Excluir criatura?')
        expect(html).toContain('<strong>Lobo das Cinzas</strong>')
        expect(html).toContain('Cancelar')
        expect(html).toContain('Excluir')
    })

    it('é nomeado para leitores de tela e o botão de excluir é de erro', () => {
        const dialog = build()
        expect(dialog.props['aria-labelledby']).toBe('delete-creature-title')
        expect(content(dialog)).toContain('MuiButton-containedError')
    })

    it('enquanto exclui, trava os botões e não fecha clicando fora', () => {
        const dialog = build(true)
        expect(dialog.props.onClose).toBeUndefined()
        expect(content(dialog).match(/disabled=""/g)?.length).toBe(2)
    })
})
