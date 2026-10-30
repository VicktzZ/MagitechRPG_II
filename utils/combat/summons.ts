import type { Combatant } from '@models';

/**
 * Invocados (decisão do dono, 29/10/2026): o invocado entra no combate como qualquer combatente-criatura (pelo "Adicionar ao combate", com iniciativa própria), mas **quem o controla é o
 * jogador que invocou**: passa o turno dele, gasta as ações, rola os dados e declara os ataques. A resolução continua do mestre (AP, defesa do alvo, dano final). Mecânica genérica: serve
 * às habilidades de invocação e, depois, às magias de Invocação. Puro.
 *
 * Os campos ficam no combatente: `controllerId` (usuário que controla) e `summonerId` (ficha do invocador, só para a tela). Sem `controllerId` é uma criatura comum.
 */

type SummonLike = Pick<Combatant, 'type'> & Partial<Pick<Combatant, 'controllerId' | 'summonerId' | 'id' | 'name'>>;

/** O combatente é um invocado (criatura com um jogador no controle) */
export const isSummon = (combatant: SummonLike | null | undefined): boolean => Boolean(combatant && combatant.type === 'creature' && combatant.controllerId);

/** O usuário controla este invocado? */
export const controlsSummon = (combatant: SummonLike | null | undefined, userId: string | null | undefined): boolean => Boolean(userId && isSummon(combatant) && combatant?.controllerId === userId);

/** Os invocados que o usuário controla, na ordem do combate */
export function summonsOf<T extends SummonLike>(combatants: readonly T[] | undefined, userId: string | null | undefined): T[] {
    return (combatants ?? []).filter(combatant => controlsSummon(combatant, userId));
}

export interface SummonController {
    /** ID do usuário (`campaign.players[].userId`) */
    userId: string;
    /** ID da ficha dele */
    charsheetId: string;
}

/**
 * Quem pode controlar: um jogador da campanha com ficha. Devolve o controlador ou `null` (usuário que não joga a campanha, texto vazio, tipo errado). O servidor usa isto para nunca
 * confiar no que o cliente manda.
 */
export function resolveController(raw: unknown, players: ReadonlyArray<{ userId: string; charsheetId: string }> | undefined): SummonController | null {
    if (typeof raw !== 'string' || raw.trim() === '') return null;
    const player = (players ?? []).find(entry => entry.userId === raw);
    return player?.charsheetId ? { userId: player.userId, charsheetId: player.charsheetId } : null;
}

/** "Golem Arcano, invocado por Aria": o texto do log e das dicas */
export const summonSentence = (summonName: string, summonerName: string | undefined): string => (summonerName ? `${summonName}, invocado por ${summonerName}` : summonName);

/**
 * Os campos que um invocado leva no combatente: o controlador e o invocador, e o lado aliado (o invocado luta ao lado dos jogadores; o mestre pode trocar depois). Sem controlador
 * devolve vazio: a criatura segue comum.
 */
export function summonFields(controller: SummonController | null): Pick<Combatant, 'controllerId' | 'summonerId' | 'side'> | Record<string, never> {
    return controller ? { controllerId: controller.userId, summonerId: controller.charsheetId, side: 'ally' } : {};
}
