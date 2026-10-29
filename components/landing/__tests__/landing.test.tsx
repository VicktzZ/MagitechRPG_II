import { ThemeProvider } from '@mui/material'
import { renderToStaticMarkup } from 'react-dom/server'
import theme from '../../../themes/theme'
import { element } from '../../../themes/tokens'
import BookCover from '../BookCover'
import ElementStrip from '../ElementStrip'
import ResourceMeter from '../ResourceMeter'
import RollResult from '../RollResult'

const render = (node: JSX.Element): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{node}</ThemeProvider>)

describe('RollResult', () => {
    it('mostra um glifo por dado, na fonte do dado, e o total', () => {
        const html = render(<RollResult sides={6} dice={[ 4, 6 ]} modifier={3} label="Dano" />)
        expect(html).toContain('aria-label="Dano: 4 e 6, mais 3, total 13"')
        expect(html).toContain('13')
        expect(html.match(/font-family:[^;]*&quot;D6&quot;|"D6"/g)?.length ?? 0).toBeGreaterThan(0)
    })

    it('sem modificador o total é a soma dos dados', () => {
        expect(render(<RollResult sides={6} dice={[ 2, 5 ]} label="Teste" />)).toContain('total 7')
    })

    it('modificador negativo usa o sinal de menos', () => {
        const html = render(<RollResult sides={8} dice={[ 3 ]} modifier={-1} label="Teste" />)
        expect(html).toContain('mais -1')
        expect(html).toContain('total 2')
    })
})

describe('ResourceMeter', () => {
    it('expõe o valor como medidor acessível e limita a barra a 100%', () => {
        const html = render(<ResourceMeter label="Vida (LP)" value={70} max={60} barColor="#fff" />)
        expect(html).toContain('role="meter"')
        expect(html).toContain('aria-valuenow="70"')
        expect(html).toContain('aria-valuemax="60"')
        expect(html).toContain('70/60')
        expect(html).toContain('width:100%')
    })
})

describe('ElementStrip', () => {
    it('lista os 13 elementos do catálogo', () => {
        const html = render(<ElementStrip />)
        for (const name of Object.keys(element)) expect(html).toContain(name)
        expect(html.match(/<li/g)).toHaveLength(13)
    })
})

describe('BookCover', () => {
    it('é um botão com nome acessível e o título na capa', () => {
        const html = render(<BookCover variant="guia" title={[ 'Livro', 'de Regras' ]} label="Baixar o Livro de Regras (PDF)" onClick={() => undefined} />)
        expect(html).toContain('aria-label="Baixar o Livro de Regras (PDF)"')
        expect(html).toContain('Livro')
        expect(html).toContain('de Regras')
    })

    it('o grimório desenha um glifo por elemento', () => {
        const html = render(<BookCover variant="grimorio" title={[ 'Grimório' ]} label="Baixar o Grimório (PDF)" onClick={() => undefined} />)
        expect(html).toContain('Grimório')
        // 13 glifos em anel + 2 caminhos da marca no centro
        expect(html.match(/<path/g)?.length).toBe(13 + 2)
    })
})
