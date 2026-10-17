/**
 * Tokens do design system: a fonte única de cor, tipografia, espaço, raio, sombra e movimento.
 * O tema do MUI (`themes/theme.ts`) e os mapas de domínio (`@constants`: elementos, raridades)
 * são gerados daqui. Componentes novos importam estes valores ou usam o tema, nunca um hex solto.
 *
 * Identidade: grafite quente com âmbar como única cor de ação; o ciano do logo só aparece como
 * mana e informação. Só existe o tema escuro. Os pares de texto passam de 4,5:1 sobre as superfícies
 * que citam e as marcas passam de 3:1 (verificado em `themes/__tests__/tokens.test.ts`).
 */

/** Cores semânticas */
export const color = {
    // Superfícies, da mais baixa para a mais alta
    canvas: '#0e0f11', // fundo da página e do modal
    surface: '#15171a', // painéis
    surfaceRaised: '#1c1f23', // cartões, campos e linhas de tabela
    surfaceOverlay: '#24282d', // menus, popovers, tooltips e modais (única camada com sombra)

    // Bordas
    border: '#2c3036', // painéis, cartões e divisores (decorativa)
    borderStrong: '#3e444c', // hover de cartão (decorativa)
    borderControl: '#7d786f', // campos e controles: 3:1 ou mais sobre surface e surfaceRaised

    // Texto
    ink: '#ece7dc', // principal
    inkMuted: '#a9a398', // secundário
    inkFaint: '#8a857b', // apoio; só sobre canvas, surface e surfaceRaised

    // Marca: âmbar, a única cor de ação
    amber: '#e8a33d',
    amberHover: '#f2b858',
    amberPressed: '#c98a26',
    onAmber: '#1a1206', // texto sobre preenchimento âmbar
    amberSubtle: '#2e2412', // fundo de item selecionado
    amberLine: '#9a722a', // borda de item selecionado

    // Informação e mana: o azul do logo
    cyan: '#3ab4e6',
    cyanSubtle: '#10222c',

    // Feedback: sempre acompanhado de ícone ou palavra
    success: '#62b583',
    warning: '#e07b39',
    danger: '#e0605a',

    // Recursos do personagem
    lp: '#e0605a', // pontos de vida
    mp: '#3ab4e6', // mana
    ap: '#9aa7b4' // armadura
} as const

/**
 * Cor de marca de cada elemento do catálogo (chave = nome em maiúsculas, como no banco). Usar como
 * ponto, glifo ou filete, nunca como fundo cheio de cartão: o glifo identifica, a cor reforça.
 */
export const element = {
    'FOGO': '#e4572e',
    'EXPLOSÃO': '#f28c28',
    'LUZ': '#f3e3a0',
    'TERRA': '#a98153',
    'ÁGUA': '#3f8edb',
    'AR': '#8fd0e8',
    'ELETRICIDADE': '#8b7bff',
    'TREVAS': '#9a6ad0',
    'PSÍQUICO': '#e05fa8',
    'SANGUE': '#c0353f',
    'VÁCUO': '#7585a0',
    'RADIAÇÃO': '#a7d129',
    'NÃO-ELEMENTAL': '#c9c3b6'
} as const

/** Cor de cada raridade; acompanha sempre o nome da raridade em texto */
export const rarity = {
    'Comum': '#9a968c',
    'Incomum': '#62b583',
    'Raro': '#4f94dc',
    'Épico': '#a276d6',
    'Lendário': '#f0883a',
    'Único': '#e0605a',
    'Mágico': '#3ab4e6',
    'Especial': '#8b86f0',
    'Amaldiçoado': '#d0629f'
} as const

/**
 * Famílias de fonte. Tech-arcano: Chakra Petch nos títulos, IBM Plex Sans no texto e IBM Plex Mono
 * nos números. Os arquivos e as licenças (OFL) ficam em `public/fonts`, carregados por `fonts.css`.
 */
export const font = {
    display: '"Chakra Petch", system-ui, sans-serif',
    text: '"IBM Plex Sans", system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
    /**
     * Fontes dos dados (public/fonts/rpg, registradas em fonts.css): um glifo por dado, não um número.
     * Os dígitos 0-9 viram a face do dado (d4: 1-4; d6, d8 e d10: pontos; d12 e d20: numeral, e no d12
     * o 0 é o 10); as letras A-F são faces preenchidas e a-f faces de contorno, numeradas em sequência.
     * Por isso o resultado de um d20 (1-20) e as somas não cabem num glifo e ficam na fonte mono.
     */
    dice: {
        d4: '"D4", "IBM Plex Mono", monospace',
        d6: '"D6", "IBM Plex Mono", monospace',
        d8: '"D8", "IBM Plex Mono", monospace',
        d10: '"D10", "IBM Plex Mono", monospace',
        d12: '"D12", "IBM Plex Mono", monospace',
        d20: '"D20", "IBM Plex Mono", monospace'
    }
} as const

/** Família da fonte de um dado de `sides` lados; sem fonte própria (ex.: d100), cai na mono */
export function diceFont(sides: number): string {
    const key = `d${sides}` as keyof typeof font.dice
    return font.dice[key] ?? font.mono
}

/** Escala de texto: tamanho e altura de linha em px, peso e família */
export const typeScale = {
    displayLg: { fontSize: 40, lineHeight: 44, fontWeight: 600, fontFamily: font.display },
    displayMd: { fontSize: 28, lineHeight: 32, fontWeight: 600, fontFamily: font.display },
    displaySm: { fontSize: 20, lineHeight: 24, fontWeight: 600, fontFamily: font.display },
    titleLg: { fontSize: 22, lineHeight: 28, fontWeight: 600, fontFamily: font.text },
    titleMd: { fontSize: 18, lineHeight: 24, fontWeight: 600, fontFamily: font.text },
    titleSm: { fontSize: 15, lineHeight: 20, fontWeight: 600, fontFamily: font.text },
    bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: 400, fontFamily: font.text },
    body: { fontSize: 14, lineHeight: 22, fontWeight: 400, fontFamily: font.text },
    bodySm: { fontSize: 12.5, lineHeight: 18, fontWeight: 400, fontFamily: font.text },
    label: { fontSize: 12, lineHeight: 16, fontWeight: 600, fontFamily: font.text, letterSpacing: '0.06em' },
    statLg: { fontSize: 28, lineHeight: 32, fontWeight: 500, fontFamily: font.mono },
    stat: { fontSize: 16, lineHeight: 20, fontWeight: 500, fontFamily: font.mono },
    code: { fontSize: 12.5, lineHeight: 18, fontWeight: 400, fontFamily: font.mono }
} as const

/** Espaço, base de 4px (equivale a `theme.spacing(n)` do MUI) */
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48, 8: 64 } as const

/**
 * Raio em px. `shape.borderRadius` do tema vale 4: no `sx`, `borderRadius: 1` é `sm`, `2` é `md`
 * e `3` é `lg` (como já está em centenas de componentes).
 */
export const radius = { sm: 4, md: 8, lg: 12, pill: 999 } as const

/** Sombras: sem brilho colorido; só a camada flutuante tem sombra */
export const shadow = {
    none: 'none',
    low: '0 1px 2px rgba(0, 0, 0, 0.45)',
    overlay: '0 16px 40px rgba(0, 0, 0, 0.6)',
    focusRing: `0 0 0 2px ${color.canvas}, 0 0 0 4px ${color.amber}`
} as const

/** Movimento: transições curtas e nenhuma animação infinita */
export const duration = { fast: 120, base: 200, slow: 320 } as const
export const easing = { standard: 'cubic-bezier(0.2, 0, 0, 1)', exit: 'cubic-bezier(0.4, 0, 1, 1)' } as const

export type ElementName = keyof typeof element
export type RarityName = keyof typeof rarity
