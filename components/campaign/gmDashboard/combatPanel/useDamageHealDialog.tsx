'use client';

import { useCampaignContext } from '@contexts';
import { useState, type ReactNode } from 'react';
import DamageHealDialog from '../../combatStatus/DamageHealDialog';
import { useDamageHeal } from '../../combatStatus/useDamageHeal';

export type DamageHealKind = 'damage' | 'heal';

interface DamageHealDialogControls {
    /** Abre o diálogo de dano ou de cura; com `targetId` o alvo já vem escolhido (o botão da linha de um combatente) */
    openDamageHeal: (type: DamageHealKind, targetId?: string) => void;
    /** O diálogo: quem usa renderiza uma vez só (o topo e as linhas do painel dividem o mesmo) */
    damageHealDialog: ReactNode;
}

/**
 * Dano e cura que o combate narra, para o mestre (`apply_damage` e `apply_heal`: vão ao log e ao chat, entram nas estatísticas e no "Desfazer"; o ajuste rápido das janelas
 * é outra coisa, não narra). O mestre escolhe o alvo e **quem causa**: de início quem tem a vez (é o que o log escreve: "Goblin causou 6 de dano em Borin"), ou "o mestre".
 * Alvo com Necrose, Incurável... recusa a cura e o aviso oferece "Curar mesmo assim".
 */
export function useDamageHealDialog(): DamageHealDialogControls {
    const { campaign, charsheets } = useCampaignContext();
    const [ request, setRequest ] = useState<{ type: DamageHealKind; targetId?: string } | null>(null);
    const { isApplying, applyDamageHeal } = useDamageHeal({ campaignId: campaign.id });
    const combat = campaign.session?.combat;

    const playerStats = (combatantId: string, odacId?: string): { lp: number; maxLp: number } | null => {
        const stats = charsheets.find(sheet => sheet.id === combatantId || sheet.id === odacId)?.stats;
        return stats ? { lp: stats.lp ?? 0, maxLp: stats.maxLp ?? 0 } : null;
    };

    const damageHealDialog = combat?.isActive ? (
        <DamageHealDialog
            open={request !== null}
            type={request?.type ?? 'damage'}
            combat={combat}
            showEnemyLp
            playerStats={playerStats}
            busy={isApplying}
            onClose={() => { setRequest(null); }}
            initialTargetId={request?.targetId}
            origin={{
                options: (combat.combatants ?? []).map(combatant => ({ id: combatant.id, name: combatant.name })),
                // Na fase de ação, quem tem a vez; na iniciativa ninguém tem
                defaultId: combat.phase === 'ACTION' ? combat.combatants?.[combat.currentTurnIndex]?.id ?? null : null
            }}
            onApply={async ({ targetId, value, actorId }) => await applyDamageHeal({ type: request?.type ?? 'damage', targetId, value, actorId }, false, () => { setRequest(null); })}
        />
    ) : null;

    return { openDamageHeal: (type, targetId) => { setRequest({ type, targetId }); }, damageHealDialog };
}
