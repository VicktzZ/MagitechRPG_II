import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { ReactElement } from 'react';
import type { InventoryItemType } from './inventoryTypes';

interface ConfirmRemoveDialogProps {
    open: boolean;
    /** Nome e tipo do item que sai; ficam guardados depois de fechar para o texto não sumir durante a animação */
    target: { name: string; type: InventoryItemType } | null;
    busy?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

/** O que a remoção faz, em uma frase (a armadura também tira os pontos de armadura que dava) */
export function removalDescription(type: InventoryItemType | undefined): string {
    const base = 'O item sai do inventário e deixa de pesar na mochila.';
    const armor = type === 'armor' ? ' Os pontos de armadura que ele dava também são tirados.' : '';
    return `${base}${armor} Não dá para desfazer.`;
}

/** Confirmação antes de tirar um item do inventário (a remoção mexe no peso e, nas armaduras, nos pontos de armadura) */
export default function ConfirmRemoveDialog({ open, target, busy, onCancel, onConfirm }: ConfirmRemoveDialogProps): ReactElement {
    return (
        <Dialog open={open} onClose={busy ? undefined : onCancel} maxWidth="xs" fullWidth aria-labelledby="remove-item-title">
            <DialogTitle id="remove-item-title">{`Remover ${target?.name ?? 'item'}?`}</DialogTitle>
            <DialogContent>
                <DialogContentText>{removalDescription(target?.type)}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={busy} color="secondary">Cancelar</Button>
                <Button onClick={onConfirm} disabled={busy} color="error" variant="contained" data-testid="confirm-remove">Remover</Button>
            </DialogActions>
        </Dialog>
    );
}
