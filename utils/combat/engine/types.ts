/**
 * Tipos comuns do motor de combate automatizado (regras do dono: ver o CLAUDE.md, seção "Combate automatizado").
 * O motor é código puro: recebe valores já rolados e devolve o que aconteceu e por quê. Quem sorteia dados, grava no banco ou desenha a tela
 * fica de fora, e o mestre sempre pode trocar qualquer entrada (o tipo de dano, por exemplo) antes de confirmar.
 */

/** Natureza do ataque: define a resistência e como o dano é reduzido. O mestre pode trocá-la ("e se esse ataque fosse mental?") */
export type DamageKind = 'fisico' | 'magico' | 'mental';

/** Uma linha do cálculo, para o dropdown do cartão de rolagem. Linhas `gm` revelam resistências e fraquezas do alvo e só o mestre vê */
export interface ExplainLine {
    label: string;
    detail?: string;
    visibility: 'all' | 'gm';
}

export const line = (label: string, detail?: string, visibility: ExplainLine['visibility'] = 'all'): ExplainLine => (
    detail === undefined ? { label, visibility } : { label, detail, visibility }
);

/** Linhas que o jogador pode ver (as `gm` ficam de fora) */
export const visibleLines = (lines: readonly ExplainLine[], viewer: 'gm' | 'player'): ExplainLine[] =>
    lines.filter(entry => viewer === 'gm' || entry.visibility === 'all');
