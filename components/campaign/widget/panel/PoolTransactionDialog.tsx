import type { ReactElement } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { NumberField } from '@components/misc';
import type { PoolTransactionState } from './usePoolTransaction';

/** Dialog de transação (depósito/retirada) de um fundo comum */
export default function PoolTransactionDialog({ state }: { state: PoolTransactionState }): ReactElement {
    const { poolDialog, poolAmount, setPoolAmount, poolBusy, closePoolDialog, confirmPoolTransaction } = state;

    return (
        <Dialog open={!!poolDialog} onClose={closePoolDialog} maxWidth="xs" fullWidth>
            <DialogTitle>
                {poolDialog?.mode === 'withdraw' ? 'Retirar do fundo' : 'Depositar no fundo'}: {poolDialog?.pool.name}
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} pt={1}>
                    <Typography variant="body2" color="text.secondary">
                        Saldo atual: {poolDialog?.pool.value}{poolDialog?.pool.max !== undefined ? ` / ${poolDialog.pool.max}` : ''} {poolDialog?.pool.unit ?? ''}
                    </Typography>
                    <NumberField
                        fullWidth
                        size="small"
                        label="Quantidade"
                        min={1}
                        max={poolDialog?.mode === 'withdraw' ? poolDialog.pool.value : undefined}
                        value={poolAmount}
                        onChange={setPoolAmount}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={closePoolDialog} disabled={poolBusy}>Cancelar</Button>
                <Button variant="contained" onClick={confirmPoolTransaction} disabled={poolBusy}>
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
