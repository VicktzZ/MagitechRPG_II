import { useSnackbar } from 'notistack';
import { errorMessage } from '@utils/errors';

interface UseWidgetActionsParams {
    widgetId: string;
    campaignId: string;
    isFinished: boolean;
    /** ID da ficha do usuário na campanha (ausente = sem ficha) */
    charsheetId?: string;
}

/** Ações do widget que chamam `PATCH /api/campaign/[id]/widget` (ajustes, fabricar, tarefas, relógios) */
export function useWidgetActions({ widgetId, campaignId, isFinished, charsheetId }: UseWidgetActionsParams) {
    const { enqueueSnackbar } = useSnackbar();

    const patch = async (payload: Record<string, unknown>) => {
        if (isFinished) return;
        try {
            const response = await fetch(`/api/campaign/${campaignId}/widget`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgetId, ...payload })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao atualizar o widget');
            }
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro ao atualizar o widget'), { variant: 'error' });
        }
    };

    const adjustResource = async (resourceId: string, value: number) =>
        await patch({ action: 'adjustResource', resourceId, value });
    const adjustBar = async (bar: 'integrity' | 'secondary', value: number) =>
        await patch({ action: 'adjustBar', bar, value });
    const adjustStock = async (stockId: string, delta: number) =>
        await patch({ action: 'adjustStock', stockId, delta });

    const craft = async (recipeId: string, quantity: number) =>
        await patch({ action: 'craft', recipeId, quantity, charsheetId });

    const claimBounty = async (bountyId: string) => {
        if (!charsheetId) return;
        await patch({ action: 'claimBounty', bountyId, charsheetId });
    };
    const approveBounty = async (bountyId: string) => await patch({ action: 'approveBounty', bountyId });
    const adjustClock = async (clockId: string, value: number) => await patch({ action: 'adjustClock', clockId, value });

    return { adjustResource, adjustBar, adjustStock, craft, claimBounty, approveBounty, adjustClock };
}
