'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';
import { useState } from 'react';
import { rollDice } from '@utils/diceRoller';

interface TestDialogProps {
    open: boolean;
    onClose: () => void;
    dt: number;
    onRollComplete: (success: boolean) => void;
}

export default function TestDialog({ open, onClose, dt, onRollComplete }: TestDialogProps) {
    const [ hasRolled, setHasRolled ] = useState(false);

    const handleRoll = () => {
        const result = rollDice('1d20');
        if (!result) return;

        const success = result.total > dt;
        onRollComplete(success);
        setHasRolled(true);
    };

    const handleClose = () => {
        setHasRolled(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Teste Solicitado</DialogTitle>
            <DialogContent>
                <Typography>
                    O Mestre solicitou um teste com.
                    {!hasRolled && ' Clique em Rolar para fazer o teste.'}
                </Typography>
            </DialogContent>
            <DialogActions>
                {!hasRolled ? (
                    <Button onClick={handleRoll} color="primary">
                        Rolar
                    </Button>
                ) : (
                    <Button onClick={handleClose}>Fechar</Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
