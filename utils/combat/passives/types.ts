import type { CombatEffectModifier } from '@models';
import type { AreaSpec } from '../sides';

/**
 * Passivas de classe e subclasse no combate assistido. As 120 habilidades de `constants/skills.ts` (48 de classe, 72 de subclasse) são só prosa; este catálogo diz o que o
 * app faz com cada uma:
 *  - **automática**: vale sozinha, em toda rolagem ou no cálculo do mestre (dados a mais no dano, custo de MP, AP, resistência...);
 *  - **ativada**: o jogador aciona (gasta MP e ação, conta usos, põe um efeito sobre si ou cura a si mesmo);
 *  - **texto**: o app só mostra a descrição; quem aplica é o mestre.
 * Só a primeira leva (36 habilidades) é estruturada; o resto é `texto` por padrão e basta acrescentar uma entrada ao catálogo para ligar uma nova.
 */

export type PassiveSource = 'class' | 'subclass';

export type PassiveMode = 'automatica' | 'ativada' | 'texto';

/** Estado do personagem que decide se uma regra vale agora */
export interface PassiveCondition {
    /** LP atual de no máximo X% do máximo */
    lpAtMostPct?: number;
    /** LP atual abaixo de X% do máximo */
    lpBelowPct?: number;
    /** LP atual de no máximo X pontos */
    lpAtMost?: number;
    /** Está com o efeito Furtivo */
    stealthy?: boolean;
    /** O alvo ainda não agiu no combate (primeira rodada, depois dele na ordem) */
    targetNotActed?: boolean;
}

/** O que a regra soma ao dano ou à cura de uma rolagem */
export interface PassiveExtra {
    /** Dados a mais, cada um "XdY" */
    dice?: string[];
    /** Dados a mais do **mesmo tipo** do dano rolado (a arma: o primeiro dado da fórmula; a magia: cada segmento de dano ou cura) */
    sameDie?: number;
    /** Valor fixo */
    flat?: number;
    /** Soma o valor de uma perícia, de um atributo ou o LP atual */
    plus?: 'Luta' | 'attr:foc' | 'currentLp';
}

export interface WeaponFilter {
    /** Só arma branca (corpo a corpo) */
    melee?: boolean;
    /** Só arma de fogo ou de longa distância */
    ranged?: boolean;
}

export interface SpellFilter {
    /** Só magia da categoria Ataque */
    attack?: boolean;
    /** `nonElemental` (Não-Elemental), `mastery` (o elemento da maestria da ficha) ou o nome de um elemento */
    element?: 'nonElemental' | 'mastery' | string;
    /** Subtipo do `type` da magia ("conjurado", "sustentado"...) */
    subtype?: string;
}

export type PassiveRule =
    /** Soma ao dano da arma */
    | { kind: 'weaponDamage'; weapon?: WeaponFilter; extra: PassiveExtra; when?: PassiveCondition }
    /** Soma ao dano ou à cura do efeito da magia (ao "Efetuar") */
    | { kind: 'spellEffect'; spell?: SpellFilter; extra: PassiveExtra; when?: PassiveCondition }
    /** Soma ao teste de magia ao conjurar: d20 de vantagem e/ou valor fixo */
    | { kind: 'spellHit'; spell?: SpellFilter; advantages?: number; flat?: number }
    /** Soma ao custo de MP da magia (negativo reduz); `freeMasteryExtra` tira o MP extra da Maestria do nível 4 */
    | { kind: 'spellCost'; delta: number; freeMasteryExtra?: boolean }
    /** Vantagem na rolagem de iniciativa */
    | { kind: 'initiative'; advantages: number }
    /** Bônus de estatística de combate (AP, deslocamento) */
    | { kind: 'stat'; stat: 'ap' | 'displacement'; flat: number; when?: PassiveCondition }
    /** Marcador (terreno difícil não atrapalha) */
    | { kind: 'flag'; flag: 'terrain_immunity' }
    /** Resistência ao dano recebido: `against` é a natureza do ataque, `element` restringe a um elemento (`mastery` = o da maestria da ficha) */
    | { kind: 'defense'; against: 'magico' | 'fisico' | 'mental' | 'any'; pct: number; element?: 'mastery' | string }
    /** Dano que o personagem causa a mais, em % */
    | { kind: 'dealtPct'; pct: number; when?: PassiveCondition }
    /** Regenera a cada turno dele, enquanto a condição valer, até um teto em % do máximo */
    | { kind: 'turnRegen'; stat: 'lp'; dice: string; when: PassiveCondition; untilPct: number }
    /** Ação extra enquanto furtivo: ao entrar em furtividade no turno dele (`enter`) ou no começo do turno (`turnStart`) */
    | { kind: 'stealthActions'; on: 'enter' | 'turnStart'; add: { padrao?: number; movimento?: number } }
    /** Lembrete que o mestre vê na resolução do ataque (a regra depende de dado ou de escolha dele) */
    | { kind: 'reminder'; side: 'defender' | 'attacker'; text: string };

export type AbilityExecution = 'Padrão' | 'Bônus' | 'Movimento' | 'Reação' | 'Completa';

export interface AbilityLimit {
    /** `dia` vale até o mestre renovar (descanso); `combate` recomeça a cada combate */
    per: 'dia' | 'combate';
    max: number;
}

/** O efeito que a habilidade ativada põe sobre o personagem */
export interface AbilityEffect {
    /** Duração: `turnos` conta nos turnos dele, `rodadas` nas rodadas, `combate` vai até o fim do combate */
    duration: { unit: 'turnos' | 'rodadas' | 'combate'; amount?: number };
    description: string;
    /** Modificadores no formato do catálogo de efeitos (`damage_dealt_bonus`, `stat_bonus`, `advantage`, `flag`...) */
    modifiers: CombatEffectModifier[];
    /** Cura ou dano a cada tick do efeito (o mesmo tick dos efeitos do catálogo: no começo do turno de quem o tem, nos que duram rodadas ou o combate) */
    tick?: { kind: 'heal' | 'damage'; dice: string };
    /** Só um alvo de cada vez: usar a habilidade de novo tira o efeito dos alvos anteriores (Maldição Debilitante: "apenas uma criatura por vez") */
    exclusive?: boolean;
}

export interface AbilityChoice {
    id: string;
    label: string;
    effect: AbilityEffect;
}

export interface AbilityActivation {
    execution: AbilityExecution;
    cost?: { mp?: number; allMp?: boolean };
    limits?: AbilityLimit[];
    /** Cura o próprio personagem: `dice` e, opcionalmente, o valor do atributo Foco. Com `area`, cura cada alvo marcado, com a própria rolagem */
    heal?: { dice: string; plusFoc?: boolean };
    /** Efeito sobre o personagem (se não houver `choices`). Com `area`, sobre cada alvo marcado */
    effect?: AbilityEffect;
    /**
     * A habilidade pega outros combatentes (aura, cura em grupo, maldição num alvo): quem usa marca quem foi atingido, o servidor confere o lado (`sides.ts`) e aplica a cura e o
     * efeito a cada um. O app não mede distância. Sem `area` a habilidade é só de quem a usa.
     */
    area?: AreaSpec;
    /** O jogador escolhe uma das variações (Postura Bestial) */
    choices?: AbilityChoice[];
}

export interface PassiveDef {
    /** Chave estável: `class:bom de briga` */
    key: string;
    source: PassiveSource;
    name: string;
    mode: PassiveMode;
    rules?: PassiveRule[];
    activation?: AbilityActivation;
    /** O que o app não faz da habilidade e continua com o mestre */
    pending?: string;
}

/** As entradas do catálogo, sem a chave (ela é montada de `source` + `name`) */
export type PassiveEntry = Omit<PassiveDef, 'key' | 'source' | 'name'>;

/** O que a rota do combate devolve ao cliente quando o jogador usa uma habilidade ativada (a cura é rolada no servidor; o cliente só a mostra no chat) */
export interface AbilityUseResult {
    key: string;
    name: string;
    choice: string | null;
    cost: number;
    execution: string;
    heal: { notation: string; display: string; total: number; applied: number } | null;
    effect: { name: string; description: string } | null;
    /** Em habilidade de área: quem foi atingido e quanto cada um recuperou (a cura é rolada por alvo) */
    targets?: Array<{ id: string; name: string; healed?: number }>;
    /** Em habilidade de área com cura: a rolagem de cada alvo, para o cliente mandar um cartão de dados por alvo ao chat */
    heals?: Array<{ id: string; name: string; notation: string; display: string; total: number; applied: number }>;
    message: string;
}

export interface AbilityUseResponse {
    success: boolean;
    message?: string;
    warnings?: string[];
    ability?: AbilityUseResult;
}
