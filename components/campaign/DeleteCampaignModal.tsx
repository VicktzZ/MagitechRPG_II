import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { campaignService } from '@services';
import { type ReactElement } from 'react';

interface DeleteCampaignModalProps {
    open: boolean;
    campaignId: string;
    onClose: () => void;
    onDelete: () => void;
}

export function DeleteCampaignModal({ open, campaignId, onClose, onDelete }: DeleteCampaignModalProps): ReactElement {
    const handleDelete = async (): Promise<void> => {
        try {
            await campaignService.deleteById(campaignId);
            onDelete();
            onClose();
        } catch (error) {
            console.error('Erro ao deletar campanha:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Deletar Campanha</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Tem certeza que deseja deletar esta campanha? Esta ação não pode ser desfeita.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleDelete} color="error" variant="contained">
                    Deletar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
