'use client';

import CasinoIcon from '@mui/icons-material/Casino';
import { Alert, alpha, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, useTheme } from '@mui/material';
import type { ReactElement } from 'react';

interface InitiativeDialogProps {
    open: boolean;
    rolling: boolean;
    /** Quantos d20 e o bônus de Agilidade (já com o Sobrepeso); `null` se a ficha não foi achada */
    formula: { numDice: number; expertiseValue: number } | null;
    onClose: () => void;
    onRoll: () => void;
}

/** O teste de Agilidade que abre o combate para o jogador: diz a rolagem (nd20 ± Agilidade) e rola. */
export default function InitiativeDialog({ open, rolling, formula, onClose, onRoll }: InitiativeDialogProps): ReactElement {
    const theme = useTheme();

    return (
        <Dialog open={open} onClose={() => { if (!rolling) onClose(); }}>
            <DialogTitle sx={{ bgcolor: alpha(theme.palette.warning.main, 0.15), display: 'flex', alignItems: 'center', gap: 1 }}>
                <CasinoIcon sx={{ color: 'text.secondary' }} />
                Teste de Iniciativa
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    O combate começou! Role seu teste de <strong>Agilidade</strong> para determinar a ordem de ação.
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        {formula
                            ? (
                                <>
                                    Sua rolagem: <strong>{formula.numDice}d20 {formula.expertiseValue >= 0 ? '+' : '−'} {Math.abs(formula.expertiseValue)}</strong> (Agilidade)
                                </>
                            ) : (
                                <>
                                    Sua rolagem considera seus modificadores de Destreza e sua perícia de <strong>Agilidade</strong>.
                                </>
                            )}
                    </Typography>
                </Alert>
                <Typography variant="body2" color="text.secondary">
                    Em caso de empate, vence quem tiver maior Destreza (DES).
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button
                    variant="contained"
                    onClick={onRoll}
                    disabled={rolling}
                    startIcon={<CasinoIcon />}
                    sx={{ bgcolor: 'warning.main', color: 'warning.contrastText', '&:hover': { bgcolor: 'warning.light' } }}
                >
                    {rolling ? 'Rolando...' : 'Rolar Iniciativa'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
