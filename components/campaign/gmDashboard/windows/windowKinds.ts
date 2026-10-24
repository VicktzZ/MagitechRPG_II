/**
 * Tipos de janela das seções da ficha de um jogador. A ordem é a do menu de seções.
 * `summary` é a visão rápida (só leitura, com as ações do jogador); as demais são as abas do antigo modal de
 * detalhes, cada uma com a própria edição; `notes` são as anotações privadas do mestre sobre a ficha (o jogador não vê).
 */
export const SHEET_WINDOW_KINDS = [ 'summary', 'info', 'attributes', 'expertises', 'inventory', 'skills', 'spells', 'notes' ] as const;

/**
 * Tipos de janela de criatura: `creature` é a ficha de uma criatura personalizada da campanha (só leitura, com editar e
 * excluir) e `combatant` é uma criatura que está no combate agora (turno, vida, mana e rolagem de perícias).
 */
export const CREATURE_WINDOW_KINDS = [ 'creature', 'combatant' ] as const;

export const WINDOW_KINDS = [ ...SHEET_WINDOW_KINDS, ...CREATURE_WINDOW_KINDS ] as const;

export type SheetWindowKind = typeof SHEET_WINDOW_KINDS[number];
export type CreatureWindowKind = typeof CREATURE_WINDOW_KINDS[number];
export type WindowKind = typeof WINDOW_KINDS[number];

/**
 * O que a janela mostra, e portanto o que o `targetId` da janela identifica:
 * `sheet` = id da ficha, `creature` = id da criatura personalizada, `combatant` = id do combatente no combate.
 */
export type WindowTarget = 'sheet' | 'creature' | 'combatant';

export const isSheetKind = (kind: WindowKind): kind is SheetWindowKind => SHEET_WINDOW_KINDS.some(sheetKind => sheetKind === kind);

export function windowTargetOf(kind: WindowKind): WindowTarget {
    return isSheetKind(kind) ? 'sheet' : kind;
}

export const WINDOW_KIND_LABEL: Record<WindowKind, string> = {
    summary: 'Resumo',
    info: 'Informações',
    attributes: 'Atributos',
    expertises: 'Perícias',
    inventory: 'Inventário',
    skills: 'Habilidades',
    spells: 'Magias',
    notes: 'Anotações',
    creature: 'Criatura',
    combatant: 'Em combate'
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
    notes: { w: 480, h: 460 },
    creature: { w: 520, h: 640 },
    combatant: { w: 520, h: 520 }
};

export const WINDOW_MIN_SIZE: WindowSize = { w: 300, h: 200 };

/** Altura da barra de título; é também a altura da janela recolhida */
export const WINDOW_TITLE_HEIGHT = 40;

/** Janelas abertas ao mesmo tempo (a partir daí o mestre precisa fechar alguma) */
export const MAX_OPEN_WINDOWS = 10;

/** Identidade de uma janela: abrir de novo a mesma seção do mesmo alvo só foca a que já existe */
export function windowKey(kind: WindowKind, targetId: string): string {
    return `${kind}:${targetId}`;
}

export function isWindowKind(value: unknown): value is WindowKind {
    return WINDOW_KINDS.some(kind => kind === value);
}
