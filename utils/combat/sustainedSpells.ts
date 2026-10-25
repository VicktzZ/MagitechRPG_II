import type { AppliedEffect, SustainedSpellInfo } from '@models';
import { getSpellSubtypes } from '@utils/spellCategory';

/**
 * Magia SUSTENTADA em combate (definição do dono): para manter a magia ativa o conjurador paga, a cada rodada, metade do custo de MP do
 * estágio conjurado (arredondada para baixo). Só vale em combate e se o teste de conjurar passou na DT; fora do combate ela é como uma
 * imediata (nada fica ativo). A magia vira um efeito sobre o conjurador, e acaba ao desconjurar, ao faltar MP para pagar, quando o MP chega
 * a 0 ou quando o combate termina.
 */
export const sustainedUpkeepFor = (cost: number): number => Math.max(0, Math.round(cost / 2));

/** Se o `type` da magia tem o subtipo "sustentado" (aceita as grafias do catálogo: sustentada, Sustentado...) */
export const isSustainedSpell = (type?: string | null): boolean => getSpellSubtypes(type).includes('Sustentado');

export const sustainedEffects = (effects: AppliedEffect[] | undefined): AppliedEffect[] => (effects ?? []).filter(effect => Boolean(effect.sustained));

export const findSustained = (effects: AppliedEffect[] | undefined, spellKey: string): AppliedEffect | undefined =>
    sustainedEffects(effects).find(effect => effect.sustained?.spellKey === spellKey);

export interface UpkeepPayment { effectId: string; spellName: string; upkeep: number }

export interface UpkeepEnding { effectId: string; spellName: string; reason: 'sem-mana' | 'mana-acabou' }

export interface UpkeepPlan {
    payments: UpkeepPayment[];
    endings: UpkeepEnding[];
    totalPaid: number;
    mpAfter: number;
}

/**
 * O que acontece com as magias sustentadas de um jogador quando a rodada vira, dado o MP que ele tem: cada uma paga a manutenção em ordem;
 * a que não couber no MP acaba, e se o MP chegar a 0 as que sobraram acabam também ("ao acabar os pontos de mana").
 */
export function planSustainedUpkeep(sustained: Array<{ id: string; info: SustainedSpellInfo }>, mp: number): UpkeepPlan {
    let current = Math.max(0, Math.floor(Number.isFinite(mp) ? mp : 0));
    const payments: UpkeepPayment[] = [];
    const endings: UpkeepEnding[] = [];

    for (const { id, info } of sustained) {
        if (current <= 0) {
            endings.push({ effectId: id, spellName: info.spellName, reason: 'mana-acabou' });
        } else if (current < info.upkeep) {
            endings.push({ effectId: id, spellName: info.spellName, reason: 'sem-mana' });
        } else {
            current -= info.upkeep;
            payments.push({ effectId: id, spellName: info.spellName, upkeep: info.upkeep });
        }
    }

    // O MP acabou de vez: o que ainda estava de pé acaba também
    if (current === 0) {
        for (const payment of payments) {
            endings.push({ effectId: payment.effectId, spellName: payment.spellName, reason: 'mana-acabou' });
        }
    }

    return { payments, endings, totalPaid: payments.reduce((sum, payment) => sum + payment.upkeep, 0), mpAfter: current };
}
