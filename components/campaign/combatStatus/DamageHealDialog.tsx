'use client';

import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { alpha, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
import type { Combat } from '@models';
import { useEffect, useState, type ReactElement } from 'react';

interface DamageHealDialogProps {
    open: boolean;
    type: 'damage' | 'heal';
    combat: Combat;
    /** O mestre e a vida à mostra veem o LP das criaturas */
    showEnemyLp: boolean;
    /** LP e máximo de um jogador, lidos da ficha */
    playerStats: (combatantId: string, odacId?: string) => { lp: number; maxLp: number } | null;
    busy: boolean;
    onClose: () => void;
    /** Aplica; devolve `true` se deu certo (o diálogo fecha) */
    onApply: (input: { targetId: string; value: number }) => Promise<boolean>;
}

/** Dano ou cura rápidos do turno do jogador: o valor e o alvo na lista de combatentes. */
export default function DamageHealDialog({ open, type, combat, showEnemyLp, playerStats, busy, onClose, onApply }: DamageHealDialogProps): ReactElement {
    const theme = useTheme();
    const [ targetId, setTargetId ] = useState('');
    const [ value, setValue ] = useState(0);

    // Cada abertura começa limpa
    useEffect(() => {
        if (open) { setTargetId(''); setValue(0); }
    }, [ open ]);

    const tone = type === 'damage' ? theme.palette.error : theme.palette.success;

    const apply = async (): Promise<void> => {
        if (await onApply({ targetId, value })) onClose();
    };

    return (
        <Dialog open={open} onClose={() => { if (!busy) onClose(); }} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper' } }}>
            <DialogTitle sx={{ bgcolor: alpha(tone.main, 0.2), color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                {type === 'damage' ? <WhatshotIcon sx={{ color: 'error.main' }} /> : <LocalHospitalIcon sx={{ color: 'success.main' }} />}
                {type === 'damage' ? 'Aplicar Dano' : 'Aplicar Cura'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Valor"
                        type="number"
                        value={value}
                        onChange={(event) => { setValue(Math.max(0, Number(event.target.value))); }}
                        inputProps={{ min: 0 }}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.raised' } }}
                    />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Selecione o alvo:</Typography>
                        <Stack spacing={0.5} sx={{ maxHeight: 200, overflow: 'auto' }}>
                            {combat.combatants.map(combatant => {
                                const selected = targetId === combatant.id;
                                const isPlayer = combatant.type === 'player';
                                const stats = isPlayer ? playerStats(combatant.id, combatant.odacId) : null;
                                const currentLp = stats?.lp ?? combatant.currentLp ?? 0;
                                const maxLp = stats?.maxLp ?? combatant.maxLp ?? 1;

                                return (
                                    <Paper
                                        key={combatant.id}
                                        onClick={() => { setTargetId(combatant.id); }}
                                        sx={{
                                            p: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            cursor: 'pointer',
                                            bgcolor: selected ? alpha(tone.main, 0.2) : 'background.paper',
                                            border: '2px solid',
                                            borderColor: selected ? tone.main : 'divider',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <Avatar src={combatant.avatar} sx={{ width: 28, height: 28, bgcolor: isPlayer ? 'info.main' : 'warning.main' }}>
                                            {isPlayer ? <PersonIcon fontSize="small" /> : <PetsIcon fontSize="small" />}
                                        </Avatar>
                                        <Typography variant="body2" sx={{ flex: 1 }}>{combatant.name}</Typography>
                                        {(isPlayer || showEnemyLp) && (
                                            <Typography variant="caption" color="text.secondary">{currentLp}/{maxLp}</Typography>
                                        )}
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Button onClick={onClose} disabled={busy} sx={{ color: 'text.secondary' }}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={() => { void apply(); }}
                    disabled={!targetId || value <= 0 || busy}
                    sx={{ bgcolor: tone.main, color: tone.contrastText, '&:hover': { bgcolor: tone.light } }}
                >
                    {busy ? 'Aplicando...' : 'Aplicar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
