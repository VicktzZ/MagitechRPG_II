'use client';

import { campaignService } from '@services';
import { errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import type { JoinPayload } from '../actions/combat/combatPayload';

interface CombatCallResult {
    message?: string;
    warnings?: string[];
}

export interface GmCombatControls {
    /** Esperando o servidor (um botão só, nunca dois comandos ao mesmo tempo) */
    busy: boolean;
    start: (payload: { players: object[]; creatures: object[]; showEnemyLp: boolean }) => Promise<boolean>;
    end: () => Promise<boolean>;
    nextTurn: () => Promise<boolean>;
    rollInitiative: (combatantId: string, value?: number) => Promise<boolean>;
    setInitiativeOrder: () => Promise<boolean>;
    addCombatants: (payload: JoinPayload) => Promise<boolean>;
}

/**
 * Os comandos do mestre sobre o combate (começar, encerrar, passar o turno, iniciativa, entrar no meio): cada um chama a rota, mostra a mensagem do servidor
 * e os avisos (quem ficou de fora) e devolve `true` se deu certo. O estado novo chega sozinho pela campanha em tempo real; nada é buscado de volta aqui.
 */
export function useGmCombat(campaignId: string): GmCombatControls {
    const { enqueueSnackbar } = useSnackbar();
    const [ busy, setBusy ] = useState(false);

    const run = useCallback(async (call: () => Promise<CombatCallResult>, fallback: string): Promise<boolean> => {
        setBusy(true);
        try {
            const result = await call();
            if (result.message) enqueueSnackbar(result.message, { variant: 'success' });
            for (const warning of result.warnings ?? []) enqueueSnackbar(warning, { variant: 'warning' });
            return true;
        } catch (error) {
            enqueueSnackbar(errorMessage(error, fallback), { variant: 'error' });
            return false;
        } finally {
            setBusy(false);
        }
    }, [ enqueueSnackbar ]);

    return {
        busy,
        start: useCallback(async (payload) => await run(async () => await campaignService.startCombat(campaignId, payload), 'Erro ao iniciar o combate'), [ campaignId, run ]),
        end: useCallback(async () => await run(async () => await campaignService.endCombat(campaignId), 'Erro ao encerrar o combate'), [ campaignId, run ]),
        nextTurn: useCallback(async () => await run(async () => await campaignService.nextTurn(campaignId), 'Erro ao passar o turno'), [ campaignId, run ]),
        rollInitiative: useCallback(
            async (combatantId, value) => await run(async () => await campaignService.rollInitiative(campaignId, { combatantId, value }), 'Erro ao rolar a iniciativa'),
            [ campaignId, run ]
        ),
        setInitiativeOrder: useCallback(async () => await run(async () => await campaignService.setInitiativeOrder(campaignId), 'Erro ao definir a ordem'), [ campaignId, run ]),
        addCombatants: useCallback(async (payload) => await run(async () => await campaignService.addCombatants(campaignId, payload), 'Erro ao adicionar ao combate'), [ campaignId, run ])
    };
}
