import theme from '../theme'
import { color, diceFont, element, font, radius, rarity, shadow } from '../tokens'

/** Luminância relativa (WCAG 2.x) de uma cor `#rrggbb` */
const luminance = (hex: string): number => {
    const [ r, g, b ] = [ 1, 3, 5 ].map(start => {
        const channel = parseInt(hex.slice(start, start + 2), 16) / 255
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    }) as [ number, number, number ]
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Razão de contraste (WCAG 2.x) entre duas cores `#rrggbb`: de 1 a 21 */
const contrast = (foreground: string, background: string): number => {
    const [ lighter, darker ] = [ luminance(foreground), luminance(background) ].sort((a, b) => b - a) as [ number, number ]
    return (lighter + 0.05) / (darker + 0.05)
}

const surfaces = {
    canvas: color.canvas,
    surface: color.surface,
    surfaceRaised: color.surfaceRaised,
    surfaceOverlay: color.surfaceOverlay
}

describe('contraste dos tokens', () => {
    describe('texto sobre as superfícies (mínimo 4,5:1)', () => {
        const texts = { ink: color.ink, inkMuted: color.inkMuted, amber: color.amber, cyan: color.cyan }

        for (const [ textName, text ] of Object.entries(texts)) {
            it.each(Object.entries(surfaces))(`${textName} sobre %s`, (_surface, background) => {
                expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5)
            })
        }
    })

    it('inkFaint (texto de apoio) passa de 4,5:1 sobre canvas, surface e surfaceRaised', () => {
        for (const background of [ color.canvas, color.surface, color.surfaceRaised ]) {
            expect(contrast(color.inkFaint, background)).toBeGreaterThanOrEqual(4.5)
        }
    })

    it('feedback (sucesso, alerta, erro) passa de 4,5:1 sobre canvas, surface e surfaceRaised', () => {
        for (const text of [ color.success, color.warning, color.danger ]) {
            for (const background of [ color.canvas, color.surface, color.surfaceRaised ]) {
                expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5)
            }
        }
    })

    it('texto sobre o botão âmbar passa de 4,5:1 em repouso, hover e pressionado', () => {
        for (const fill of [ color.amber, color.amberHover, color.amberPressed ]) {
            expect(contrast(color.onAmber, fill)).toBeGreaterThanOrEqual(4.5)
        }
    })

    it('texto sobre o item selecionado (amberSubtle) passa de 4,5:1', () => {
        expect(contrast(color.ink, color.amberSubtle)).toBeGreaterThanOrEqual(4.5)
        expect(contrast(color.amber, color.amberSubtle)).toBeGreaterThanOrEqual(4.5)
    })

    it('borda de campos e controles passa de 3:1 sobre surface e surfaceRaised', () => {
        for (const background of [ color.surface, color.surfaceRaised ]) {
            expect(contrast(color.borderControl, background)).toBeGreaterThanOrEqual(3)
        }
    })

    it('marcas de elemento passam de 3:1 sobre canvas, surface e surfaceRaised', () => {
        for (const [ name, mark ] of Object.entries(element)) {
            for (const background of [ color.canvas, color.surface, color.surfaceRaised ]) {
                expect({ name, ratio: contrast(mark, background) >= 3 }).toEqual({ name, ratio: true })
            }
        }
    })

    it('marcas de raridade passam de 3:1 sobre canvas, surface e surfaceRaised', () => {
        for (const [ name, mark ] of Object.entries(rarity)) {
            for (const background of [ color.canvas, color.surface, color.surfaceRaised ]) {
                expect({ name, ratio: contrast(mark, background) >= 3 }).toEqual({ name, ratio: true })
            }
        }
    })

    it('as superfícies ficam em ordem crescente de luminosidade', () => {
        const order = [ color.canvas, color.surface, color.surfaceRaised, color.surfaceOverlay ].map(luminance)
        expect([ ...order ].sort((a, b) => a - b)).toEqual(order)
    })
})

describe('mapas de domínio', () => {
    it('elementos cobrem os 13 elementos do catálogo, em maiúsculas', () => {
        expect(Object.keys(element)).toHaveLength(13)
        for (const name of Object.keys(element)) {
            expect(name).toBe(name.toUpperCase())
        }
    })

    it('raridades cobrem as 9 raridades do sistema', () => {
        expect(Object.keys(rarity)).toEqual([
            'Comum', 'Incomum', 'Raro', 'Épico', 'Lendário', 'Único', 'Mágico', 'Especial', 'Amaldiçoado'
        ])
    })

    it('todas as cores são hex #rrggbb', () => {
        const hex = /^#[0-9a-f]{6}$/
        for (const value of [ ...Object.values(color), ...Object.values(element), ...Object.values(rarity) ]) {
            expect(value).toMatch(hex)
        }
    })
})

describe('diceFont', () => {
    it.each([ 4, 6, 8, 10, 12, 20 ])('d%i usa a fonte própria do dado', sides => {
        expect(diceFont(sides)).toBe(font.dice[`d${sides}` as keyof typeof font.dice])
        expect(diceFont(sides)).toContain(`"D${sides}"`)
    })

    it('dado sem fonte própria (ex.: d100) cai na fonte mono', () => {
        expect(diceFont(100)).toBe(font.mono)
    })
})

describe('tema do MUI gerado dos tokens', () => {
    it('é só escuro', () => {
        expect(theme.palette.mode).toBe('dark')
    })

    it('âmbar é a cor de ação e o ciano é só informação', () => {
        expect(theme.palette.primary.main).toBe(color.amber)
        expect(theme.palette.primary.contrastText).toBe(color.onAmber)
        expect(theme.palette.info.main).toBe(color.cyan)
    })

    it('secondary é neutro, não uma segunda cor de marca', () => {
        expect(theme.palette.secondary.main).toBe(color.inkMuted)
    })

    it('as superfícies seguem a escala de tokens', () => {
        expect(theme.palette.background.default).toBe(color.canvas)
        expect(theme.palette.background.paper).toBe(color.surface)
        expect(theme.palette.background.raised).toBe(color.surfaceRaised)
        expect(theme.palette.background.overlay).toBe(color.surfaceOverlay)
    })

    it('texto e divisor vêm dos tokens', () => {
        expect(theme.palette.text.primary).toBe(color.ink)
        expect(theme.palette.text.secondary).toBe(color.inkMuted)
        expect(theme.palette.divider).toBe(color.border)
    })

    it('shape.borderRadius vale o raio sm, para o sx manter 1 = 4px, 2 = 8px, 3 = 12px', () => {
        expect(theme.shape.borderRadius).toBe(radius.sm)
        expect(theme.shape.borderRadius * 2).toBe(radius.md)
        expect(theme.shape.borderRadius * 3).toBe(radius.lg)
    })

    it('só a camada flutuante tem sombra: cartões planos, menus e modais com shadow.overlay', () => {
        expect(theme.shadows).toHaveLength(25)
        for (const elevation of [ 0, 1, 2, 4, 6 ]) expect(theme.shadows[elevation]).toBe(shadow.none)
        for (const elevation of [ 8, 16, 24 ]) expect(theme.shadows[elevation]).toBe(shadow.overlay)
    })

    it('o Paper não tem o gradiente de elevação do modo escuro', () => {
        const paper = theme.components?.MuiPaper?.styleOverrides as { root: { backgroundImage: string } }
        expect(paper.root.backgroundImage).toBe('none')
    })

    it('a fonte de texto do tema é a IBM Plex Sans', () => {
        expect(theme.typography.fontFamily).toBe(font.text)
    })
})
