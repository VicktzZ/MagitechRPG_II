import { ThemeProvider } from '@mui/material'
import { renderToStaticMarkup } from 'react-dom/server'
import theme from '../../../themes/theme'
import CampaignUnavailable from '../CampaignUnavailable'

const render = (reason: 'not-found' | 'error', code = 'LL14N6WX'): string => renderToStaticMarkup(
    <ThemeProvider theme={theme}>
        <CampaignUnavailable reason={reason} code={code} onBack={() => {}} onRetry={() => {}} />
    </ThemeProvider>
)

describe('CampaignUnavailable', () => {
    it('código inexistente: explica, mostra o código e só oferece voltar', () => {
        const html = render('not-found')
        expect(html).toContain('Campanha não encontrada')
        expect(html).toContain('LL14N6WX')
        expect(html).toContain('Voltar às campanhas')
        expect(html).not.toContain('Tentar de novo')
        expect(html).toContain('role="status"')
    })

    it('falha ao carregar: oferece tentar de novo e é anunciada como alerta', () => {
        const html = render('error')
        expect(html).toContain('Não foi possível carregar a campanha')
        expect(html).toContain('Tentar de novo')
        expect(html).toContain('Voltar às campanhas')
        expect(html).toContain('role="alert"')
    })

    it('escapa o código vindo da URL', () => {
        const html = render('not-found', '<img src=x onerror=alert(1)>')
        expect(html).not.toContain('<img')
        expect(html).toContain('&lt;img')
    })

    it('sem código na URL, não mostra a linha do código', () => {
        expect(render('not-found', '')).not.toContain('Código:')
    })
})
