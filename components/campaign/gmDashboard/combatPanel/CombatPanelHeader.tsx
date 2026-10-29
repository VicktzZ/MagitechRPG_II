'use client';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import StopIcon from '@mui/icons-material/Stop';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, Typography } from '@mui/material';
import type { Combat } from '@models';
import { font } from '@themes/tokens';
import { pendingInitiative } from '@utils/combat/combatPanel';
import { useState, type ReactElement } from 'react';
import TurnOrderStrip from '../../combat/TurnOrderStrip';
import { useTurnOrder } from '../../combat/useTurnOrder';
import type { GmCombatControls } from './useGmCombat';

interface CombatPanelHeaderProps {
    combat: Combat;
    controls: GmCombatControls;
}

/**
 * O topo do painel de combate do mestre, que fica à vista enquanto a lista rola: a rodada, a fase, de quem é a vez, os comandos (passar o turno, definir a ordem,
 * encerrar) e a faixa da ordem de turnos. Encerrar pede confirmação (o painel é permanente, o clique errado custa mais que no antigo diálogo).
 */
export default function CombatPanelHeader({ combat, controls }: CombatPanelHeaderProps): ReactElement {
    const summary = useTurnOrder();
    const [ confirmEnd, setConfirmEnd ] = useState(false);
    const initiative = combat.phase === 'INITIATIVE';
    const waiting = pendingInitiative(combat.combatants);

    const end = async (): Promise<void> => {
        if (await controls.end()) setConfirmEnd(false);
    };

    return (
        <Box
            data-testid="gm-combat-header"
            sx={{
                position: { xs: 'static', md: 'sticky' },
                top: 0,
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                // Sticky de ponta a ponta do painel: o fundo cobre o que rola por trás
                mx: { xs: -2, sm: -3 },
                px: { xs: 2, sm: 3 },
                py: 1.5,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <SportsKabaddiIcon sx={{ color: 'text.secondary' }} />
                <Typography variant="h6" component="h2" sx={{ fontFamily: font.display }}>Combate</Typography>
                <Chip size="small" variant="outlined" label={`Rodada ${combat.round}`} sx={{ fontFamily: font.mono }} />
                <Chip size="small" variant="outlined" color={initiative ? 'warning' : 'info'} label={initiative ? 'Fase de iniciativa' : 'Fase de ação'} />
                {!initiative && summary?.currentName && (
                    <Typography aria-live="polite" sx={{ fontSize: 14 }}>
                        Vez de <Box component="strong">{summary.currentName}</Box>
                    </Typography>
                )}
                {initiative && waiting > 0 && (
                    <Typography sx={{ fontSize: 14 }} color="text.secondary">
                        {waiting === 1 ? 'Falta 1 rolar a iniciativa' : `Faltam ${waiting} rolarem a iniciativa`}
                    </Typography>
                )}

                <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {initiative && waiting === 0 && (
                        <Button variant="contained" startIcon={<PlayArrowIcon />} disabled={controls.busy} onClick={() => { void controls.setInitiativeOrder(); }}>
                            Definir ordem
                        </Button>
                    )}
                    {!initiative && (
                        <Button variant="contained" startIcon={<SkipNextIcon />} disabled={controls.busy} onClick={() => { void controls.nextTurn(); }}>
                            Passar turno
                        </Button>
                    )}
                    <Button variant="outlined" color="secondary" startIcon={<StopIcon />} disabled={controls.busy} onClick={() => { setConfirmEnd(true); }}>
                        Encerrar combate
                    </Button>
                </Box>
            </Box>

            {controls.busy && <LinearProgress aria-label="Executando" sx={{ mt: -0.5 }} />}
            {summary && <TurnOrderStrip items={summary.items} />}

            <Dialog open={confirmEnd} onClose={() => { if (!controls.busy) setConfirmEnd(false); }} maxWidth="xs" fullWidth>
                <DialogTitle>Encerrar o combate?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Os efeitos de combate saem e os limites de MP e as ações voltam ao normal. Dá para desfazer pelo histórico do combate.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={() => { setConfirmEnd(false); }} disabled={controls.busy}>Continuar o combate</Button>
                    <Button variant="contained" onClick={() => { void end(); }} disabled={controls.busy}>Encerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
