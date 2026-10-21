import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { errorMessage } from '@utils/errors';
import type { WidgetPool } from '@models';

export interface PoolDialogState {
    pool: WidgetPool;
    mode: 'deposit' | 'withdraw';
}

interface UsePoolTransactionParams {
    widgetId: string;
    campaignId: string;
}

/** Estado e requisição do diálogo de depósito/retirada de um fundo comum */
export function usePoolTransaction({ widgetId, campaignId }: UsePoolTransactionParams) {
    const { enqueueSnackbar } = useSnackbar();
    const [ poolDialog, setPoolDialog ] = useState<PoolDialogState | null>(null);
    const [ poolAmount, setPoolAmount ] = useState(1);
    const [ poolBusy, setPoolBusy ] = useState(false);

    const openPoolDialog = (pool: WidgetPool, mode: 'deposit' | 'withdraw') => {
        setPoolDialog({ pool, mode });
        setPoolAmount(1);
    };
    const closePoolDialog = () => setPoolDialog(null);

    const confirmPoolTransaction = async () => {
        if (!poolDialog) return;
        setPoolBusy(true);
        try {
            const amount = poolDialog.mode === 'withdraw' ? -Math.abs(poolAmount) : Math.abs(poolAmount);
            const response = await fetch(`/api/campaign/${campaignId}/widget`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgetId, action: 'poolTransaction', poolId: poolDialog.pool.id, amount })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro na transação');
            }
            enqueueSnackbar(poolDialog.mode === 'deposit' ? 'Depósito realizado!' : 'Retirada realizada!', { variant: 'success' });
            setPoolDialog(null);
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro na transação'), { variant: 'error' });
        } finally {
            setPoolBusy(false);
        }
    };

    return { poolDialog, poolAmount, setPoolAmount, poolBusy, openPoolDialog, closePoolDialog, confirmPoolTransaction };
}

export type PoolTransactionState = ReturnType<typeof usePoolTransaction>;
