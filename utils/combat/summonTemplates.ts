import type { CreatureDice } from './creatureDice';

/**
 * Modelos prontos de invocados (decisão do dono, 29/10/2026: "modelos prontos, ex.: golem arcano, 40 LP e 15 AP"). Cada um é uma criatura personalizada que o mestre cria na campanha com
 * um clique e depois põe no combate sob o controle de um jogador. **Os números de vida, AP e dano vêm do texto das habilidades** (`constants/skills.ts`); os **atributos são premissa minha**
 * (o texto não os dá) e o mestre ajusta no editor de criatura. Dura "N turnos" em muitos casos: a duração é do mestre (tirar o invocado do combate quando acabar).
 * Puro.
 */

export interface SummonTemplate {
    id: string;
    name: string;
    /** A habilidade que invoca, para o mestre saber de onde vem */
    source: string;
    description: string;
    level: number;
    attributes: { vig: number; des: number; log: number; car: number; sab: number; foc: number };
    stats: { lp: number; mp: number; ap: number };
    dices: CreatureDice[];
    /** "Só ataques mágicos o atingem": vira resistência de 100% ao dano físico (defesa secreta do mestre) */
    magicOnly?: boolean;
}

const die = (id: string, name: string, description: string, quantity: number, faces: number): CreatureDice => ({ id, name, description, dices: [ { quantity, faces } ], modifiers: [] });

export const SUMMON_TEMPLATES: readonly SummonTemplate[] = [
    {
        id: 'golem-arcano',
        name: 'Golem Arcano',
        source: 'Sentinela Rúnica (Glifomante)',
        description: 'Runas que se erguem num golem. Ataca uma vez por turno (3d10 de dano Não-Elemental), dura 1d6 turnos e obedece aos comandos mentais de quem o invocou.',
        level: 15,
        attributes: { vig: 10, des: 5, log: 0, car: 0, sab: 0, foc: 0 },
        stats: { lp: 40, mp: 0, ap: 15 },
        dices: [ die('soco-runico', 'Soco Rúnico', 'Dano Não-Elemental, uma vez por turno', 3, 10) ]
    },
    {
        id: 'lacaio-morto-vivo',
        name: 'Lacaio Morto-Vivo',
        source: 'Legião Profana (Necromante)',
        description: 'Até 6 lacaios por conjuração, que duram 3 turnos ou até serem derrotados. Ao término, quem os conjurou recupera 1d6 MP por lacaio restante.',
        level: 15,
        attributes: { vig: 5, des: 5, log: 0, car: 0, sab: 0, foc: 0 },
        stats: { lp: 15, mp: 0, ap: 0 },
        dices: [ die('golpe', 'Golpe', 'Dano do lacaio', 1, 10) ]
    },
    {
        id: 'espirito-de-cura',
        name: 'Espírito de Cura',
        source: 'Aliança Espectral (Espiritista)',
        description: 'Cura 1d4 LP por turno a um aliado. Só ataques mágicos o atingem.',
        level: 10,
        attributes: { vig: 0, des: 5, log: 0, car: 0, sab: 5, foc: 5 },
        stats: { lp: 20, mp: 0, ap: 0 },
        dices: [ die('cura-espiritual', 'Cura Espiritual', 'LP curados em um aliado no turno', 1, 4) ],
        magicOnly: true
    },
    {
        id: 'espirito-de-ataque',
        name: 'Espírito de Ataque',
        source: 'Aliança Espectral (Espiritista)',
        description: 'Causa 2d8 de dano a inimigos em um raio de 5m. Só ataques mágicos o atingem.',
        level: 10,
        attributes: { vig: 0, des: 5, log: 0, car: 0, sab: 0, foc: 10 },
        stats: { lp: 20, mp: 0, ap: 0 },
        dices: [ die('rajada-espiritual', 'Rajada Espiritual', 'Dano em inimigos num raio de 5m', 2, 8) ],
        magicOnly: true
    },
    {
        id: 'espirito-protetor',
        name: 'Espírito Protetor',
        source: 'Chamado dos Ancestrais (Espiritista)',
        description: 'Dá +2 AP a um aliado enquanto durar (aplique o efeito pelo mestre). Só ataques mágicos o atingem.',
        level: 20,
        attributes: { vig: 0, des: 5, log: 0, car: 0, sab: 5, foc: 0 },
        stats: { lp: 20, mp: 0, ap: 0 },
        dices: [],
        magicOnly: true
    },
    {
        id: 'espirito-guerreiro',
        name: 'Espírito Guerreiro',
        source: 'Chamado dos Ancestrais (Espiritista)',
        description: 'Causa 4d10 de dano a um inimigo. Só ataques mágicos o atingem.',
        level: 20,
        attributes: { vig: 0, des: 5, log: 0, car: 0, sab: 0, foc: 10 },
        stats: { lp: 20, mp: 0, ap: 0 },
        dices: [ die('golpe-ancestral', 'Golpe Ancestral', 'Dano em um inimigo', 4, 10) ],
        magicOnly: true
    },
    {
        id: 'espirito-da-morte',
        name: 'Espírito da Morte',
        source: 'Chamado dos Ancestrais (Espiritista)',
        description: 'Necrose mortal: 3d6 de dano das trevas, custando 2 LP por turno ao espírito (tire do LP dele na mão). Só ataques mágicos o atingem.',
        level: 20,
        attributes: { vig: 0, des: 5, log: 0, car: 0, sab: 0, foc: 10 },
        stats: { lp: 20, mp: 0, ap: 0 },
        dices: [ die('necrose-mortal', 'Necrose Mortal', 'Dano de Trevas; custa 2 LP por turno ao espírito', 3, 6) ],
        magicOnly: true
    },
    {
        id: 'imagem-espelhada',
        name: 'Imagem Espelhada',
        source: 'Imagem Espelhada (Embusteiro)',
        description: 'Duplicata ilusória de quem a criou: dura 1 minuto ou até ser atingida. Os inimigos testam Percepção (DT 15) para saber qual é o alvo verdadeiro; quem a criou a move com a ação bônus.',
        level: 10,
        attributes: { vig: 0, des: 5, log: 0, car: 0, sab: 0, foc: 0 },
        stats: { lp: 1, mp: 0, ap: 0 },
        dices: []
    }
];

export const findSummonTemplate = (id: string): SummonTemplate | undefined => SUMMON_TEMPLATES.find(template => template.id === id);

/** O nome do modelo ou "Nome (2)" se a campanha já tem uma criatura com esse nome (sem caixa nem espaço) */
export function uniqueSummonName(base: string, existingNames: readonly string[]): string {
    const taken = new Set(existingNames.map(name => name.trim().toLowerCase()));
    if (!taken.has(base.toLowerCase())) return base;
    for (let copy = 2; ; copy++) {
        const name = `${base} (${copy})`;
        if (!taken.has(name.toLowerCase())) return name;
    }
}

/**
 * O corpo do `POST /api/campaign/[id]/custom/creatures` que cria o invocado do modelo. A imunidade a ataques físicos ("só ataques mágicos o atingem") vai como resistência de 100% a
 * "Físico", que a rota guarda no documento privado do mestre.
 */
export function summonTemplateBody(template: SummonTemplate, existingNames: readonly string[]): Record<string, unknown> {
    return {
        name: uniqueSummonName(template.name, existingNames),
        description: `${template.description} (Modelo de invocação: ${template.source}. Os atributos são sugestão: ajuste no editor.)`,
        type: 'Invocado',
        level: template.level,
        attributes: { ...template.attributes },
        stats: { lp: template.stats.lp, maxLp: template.stats.lp, mp: template.stats.mp, maxMp: template.stats.mp, ap: template.stats.ap },
        dices: template.dices.map(dice => ({ ...dice, dices: dice.dices.map(group => ({ ...group })), modifiers: [ ...dice.modifiers ] })),
        ...(template.magicOnly ? { damageModifiers: [ { kind: 'resistance', element: 'Físico', value: '100%' } ] } : {})
    };
}
