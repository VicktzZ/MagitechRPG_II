import type { AppliedEffect } from '@models';
import { effectiveBudget } from './actionFlags';
import { normalizeSearchText } from '@utils/searchText';
import { getSpellExecution } from '@utils/spellCategory';

/**
 * Reação aberta no combate assistido (Fase 8). Uma Reação acontece em turno alheio, quando algo dispara (um ataque erra, um aliado cai, um inimigo conjura...), e o mapa e
 * a narração são do mestre: ele **abre a reação** dizendo o que aconteceu e quem pode reagir, e (nos casos que o app já sabe, ao resolver um ataque) o servidor abre sozinho.
 * Cada reator com a Reação disponível ganha uma **oferta** (`Combat.reactions`): vê o que aconteceu e as magias de Reação dele que combinam com o gatilho, e decide reagir
 * ou deixar passar. É só oferta: quem reage usa a magia pelo caminho de sempre (a ação Reação é gasta ali), e gastar a Reação fecha as ofertas dele. A oferta dura o
 * turno em andamento (passar o turno limpa tudo), como o ataque de oportunidade.
 */

/** O que dispara a reação (o "gatilho" das magias de Reação do catálogo, agrupado) */
export type ReactionTrigger = 'attacked' | 'hit' | 'miss' | 'critical' | 'damaged' | 'downed' | 'cast' | 'status' | 'moved' | 'other';

export const REACTION_TRIGGERS: readonly ReactionTrigger[] = [ 'attacked', 'hit', 'miss', 'critical', 'damaged', 'downed', 'cast', 'status', 'moved', 'other' ];

/** Os nomes dos gatilhos para o mestre escolher */
export const TRIGGER_LABEL: Record<ReactionTrigger, string> = {
    attacked: 'Alguém foi alvo de um ataque',
    hit: 'Um ataque acertou',
    miss: 'Um ataque errou',
    critical: 'Acerto crítico',
    damaged: 'Alguém sofreu dano',
    downed: 'Alguém caiu a 0 LP',
    cast: 'Uma magia foi conjurada',
    status: 'Alguém recebeu um estado negativo',
    moved: 'Alguém entrou ou saiu do alcance',
    other: 'Outro (descrever)'
};

export interface ReactionOfferData {
    id: string;
    trigger: ReactionTrigger;
    /** O que aconteceu, em uma frase pronta ("Aria Valen sofreu dano") */
    text: string;
    /** Quem sofreu ou fez o que disparou a reação */
    subjectId?: string;
    subjectName?: string;
    /** Quem pode reagir */
    reactorId: string;
    reactorName: string;
    createdAt: string;
}

export const MAX_REACTIONS = 20;
export const MAX_REACTION_TEXT = 140;

/** O gatilho vindo do cliente (`null` se não for um dos conhecidos) */
export const sanitizeTrigger = (raw: unknown): ReactionTrigger | null => REACTION_TRIGGERS.find(trigger => trigger === raw) ?? null;

/** O texto livre do mestre: sem espaço sobrando e até 140 caracteres; vazio se não for texto */
export const sanitizeReactionText = (raw: unknown): string => (typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ').slice(0, MAX_REACTION_TEXT) : '');

/** Quem pode reagir: ids de texto, sem repetir, no máximo 20 (o que vem do cliente) */
export function sanitizeReactionReactorIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const ids = raw.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '' && entry.length <= 80);
    return [ ...new Set(ids) ].slice(0, MAX_REACTIONS);
}

/** A frase da oferta: "Aria Valen sofreu dano", com o detalhe do mestre entre parênteses; no gatilho "outro" é o próprio texto dele */
export function reactionSentence(trigger: ReactionTrigger, subjectName: string | undefined, extra: string = ''): string {
    const who = subjectName?.trim() || 'Alguém';
    const detail = extra.trim();
    const base: Record<Exclude<ReactionTrigger, 'other'>, string> = {
        attacked: `${who} foi alvo de um ataque`,
        hit: `Um ataque contra ${who} acertou`,
        miss: `Um ataque contra ${who} errou`,
        critical: `${who} sofreu um acerto crítico`,
        damaged: `${who} sofreu dano`,
        downed: `${who} caiu a 0 LP`,
        cast: `${who} está conjurando uma magia`,
        status: `${who} recebeu um estado negativo`,
        moved: `${who} entrou ou saiu do alcance`
    };
    if (trigger === 'other') return detail || 'Algo aconteceu';
    return detail ? `${base[trigger]} (${detail})` : base[trigger];
}

// ─────────────────────────────────────────────
// Quem ganha a oferta
// ─────────────────────────────────────────────

/** O que `open_reaction` precisa saber de cada combatente */
interface ReactionCombatant {
    id: string;
    name: string;
    actions?: unknown;
    effects?: readonly AppliedEffect[] | null;
}

export interface ReactionPlan {
    /** As ofertas a abrir (sem id nem horário, que a rota põe) */
    offers: Array<Omit<ReactionOfferData, 'id' | 'createdAt'>>;
    /** Avisos que não impedem a ação: quem não pôde reagir e por quê, ids que não estão no combate */
    warnings: string[];
}

/**
 * Quem ganha uma oferta de reação para o que aconteceu com `subjectId`. **Quem não tem a Reação disponível não ganha** (o mestre devolve a ação se quiser): a Reação é
 * uma por rodada, e gastar uma ação já usada é o que o orçamento existe para evitar. O próprio sujeito pode reagir ("quando você sofrer dano").
 */
export function planOpenReaction(
    combatants: readonly ReactionCombatant[],
    input: { trigger: ReactionTrigger; subjectId?: string; reactorIds: readonly string[]; text?: string }
): ReactionPlan {
    const plan: ReactionPlan = { offers: [], warnings: [] };
    const subject = combatants.find(candidate => candidate.id === input.subjectId);
    const text = reactionSentence(input.trigger, subject?.name, input.text);

    for (const reactorId of input.reactorIds) {
        const reactor = combatants.find(candidate => candidate.id === reactorId);
        if (!reactor) {
            plan.warnings.push('Um dos combatentes escolhidos não está mais no combate.');
            continue;
        }
        if (effectiveBudget(reactor).reacao <= 0) {
            plan.warnings.push(`${reactor.name} não tem a Reação disponível: sem reação.`);
            continue;
        }
        plan.offers.push({
            trigger: input.trigger,
            text,
            ...(subject ? { subjectId: subject.id, subjectName: subject.name } : {}),
            reactorId: reactor.id,
            reactorName: reactor.name
        });
    }
    return plan;
}

/** Abre as ofertas; abrir de novo o mesmo gatilho para o mesmo reator (e o mesmo sujeito) troca a anterior. Guarda as 20 mais novas */
export function addReactions(list: readonly ReactionOfferData[] | undefined, entries: readonly ReactionOfferData[]): ReactionOfferData[] {
    const kept = (list ?? []).filter(existing => !entries.some(entry => entry.reactorId === existing.reactorId && entry.trigger === existing.trigger && entry.subjectId === existing.subjectId));
    return [ ...kept, ...entries ].slice(-MAX_REACTIONS);
}

export const removeReaction = (list: readonly ReactionOfferData[] | undefined, reactionId: string): ReactionOfferData[] =>
    (list ?? []).filter(entry => entry.id !== reactionId);

/** A Reação foi gasta: as ofertas de quem a gastou se fecham */
export const closeReactionsOf = (list: readonly ReactionOfferData[] | undefined, reactorId: string): ReactionOfferData[] =>
    (list ?? []).filter(entry => entry.reactorId !== reactorId);

/** Tira as ofertas de quem saiu do combate (quem ia reagir ou de quem se falava) */
export const dropReactionsFor = (list: readonly ReactionOfferData[] | undefined, combatantId: string): ReactionOfferData[] =>
    (list ?? []).filter(entry => entry.reactorId !== combatantId && entry.subjectId !== combatantId);

/** As ofertas abertas para esse combatente */
export const reactionsForReactor = (list: readonly ReactionOfferData[] | undefined, reactorId: string | undefined): ReactionOfferData[] =>
    (list ?? []).filter(entry => Boolean(reactorId) && entry.reactorId === reactorId);

// ─────────────────────────────────────────────
// Reação aberta sozinha, ao resolver um ataque
// ─────────────────────────────────────────────

/** Um gatilho que o servidor já sabe, e quem pode reagir a ele */
export interface AutoReaction {
    trigger: ReactionTrigger;
    subjectId: string;
    reactorIds: string[];
}

interface AutoCombatant {
    id: string;
    type: string;
}

/**
 * Os gatilhos que a resolução de um ataque entrega de graça (o mestre confirmou o resultado), para **jogadores** (a criatura reage pelas mãos do mestre):
 *  - o ataque **errou**: o alvo pode reagir ("quando um inimigo errar um ataque contra você");
 *  - o alvo **sofreu dano** (`dealt` > 0): ele e os aliados dele (mesmo tipo de combatente) podem reagir;
 *  - o alvo **caiu a 0 LP**: os aliados podem reagir ("quando um aliado for reduzido a 0 LP").
 * O acerto crítico, o ataque declarado, a conjuração e o movimento ficam com o mestre (`open_reaction`): o app não os vê na resolução.
 */
export function reactionsAfterAttack(combatants: readonly AutoCombatant[], input: { targetId: string; hit: boolean; dealt: number; downed: boolean }): AutoReaction[] {
    const target = combatants.find(candidate => candidate.id === input.targetId);
    if (!target) return [];

    const players = (list: readonly AutoCombatant[]): string[] => list.filter(candidate => candidate.type === 'player').map(candidate => candidate.id);
    const allies = combatants.filter(candidate => candidate.type === target.type && candidate.id !== target.id);
    const reactions: AutoReaction[] = [];

    if (!input.hit) {
        const reactorIds = players([ target ]);
        if (reactorIds.length > 0) reactions.push({ trigger: 'miss', subjectId: target.id, reactorIds });
    }
    if (input.hit && input.dealt > 0) {
        const reactorIds = players([ target, ...allies ]);
        if (reactorIds.length > 0) reactions.push({ trigger: 'damaged', subjectId: target.id, reactorIds });
        if (input.downed) {
            const allyIds = players(allies);
            if (allyIds.length > 0) reactions.push({ trigger: 'downed', subjectId: target.id, reactorIds: allyIds });
        }
    }
    return reactions;
}

// ─────────────────────────────────────────────
// Magias de Reação que combinam com o gatilho
// ─────────────────────────────────────────────

/** O que a sugestão lê de uma magia */
export interface ReactionSpellLike {
    name?: string;
    execution?: string | null;
    stages?: readonly string[] | null;
}

/** A magia é de Reação (a execução "Reação" do catálogo) */
export const isReactionSpell = (spell: ReactionSpellLike | null | undefined): boolean => getSpellExecution(spell?.execution).includes('Reação');

/** Os gatilhos que o texto da magia cita, regra a regra, sobre o gatilho do 1º estágio (a oração antes da primeira vírgula ou dois-pontos: "Quando um inimigo errar um ataque contra você") */
const TRIGGER_PATTERNS: ReadonlyArray<readonly [ Exclude<ReactionTrigger, 'other'>, RegExp ]> = [
    [ 'miss', /\berrar\b|\berre\b|\berrou\b/ ],
    [ 'hit', /\bacertar\b|\bacerte\b/ ],
    [ 'critical', /critico/ ],
    [ 'damaged', /(sofrer|receber)( um)? (\w+ )?dano/ ],
    [ 'downed', /\b0 lp\b/ ],
    [ 'cast', /conjurar|conjuracao/ ],
    [ 'status', /estado negativo/ ],
    [ 'moved', /(entrar|sair) (no|do) alcance/ ],
    [ 'attacked', /declarar (um )?ataque|alvo de (um )?ataque|tiver .* como alvo/ ]
];

/** Os gatilhos que a magia de Reação cita (vazio se o texto não cabe em nenhum: ela só combina com "Outro") */
export function reactionTriggersOf(spell: ReactionSpellLike | null | undefined): ReactionTrigger[] {
    const first = spell?.stages?.[0];
    if (typeof first !== 'string') return [];
    const clause = normalizeSearchText(first.split(/[,:]/)[0]);
    return TRIGGER_PATTERNS.filter(([ , pattern ]) => pattern.test(clause)).map(([ trigger ]) => trigger);
}

/** As magias de Reação do personagem que combinam com o gatilho (no "outro", todas as de Reação), por nome */
export function suggestReactionSpells<T extends ReactionSpellLike>(spells: readonly T[] | null | undefined, trigger: ReactionTrigger): T[] {
    return (spells ?? [])
        .filter(spell => isReactionSpell(spell) && (trigger === 'other' || reactionTriggersOf(spell).includes(trigger)))
        .sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? ''), 'pt-BR'));
}

/** Uma oferta com as magias de Reação do personagem que combinam com ela */
export interface ReactionEntry<T extends ReactionSpellLike = ReactionSpellLike> {
    offer: ReactionOfferData;
    spells: T[];
}

/**
 * As ofertas que o jogador **vê**: as abertas para ele em que há o que fazer, ou seja, ao menos uma magia de Reação dele que combina com o gatilho (no "outro", qualquer
 * magia de Reação) ou o gatilho é do mestre ("outro": ele pode reagir sem magia, narrando). Oferta sem nenhuma magia que combine fica fora da tela (e não avisa), mas continua
 * aberta até o turno passar: é a lista do mestre que mostra todas.
 */
export function reactionEntriesFor<T extends ReactionSpellLike>(
    list: readonly ReactionOfferData[] | undefined,
    reactorId: string | undefined,
    spells: readonly T[] | null | undefined
): Array<ReactionEntry<T>> {
    return reactionsForReactor(list, reactorId)
        .map(offer => ({ offer, spells: suggestReactionSpells(spells, offer.trigger) }))
        .filter(entry => entry.spells.length > 0 || entry.offer.trigger === 'other');
}
