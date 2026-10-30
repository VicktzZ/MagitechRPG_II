import { ThemeProvider } from '@mui/material'
import { renderToStaticMarkup } from 'react-dom/server'
import theme from '../../../themes/theme'
import SkillMode, { skillModeOf, skillModeTag, skillSource } from '../subcomponents/SkillMode'

const skills = {
    class: [ { name: 'Feitiçaria' }, { name: 'Cura Interior' }, { name: 'Habilidade Inventada' } ],
    subclass: [ { name: 'Postura Defensiva' } ],
    lineage: [ { name: 'Feitiçaria' } ]
}

// Outras origens (linhagem, raça, bônus...) ficam na ficha ao lado de classe e subclasse, mas não são passivas de combate
const otherOrigins = { class: [], lineage: [ { name: 'Só de linhagem' } ] }

const render = (info: ReturnType<typeof skillModeOf>): string => renderToStaticMarkup(
    <ThemeProvider theme={theme}>
        <SkillMode info={info} />
    </ThemeProvider>
)

describe('skillSource', () => {
    it('acha a habilidade na lista de classe ou de subclasse', () => {
        expect(skillSource(skills, 'Cura Interior')).toBe('class')
        expect(skillSource(skills, 'Postura Defensiva')).toBe('subclass')
    })

    it('outras origens e nomes que a ficha não tem não contam', () => {
        expect(skillSource(otherOrigins, 'Só de linhagem')).toBeNull()
        expect(skillSource(skills, 'Não existe')).toBeNull()
    })

    it('lista gravada como objeto de chaves numéricas (formato antigo do Firestore) também vale', () => {
        expect(skillSource({ class: { 0: { name: 'Cura Interior' } } }, 'Cura Interior')).toBe('class')
    })

    it('ficha sem habilidades não quebra', () => {
        expect(skillSource(null, 'Cura Interior')).toBeNull()
        expect(skillSource(undefined, 'Cura Interior')).toBeNull()
        expect(skillSource({}, 'Cura Interior')).toBeNull()
    })
})

describe('skillModeOf', () => {
    it('diz o modo das habilidades do catálogo', () => {
        expect(skillModeOf(skills, undefined, 'Feitiçaria')).toMatchObject({ source: 'class', mode: 'automatica' })
        expect(skillModeOf(skills, undefined, 'Cura Interior')).toMatchObject({ source: 'class', mode: 'ativada' })
        expect(skillModeOf(skills, undefined, 'Postura Defensiva')).toMatchObject({ source: 'subclass', mode: 'ativada' })
    })

    it('habilidade de classe fora do catálogo é só texto', () => {
        expect(skillModeOf(skills, undefined, 'Habilidade Inventada')).toMatchObject({ source: 'class', mode: 'texto', def: undefined })
    })

    it('ficha de sistema customizado e habilidades de outras origens não têm modo', () => {
        expect(skillModeOf(skills, 'sistema-1', 'Cura Interior')).toBeNull()
        expect(skillModeOf(otherOrigins, undefined, 'Só de linhagem')).toBeNull()
    })
})

describe('skillModeTag', () => {
    it('o cartão só repete o modo do que o app trata de fato', () => {
        expect(skillModeTag(skillModeOf(skills, undefined, 'Feitiçaria'))).toBe('Automática')
        expect(skillModeTag(skillModeOf(skills, undefined, 'Cura Interior'))).toBe('Ativada')
        expect(skillModeTag(skillModeOf(skills, undefined, 'Habilidade Inventada'))).toBe('')
        expect(skillModeTag(null)).toBe('')
    })
})

describe('SkillMode', () => {
    it('mostra o rótulo, a explicação e o que o app não faz sozinho', () => {
        const html = render(skillModeOf(skills, undefined, 'Feitiçaria'))

        expect(html).toContain('data-testid="skill-mode"')
        expect(html).toContain('Automática')
        expect(html).toContain('O app aplica sozinho nas rolagens e no combate.')
        expect(html).toContain('Fora do automático: ')
        expect(html).toContain('Escolher a magia de nível 1 ao adquirir a habilidade é na ficha.')
    })

    it('habilidade ativada explica onde ela aparece', () => {
        const html = render(skillModeOf(skills, undefined, 'Cura Interior'))

        expect(html).toContain('Ativada')
        expect(html).toContain('quadrado na seção Ações')
        expect(html).not.toContain('Fora do automático')
    })

    it('habilidade só de texto diz que o mestre aplica', () => {
        const html = render(skillModeOf(skills, undefined, 'Habilidade Inventada'))

        expect(html).toContain('Só texto')
        expect(html).toContain('quem aplica é o mestre')
    })

    it('sem modo (outra origem ou sistema customizado) não desenha nada', () => {
        expect(render(null)).toBe('')
    })
})

describe('habilidade de reação a ataque', () => {
    it('o detalhe explica que se usa em "Reagir" no cartão do ataque, e não como quadrado', () => {
        const html = render(skillModeOf({ class: [], subclass: [ { name: 'Barreira de Ki' } ] }, undefined, 'Barreira de Ki'))

        expect(html).toContain('Ativada')
        expect(html).toContain('Reagir')
        expect(html).not.toContain('Aparece como quadrado')
    })

    it('a ativada comum continua dizendo que é um quadrado', () => {
        expect(render(skillModeOf(skills, undefined, 'Cura Interior'))).toContain('Aparece como quadrado')
    })
})
