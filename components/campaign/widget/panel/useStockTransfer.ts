import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { errorMessage } from '@utils/errors';
import type { Item, WidgetStockItem } from '@models';

export type TransferDialogState =
    | { mode: 'withdraw'; stockItem: WidgetStockItem }
    | { mode: 'deposit' };

interface UseStockTransferParams {
    widgetId: string;
    campaignId: string;
    /** ID da ficha do usuário na campanha (ausente = sem ficha) */
    charsheetId?: string;
    /** Itens do inventário da ficha (origem do depósito) */
    ownItems: Item[];
}

/** Estado e requisição do diálogo de transferência (retirar do estoque / depositar no estoque) */
export function useStockTransfer({ widgetId, campaignId, charsheetId, ownItems }: UseStockTransferParams) {
    const { enqueueSnackbar } = useSnackbar();
    const [ transfer, setTransfer ] = useState<TransferDialogState | null>(null);
    // Guarda o ÍNDICE do item em ownItems (como string, para o Select) — itens do
    // catálogo padrão (ex: "Bolsa") podem não ter um `id` próprio.
    const [ transferItemIndex, setTransferItemIndex ] = useState('');
    const [ transferQty, setTransferQty ] = useState(1);
    const [ transferBusy, setTransferBusy ] = useState(false);

    const selectedOwnItem = ownItems[Number(transferItemIndex)];

    const openWithdraw = (stockItem: WidgetStockItem) => {
        setTransfer({ mode: 'withdraw', stockItem });
        setTransferQty(stockItem.quantity);
    };
    const openDeposit = () => {
        setTransfer({ mode: 'deposit' });
        setTransferItemIndex(ownItems.length > 0 ? '0' : '');
        setTransferQty(ownItems[0]?.quantity ?? 1);
    };
    const closeTransfer = () => {
        setTransfer(null);
        setTransferItemIndex('');
        setTransferQty(1);
    };

    const confirmTransfer = async () => {
        if (!transfer || !charsheetId) return;
        setTransferBusy(true);
        try {
            const body = transfer.mode === 'withdraw'
                ? { action: 'withdraw', charsheetId, stockId: transfer.stockItem.id, quantity: transferQty }
                : { action: 'deposit', charsheetId, itemIndex: Number(transferItemIndex), quantity: transferQty };

            const response = await fetch(`/api/campaign/${campaignId}/widget`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ widgetId, ...body })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro na transferência');
            }
            enqueueSnackbar(transfer.mode === 'withdraw' ? 'Item retirado do estoque!' : 'Item transferido para o estoque!', { variant: 'success' });
            closeTransfer();
        } catch (error) {
            enqueueSnackbar(errorMessage(error, 'Erro na transferência'), { variant: 'error' });
        } finally {
            setTransferBusy(false);
        }
    };

    return {
        transfer,
        transferItemIndex,
        setTransferItemIndex,
        transferQty,
        setTransferQty,
        transferBusy,
        selectedOwnItem,
        openWithdraw,
        openDeposit,
        closeTransfer,
        confirmTransfer
    };
}

export type StockTransferState = ReturnType<typeof useStockTransfer>;
