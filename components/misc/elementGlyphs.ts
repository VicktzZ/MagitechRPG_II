import { element, type ElementName } from '../../themes/tokens'

/**
 * Glifo de cada elemento: traço único em grade de 24px (stroke 1,75), pintado com `currentColor`.
 * O glifo identifica o elemento; a cor (`elementColor`) só reforça. Substitui o ícone de faíscas.
 */
export const elementGlyphs: Record<ElementName, string> = {
    // chama
    'FOGO': 'M12 2.8c.4 3.2-3.1 5.2-4.5 8-1.2 2.4-.7 5.2 1.1 6.9A5 5 0 0 0 12 21.2c3.1 0 5.5-2.4 5.5-5.4 0-2.2-1.2-3.7-2.4-5.1-.4 1.3-1.2 2.1-2.2 2.4.6-3-.1-6.7-.9-10.3Z',
    // estrela de oito pontas
    'EXPLOSÃO': 'M12 2 L13.76 7.75 L19.07 4.93 L16.25 10.24 L22 12 L16.25 13.76 L19.07 19.07 L13.76 16.25 L12 22 L10.24 16.25 L4.93 19.07 L7.75 13.76 L2 12 L7.75 10.24 L4.93 4.93 L10.24 7.75Z',
    // sol
    'LUZ': 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8',
    // montanhas
    'TERRA': 'M2.8 19 9.4 7l4.1 7.3 2.3-3.9L21.2 19Z',
    // ondas
    'ÁGUA': 'M3 7.5q2.25-3 4.5 0t4.5 0 4.5 0 4.5 0M3 13q2.25-3 4.5 0t4.5 0 4.5 0 4.5 0M3 18.5q2.25-3 4.5 0t4.5 0 4.5 0 4.5 0',
    // vento
    'AR': 'M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7.5',
    // raio
    'ELETRICIDADE': 'M13.6 2.5 5 13.3h6.1l-1 8.2 8.9-11h-6.2Z',
    // lua crescente
    'TREVAS': 'M20.2 14.3A8.6 8.6 0 1 1 9.7 3.8a6.9 6.9 0 0 0 10.5 10.5Z',
    // olho
    'PSÍQUICO': 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    // gota
    'SANGUE': 'M12 3s6.5 6.6 6.5 11.2A6.5 6.5 0 0 1 12 20.7a6.5 6.5 0 0 1-6.5-6.5C5.5 9.6 12 3 12 3ZM8.8 14.6a3.1 3.1 0 0 0 2.6 2.8',
    // espiral
    'VÁCUO': 'M20.5 12a8.5 8.5 0 1 1-3-6.5M16 12a4 4 0 1 1-4-4M13.2 12a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z',
    // trifólio
    'RADIAÇÃO': 'M7.3 3.86A9.4 9.4 0 0 1 16.7 3.86L13.7 9.06A3.4 3.4 0 0 0 10.3 9.06Z M21.4 12A9.4 9.4 0 0 1 16.7 20.14L13.7 14.94A3.4 3.4 0 0 0 15.4 12Z M7.3 20.14A9.4 9.4 0 0 1 2.6 12L8.6 12A3.4 3.4 0 0 0 10.3 14.94Z M13.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
    // losango
    'NÃO-ELEMENTAL': 'M12 2.8 21.2 12 12 21.2 2.8 12ZM13.4 12a1.4 1.4 0 1 1-2.8 0 1.4 1.4 0 0 1 2.8 0Z'
}

const normalizeKey = (value: string): string =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, '-').trim()

/** Nome do elemento sem acento e em maiúsculas → nome canônico do catálogo (inclui o apelido "NEUTRO") */
const ELEMENT_ALIASES: Record<string, ElementName> = {
    ...Object.fromEntries((Object.keys(element) as ElementName[]).map(name => [ normalizeKey(name), name ])),
    NEUTRO: 'NÃO-ELEMENTAL',
    NEUTRAL: 'NÃO-ELEMENTAL',
    'NAO-ELEMENTAR': 'NÃO-ELEMENTAL'
}

/** Nome canônico de um elemento ("fogo" → "FOGO", "NEUTRO" → "NÃO-ELEMENTAL"); desconhecido cai em NÃO-ELEMENTAL */
export function resolveElement(value?: string | null): ElementName {
    return ELEMENT_ALIASES[normalizeKey(value ?? '')] ?? 'NÃO-ELEMENTAL'
}
