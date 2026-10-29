import type { DamageModifierData } from '@utils/combat/creatureDefense';
import type { CreatureDice } from '@utils/combat/creatureDice';

export interface SkillData {
    id: string;
    name: string;
    description: string;
    type: string;
}

export interface SpellData {
    id: string;
    name: string;
    description: string;
    level: number;
    element: string;
    cost: number;
}

export interface CreatureData {
    id?: string;
    name: string;
    description: string;
    /** Categoria da criatura (ex: Fera, Humanoide, Morto-vivo) — livre */
    type?: string;
    /** URL de imagem/retrato da criatura */
    imageUrl?: string;
    level: number;
    attributes: Record<string, number>;
    stats: {
        lp: number;
        maxLp: number;
        mp: number;
        maxMp: number;
        ap: number;
    };
    skills: SkillData[];
    spells: SpellData[];
    /** Dados customizáveis da criatura (rolados pelo mestre no chat) */
    dices?: CreatureDice[];
    expertises: Record<string, { value: number; defaultAttribute?: string | null }>;
    /** Elemento da criatura (dá a ela a fraqueza do elemento que o vence) */
    elementalMastery?: string;
    /** Fraquezas declaradas: elementos ou tipos de dano físico */
    weaknesses?: string[];
    /** Resistências e vulnerabilidades ao dano recebido */
    damageModifiers?: DamageModifierData[];
}

export interface AttributeDef { key: string; label: string; name: string }
export interface ExpertiseDef { key: string; name: string; attrKey: string | null; attrLabel: string }
