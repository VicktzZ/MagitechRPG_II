import type { Creature } from '@models';
import type { PlayerInfo } from '../types';

/** Os atributos hoje são des/vig/log/sab/foc/car; fichas antigas ainda podem trazer `agi` */
const legacyAgility = (attributes: object | undefined): number | undefined => (attributes as { agi?: number } | undefined)?.agi;

/** Jogadores marcados (por `PlayerInfo.id`) no formato do início do combate; quem está sem ficha sai da lista */
export function buildStartPlayers(players: readonly PlayerInfo[], selectedIds: readonly string[]) {
    return selectedIds.map(id => {
        const player = players.find(p => p.id === id);
        return {
            odacId: player?.id,
            charsheetId: player?.charsheet?.id,
            name: player?.charsheet?.name || player?.name || 'Jogador',
            agility: legacyAgility(player?.charsheet?.attributes) || 0,
            dexterity: player?.charsheet?.attributes?.des || 0,
            avatar: player?.avatar,
            lp: player?.charsheet?.stats?.lp || 0,
            maxLp: player?.charsheet?.stats?.maxLp || 0,
            mp: player?.charsheet?.stats?.mp || 0,
            maxMp: player?.charsheet?.stats?.maxMp || 0
        };
    }).filter(p => p.charsheetId);
}

/** Quantidade pedida da criatura, de 1 a 99 */
export const clampQuantity = (value: number | undefined): number => (Number.isFinite(value) ? Math.min(99, Math.max(1, Math.floor(Number(value)))) : 1);

/** Criaturas marcadas no formato do início do combate: uma entrada por cópia ("Goblin (1)", "Goblin (2)"...) */
export function buildStartCreatures(creatures: readonly Creature[], selectedIds: readonly string[], quantities: Readonly<Record<string, number>>) {
    return selectedIds.flatMap(id => {
        const creature = creatures.find(c => c.id === id);
        if (!creature) return [];

        const count = clampQuantity(quantities[id]);

        return Array.from({ length: count }, (_, index) => ({
            id: `${creature.id}-${index + 1}`,
            name: count > 1 ? `${creature.name} (${index + 1})` : (creature.name || 'Criatura'),
            agility: legacyAgility(creature.attributes) ?? creature.attributes?.des ?? 0,
            dexterity: creature.attributes?.des ?? 0,
            lp: creature.stats?.lp ?? 0,
            maxLp: creature.stats?.maxLp ?? creature.stats?.lp ?? 0,
            mp: creature.stats?.mp ?? 0,
            maxMp: creature.stats?.maxMp ?? creature.stats?.mp ?? 0
        }));
    });
}

export interface JoinPayload {
    players: Array<{ charsheetId: string; avatar?: string }>;
    creatures: Array<{ id: string; quantity: number }>;
}

/**
 * Quem entra num combate em andamento. Vai só o que identifica (ficha e criatura): nome, vida e atributos o servidor lê da
 * ficha e da criatura da campanha, para as cópias ganharem ids e nomes sem repetir os de quem já está lá.
 */
export function buildJoinPayload(
    players: readonly PlayerInfo[],
    selectedPlayerIds: readonly string[],
    selectedCreatureIds: readonly string[],
    quantities: Readonly<Record<string, number>>
): JoinPayload {
    return {
        players: selectedPlayerIds.flatMap(id => {
            const player = players.find(p => p.id === id);
            const charsheetId = player?.charsheet?.id;
            return charsheetId ? [ { charsheetId, ...(player?.avatar ? { avatar: player.avatar } : {}) } ] : [];
        }),
        creatures: selectedCreatureIds.map(id => ({ id, quantity: clampQuantity(quantities[id]) }))
    };
}

/** Quantos combatentes o pedido adiciona (jogadores e cópias das criaturas) */
export const countJoining = (payload: JoinPayload): number => payload.players.length + payload.creatures.reduce((sum, creature) => sum + creature.quantity, 0);
