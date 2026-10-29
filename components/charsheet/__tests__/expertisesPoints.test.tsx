import { ThemeProvider } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FormProvider, useForm } from 'react-hook-form'
import theme from '../../../themes/theme'
import Expertises from '../Expertises'
import Passives from '../subcomponents/Passives'

// Os componentes de tela abaixo importam barris (@components/...) que carregam CSS e canvas, fora do alcance do jest em node
jest.mock('@components/charsheet', () => ({ Expertise: () => null }))
jest.mock('@components/misc', () => ({ NumberField: () => null }))
jest.mock('@hooks', () => ({ useAudio: () => ({ play: () => {} }), useCharsheetSystem: () => ({ system: null, loading: false }) }))
jest.mock('@hooks/useCharsheetSystem', () => ({ useCharsheetSystem: () => ({ system: null, loading: false }) }))
// O barril de contextos puxa um erro de tipo antigo em charsheetContext.ts que o ts-jest barra; aqui só importa o hook que a seção lê
jest.mock('@contexts', () => ({ useCampaignCurrentCharsheetContext: () => ({ charsheet: {}, updateCharsheet: async () => undefined }) }))

function FormHost({ values, children }: { values: Record<string, unknown>, children: ReactNode }): ReactElement {
    const form = useForm({ defaultValues: values })
    return <FormProvider {...form}>{children}</FormProvider>
}

const render = (values: Record<string, unknown>, children: ReactNode): string => renderToStaticMarkup(
    <ThemeProvider theme={theme}>
        <FormHost values={values}>{children}</FormHost>
    </ThemeProvider>
)

const sheet = {
    id: 'cs-1',
    name: 'Teste',
    class: 'Especialista',
    race: 'Humano',
    lineage: 'Nobre',
    mode: 'Classic',
    level: 6,
    points: { attributes: 0, expertises: 3, skills: 0, magics: 0 },
    expertises: { Luta: { value: 1, defaultAttribute: 'vig' } },
    passives: [ { title: 'Sempre alerta', description: 'Nunca é surpreendido.', occasion: 'Sempre ativo' } ],
    mods: { attributes: {} }
}

// Regressão: na primeira renderização o formulário ainda não está "montado" e `useWatch` com `defaultValue` devolvia o valor padrão no lugar do valor da ficha.
// "Pontos de Perícia" aparecia 0 (e dava para ver "sumir" os pontos ganhos ao subir de nível) até o próximo evento do formulário.
describe('valores da ficha na primeira renderização', () => {
    it('os pontos de perícia ganhos (ex: ao subir de nível) aparecem de cara, não o padrão 0', () => {
        const html = render(sheet, <Expertises />)

        expect(html).toMatch(/Pontos de Perícia:\s*<b[^>]*>3<\/b>/)
    })

    it('sem o campo na ficha, o contador cai em 0 sem quebrar', () => {
        const html = render({ ...sheet, points: {} }, <Expertises />)

        expect(html).toMatch(/Pontos de Perícia:\s*<b[^>]*>0<\/b>/)
    })

    it('as passivas da ficha aparecem de cara', () => {
        const html = render(sheet, <Passives />)

        expect(html).toContain('Sempre alerta')
    })
})
