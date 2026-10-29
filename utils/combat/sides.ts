/**
 * Lados do combate e alvos de área (decisão do dono, 29/10/2026): o combatente é **aliado** ou **inimigo**; jogador = aliado, criatura = inimigo, e o mestre troca quando a luta pede
 * (um aliado convertido, uma criatura que ajuda o grupo). Auras, "aliados num raio de 10 m", magias de área que só atingem inimigos e curas em grupo usam isto. O mapa é de
 * terceiros (princípio 2): o app **nunca mede distância**; quem foi atingido pela área é **marcado à mão** por quem usa a habilidade (o mestre corrige), e o app só confere o lado.
 * Genérico de propósito: as magias vão pedir o mesmo depois.
 */

export type CombatSide = 'ally' | 'enemy';

export const COMBAT_SIDES: readonly CombatSide[] = [ 'ally', 'enemy' ];

export const SIDE_LABEL: Record<CombatSide, string> = { ally: 'Aliado', enemy: 'Inimigo' };

export const isCombatSide = (value: unknown): value is CombatSide => value === 'ally' || value === 'enemy';

/** O que o lado precisa saber do combatente (o `Combatant` serve) */
interface SideSource {
    type?: string;
    side?: unknown;
}

/** O lado do combatente: o que o mestre marcou ou, sem marca, jogador = aliado e criatura = inimigo (combate antigo, sem o campo, continua valendo) */
export function combatantSide(combatant: SideSource | null | undefined): CombatSide {
    if (isCombatSide(combatant?.side)) return combatant.side;
    return combatant?.type === 'player' ? 'ally' : 'enemy';
}

export const oppositeSide = (side: CombatSide): CombatSide => (side === 'ally' ? 'enemy' : 'ally');

/** Em quem a área pode pegar, em relação a quem a usa: os do mesmo lado, os do outro lado ou qualquer um */
export type AreaAffects = 'allies' | 'enemies' | 'any';

export interface AreaSpec {
    affects: AreaAffects;
    /** Quem usa também entra. Sem o campo vale `true` para aliados e para "qualquer um" e nunca para inimigos */
    includeSelf?: boolean;
    /** Quantos alvos, no máximo (até `MAX_AREA_TARGETS`) */
    max?: number;
}

/** Teto de alvos de uma área, por chamada */
export const MAX_AREA_TARGETS = 20;

export const AREA_AFFECTS_LABEL: Record<AreaAffects, string> = { allies: 'Aliados', enemies: 'Inimigos', any: 'Qualquer um' };

/** Quem usa entra na própria área? (aliados e "qualquer um": sim, salvo `includeSelf: false`; inimigos: nunca) */
export const areaIncludesSelf = (spec: AreaSpec): boolean => spec.affects !== 'enemies' && spec.includeSelf !== false;

export const areaMax = (spec: AreaSpec): number => Math.max(1, Math.min(MAX_AREA_TARGETS, Math.floor(Number(spec.max) || MAX_AREA_TARGETS)));

interface AreaCombatant extends SideSource {
    id: string;
}

/** Os combatentes que a área pode pegar, na ordem do combate. Quem usa que não está no combate vale como aliado */
export function areaCandidates<T extends AreaCombatant>(combatants: readonly T[], sourceId: string, spec: AreaSpec): T[] {
    const source = combatants.find(combatant => combatant.id === sourceId);
    const sourceSide = combatantSide(source);
    const withSelf = areaIncludesSelf(spec);

    return combatants.filter(combatant => {
        if (combatant.id === sourceId) return withSelf;
        if (spec.affects === 'any') return true;
        const sameSide = combatantSide(combatant) === sourceSide;
        return spec.affects === 'allies' ? sameSide : !sameSide;
    });
}

/** O que a tela já deixa marcado: em área de aliados, todos eles; nas outras, ninguém (quem escolhe é quem usa) */
export function defaultAreaSelection<T extends AreaCombatant>(combatants: readonly T[], sourceId: string, spec: AreaSpec): string[] {
    if (spec.affects !== 'allies') return [];
    return areaCandidates(combatants, sourceId, spec).slice(0, areaMax(spec)).map(combatant => combatant.id);
}

/** Ids vindos do cliente: texto curto, sem repetir */
export function sanitizeAreaIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const ids = raw.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '' && entry.length <= 80);
    return [ ...new Set(ids) ];
}

export interface AreaTargets {
    /** Quem entra na área, na ordem do combate */
    ids: string[];
    /** Pedidos que ficaram de fora: não estão no combate, são do lado errado ou passaram do máximo */
    dropped: string[];
}

/**
 * Confere os alvos que o cliente marcou: só entram os que a área pode pegar (`areaCandidates`), até o máximo. O servidor nunca confia na lista do cliente: ela é o que quem usa
 * diz que foi atingido, e o lado e o combate decidem se vale.
 */
export function sanitizeAreaTargets<T extends AreaCombatant>(combatants: readonly T[], sourceId: string, spec: AreaSpec, raw: unknown): AreaTargets {
    const requested = sanitizeAreaIds(raw);
    const allowed = new Set(areaCandidates(combatants, sourceId, spec).map(combatant => combatant.id));
    const valid = requested.filter(id => allowed.has(id));
    const max = areaMax(spec);
    const kept = new Set(valid.slice(0, max));

    return {
        ids: combatants.filter(combatant => kept.has(combatant.id)).map(combatant => combatant.id),
        dropped: requested.filter(id => !kept.has(id))
    };
}

/** Marca o lado de cada combatente indicado e devolve os que de fato mudaram (marcar o lado que já tinha não muda nada) */
export function applySide<T extends AreaCombatant & { side?: CombatSide }>(combatants: readonly T[], ids: readonly string[], side: CombatSide): T[] {
    const wanted = new Set(ids);
    const changed: T[] = [];

    for (const combatant of combatants) {
        if (!wanted.has(combatant.id) || combatantSide(combatant) === side) continue;
        combatant.side = side;
        changed.push(combatant);
    }
    return changed;
}
