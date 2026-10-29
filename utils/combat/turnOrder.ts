import type { Combat, Combatant } from '@models';

/**
 * A ordem de turnos como a tela a mostra (a faixa de retratos do jogador e, depois, a do mestre). Pura: recebe o combate e quem está vendo e devolve, por combatente, só o
 * que a tela precisa. A lista de `combat.combatants` já vem na ordem de ação (maior iniciativa primeiro) e `currentTurnIndex` aponta o turno; na fase de iniciativa
 * ainda não há ordem, então ninguém é "o da vez".
 */

export interface TurnOrderLp {
    current: number;
    max: number;
    /** 0 a 100 */
    percent: number;
}

export interface TurnOrderItem {
    id: string;
    name: string;
    /** Uma ou duas letras para o retrato sem imagem */
    initials: string;
    type: Combatant['type'];
    avatar?: string;
    isCurrent: boolean;
    /** É o personagem de quem está vendo */
    isViewer: boolean;
    /** Já agiu nesta rodada (só na fase de ação) */
    hasActed: boolean;
    /** Iniciativa já rolada, ou `null` */
    initiative: number | null;
    /** LP à vista; `null` onde não se mostra (criatura com a vida escondida pelo mestre) */
    lp: TurnOrderLp | null;
    /** Nomes dos efeitos aplicados */
    effects: string[];
}

export interface TurnOrderSummary {
    round: number;
    phase: Combat['phase'];
    items: TurnOrderItem[];
    /** Nome de quem tem a vez (só na fase de ação) */
    currentName: string | null;
    /** É a vez de quem está vendo */
    viewerIsCurrent: boolean;
    /** Quantos turnos faltam até o de quem está vendo: 0 é agora; `null` fora da fase de ação ou sem o personagem no combate */
    turnsUntilViewer: number | null;
}

export interface TurnOrderOptions {
    /** O combatente de quem está vendo (id do personagem) */
    viewerId?: string | null;
    /** O mestre e a criatura com a vida à mostra veem o LP das criaturas; senão só o dos jogadores */
    showCreatureLp?: boolean;
    /** LP e máximo de um jogador, lidos da ficha (o combatente guarda uma cópia que pode estar velha); sem a ficha vale o do combatente */
    playerLp?: (combatant: Combatant) => { lp: number; maxLp: number } | null | undefined;
}

const finite = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);

/** "Aria Valen" → "AV"; "Goblin" → "GO"; a cópia "Goblin Saqueador (2)" → "GS" (o "(2)" não é uma palavra do nome) */
export function initialsOf(name: string): string {
    const all = name.trim().split(/\s+/).filter(Boolean);
    const named = all.filter(word => /^[\p{L}\p{N}]/u.test(word));
    const words = named.length > 0 ? named : all;
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
    return `${words[0]![0]}${words[words.length - 1]![0]}`.toUpperCase();
}

function lpOf(combatant: Combatant, options: TurnOrderOptions): TurnOrderLp | null {
    const isPlayer = combatant.type === 'player';
    if (!isPlayer && !options.showCreatureLp) return null;

    const fromSheet = isPlayer ? options.playerLp?.(combatant) : null;
    const current = finite(fromSheet?.lp) ?? finite(combatant.currentLp);
    const max = finite(fromSheet?.maxLp) ?? finite(combatant.maxLp);
    if (current === null || max === null || max <= 0) return null;

    return { current, max, percent: Math.max(0, Math.min(100, Math.round((current / max) * 100))) };
}

export function summarizeTurnOrder(combat: Pick<Combat, 'round' | 'phase' | 'currentTurnIndex' | 'combatants'> | null | undefined, options: TurnOrderOptions = {}): TurnOrderSummary | null {
    if (!combat) return null;

    const combatants = Array.isArray(combat.combatants) ? combat.combatants : [];
    const acting = combat.phase === 'ACTION';
    const currentIndex = acting ? combat.currentTurnIndex : -1;
    const viewerIndex = options.viewerId ? combatants.findIndex(combatant => combatant.id === options.viewerId) : -1;

    const items = combatants.map((combatant, index): TurnOrderItem => ({
        id: combatant.id,
        name: combatant.name,
        initials: initialsOf(combatant.name),
        type: combatant.type,
        ...(combatant.avatar ? { avatar: combatant.avatar } : {}),
        isCurrent: index === currentIndex,
        isViewer: index === viewerIndex,
        hasActed: acting && Boolean(combatant.hasActed),
        initiative: combatant.initiativeTotal > 0 ? combatant.initiativeTotal : null,
        lp: lpOf(combatant, options),
        effects: (combatant.effects ?? []).map(effect => String(effect.snapshot?.name ?? '').trim()).filter(Boolean)
    }));

    const count = combatants.length;
    const turnsUntilViewer = acting && viewerIndex >= 0 && currentIndex >= 0 && count > 0 ? (viewerIndex - currentIndex + count) % count : null;

    return {
        round: combat.round,
        phase: combat.phase,
        items,
        currentName: currentIndex >= 0 ? (combatants[currentIndex]?.name ?? null) : null,
        viewerIsCurrent: turnsUntilViewer === 0,
        turnsUntilViewer
    };
}

/** "Agora", "Próximo", "Em 3 turnos": quando chega a vez de quem está vendo */
export function describeTurnsUntil(turns: number | null): string | null {
    if (turns === null) return null;
    if (turns === 0) return 'Agora';
    if (turns === 1) return 'Próximo';
    return `Em ${turns} turnos`;
}
