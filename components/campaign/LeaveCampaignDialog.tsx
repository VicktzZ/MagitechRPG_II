import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { ReactElement } from 'react';

interface LeaveCampaignDialogProps {
    open: boolean;
    campaignTitle: string;
    /** Saída em andamento: trava os botões para não repetir o pedido */
    leaving: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/** Confirmação antes de o jogador deixar a campanha (a saída vale na hora, sem desfazer) */
export default function LeaveCampaignDialog({ open, campaignTitle, leaving, onConfirm, onCancel }: LeaveCampaignDialogProps): ReactElement {
    return (
        <Dialog
            open={open}
            onClose={leaving ? undefined : onCancel}
            aria-labelledby="leave-campaign-title"
            aria-describedby="leave-campaign-description"
        >
            <DialogTitle id="leave-campaign-title">Sair da campanha?</DialogTitle>
            <DialogContent>
                <DialogContentText id="leave-campaign-description">
                    Você deixa de participar de <strong>{campaignTitle}</strong> e sai da lista de jogadores.
                    Sua ficha não é apagada, mas para voltar será preciso entrar de novo com o código da campanha.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={leaving}>
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={leaving}
                    startIcon={leaving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Sair da campanha
                </Button>
            </DialogActions>
        </Dialog>
    );
}
