import { ThemeProvider } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FormProvider, useForm } from 'react-hook-form'
import theme from '../../../themes/theme'
import Characteristics from '../Characteristics'
import Expertises from '../Expertises'
import LevelProgress from '../subcomponents/LevelProgress'

// Os componentes de tela abaixo importam barris (@components/...) que carregam CSS e canvas, fora do
// alcance do jest em node: só os pontos que as seções usam são trocados por componentes vazios.
jest.mock('@components/charsheet', () => ({ Expertise: () => null }))
jest.mock('@components/misc', () => ({ NumberField: () => null }))
jest.mock('@hooks', () => ({ useAudio: () => ({ play: () => {} }) }))

function FormHost({ values, children }: { values: Record<string, unknown>, children: ReactNode }): ReactElement {
    const form = useForm({ defaultValues: values })
    return <FormProvider {...form}>{children}</FormProvider>
}

const render = (values: Record<string, unknown>, children: ReactNode): string => renderToStaticMarkup(
    <ThemeProvider theme={theme}>
        <FormHost values={values}>{children}</FormHost>
    </ThemeProvider>
)

const baseSheet = {
    name: 'Teste',
    class: 'Especialista',
    race: 'Humano',
    lineage: 'Nobre',
    gender: 'Feminino',
    age: 20,
    mode: 'Classic',
    level: 1,
    points: { expertises: 3 },
    expertises: { Luta: { value: 1, defaultAttribute: 'vig' } },
    mods: { attributes: {} }
}

describe('Expertises (multiplicador e botões de edição)', () => {
    it('mostra o multiplicador rotulado e os botões +N/-N com estado', () => {
        const html = render(baseSheet, <Expertises />)
        expect(html).toContain('id="expertises-multiplier-label"')
        expect(html).toContain('aria-labelledby="expertises-multiplier-label"')
        expect(html).toContain('aria-label="Adicionar 1 ponto(s) por clique"')
        expect(html).toContain('aria-label="Remover 1 ponto(s) por clique"')
        expect(html.match(/aria-pressed="false"/g)?.length).toBe(2)
    })

    it('com a edição travada não mostra os controles', () => {
        const html = render(baseSheet, <Expertises disabled />)
        expect(html).not.toContain('expertises-multiplier-label')
        expect(html).not.toContain('aria-pressed')
    })
})

describe('Characteristics (layout)', () => {
    it('empilha as duas colunas abaixo de md e as divide 65/35 a partir dele', () => {
        const html = render(baseSheet, <Characteristics />)
        // abaixo de md: coluna única; a partir de md (900px): linha com 65% e 35%
        const rule = (min: number, declaration: string): RegExp =>
            new RegExp(`@media \\(min-width:${min}px\\)\\{\\.css-[a-z0-9]+\\{[^}]*${declaration};`)

        expect(html).toMatch(rule(0, 'flex-direction:column'))
        expect(html).toMatch(rule(900, 'flex-direction:row'))
        expect(html).toMatch(rule(0, 'width:100%'))
        expect(html).toMatch(rule(900, 'width:65%'))
        expect(html).toMatch(rule(900, 'width:35%'))
    })

    it('liga o rótulo de cada lista ao campo (nome acessível)', () => {
        const html = render(baseSheet, <Characteristics />)
        const labelledBy = [ ...html.matchAll(/aria-labelledby="([^"]+)"/g) ].map(match => match[1]!)
        expect(labelledBy.length).toBeGreaterThanOrEqual(4)
        labelledBy.forEach(ids => {
            const labelId = ids.split(' ')[0]!
            expect(html).toContain(`id="${labelId}"`)
        })
    })
})

describe('LevelProgress (acessibilidade)', () => {
    it('é uma barra de progresso nomeada e o nível não vira título', () => {
        const html = render({}, <LevelProgress title='Nível de Personagem' level={3} amount={20} />)
        expect(html).toContain('role="progressbar"')
        expect(html).toContain('aria-label="Nível de Personagem"')
        expect(html).toContain('aria-valuenow="3"')
        expect(html).toContain('aria-valuemax="20"')
        expect(html).not.toMatch(/<h[1-6]/)
    })
})
