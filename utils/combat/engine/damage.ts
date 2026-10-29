import { resistReduction, type DefenseStatus } from './defense';
import type { Amount, TakenModifier } from './modifiers';
import { line, type DamageKind, type ExplainLine } from './types';

/**
 * Pipeline do dano de um ataque que acertou, na ordem:
 *  1. dano rolado (já com o crítico);
 *  2. modificadores de quem ataca (bônus e penalidades de dano dos efeitos), percentual sobre o rolado + fixos;
 *  3. fraqueza elemental do alvo (dobro);
 *  4. defesa do alvo: esquivou = 0; resistiu = tira AP + ⌊mod ÷ 2⌋ (mental: metade); falhou ou não defendeu = inteiro;
 *  5. resistências e vulnerabilidades do alvo (efeitos), percentual e fixos;
 *  6. arredonda para baixo e nunca passa de zero.
 * Cada passo vira uma linha do cálculo; as que revelam fraquezas e resistências do alvo são só do mestre.
 */

export interface DamageInput {
    /** Dano rolado, já com o crítico */
    rolled: number;
    kind: DamageKind;
    /** Elemento ou tipo físico do dano ("Fogo", "Cortante"), para as resistências elementais */
    attackType?: unknown;
    dealt?: Amount;
    /** 2 quando o alvo é fraco ao ataque (`weaknessAgainst`) */
    weaknessMultiplier?: number;
    defense: DefenseStatus;
    targetAp: number;
    /** Modificador da perícia de resistência do alvo (RES Física ou RES Mágica) */
    resistanceMod: number;
    taken?: readonly TakenModifier[];
}

export interface DamageResult {
    final: number;
    steps: ExplainLine[];
}

const normalize = (value: unknown): string => (typeof value === 'string' ? value : '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

const signed = (value: number, suffix = ''): string => `${value >= 0 ? '+' : '−'}${Math.abs(value)}${suffix}`;

/** A resistência/vulnerabilidade vale para este dano? Sem elemento vale para todo; "fisico" vale para o dano físico */
function appliesTo(modifier: TakenModifier, kind: DamageKind, attackType: unknown): boolean {
    if (modifier.against && modifier.against !== kind) return false;
    if (!modifier.element) return true;
    if (modifier.element === 'fisico') return kind === 'fisico';
    return modifier.element === normalize(attackType);
}

export function computeDamage(input: DamageInput): DamageResult {
    const steps: ExplainLine[] = [];
    let damage = Math.max(0, Math.floor(input.rolled));
    steps.push(line('Dano rolado', String(damage)));

    const dealt = input.dealt ?? { pct: 0, flat: 0 };
    if (dealt.pct !== 0 || dealt.flat !== 0) {
        damage = Math.max(0, Math.floor((damage + dealt.flat) * Math.max(0, 1 + dealt.pct / 100)));
        const parts = [ dealt.pct !== 0 ? signed(dealt.pct, '%') : '', dealt.flat !== 0 ? signed(dealt.flat) : '' ].filter(Boolean).join(' e ');
        steps.push(line('Modificadores de quem ataca', `${parts} = ${damage}`));
    }

    const multiplier = input.weaknessMultiplier ?? 1;
    if (multiplier !== 1) {
        damage = Math.floor(damage * multiplier);
        steps.push(line('Fraqueza do alvo', `×${multiplier} = ${damage}`, 'gm'));
    }

    switch (input.defense) {
    case 'dodged':
        steps.push(line('Esquiva', 'dano anulado'));
        return { final: 0, steps };
    case 'resisted':
        if (input.kind === 'mental') {
            damage = Math.floor(damage / 2);
            steps.push(line('Resistência mental', `dano pela metade = ${damage}`));
        } else {
            const reduction = resistReduction(input.targetAp, input.resistanceMod);
            damage = Math.max(0, damage - reduction);
            steps.push(line('Resistência', `−${reduction} (AP ${Math.floor(input.targetAp)} + metade do mod ${Math.floor(input.resistanceMod / 2)}) = ${damage}`));
        }
        break;
    case 'dodge-failed':
        steps.push(line('Esquiva falhou', 'dano inteiro'));
        break;
    case 'resist-failed':
        steps.push(line('Resistência falhou', 'dano inteiro'));
        break;
    default:
        break;
    }

    const taken = (input.taken ?? []).filter(modifier => appliesTo(modifier, input.kind, input.attackType));
    if (taken.length > 0) {
        const pct = taken.reduce((sum, modifier) => sum + modifier.pct, 0);
        const flat = taken.reduce((sum, modifier) => sum + modifier.flat, 0);
        damage = Math.max(0, Math.floor(damage * Math.max(0, 1 + pct / 100)) + flat);
        const parts = [ pct !== 0 ? signed(pct, '%') : '', flat !== 0 ? signed(flat) : '' ].filter(Boolean).join(' e ');
        steps.push(line('Resistências e vulnerabilidades do alvo', `${parts || 'sem efeito'} = ${damage}`, 'gm'));
    }

    damage = Math.max(0, Math.floor(damage));
    steps.push(line('Dano final', String(damage)));
    return { final: damage, steps };
}
