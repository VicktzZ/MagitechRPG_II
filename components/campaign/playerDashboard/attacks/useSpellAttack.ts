'use client';

import type { SpellDTO } from '@models/dtos';
import type { HitTestResult } from '@utils/combat/hitTest';
import { getSpellCategories } from '@utils/spellCategory';
import { useAttackTargeting, type AttackTargetingApi } from './useAttackTargeting';

/** A magia é de ataque? Só essas vão ao mestre como ataque com alvo (cura, defesa e controle seguem como sempre) */
export const isAttackSpell = (spell: Pick<SpellDTO, 'type'>): boolean => getSpellCategories(spell.type).includes('Ataque');

export interface SpellAttackApi {
    targeting: AttackTargetingApi['targeting'];
    /** Conjuração com sucesso de uma magia de ataque: declara o ataque ao alvo escolhido (o teste de magia é o acerto, que também passa pelo AP) */
    declareSpell: (spell: SpellDTO, test: HitTestResult, options?: { opportunity?: boolean }) => Promise<void>;
    /** "Efetuar": o dano rolado da magia se junta ao ataque que ela declarou */
    attachSpellDamage: (spell: SpellDTO, damage: number) => Promise<void>;
}

/** Ataque assistido das magias: o alvo é o mesmo do inventário, mas cada seção guarda o seu. A ação da magia já foi gasta ao conjurar */
export function useSpellAttack(): SpellAttackApi {
    const { targeting, declare, attachDamage } = useAttackTargeting();

    return {
        targeting,
        declareSpell: async (spell, test, options) => {
            if (!isAttackSpell(spell)) return;
            await declare({
                source: 'spell',
                name: spell.name,
                kind: 'magico',
                attackType: spell.element ? String(spell.element) : undefined,
                attackTotal: test.total,
                rolls: test.rolls,
                bonus: test.bonus,
                ...(test.keep === 'lowest' ? { keep: 'lowest' } : {})
            }, options);
        },
        attachSpellDamage: async (spell, damage) => {
            if (!isAttackSpell(spell) || damage <= 0) return;
            await attachDamage(spell.name, 'spell', damage);
        }
    };
}
