'use client';

import UndoIcon from '@mui/icons-material/Undo';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Box, Button, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, Typography
} from '@mui/material';
import { campaignService } from '@services';
import type { CombatEventItem } from '@utils/combat/history';
import { asRequestError, errorMessage } from '@utils/errors';
import { useSnackbar } from 'notistack';
import { useState, type ReactElement } from 'react';
import { useCombatHistory } from './useCombatHistory';

interface CombatHistoryPanelProps {
    campaignId: string;
    /** Algo que muda a cada ação do combate; refaz a consulta do histórico */
    signature: string;
    /** O combate mudou (um evento foi desfeito): quem usa o painel busca o estado de novo */
    onChanged: () => void;
    /** Abre já com a lista de eventos à mostra (a aba do painel de combate) */
    defaultOpen?: boolean;
    /** Sem margem em cima, e sem eventos diz que não há o que desfazer em vez de sumir */
    flush?: boolean;
}

interface PendingConflict {
    event: CombatEventItem;
    lines: string[];
}

const timeOf = (iso: string): string => {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Histórico do combate com "Desfazer" (só o mestre): cada ação importante (dano, cura, passar o turno, efeito, entrada e saída de combatentes,
 * encerrar) aparece com o que mudou. Desfazer devolve só os campos que o evento mexeu; se algum já mudou de novo depois, o servidor avisa e o
 * mestre decide se desfaz mesmo assim. Não reverte as estatísticas da campanha nem apaga as mensagens do chat (o chat ganha um aviso).
 */
export default function CombatHistoryPanel({ campaignId, signature, onChanged, defaultOpen = false, flush = false }: CombatHistoryPanelProps): ReactElement | null {
    const { enqueueSnackbar } = useSnackbar();
    const [ open, setOpen ] = useState(defaultOpen);
    const [ busyId, setBusyId ] = useState<string | null>(null);
    const [ conflict, setConflict ] = useState<PendingConflict | null>(null);
    const { events, failed } = useCombatHistory(campaignId, signature, true);

    const nothing = (message: string): ReactElement | null => (flush ? <Typography variant="body2" color="text.secondary">{message}</Typography> : null);
    if (failed && !events) return nothing('Não foi possível carregar o histórico agora.');
    if (!events || events.length === 0) return nothing('Nada para desfazer ainda: as ações importantes do combate aparecem aqui.');

    const latest = events.find(event => !event.undone);

    const undo = async (event: CombatEventItem, force = false): Promise<void> => {
        setBusyId(event.id);
        try {
            await campaignService.undoCombatEvent(campaignId, { eventId: event.id, force });
            enqueueSnackbar(`Desfeito: ${event.label}`, { variant: 'success' });
            setConflict(null);
            onChanged();
        } catch (error) {
            const { response } = asRequestError(error);
            if (response?.status === 409 && response.data?.code === 'UNDO_CONFLICT') {
                setConflict({ event, lines: response.data.conflicts ?? [] });
            } else {
                enqueueSnackbar(errorMessage(error, 'Erro ao desfazer'), { variant: 'error' });
            }
        } finally {
            setBusyId(null);
        }
    };

    return (
        <Box sx={{ mt: flush ? 0 : 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.raised' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 0.75 }}>
                <Typography variant="subtitle2" sx={{ flex: 1 }}>
                    Histórico do combate
                </Typography>
                {latest && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<UndoIcon fontSize="small" />}
                        disabled={busyId !== null}
                        onClick={() => { void undo(latest); }}
                        sx={{ textTransform: 'none' }}
                    >
                        Desfazer último
                    </Button>
                )}
                <IconButton size="small" aria-expanded={open} aria-label={open ? 'Recolher o histórico' : 'Expandir o histórico'} onClick={() => { setOpen(value => !value); }}>
                    {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
            </Stack>

            <Collapse in={open} unmountOnExit>
                <Stack spacing={0} sx={{ maxHeight: 280, overflow: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
                    {events.map(event => (
                        <Box
                            key={event.id}
                            data-testid={`combat-event-${event.id}`}
                            sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', opacity: event.undone ? 0.6 : 1, '&:last-of-type': { borderBottom: 0 } }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {event.label}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {[ timeOf(event.at), event.byName ].filter(Boolean).join(' · ')}
                                    </Typography>
                                </Box>
                                {event.undone ? (
                                    <Chip size="small" label="Desfeito" />
                                ) : (
                                    <Button
                                        size="small"
                                        startIcon={<UndoIcon fontSize="small" />}
                                        disabled={busyId !== null}
                                        onClick={() => { void undo(event); }}
                                        aria-label={`Desfazer: ${event.label}`}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Desfazer
                                    </Button>
                                )}
                            </Stack>
                            {event.summary.length > 0 && (
                                <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2 }}>
                                    {event.summary.map((line, index) => (
                                        <Typography key={`${event.id}-${index}`} component="li" variant="caption" sx={{ color: 'text.secondary' }}>
                                            {line}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Stack>
            </Collapse>

            <Dialog open={conflict !== null} onClose={() => { setConflict(null); }} maxWidth="xs" fullWidth>
                <DialogTitle>Algo mudou depois deste evento</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 1 }}>
                        Desfazer &quot;{conflict?.event.label}&quot; sobrescreve estes valores com os de antes do evento:
                    </DialogContentText>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        {(conflict?.lines ?? []).map(line => (
                            <Typography key={line} component="li" variant="body2">{line}</Typography>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setConflict(null); }} disabled={busyId !== null}>Cancelar</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        disabled={busyId !== null}
                        onClick={() => { if (conflict) void undo(conflict.event, true); }}
                    >
                        Desfazer mesmo assim
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
