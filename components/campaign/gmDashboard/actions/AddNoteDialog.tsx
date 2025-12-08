'use client';

import { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useSnackbar } from 'notistack';

interface AddNoteDialogProps {
    open: boolean;
    onClose: () => void;
    campaignId: string;
}

export default function AddNoteDialog({ open, onClose, campaignId }: AddNoteDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [noteContent, setNoteContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!noteContent.trim()) {
            enqueueSnackbar('Digite o conteúdo da nota', { variant: 'warning' });
            return;
        }

        setIsSubmitting(true);
        try {
            // TODO: Implementar lógica de salvar nota
            enqueueSnackbar('Nota adicionada com sucesso!', { variant: 'success' });
            setNoteContent('');
            onClose();
        } catch (error) {
            console.error('Erro ao adicionar nota:', error);
            enqueueSnackbar('Erro ao adicionar nota', { variant: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setNoteContent('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NoteAddIcon color="primary" />
                Adicionar Nota da Campanha
            </DialogTitle>
            <DialogContent>
                <TextField
                    label="Conteúdo da nota"
                    multiline
                    rows={4}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    fullWidth
                    sx={{ mt: 1 }}
                    disabled={isSubmitting}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleClose} disabled={isSubmitting} variant="outlined">
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={isSubmitting || !noteContent.trim()}
                >
                    Adicionar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
