'use client';

import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { orange } from '@mui/material/colors';
import { useSnackbar } from 'notistack';

interface FinishCampaignDialogProps {
    open: boolean;
    onClose: () => void;
    campaignId: string;
    campaignTitle: string;
    /** Chamado após finalizar com sucesso (ex: abrir a retrospectiva) */
    onFinished?: () => void;
}

export default function FinishCampaignDialog({
    open,
    onClose,
    campaignId,
    campaignTitle,
    onFinished
}: FinishCampaignDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [ isFinishing, setIsFinishing ] = useState(false);

    const handleFinish = async () => {
        setIsFinishing(true);
        try {
            const response = await fetch(`/api/campaign/${campaignId}/finish`, { method: 'POST' });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao finalizar campanha');
            }

            enqueueSnackbar('Campanha finalizada! 🏆', { variant: 'success' });
            onClose();
            onFinished?.();
        } catch (error: any) {
            console.error('Erro ao finalizar campanha:', error);
            enqueueSnackbar(error.message || 'Erro ao finalizar campanha', { variant: 'error' });
        } finally {
            setIsFinishing(false);
        }
    };

    return (
        <Dialog open={open} onClose={isFinishing ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlagIcon sx={{ color: orange[500] }} />
                Finalizar Campanha
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography>
                        Tem certeza que deseja finalizar a campanha <strong>{campaignTitle}</strong>?
                    </Typography>
                    <Alert severity="warning">
                        Ao finalizar:
                        <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                            <li>Combates, loja, doações e evoluções serão <strong>bloqueados</strong></li>
                            <li>As estatísticas param de ser coletadas e ficam <strong>congeladas</strong></li>
                            <li>Todos os participantes poderão ver a <strong>retrospectiva final</strong></li>
                        </ul>
                    </Alert>
                    <Alert severity="info">
                        Você poderá <strong>reabrir</strong> a campanha depois, se mudar de ideia.
                    </Alert>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={isFinishing} variant="outlined">
                    Cancelar
                </Button>
                <Button
                    onClick={handleFinish}
                    variant="contained"
                    color="warning"
                    disabled={isFinishing}
                    startIcon={isFinishing ? <CircularProgress size={20} /> : <FlagIcon />}
                >
                    {isFinishing ? 'Finalizando...' : 'Finalizar Campanha'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
