import { combatantBudget } from './actionBudgets';
import { isOpportunitySpell, meleeReach, opportunityCheck, type OpportunityBlock } from './engine/opportunity';

/**
 * Ataque de oportunidade no combate assistido. O mapa é de terceiros: quem sai do alcance corpo a corpo de um inimigo **declara** a saída (o jogador pelo próprio
 * personagem, o mestre por qualquer um) e diz quem estava ao alcance. Cada inimigo que pode reagir ganha uma **oportunidade aberta**; o ataque em si é um ataque
 * assistido comum (arma branca ou magia de Reação de alcance Curto, `engine/opportunity.ts`) declarado com o id da oportunidade, que se consome. Quem decide se
 * vale, e o resultado, é o mestre. Fica em `Combat.opportunities`; só dura enquanto o turno de quem se move (passar o turno limpa tudo).
 */

export interface OpportunityData {
    id: string;
    /** Quem saiu do alcance */
    moverId: string;
    moverName: string;
    /** Quem pode reagir com um ataque */
    reactorId: string;
    reactorName: string;
    createdAt: string;
}

export const MAX_OPPORTUNITIES = 20;

/** O que `declare_leave` precisa saber de cada combatente */
interface LeaveCombatant {
    id: string;
    name: string;
    actions?: unknown;
}

/** Quem pode reagir: ids de texto, sem repetir, no máximo 20 (o que vem do cliente) */
export function sanitizeReactorIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const ids = raw.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '' && entry.length <= 80);
    return [ ...new Set(ids) ].slice(0, MAX_OPPORTUNITIES);
}

const BLOCK_TEXT: Record<OpportunityBlock, string> = {
    'sem-reacao': 'não tem a Reação disponível',
    incapacitado: 'está incapacitado',
    'nao-viu': 'não tinha visto quem saiu',
    desengajou: 'o alvo desengajou',
    'saida-instantanea': 'a saída foi instantânea'
};

export interface LeavePlan {
    /** As oportunidades a abrir (sem id nem horário, que a rota põe) */
    opportunities: Array<Pick<OpportunityData, 'moverId' | 'moverName' | 'reactorId' | 'reactorName'>>;
    /** Avisos que não impedem a ação: quem não pôde reagir e por quê, ids que não estão no combate */
    warnings: string[];
}

/**
 * Quem ganha uma oportunidade quando `moverId` sai do alcance de `reactorIds`. Quem não tem Reação não ganha (o mestre devolve a ação se quiser); a percepção
 * ("já viu o alvo") é de quem declara a saída, então não se checa aqui.
 */
export function planLeaveReach(combatants: readonly LeaveCombatant[], moverId: string, reactorIds: readonly string[]): LeavePlan {
    const mover = combatants.find(candidate => candidate.id === moverId);
    const plan: LeavePlan = { opportunities: [], warnings: [] };
    if (!mover) return plan;

    for (const reactorId of reactorIds) {
        const reactor = combatants.find(candidate => candidate.id === reactorId);
        if (!reactor) {
            plan.warnings.push('Um dos combatentes escolhidos não está mais no combate.');
            continue;
        }
        if (reactor.id === mover.id) continue;

        const check = opportunityCheck({ reactor: { hasReaction: combatantBudget(reactor).reacao > 0, sawMover: true }, mover: {} });
        if (!check.provoked) {
            plan.warnings.push(`${reactor.name} ${check.reason ? BLOCK_TEXT[check.reason] : 'não pode reagir'}: sem ataque de oportunidade.`);
            continue;
        }
        plan.opportunities.push({ moverId: mover.id, moverName: mover.name, reactorId: reactor.id, reactorName: reactor.name });
    }
    return plan;
}

/** Abre as oportunidades; declarar de novo a mesma saída (mesmo alvo e mesmo inimigo) troca a anterior. Guarda as 20 mais novas */
export function addOpportunities(list: readonly OpportunityData[] | undefined, entries: readonly OpportunityData[]): OpportunityData[] {
    const kept = (list ?? []).filter(existing => !entries.some(entry => entry.moverId === existing.moverId && entry.reactorId === existing.reactorId));
    return [ ...kept, ...entries ].slice(-MAX_OPPORTUNITIES);
}

export const removeOpportunity = (list: readonly OpportunityData[] | undefined, opportunityId: string): OpportunityData[] =>
    (list ?? []).filter(entry => entry.id !== opportunityId);

/** Tira as oportunidades de quem saiu do combate (quem se moveu ou quem ia reagir) */
export const dropOpportunitiesFor = (list: readonly OpportunityData[] | undefined, combatantId: string): OpportunityData[] =>
    (list ?? []).filter(entry => entry.moverId !== combatantId && entry.reactorId !== combatantId);

/** As oportunidades abertas para esse inimigo reagir */
export const opportunitiesForReactor = (list: readonly OpportunityData[] | undefined, reactorId: string | undefined): OpportunityData[] =>
    (list ?? []).filter(entry => Boolean(reactorId) && entry.reactorId === reactorId);

/** As oportunidades que esse combatente provocou ao sair do alcance */
export const opportunitiesByMover = (list: readonly OpportunityData[] | undefined, moverId: string | undefined): OpportunityData[] =>
    (list ?? []).filter(entry => Boolean(moverId) && entry.moverId === moverId);

/** A oportunidade desse inimigo contra esse alvo, se ainda está aberta */
export const findOpportunity = (list: readonly OpportunityData[] | undefined, reactorId: string, moverId: string): OpportunityData | undefined =>
    (list ?? []).find(entry => entry.reactorId === reactorId && entry.moverId === moverId);

/** A arma serve de ataque de oportunidade: arma branca (corpo a corpo). Arma de fogo, de energia... não faz */
export const isOpportunityWeapon = (weapon: { categ?: unknown; range?: unknown } | null | undefined): boolean => meleeReach(weapon) !== null;

export { isOpportunitySpell };

/** Por que esta arma ou magia não serve de ataque de oportunidade, para o aviso na tela */
export const OPPORTUNITY_WEAPON_HELP = 'Ataque de oportunidade só com arma branca (corpo a corpo).';
export const OPPORTUNITY_SPELL_HELP = 'Ataque de oportunidade só com magia de Reação de alcance Curto. Desmarque a opção para usar esta magia.';
