'use client';

import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { handleHealingBlocked } from '../healBlocked';
import { failure, post } from './combatRequest';

export interface DamageHealInput {
    type: 'damage' | 'heal';
    targetId: string;
    value: number;
    /** Quem causa: o id do combatente; `null` é o mestre, sem personagem; ausente vale o padrão do hook */
    actorId?: string | null;
}

/**
 * O corpo da chamada à rota. Quem causa: `actorId` da chamada; ausente vale o padrão (o personagem de quem joga, o do turno atual para o mestre); `null` é o mestre sem
 * personagem e vai sem `combatantId` (o log diz "O mestre"). `force` só vai quando é a cura do mestre em quem tem o efeito que a bloqueia.
 */
export function damageHealBody({ type, targetId, value, actorId }: DamageHealInput, defaultActorId: string | undefined, force: boolean): Record<string, unknown> {
    const combatantId = actorId === undefined ? defaultActorId : actorId ?? undefined;
    return {
        action: type === 'damage' ? 'apply_damage' : 'apply_heal',
        ...(combatantId ? { combatantId } : {}),
        targetId,
        value,
        ...(force ? { force: true } : {})
    };
}

interface DamageHealOptions {
    campaignId: string;
    /** Quem causa quando a chamada não diz: o personagem de quem joga, ou o do turno atual para o mestre */
    defaultActorId?: string;
    onActionComplete?: () => void;
}

/**
 * Dano e cura que o combate narra (`apply_damage` e `apply_heal`: vão ao log e ao chat, entram nas estatísticas e no histórico do "Desfazer"). Devolve `true` se aplicou.
 * `force` é a cura do mestre em quem tem Necrose, Incurável... (o aviso `HEALING_BLOCKED` oferece "Curar mesmo assim", que repete a chamada com ele).
 */
export function useDamageHeal({ campaignId, defaultActorId, onActionComplete }: DamageHealOptions) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [ isApplying, setIsApplying ] = useState(false);

    /** `onForcedDone` roda quando a cura forçada ("Curar mesmo assim") dá certo: o diálogo que recusou a primeira tentativa já não tem como saber, então quem abriu o fecha */
    const applyDamageHeal = useCallback(async ({ type, targetId, value, actorId }: DamageHealInput, force = false, onForcedDone?: () => void): Promise<boolean> => {
        if (!targetId || value <= 0) {
            enqueueSnackbar('Selecione um alvo e um valor válido', { variant: 'warning' });
            return false;
        }

        setIsApplying(true);
        try {
            const { ok, result } = await post(campaignId, damageHealBody({ type, targetId, value, actorId }, defaultActorId, force));

            // Necrose, Incurável...: o alvo não recebe cura. O mestre pode curar mesmo assim
            const forceHeal = (): void => { void applyDamageHeal({ type, targetId, value, actorId }, true, onForcedDone); };
            if (!ok && handleHealingBlocked(result as { code?: string; error?: string; canForce?: boolean }, { enqueueSnackbar, closeSnackbar }, forceHeal)) return false;
            if (!ok) throw failure(result, 'Erro ao aplicar ação');

            enqueueSnackbar(type === 'damage' ? `${value} de dano aplicado!` : `${value} de cura aplicada!`, { variant: 'success' });
            onActionComplete?.();
            if (force) onForcedDone?.();
            return true;
        } catch (error) {
            console.error('Erro ao aplicar ação:', error);
            enqueueSnackbar(error instanceof Error ? error.message : 'Erro ao aplicar ação', { variant: 'error' });
            return false;
        } finally {
            setIsApplying(false);
        }
    }, [ campaignId, defaultActorId, enqueueSnackbar, closeSnackbar, onActionComplete ]);

    return { isApplying, applyDamageHeal };
}
