'use client';

import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { alpha, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
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
    /** Alvo já escolhido ao abrir (o botão da linha de um combatente no painel do mestre) */
    initialTargetId?: string;
    /** O mestre escolhe quem causa o dano ou a cura (padrão: quem tem a vez; `null` é o mestre, sem personagem). Sem isto o diálogo não pergunta: quem causa é o próprio jogador */
    origin?: { options: ReadonlyArray<{ id: string; name: string }>; defaultId: string | null };
    /** Aplica; devolve `true` se deu certo (o diálogo fecha). `actorId` só vem com `origin` */
    onApply: (input: { targetId: string; value: number; actorId?: string | null }) => Promise<boolean>;
}

/** Dano ou cura que o combate narra: o valor e o alvo na lista de combatentes (e, para o mestre, quem causa). O jogador usa no turno dele; o mestre, a qualquer hora, pelo painel de combate. */
export default function DamageHealDialog({ open, type, combat, showEnemyLp, playerStats, busy, onClose, initialTargetId, origin, onApply }: DamageHealDialogProps): ReactElement {
    const theme = useTheme();
    const [ targetId, setTargetId ] = useState('');
    const [ value, setValue ] = useState(0);
    // '' é o mestre, sem personagem
    const [ actorId, setActorId ] = useState('');

    // Cada abertura começa limpa
    useEffect(() => {
        if (open) { setTargetId(initialTargetId ?? ''); setValue(0); setActorId(origin?.defaultId ?? ''); }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- só a abertura reinicia: o padrão de quem causa muda com o turno e não deve apagar o que o mestre já digitou
    }, [ open ]);

    const tone = type === 'damage' ? theme.palette.error : theme.palette.success;

    const apply = async (): Promise<void> => {
        if (await onApply({ targetId, value, ...(origin ? { actorId: actorId || null } : {}) })) onClose();
    };

    const canApply = Boolean(targetId) && value > 0 && !busy;

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
                        autoFocus={Boolean(initialTargetId)}
                        onKeyDown={(event) => { if (event.key === 'Enter' && canApply) void apply(); }}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.raised' } }}
                    />

                    {origin && (
                        <TextField
                            select
                            label={type === 'damage' ? 'Quem causa o dano' : 'Quem cura'}
                            value={actorId}
                            onChange={(event) => { setActorId(event.target.value); }}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.raised' } }}
                        >
                            <MenuItem value="">O mestre (sem personagem)</MenuItem>
                            {origin.options.map(option => <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>)}
                        </TextField>
                    )}

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
                    disabled={!canApply}
                    sx={{ bgcolor: tone.main, color: tone.contrastText, '&:hover': { bgcolor: tone.light } }}
                >
                    {busy ? 'Aplicando...' : 'Aplicar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
