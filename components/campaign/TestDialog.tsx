'use client';

import { type ReactElement } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { rollDice } from '@utils/diceRoller';

interface TestDialogProps {
    open: boolean;
    onClose: () => void;
    onRollComplete: (success: boolean, roll: { dice: string, result: number[] }) => void;
    dt: number;
}

export default function TestDialog({ open, onClose, onRollComplete, dt }: TestDialogProps): ReactElement {
    const handleRoll = () => {
        const roll = rollDice('1d20');
        const success = (roll?.total ?? 0) >= dt;
        onRollComplete(success, { dice: '1d20', result: [ roll?.total ?? 0 ] });
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Teste Solicitado</DialogTitle>
            <DialogContent>
                <Typography>
                    O Mestre solicitou um teste. Clique em Rolar para fazer o teste.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleRoll} color="primary">
                    Rolar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
