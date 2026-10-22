import { ThemeProvider } from '@mui/material'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import theme from '../../../themes/theme'
import LeaveCampaignDialog from '../LeaveCampaignDialog'

// O Dialog do MUI usa Portal (sem saída no render de servidor): inspeciona-se o elemento
// devolvido e renderiza-se só o conteúdo dele
const build = (props: { open?: boolean, leaving?: boolean, title?: string } = {}): ReactElement => LeaveCampaignDialog({
    open: props.open ?? true,
    leaving: props.leaving ?? false,
    campaignTitle: props.title ?? 'A Queda de Alvorada',
    onConfirm: () => {},
    onCancel: () => {}
})

const renderContent = (dialog: ReactElement): string => renderToStaticMarkup(
    <ThemeProvider theme={theme}>{dialog.props.children}</ThemeProvider>
)

describe('LeaveCampaignDialog', () => {
    it('pergunta antes de sair e cita a campanha e que a ficha não é apagada', () => {
        const html = renderContent(build())
        expect(html).toContain('Sair da campanha?')
        expect(html).toContain('A Queda de Alvorada')
        expect(html).toContain('Sua ficha não é apagada')
        expect(html).toContain('Cancelar')
    })

    it('é um diálogo nomeado e descrito para leitores de tela', () => {
        const dialog = build()
        expect(dialog.props['aria-labelledby']).toBe('leave-campaign-title')
        expect(dialog.props['aria-describedby']).toBe('leave-campaign-description')
        const html = renderContent(dialog)
        expect(html).toContain('id="leave-campaign-title"')
        expect(html).toContain('id="leave-campaign-description"')
    })

    it('fechado quando open é falso', () => {
        expect(build({ open: false }).props.open).toBe(false)
    })

    it('enquanto sai, trava os botões e não fecha clicando fora', () => {
        const dialog = build({ leaving: true })
        expect(dialog.props.onClose).toBeUndefined()
        const html = renderContent(dialog)
        expect(html.match(/disabled=""/g)?.length).toBe(2)
        expect(html).toContain('role="progressbar"')
    })

    it('fora da saída, os botões estão ativos e fechar pelo fundo cancela', () => {
        const dialog = build()
        expect(typeof dialog.props.onClose).toBe('function')
        expect(renderContent(dialog)).not.toContain('disabled=""')
    })
})
