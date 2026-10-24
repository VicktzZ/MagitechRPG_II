/**
 * Tipos de janela do mestre: cada tipo é uma seção da ficha de um jogador.
 * Só existe o resumo por enquanto; atributos, perícias, inventário, habilidades e magias entram depois.
 */
export const WINDOW_KINDS = [ 'summary' ] as const;

export type WindowKind = typeof WINDOW_KINDS[number];

export const WINDOW_KIND_LABEL: Record<WindowKind, string> = {
    summary: 'Resumo'
};

export interface WindowSize {
    w: number;
    h: number;
}

/** Tamanho com que cada tipo de janela abre */
export const WINDOW_DEFAULT_SIZE: Record<WindowKind, WindowSize> = {
    summary: { w: 380, h: 640 }
};

export const WINDOW_MIN_SIZE: WindowSize = { w: 300, h: 200 };

/** Altura da barra de título; é também a altura da janela recolhida */
export const WINDOW_TITLE_HEIGHT = 40;

/** Janelas abertas ao mesmo tempo (a partir daí o mestre precisa fechar alguma) */
export const MAX_OPEN_WINDOWS = 8;

/** Identidade de uma janela: abrir de novo a mesma seção da mesma ficha só foca a que já existe */
export function windowKey(kind: WindowKind, charsheetId: string): string {
    return `${kind}:${charsheetId}`;
}

export function isWindowKind(value: unknown): value is WindowKind {
    return WINDOW_KINDS.some(kind => kind === value);
}
