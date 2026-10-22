import type { ReactElement } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from '@mui/material';
import { NumberField } from '@components/misc';
import type { Item } from '@models';
import type { StockTransferState } from './useStockTransfer';

interface StockTransferDialogProps {
    state: StockTransferState;
    /** Itens do inventário da ficha (opções do depósito) */
    ownItems: Item[];
}

/** Dialog de transferência (depósito/retirada) entre o inventário da ficha e o estoque do widget */
export default function StockTransferDialog({ state, ownItems }: StockTransferDialogProps): ReactElement {
    const {
        transfer, transferItemIndex, setTransferItemIndex, transferQty, setTransferQty,
        transferBusy, selectedOwnItem, closeTransfer, confirmTransfer
    } = state;

    return (
        <Dialog open={!!transfer} onClose={closeTransfer} maxWidth="xs" fullWidth>
            <DialogTitle>
                {transfer?.mode === 'withdraw' ? 'Retirar do estoque' : 'Transferir para o estoque'}
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} pt={1}>
                    {transfer?.mode === 'deposit' && (
                        <FormControl fullWidth size="small">
                            <InputLabel>Item</InputLabel>
                            <Select
                                label="Item"
                                value={transferItemIndex}
                                onChange={(e) => {
                                    setTransferItemIndex(e.target.value);
                                    const item = ownItems[Number(e.target.value)];
                                    setTransferQty(item?.quantity ?? 1);
                                }}
                            >
                                {ownItems.map((item, idx) => (
                                    <MenuItem key={item.id ?? idx} value={String(idx)}>
                                        {item.name} (x{item.quantity})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    {transfer?.mode === 'withdraw' && (
                        <Typography variant="body2">
                            {transfer.stockItem.name} — disponível: {transfer.stockItem.quantity}
                        </Typography>
                    )}
                    <NumberField
                        fullWidth
                        size="small"
                        label="Quantidade"
                        min={1}
                        max={transfer?.mode === 'withdraw' ? transfer.stockItem.quantity : (selectedOwnItem?.quantity ?? 1)}
                        value={transferQty}
                        onChange={setTransferQty}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeTransfer} disabled={transferBusy}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={confirmTransfer}
                    disabled={transferBusy || (transfer?.mode === 'deposit' && !transferItemIndex)}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
