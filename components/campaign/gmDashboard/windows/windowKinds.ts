/**
 * Tipos de janela do mestre: cada tipo é uma seção da ficha de um jogador. A ordem é a do menu de seções.
 * `summary` é a visão rápida (só leitura, com as ações do jogador); as demais são as abas do antigo modal de
 * detalhes, cada uma com a própria edição; `notes` são as anotações privadas do mestre sobre a ficha (o jogador não vê).
 */
export const WINDOW_KINDS = [ 'summary', 'info', 'attributes', 'expertises', 'inventory', 'skills', 'spells', 'notes' ] as const;

export type WindowKind = typeof WINDOW_KINDS[number];

export const WINDOW_KIND_LABEL: Record<WindowKind, string> = {
    summary: 'Resumo',
    info: 'Informações',
    attributes: 'Atributos',
    expertises: 'Perícias',
    inventory: 'Inventário',
    skills: 'Habilidades',
    spells: 'Magias',
    notes: 'Anotações'
};

export interface WindowSize {
    w: number;
    h: number;
}

/** Tamanho com que cada tipo de janela abre */
export const WINDOW_DEFAULT_SIZE: Record<WindowKind, WindowSize> = {
    summary: { w: 380, h: 700 },
    info: { w: 720, h: 600 },
    attributes: { w: 460, h: 460 },
    expertises: { w: 480, h: 600 },
    inventory: { w: 720, h: 600 },
    skills: { w: 720, h: 600 },
    spells: { w: 760, h: 600 },
    notes: { w: 480, h: 460 }
};

export const WINDOW_MIN_SIZE: WindowSize = { w: 300, h: 200 };

/** Altura da barra de título; é também a altura da janela recolhida */
export const WINDOW_TITLE_HEIGHT = 40;

/** Janelas abertas ao mesmo tempo (a partir daí o mestre precisa fechar alguma) */
export const MAX_OPEN_WINDOWS = 10;

/** Identidade de uma janela: abrir de novo a mesma seção da mesma ficha só foca a que já existe */
export function windowKey(kind: WindowKind, charsheetId: string): string {
    return `${kind}:${charsheetId}`;
}

export function isWindowKind(value: unknown): value is WindowKind {
    return WINDOW_KINDS.some(kind => kind === value);
}
