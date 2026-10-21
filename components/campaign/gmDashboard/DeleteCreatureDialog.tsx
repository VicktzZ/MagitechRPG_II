import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { ReactElement } from 'react';

interface DeleteCreatureDialogProps {
    open: boolean;
    creatureName: string;
    /** Exclusão em andamento: trava os botões para não repetir o pedido */
    deleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/** Confirmação antes de excluir uma criatura customizada da campanha (a exclusão vale na hora, sem desfazer) */
export default function DeleteCreatureDialog({ open, creatureName, deleting, onConfirm, onCancel }: DeleteCreatureDialogProps): ReactElement {
    return (
        <Dialog
            open={open}
            onClose={deleting ? undefined : onCancel}
            aria-labelledby="delete-creature-title"
            aria-describedby="delete-creature-description"
        >
            <DialogTitle id="delete-creature-title">Excluir criatura?</DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-creature-description">
                    Tem certeza que deseja excluir a criatura <strong>{creatureName}</strong>? Esta ação não pode ser desfeita.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={deleting}>
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={deleting}
                    startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Excluir
                </Button>
            </DialogActions>
        </Dialog>
    );
}
