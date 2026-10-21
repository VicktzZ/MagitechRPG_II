'use client';

import { memo, type ReactElement } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

interface TestDialogProps {
    open: boolean;
    /** Perícia do teste, quando o mestre escolheu uma */
    expertise?: string;
    /** Rolagem em andamento: trava os botões */
    rolling: boolean;
    onRoll: () => void;
    onClose: () => void;
}

function TestDialog({ open, expertise, rolling, onRoll, onClose }: TestDialogProps): ReactElement {
    return (
        <Dialog open={open} onClose={rolling ? undefined : onClose} aria-labelledby="campaign-test-title">
            <DialogTitle id="campaign-test-title">Teste solicitado</DialogTitle>
            <DialogContent>
                <Typography>
                    O Mestre pediu um teste{expertise ? <> de <strong>{expertise}</strong></> : ''}. Clique em Rolar para fazer o teste.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={rolling}>
                    Agora não
                </Button>
                <Button
                    onClick={onRoll}
                    variant="contained"
                    disabled={rolling}
                    startIcon={rolling ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    Rolar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default memo(TestDialog);
