import { diffAgainst } from '../textDiff'

const join = (segments: Array<{ text: string }>): string => segments.map(s => s.text).join('')
const marked = (text: string, previous: string): string[] => diffAgainst(previous, text).segments.filter(s => s.changed).map(s => s.text)

describe('diffAgainst', () => {
    it('marca só o que é novo e o texto sai idêntico ao original', () => {
        const previous = 'Causa 2d6 de dano de fogo em um alvo a 9m.'
        const current = 'Causa 3d6 de dano de fogo em um alvo a 9m.'
        const diff = diffAgainst(previous, current)
        expect(join(diff.segments)).toBe(current)
        expect(marked(current, previous)).toEqual([ '3d6' ])
        expect(diff.changedWords).toBe(1)
        expect(diff.rewritten).toBe(false)
    })

    it('junta palavras novas vizinhas num só trecho e acha o que foi acrescentado no fim', () => {
        const previous = 'Causa 2d6 de dano de fogo em um alvo.'
        const current = 'Causa 2d6 de dano de fogo em um alvo e deixa o alvo em chamas por 2 turnos.'
        expect(marked(current, previous)).toEqual([ 'e deixa o alvo em chamas por 2 turnos.' ])
        expect(join(diffAgainst(previous, current).segments)).toBe(current)
    })

    it('ignora caixa e pontuação na ponta das palavras', () => {
        expect(marked('Dano de Fogo, 2d6.', 'dano de fogo 2d6')).toEqual([])
    })

    it('texto igual não marca nada', () => {
        const diff = diffAgainst('Cura 1d6.', 'Cura 1d6.')
        expect(diff.segments).toEqual([ { text: 'Cura 1d6.', changed: false } ])
        expect(diff.changedWords).toBe(0)
    })

    it('texto reescrito (quase nada em comum) não é marcado inteiro', () => {
        const diff = diffAgainst('Cria uma barreira de pedra ao redor do conjurador.', 'Lança uma rajada de chamas que atravessa os inimigos alinhados.')
        expect(diff.rewritten).toBe(true)
        expect(diff.segments.every(s => !s.changed)).toBe(true)
        expect(join(diff.segments)).toBe('Lança uma rajada de chamas que atravessa os inimigos alinhados.')
    })

    it('sem texto anterior (estágio 1) ou sem texto atual devolve o texto puro', () => {
        expect(diffAgainst(undefined, 'Cura 1d6.').segments).toEqual([ { text: 'Cura 1d6.', changed: false } ])
        expect(diffAgainst('Cura 1d6.', null).segments).toEqual([])
        expect(diffAgainst('   ', 'Cura 1d6.').changedWords).toBe(0)
    })

    it('preserva quebras de linha e espaços do original', () => {
        const previous = 'Primeira linha.\nSegunda linha.'
        const current = 'Primeira linha.\nSegunda linha maior.'
        expect(join(diffAgainst(previous, current).segments)).toBe(current)
    })

    it('textos muito longos não são comparados', () => {
        const long = Array.from({ length: 600 }, (_, i) => `p${i}`).join(' ')
        expect(diffAgainst(long, `${long} novo`).segments).toEqual([ { text: `${long} novo`, changed: false } ])
    })
})
