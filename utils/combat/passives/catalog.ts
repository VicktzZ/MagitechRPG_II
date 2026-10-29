import { normalizeSearchText } from '@utils/searchText';
import type { AbilityEffect, PassiveDef, PassiveEntry, PassiveRule, PassiveSource } from './types';

/**
 * O catálogo estruturado das passivas de classe e subclasse (primeira leva: 36 das 120 habilidades de `constants/skills.ts`). O que não está aqui é `texto`: o app mostra a
 * descrição e o mestre aplica. Cada entrada diz as regras que o motor entende (`rules`, automáticas) ou a ativação (`activation`, o jogador aciona), e o que **não** foi
 * automatizado (`pending`). O texto do dono manda: onde a regra dele deixou lacuna (a ação de uma habilidade ativada, por exemplo) a premissa é minha e está dita no `pending`.
 */

export const passiveKey = (source: PassiveSource, name: string): string => `${source}:${normalizeSearchText(name)}`;

const entries: Array<[ PassiveSource, string, PassiveEntry ]> = [];
const add = (source: PassiveSource, name: string, entry: PassiveEntry): void => { entries.push([ source, name, entry ]); };

const auto = (rules: PassiveRule[], pending?: string): PassiveEntry => ({ mode: 'automatica', rules, ...(pending ? { pending } : {}) });
const active = (activation: NonNullable<PassiveDef['activation']>, pending?: string): PassiveEntry => ({ mode: 'ativada', activation, ...(pending ? { pending } : {}) });

const effect = (duration: AbilityEffect['duration'], description: string, modifiers: AbilityEffect['modifiers'] = []): AbilityEffect => ({ duration, description, modifiers });

// ─── Classe ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Combatente
add('class', 'Bom de Briga', auto([ { kind: 'weaponDamage', weapon: { melee: true }, extra: { plus: 'Luta' } } ]));
add('class', 'Reflexos Aumentados', auto([ { kind: 'initiative', advantages: 1 } ], 'Testes de Agilidade fora da iniciativa: o +1 dado é na mão.'));
add('class', 'Regeneração Furiosa', auto([ { kind: 'turnRegen', stat: 'lp', dice: '1d6', when: { lpBelowPct: 50 }, untilPct: 50 } ]));
add('class', 'Armado', auto([ { kind: 'weaponDamage', weapon: { melee: true }, extra: { sameDie: 1 } } ]));
add('class', 'Não-Elementalista', auto([
    { kind: 'spellEffect', spell: { element: 'nonElemental' }, extra: { sameDie: 1 } },
    { kind: 'spellHit', spell: { element: 'nonElemental' }, advantages: 1 }
]));
add('class', 'Muralha', auto(
    [ { kind: 'dealtPct', pct: 50, when: { lpAtMostPct: 10 } } ],
    'Vale enquanto o LP está em 10% ou menos; a regra dura até a vida voltar a 50%, e essa memória é do mestre.'
));

// Feiticeiro
add('class', 'Feitiçaria', auto([ { kind: 'spellEffect', spell: { attack: true }, extra: { flat: 1 } } ], 'Escolher a magia de nível 1 ao adquirir a habilidade é na ficha.'));
add('class', 'Imunidade Mágica', auto([ { kind: 'defense', against: 'magico', pct: 100, element: 'mastery' } ]));
add('class', 'Magismo Total', auto([ { kind: 'spellCost', delta: -1, freeMasteryExtra: true } ]));

// Monge
add('class', 'Cura Interior', active({
    execution: 'Bônus',
    limits: [ { per: 'dia', max: 3 }, { per: 'combate', max: 1 } ],
    heal: { dice: '2d6' }
}));
add('class', 'Força Vital', auto([
    { kind: 'weaponDamage', extra: { plus: 'currentLp' }, when: { lpAtMost: 20 } },
    { kind: 'spellEffect', spell: { attack: true }, extra: { plus: 'currentLp' }, when: { lpAtMost: 20 } }
]));

// Arcano
add('class', 'Concentração', active({
    execution: 'Completa',
    limits: [ { per: 'combate', max: 1 } ],
    heal: { dice: '2d6', plusFoc: true }
}, 'O limite é "uma vez por cena": o app conta uma vez por combate.'));
add('class', 'Magia Resiliente', auto([ { kind: 'spellEffect', extra: { plus: 'attr:foc' } } ], 'Forçar novo teste de resistência (3 MP) é na mão.'));
add('class', 'Ascensão Arcana', auto([ { kind: 'defense', against: 'magico', pct: 50 } ], 'Margem de crítico de magias em 19: o crítico é marcado na mão.'));

// Ladino
add('class', 'Disfarce', auto([ { kind: 'stealthActions', on: 'enter', add: { padrao: 1 } } ], 'Vale quando o efeito Furtivo é aplicado no turno dele.'));
add('class', 'Ligeireza', auto([ { kind: 'stealthActions', on: 'turnStart', add: { movimento: 2 } } ], 'Andar sem alertar criaturas é do mestre.'));
add('class', 'Sempre Distante', auto([
    { kind: 'weaponDamage', weapon: { ranged: true }, extra: { sameDie: 1 } },
    { kind: 'weaponDamage', weapon: { ranged: true }, extra: { sameDie: 2 }, when: { stealthy: true } }
]));
add('class', 'Abscondido', auto([
    { kind: 'weaponDamage', extra: { flat: 10 }, when: { stealthy: true } },
    { kind: 'stat', stat: 'ap', flat: 2, when: { stealthy: true } }
], 'Sentidos aguçados e +1 MP por turno enquanto furtivo são do mestre.'));

// ─── Subclasse ────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Polimorfo
add('subclass', 'Pele Resistente', auto([
    { kind: 'stat', stat: 'ap', flat: 2 },
    { kind: 'reminder', side: 'defender', text: 'Pele Resistente: imune a calor, frio e radiação extremos e a queimadura, congelamento e necrose.' }
]));
add('subclass', 'Forma Primordial', active({
    execution: 'Bônus',
    cost: { allMp: true },
    limits: [ { per: 'dia', max: 1 } ],
    effect: effect({ unit: 'combate' }, 'Brutamonte: ignora o AP do alvo até o fim do combate.', [ { kind: 'flag', target: 'ignore_ap' } ])
}, 'Margem de crítico −2 é na mão; a ação gasta é premissa minha (o texto não diz).'));

// Comandante
add('subclass', 'Postura Defensiva', active({
    execution: 'Bônus',
    cost: { mp: 5 },
    limits: [ { per: 'dia', max: 3 } ],
    effect: effect({ unit: 'turnos', amount: 2 }, 'Postura defensiva: +3 AP.', [ { kind: 'stat_bonus', target: 'ap', value: 3 } ])
}, 'Os aliados a 6m recebem o mesmo efeito pelo mestre; +3 de Agilidade e −1d8 nos seus ataques são na mão; a ação gasta é premissa minha.'));

// Aniquilador
add('subclass', 'Avatar da Destruição', active({
    execution: 'Completa',
    cost: { mp: 20 },
    limits: [ { per: 'dia', max: 1 } ],
    effect: effect({ unit: 'rodadas', amount: 3 }, 'Avatar da destruição: dano ×2 e ignora o AP do alvo.', [
        { kind: 'damage_dealt_bonus', value: '100%' },
        { kind: 'flag', target: 'ignore_ap' }
    ])
}, 'A imunidade a Medo, Atordoado e Paralisado é do mestre; o dobro vale para todo ataque (o texto diz corpo a corpo).'));

// Errante
add('subclass', 'Trilheiro', auto([ { kind: 'flag', flag: 'terrain_immunity' } ], '+3 em Sobrevivência e Percepção e o mesmo para os aliados são do mestre.'));
add('subclass', 'Resiliência Inata', auto([ { kind: 'reminder', side: 'defender', text: 'Resiliência Inata: reduza todo dano recebido em 1d8+1.' } ], 'O dado é rolado pelo mestre.'));
add('subclass', 'Trilha da Fortuna', active({
    execution: 'Bônus',
    limits: [ { per: 'combate', max: 1 } ],
    effect: effect({ unit: 'rodadas', amount: 1 }, 'Estado supremo: +2d4 em qualquer dano ou cura.', [ { kind: 'damage_dealt_bonus', value: '2d4', target: 'any' } ])
}, 'Testes automaticamente bem-sucedidos e o efeito nos aliados são do mestre; a ação gasta é premissa minha.'));

// Duelista
add('subclass', 'Analisar Oponente', active({
    execution: 'Padrão',
    cost: { mp: 8 },
    effect: effect({ unit: 'turnos', amount: 3 }, 'Vantagem (+1d20) nos testes de ataque contra o alvo analisado.', [ { kind: 'advantage', target: 'attack' } ])
}, 'Revelar a resistência ou vulnerabilidade do alvo é do mestre; o d20 vale para todo ataque, não só contra o alvo analisado.'));

// Conjurador
add('subclass', 'Conjuração', auto([ { kind: 'spellEffect', spell: { subtype: 'conjurado' }, extra: { dice: [ '3d8' ] } } ], 'Ignorar 3 de resistência mágica e +1 turno de conjuração são do mestre.'));

// Elementalista
add('subclass', 'Domínio Elemental', auto([
    { kind: 'spellEffect', spell: { element: 'mastery' }, extra: { dice: [ '2d6' ] } },
    { kind: 'spellHit', spell: { element: 'mastery' }, flat: 2 }
], 'O elemento escolhido é o da maestria elemental da ficha (premissa minha: a ficha não guarda outra escolha).'));

// Mestre (Monge)
add('subclass', 'Golpe de Ki', active({
    execution: 'Bônus',
    cost: { mp: 4 },
    effect: effect({ unit: 'turnos', amount: 3 }, 'Golpe de Ki: +2d8 de dano Não-Elemental nos ataques corpo a corpo.', [ { kind: 'damage_dealt_bonus', value: '2d8', target: 'melee' } ])
}, 'O alcance de 3m do ataque desarmado é do mestre; o dano vale para arma branca (o ataque desarmado do Monge entra na ficha como arma); a ação gasta é premissa minha.'));

// Necromante
add('subclass', 'Aura Decadente', auto([
    { kind: 'weaponDamage', extra: { dice: [ '1d6' ] } },
    { kind: 'spellEffect', spell: { element: 'trevas' }, extra: { dice: [ '1d6' ] } }
], 'Impedir ressurreição, −2 de resistência física e 1d4 de dano por turno nos inimigos a 5m são do mestre.'));

// Guardião
add('subclass', 'Postura Bestial', active({
    execution: 'Bônus',
    choices: [
        { id: 'urso', label: 'Postura do Urso', effect: effect({ unit: 'turnos', amount: 1 }, 'Postura do Urso: +3 em RES Física e +5 LP temporários (aplicados na mão).') },
        { id: 'lobo', label: 'Postura do Lobo', effect: effect({ unit: 'turnos', amount: 1 }, 'Postura do Lobo: +1d8 de dano corpo a corpo.', [ { kind: 'damage_dealt_bonus', value: '1d8', target: 'melee' } ]) },
        { id: 'aguia', label: 'Postura da Águia', effect: effect({ unit: 'turnos', amount: 1 }, 'Postura da Águia: vantagem em Percepção.', [ { kind: 'advantage', target: 'perception' } ]) }
    ]
}, 'Os +3 de RES e os 5 LP temporários do Urso, o passo de 3m do Lobo e ignorar cobertura da Águia são na mão; a ação é "livre" (Bônus).'));

// Arquimago
add('subclass', 'Manipulação Elemental', auto([ { kind: 'spellEffect', extra: { dice: [ '1d8' ] } } ], 'Trocar o elemento da magia antes de lançar é na mão.'));

// Espectro
add('subclass', 'Desvanecer', active({
    execution: 'Bônus',
    cost: { mp: 6 },
    effect: effect({ unit: 'turnos', amount: 2 }, 'Invisível: vantagem nos ataques e +1d10 de dano nos ataques furtivos.', [
        { kind: 'flag', target: 'invisible' },
        { kind: 'advantage', target: 'attack' },
        { kind: 'damage_dealt_bonus', value: '1d10', target: 'stealth' }
    ])
}, 'A desvantagem dos ataques contra ele é do mestre; fora de combate dura 15 minutos; a ação gasta é premissa minha.'));
add('subclass', 'Sombras Penetrantes', auto([ { kind: 'weaponDamage', extra: { dice: [ '2d6' ] }, when: { stealthy: true } } ], 'Desvantagem do alvo nas resistências e o dano ao errar são do mestre.'));

// Estrategista
add('subclass', 'Ataque Calculado', auto([
    { kind: 'weaponDamage', extra: { dice: [ '3d8' ] }, when: { targetNotActed: true } },
    { kind: 'spellEffect', spell: { attack: true }, extra: { dice: [ '3d8' ] }, when: { targetNotActed: true } }
], 'Vale só na primeira rodada, contra o alvo escolhido que ainda não agiu.'));
add('subclass', 'Ritmo da Batalha', active({
    execution: 'Bônus',
    cost: { mp: 10 },
    limits: [ { per: 'combate', max: 1 } ],
    effect: effect({ unit: 'rodadas', amount: 2 }, 'Domínio total: +2 no acerto e ignora 2 pontos de armadura.', [
        { kind: 'stat_bonus', target: 'hit', value: 2 },
        { kind: 'stat_bonus', target: 'apIgnore', value: 2 }
    ])
}, 'Dois ataques numa só ação e a desvantagem dos inimigos no turno seguinte são do mestre; a ação gasta é premissa minha.'));

/** Todas as passivas estruturadas, por chave */
export const PASSIVE_CATALOG: ReadonlyMap<string, PassiveDef> = new Map(
    entries.map(([ source, name, entry ]) => {
        const key = passiveKey(source, name);
        return [ key, { ...entry, key, source, name } ] as const;
    })
);

/** A definição estruturada da habilidade, ou `undefined` se ela é só texto */
export const findPassive = (source: PassiveSource, name: string): PassiveDef | undefined => PASSIVE_CATALOG.get(passiveKey(source, name));

export const findPassiveByKey = (key: string): PassiveDef | undefined => PASSIVE_CATALOG.get(key);
