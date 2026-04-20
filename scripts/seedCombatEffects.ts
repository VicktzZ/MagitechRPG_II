import type { CombatEffect } from '@models'
import { CombatEffectEntity } from '@models/entities'
import { combatEffectRepository } from '@repositories'
import { stripUndefined } from '@utils/firestore/stripUndefined'

/**
 * Definição declarativa dos efeitos pré-definidos que o seed popula como globais.
 *
 * IDs fixos para facilitar idempotência: rodar o seed várias vezes NÃO duplica
 * (upsert por `id`).
 *
 * Todos os efeitos têm 3 níveis por padrão — a nomenclatura escala automaticamente
 * via `getLevelLabel` quando o GM clonar e adicionar níveis 4+ (Mortal+, Superior++…).
 *
 * `modifiers` descrevem os impactos mecânicos de forma estruturada, consumíveis
 * pela UI (tooltips) e, progressivamente, pelo motor de combate.
 */
const SEED_EFFECTS: Partial<CombatEffect>[] = [
    // ═══════════════════════════════════════════════════════════════════════
    // DAMAGE
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-queimadura',
        name: 'Queimadura',
        description: 'A vítima arde em chamas sagradas ou artificiais, sofrendo dano contínuo de fogo.',
        category: 'damage',
        timing: 'turn',
        element: 'fogo',
        color: '#f97316',
        icon: '🔥',
        levels: [
            { level: 1, formula: '2d6', duration: 2 },
            { level: 2, formula: '3d6', duration: 3 },
            { level: 3, formula: '4d6', duration: 4 }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-necrose',
        name: 'Necrose',
        description: 'Os tecidos do alvo se decompõem lentamente, corroídos por energia das trevas.',
        category: 'damage',
        timing: 'round',
        element: 'trevas',
        color: '#581c87',
        icon: '💀',
        levels: [
            { level: 1, formula: '2d4', duration: 3 },
            { level: 2, formula: '3d4', duration: 4 },
            { level: 3, formula: '4d4', duration: 5, modifiers: [
                { kind: 'no_healing', note: 'Cura é bloqueada enquanto durar.' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-sangramento',
        name: 'Sangramento',
        description: 'Ferida aberta que continua causando dano físico a cada rodada do afetado.',
        category: 'damage',
        timing: 'round',
        element: 'fisico',
        color: '#dc2626',
        icon: '🩸',
        levels: [
            { level: 1, formula: '1d4', duration: 2 },
            { level: 2, formula: '2d4', duration: 3 },
            { level: 3, formula: '3d4', duration: 4 }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-envenenamento',
        name: 'Envenenamento',
        description: 'Toxina circula pelas veias causando dano contínuo. Quanto maior, mais letal.',
        category: 'damage',
        timing: 'turn',
        element: 'veneno',
        color: '#16a34a',
        icon: '☠️',
        levels: [
            { level: 1, formula: '1d6', duration: 3 },
            { level: 2, formula: '2d6', duration: 4 },
            { level: 3, formula: '3d6', duration: 5 }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-radiacao',
        name: 'Radiação',
        description: 'Exposição a energia mágica instável causa dano cumulativo ao longo das rodadas.',
        category: 'damage',
        timing: 'round',
        element: 'energia',
        color: '#a3e635',
        icon: '☢️',
        levels: [
            { level: 1, formula: '1d8', duration: 3 },
            { level: 2, formula: '2d8', duration: 4 },
            { level: 3, formula: '3d8', duration: 5 }
        ],
        scope: 'global',
        createdBy: 'system'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // HEAL
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-regeneracao',
        name: 'Regeneração',
        description: 'Um fluxo mágico restaura pontos de vida a cada rodada do afetado.',
        category: 'heal',
        timing: 'round',
        element: 'luz',
        color: '#22c55e',
        icon: '🌿',
        levels: [
            { level: 1, formula: '1d6', duration: 2 },
            { level: 2, formula: '2d6', duration: 3 },
            { level: 3, formula: '3d6', duration: 4 }
        ],
        scope: 'global',
        createdBy: 'system'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // DEBUFF
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-congelamento',
        name: 'Congelamento',
        description: 'O alvo fica congelado, com deslocamento reduzido e chance crescente de perder o turno.',
        category: 'debuff',
        timing: 'round',
        element: 'agua',
        color: '#38bdf8',
        icon: '❄️',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [
                { kind: 'stat_penalty', target: 'displacement', value: '-25%', note: 'Deslocamento reduzido.' }
            ] },
            { level: 2, formula: '1d4', duration: 2, modifiers: [
                { kind: 'stat_penalty', target: 'displacement', value: '-50%' },
                { kind: 'disadvantage', target: 'attack' }
            ] },
            { level: 3, formula: '1d6', duration: 3, modifiers: [
                { kind: 'stat_penalty', target: 'displacement', value: '-75%' },
                { kind: 'skip_turn', note: 'Chance de pular o turno.' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-eletrizacao',
        name: 'Eletrização',
        description: 'Correntes elétricas percorrem o corpo do alvo, drenando AP e travando ações.',
        category: 'debuff',
        timing: 'round',
        element: 'energia',
        color: '#fde047',
        icon: '⚡',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [
                { kind: 'stat_penalty', target: 'ap', value: -1 }
            ] },
            { level: 2, formula: '1d4', duration: 3, modifiers: [
                { kind: 'stat_penalty', target: 'ap', value: -2 },
                { kind: 'disadvantage', target: 'attack' }
            ] },
            { level: 3, formula: '2d4', duration: 3, modifiers: [
                { kind: 'stat_penalty', target: 'ap', value: -3 },
                { kind: 'skip_turn' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-paralisia',
        name: 'Paralisia',
        description: 'O alvo está completamente imobilizado e não pode agir.',
        category: 'debuff',
        timing: 'round',
        element: 'neutro',
        color: '#64748b',
        icon: '🧊',
        levels: [
            { level: 1, formula: '0', duration: 1, modifiers: [ { kind: 'skip_turn' } ] },
            { level: 2, formula: '0', duration: 2, modifiers: [
                { kind: 'skip_turn' },
                { kind: 'no_spells' }
            ] },
            { level: 3, formula: '0', duration: 3, modifiers: [
                { kind: 'skip_turn' },
                { kind: 'no_actions' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-atordoamento',
        name: 'Atordoamento',
        description: 'O alvo está atordoado, suas ações ficam limitadas ou cancelam.',
        category: 'debuff',
        timing: 'turn',
        element: 'neutro',
        color: '#eab308',
        icon: '💫',
        levels: [
            { level: 1, formula: '0', duration: 1, modifiers: [ { kind: 'disadvantage', target: 'attack' } ] },
            { level: 2, formula: '0', duration: 2, modifiers: [
                { kind: 'disadvantage', target: 'attack' },
                { kind: 'disadvantage', target: 'dodge' }
            ] },
            { level: 3, formula: '0', duration: 3, modifiers: [ { kind: 'skip_turn' } ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-silenciamento',
        name: 'Silenciamento',
        description: 'O alvo não consegue conjurar magias nem usar habilidades verbais.',
        category: 'debuff',
        timing: 'round',
        element: 'neutro',
        color: '#78716c',
        icon: '🤐',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [ { kind: 'no_spells' } ] },
            { level: 2, formula: '0', duration: 3, modifiers: [ { kind: 'no_spells' } ] },
            { level: 3, formula: '0', duration: 4, modifiers: [
                { kind: 'no_spells' },
                { kind: 'disadvantage', target: 'attack' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-cegueira',
        name: 'Cegueira',
        description: 'O alvo está cego, perde referência visual e sofre desvantagem em ataques.',
        category: 'debuff',
        timing: 'round',
        element: 'neutro',
        color: '#111827',
        icon: '👁️',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [
                { kind: 'disadvantage', target: 'attack' }
            ] },
            { level: 2, formula: '0', duration: 3, modifiers: [
                { kind: 'disadvantage', target: 'attack' },
                { kind: 'disadvantage', target: 'dodge' }
            ] },
            { level: 3, formula: '0', duration: 4, modifiers: [
                { kind: 'disadvantage', target: 'attack' },
                { kind: 'disadvantage', target: 'dodge' },
                { kind: 'disadvantage', target: 'perception' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-exaustao',
        name: 'Exaustão',
        description: 'O alvo está extremamente cansado; seus atributos físicos ficam reduzidos.',
        category: 'debuff',
        timing: 'round',
        element: 'neutro',
        color: '#9ca3af',
        icon: '😮‍💨',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [
                { kind: 'stat_penalty', target: 'ap', value: -1 },
                { kind: 'stat_penalty', target: 'displacement', value: '-25%' }
            ] },
            { level: 2, formula: '0', duration: 4, modifiers: [
                { kind: 'stat_penalty', target: 'ap', value: -2 },
                { kind: 'stat_penalty', target: 'displacement', value: '-50%' },
                { kind: 'disadvantage', target: 'attack' }
            ] },
            { level: 3, formula: '0', duration: 5, modifiers: [
                { kind: 'stat_penalty', target: 'ap', value: -3 },
                { kind: 'stat_penalty', target: 'displacement', value: '-75%' },
                { kind: 'disadvantage', target: 'attack' },
                { kind: 'disadvantage', target: 'dodge' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-enfraquecimento',
        name: 'Enfraquecimento',
        description: 'O alvo está enfraquecido; seu dano causado é reduzido.',
        category: 'debuff',
        timing: 'turn',
        element: 'neutro',
        color: '#a3a3a3',
        icon: '🪫',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [
                { kind: 'damage_dealt_penalty', value: '-25%' }
            ] },
            { level: 2, formula: '0', duration: 3, modifiers: [
                { kind: 'damage_dealt_penalty', value: '-50%' }
            ] },
            { level: 3, formula: '0', duration: 4, modifiers: [
                { kind: 'damage_dealt_penalty', value: '-75%' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-vulneravel',
        name: 'Vulnerável',
        description: 'O alvo sofre mais dano de qualquer fonte durante a duração.',
        category: 'debuff',
        timing: 'turn',
        element: 'neutro',
        color: '#f43f5e',
        icon: '🎯',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [
                { kind: 'damage_vulnerability', value: '+25%' }
            ] },
            { level: 2, formula: '0', duration: 3, modifiers: [
                { kind: 'damage_vulnerability', value: '+50%' }
            ] },
            { level: 3, formula: '0', duration: 4, modifiers: [
                { kind: 'damage_vulnerability', value: '+100%' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-fragilidade',
        name: 'Fragilidade',
        description: 'O alvo tem seu LP máximo temporariamente reduzido, deixando-o mais quebradiço.',
        category: 'debuff',
        timing: 'round',
        element: 'neutro',
        color: '#e11d48',
        icon: '🩻',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [
                { kind: 'stat_penalty', target: 'maxLp', value: '-10%' }
            ] },
            { level: 2, formula: '0', duration: 4, modifiers: [
                { kind: 'stat_penalty', target: 'maxLp', value: '-25%' }
            ] },
            { level: 3, formula: '0', duration: 5, modifiers: [
                { kind: 'stat_penalty', target: 'maxLp', value: '-40%' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-incuravel',
        name: 'Incurável',
        description: 'Ferimentos do alvo não podem ser curados por nenhum meio.',
        category: 'debuff',
        timing: 'round',
        element: 'trevas',
        color: '#7c2d12',
        icon: '🚫',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [ { kind: 'no_healing' } ] },
            { level: 2, formula: '0', duration: 3, modifiers: [ { kind: 'no_healing' } ] },
            { level: 3, formula: '0', duration: 4, modifiers: [ { kind: 'no_healing' } ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-medo',
        name: 'Medo',
        description: 'O alvo fica amedrontado e tem dificuldade em agir contra a fonte do medo.',
        category: 'debuff',
        timing: 'turn',
        element: 'trevas',
        color: '#4c1d95',
        icon: '👻',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [
                { kind: 'disadvantage', target: 'attack' }
            ] },
            { level: 2, formula: '0', duration: 3, modifiers: [
                { kind: 'disadvantage', target: 'attack' },
                { kind: 'disadvantage', target: 'dodge' }
            ] },
            { level: 3, formula: '0', duration: 3, modifiers: [
                { kind: 'skip_turn', note: 'O alvo está paralisado de medo no primeiro tick.' },
                { kind: 'disadvantage', target: 'attack' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BUFF
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-velocidade',
        name: 'Velocidade',
        description: 'O alvo se move mais rápido; deslocamento e iniciativa aumentam.',
        category: 'buff',
        timing: 'round',
        element: 'vento',
        color: '#06b6d4',
        icon: '🏃',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [
                { kind: 'stat_bonus', target: 'displacement', value: '+25%' },
                { kind: 'stat_bonus', target: 'initiative', value: 2 }
            ] },
            { level: 2, formula: '0', duration: 4, modifiers: [
                { kind: 'stat_bonus', target: 'displacement', value: '+50%' },
                { kind: 'stat_bonus', target: 'initiative', value: 4 }
            ] },
            { level: 3, formula: '0', duration: 5, modifiers: [
                { kind: 'stat_bonus', target: 'displacement', value: '+100%' },
                { kind: 'stat_bonus', target: 'initiative', value: 6 },
                { kind: 'advantage', target: 'dodge' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-invisivel',
        name: 'Invisível',
        description: 'O alvo fica totalmente invisível, não pode ser alvo direto de ataques enquanto oculto.',
        category: 'buff',
        timing: 'round',
        element: 'neutro',
        color: '#94a3b8',
        icon: '🕶️',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [
                { kind: 'flag', target: 'invisible', value: 'partial' },
                { kind: 'advantage', target: 'attack' }
            ] },
            { level: 2, formula: '0', duration: 3, modifiers: [
                { kind: 'flag', target: 'invisible' },
                { kind: 'advantage', target: 'attack' },
                { kind: 'advantage', target: 'stealth' }
            ] },
            { level: 3, formula: '0', duration: 4, modifiers: [
                { kind: 'flag', target: 'invisible' },
                { kind: 'advantage', target: 'attack' },
                { kind: 'advantage', target: 'stealth' },
                { kind: 'advantage', target: 'dodge' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-visao-penumbra',
        name: 'Visão na Penumbra',
        description: 'O alvo enxerga em locais de pouca luz sem penalidade.',
        category: 'buff',
        timing: 'round',
        element: 'luz',
        color: '#60a5fa',
        icon: '🌘',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [ { kind: 'flag', target: 'dim_vision' } ] },
            { level: 2, formula: '0', duration: 4, modifiers: [
                { kind: 'flag', target: 'dim_vision' },
                { kind: 'advantage', target: 'perception' }
            ] },
            { level: 3, formula: '0', duration: 5, modifiers: [
                { kind: 'flag', target: 'dim_vision' },
                { kind: 'advantage', target: 'perception' },
                { kind: 'advantage', target: 'stealth' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-visao-verdadeira',
        name: 'Visão Verdadeira',
        description: 'O alvo vê através de ilusões, invisibilidade e disfarces.',
        category: 'buff',
        timing: 'round',
        element: 'luz',
        color: '#fbbf24',
        icon: '👁️‍🗨️',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [ { kind: 'flag', target: 'true_sight' } ] },
            { level: 2, formula: '0', duration: 3, modifiers: [
                { kind: 'flag', target: 'true_sight' },
                { kind: 'advantage', target: 'perception' }
            ] },
            { level: 3, formula: '0', duration: 4, modifiers: [
                { kind: 'flag', target: 'true_sight' },
                { kind: 'advantage', target: 'perception' },
                { kind: 'advantage', target: 'attack' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-furtivo',
        name: 'Furtivo',
        description: 'O alvo fica em modo de furtividade, dificultando ser detectado.',
        category: 'buff',
        timing: 'round',
        element: 'neutro',
        color: '#475569',
        icon: '🥷',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [
                { kind: 'flag', target: 'stealth' },
                { kind: 'advantage', target: 'stealth' }
            ] },
            { level: 2, formula: '0', duration: 4, modifiers: [
                { kind: 'flag', target: 'stealth' },
                { kind: 'advantage', target: 'stealth' },
                { kind: 'advantage', target: 'attack' }
            ] },
            { level: 3, formula: '0', duration: 5, modifiers: [
                { kind: 'flag', target: 'stealth' },
                { kind: 'advantage', target: 'stealth' },
                { kind: 'advantage', target: 'attack' },
                { kind: 'damage_dealt_bonus', value: '+25%', note: 'Dano por ataque furtivo' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-sobrecura',
        name: 'Sobrecura',
        description: 'O LP do alvo pode temporariamente exceder o máximo.',
        category: 'buff',
        timing: 'round',
        element: 'luz',
        color: '#ec4899',
        icon: '💗',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [
                { kind: 'overflow_stat', target: 'lp', value: '+25%' }
            ] },
            { level: 2, formula: '0', duration: 4, modifiers: [
                { kind: 'overflow_stat', target: 'lp', value: '+50%' }
            ] },
            { level: 3, formula: '0', duration: 5, modifiers: [
                { kind: 'overflow_stat', target: 'lp', value: '+100%' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-sobremana',
        name: 'Sobremana',
        description: 'O MP do alvo pode temporariamente exceder o máximo.',
        category: 'buff',
        timing: 'round',
        element: 'energia',
        color: '#3b82f6',
        icon: '🔮',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [
                { kind: 'overflow_stat', target: 'mp', value: '+25%' }
            ] },
            { level: 2, formula: '0', duration: 4, modifiers: [
                { kind: 'overflow_stat', target: 'mp', value: '+50%' }
            ] },
            { level: 3, formula: '0', duration: 5, modifiers: [
                { kind: 'overflow_stat', target: 'mp', value: '+100%' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-precisao',
        name: 'Precisão',
        description: 'O alvo está excepcionalmente preciso em seus ataques.',
        category: 'buff',
        timing: 'round',
        element: 'neutro',
        color: '#0ea5e9',
        icon: '🎯',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [ { kind: 'advantage', target: 'attack' } ] },
            { level: 2, formula: '0', duration: 3, modifiers: [
                { kind: 'advantage', target: 'attack' },
                { kind: 'damage_dealt_bonus', value: '+25%' }
            ] },
            { level: 3, formula: '0', duration: 4, modifiers: [
                { kind: 'advantage', target: 'attack' },
                { kind: 'damage_dealt_bonus', value: '+50%' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-evasao',
        name: 'Evasão',
        description: 'O alvo fica extremamente ágil, com maior chance de esquivar golpes.',
        category: 'buff',
        timing: 'round',
        element: 'vento',
        color: '#14b8a6',
        icon: '🌪️',
        levels: [
            { level: 1, formula: '0', duration: 2, modifiers: [ { kind: 'advantage', target: 'dodge' } ] },
            { level: 2, formula: '0', duration: 3, modifiers: [
                { kind: 'advantage', target: 'dodge' },
                { kind: 'damage_resistance', value: '-15%', note: 'Redução geral de dano.' }
            ] },
            { level: 3, formula: '0', duration: 4, modifiers: [
                { kind: 'advantage', target: 'dodge' },
                { kind: 'damage_resistance', value: '-30%' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },

    // Resistências elementais — buffs com `element` variável.
    // Um template "genérico" e variantes para os elementos mais usados.
    {
        id: 'seed-resistencia-generica',
        name: 'Resistência Elemental',
        description: 'Resistência genérica contra um elemento. Clone e customize o elemento alvo ao aplicar.',
        category: 'buff',
        timing: 'round',
        element: 'neutro',
        color: '#6366f1',
        icon: '🛡️',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [
                { kind: 'damage_resistance', value: '-25%', note: 'Substitua `element` ao clonar.' }
            ] },
            { level: 2, formula: '0', duration: 4, modifiers: [
                { kind: 'damage_resistance', value: '-50%' }
            ] },
            { level: 3, formula: '0', duration: 5, modifiers: [
                { kind: 'damage_resistance', value: '-75%' }
            ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-resistencia-fogo',
        name: 'Resistência (Fogo)',
        description: 'O alvo resiste a dano de fogo.',
        category: 'buff',
        timing: 'round',
        element: 'fogo',
        color: '#fb923c',
        icon: '🛡️',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [ { kind: 'damage_resistance', element: 'fogo', value: '-25%' } ] },
            { level: 2, formula: '0', duration: 4, modifiers: [ { kind: 'damage_resistance', element: 'fogo', value: '-50%' } ] },
            { level: 3, formula: '0', duration: 5, modifiers: [ { kind: 'damage_resistance', element: 'fogo', value: '-75%' } ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-resistencia-fisico',
        name: 'Resistência (Físico)',
        description: 'O alvo resiste a dano físico.',
        category: 'buff',
        timing: 'round',
        element: 'fisico',
        color: '#a16207',
        icon: '🛡️',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [ { kind: 'damage_resistance', element: 'fisico', value: '-25%' } ] },
            { level: 2, formula: '0', duration: 4, modifiers: [ { kind: 'damage_resistance', element: 'fisico', value: '-50%' } ] },
            { level: 3, formula: '0', duration: 5, modifiers: [ { kind: 'damage_resistance', element: 'fisico', value: '-75%' } ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-resistencia-veneno',
        name: 'Resistência (Veneno)',
        description: 'O alvo resiste a dano de veneno.',
        category: 'buff',
        timing: 'round',
        element: 'veneno',
        color: '#15803d',
        icon: '🛡️',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [ { kind: 'damage_resistance', element: 'veneno', value: '-25%' } ] },
            { level: 2, formula: '0', duration: 4, modifiers: [ { kind: 'damage_resistance', element: 'veneno', value: '-50%' } ] },
            { level: 3, formula: '0', duration: 5, modifiers: [ { kind: 'damage_resistance', element: 'veneno', value: '-75%' } ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },
    {
        id: 'seed-resistencia-trevas',
        name: 'Resistência (Trevas)',
        description: 'O alvo resiste a dano de trevas.',
        category: 'buff',
        timing: 'round',
        element: 'trevas',
        color: '#312e81',
        icon: '🛡️',
        levels: [
            { level: 1, formula: '0', duration: 3, modifiers: [ { kind: 'damage_resistance', element: 'trevas', value: '-25%' } ] },
            { level: 2, formula: '0', duration: 4, modifiers: [ { kind: 'damage_resistance', element: 'trevas', value: '-50%' } ] },
            { level: 3, formula: '0', duration: 5, modifiers: [ { kind: 'damage_resistance', element: 'trevas', value: '-75%' } ] }
        ],
        scope: 'global',
        createdBy: 'system'
    },

    // ═══════════════════════════════════════════════════════════════════════
    // INFO (flavor)
    // ═══════════════════════════════════════════════════════════════════════
    {
        id: 'seed-concentracao',
        name: 'Concentração',
        description: 'O alvo está concentrado em uma habilidade sustentada.',
        category: 'info',
        timing: 'round',
        element: 'neutro',
        color: '#a855f7',
        icon: '🎯',
        levels: [
            { level: 1, formula: '0', duration: 1 },
            { level: 2, formula: '0', duration: 2 },
            { level: 3, formula: '0', duration: 3 }
        ],
        scope: 'global',
        createdBy: 'system'
    }
]

export interface SeedCombatEffectsResult {
    created: number
    updated: number
    total: number
    effects: Array<{ id: string; name: string; action: 'created' | 'updated' }>
}

/**
 * Faz upsert dos efeitos pré-definidos globais.
 * Seguro para rodar múltiplas vezes (idempotente por `id`).
 */
export async function seedCombatEffects(): Promise<SeedCombatEffectsResult> {
    const result: SeedCombatEffectsResult = {
        created: 0,
        updated: 0,
        total: SEED_EFFECTS.length,
        effects: []
    }

    for (const def of SEED_EFFECTS) {
        if (!def.id) continue

        const existing = await combatEffectRepository.findById(def.id)

        if (existing) {
            const merged = new CombatEffectEntity(stripUndefined({
                ...existing,
                ...def,
                id: existing.id,
                createdAt: existing.createdAt
            }))
            await combatEffectRepository.update(merged)
            result.updated++
            result.effects.push({ id: def.id, name: def.name || '', action: 'updated' })
        } else {
            const entity = new CombatEffectEntity(stripUndefined({
                ...def,
                createdAt: new Date().toISOString()
            }))
            await combatEffectRepository.create(entity)
            result.created++
            result.effects.push({ id: def.id, name: def.name || '', action: 'created' })
        }
    }

    return result
}

export { SEED_EFFECTS }
