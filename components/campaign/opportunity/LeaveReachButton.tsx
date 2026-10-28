'use client';

import { DirectionsRun } from '@mui/icons-material';
import { Button } from '@mui/material';
import type { Combat } from '@models';
import { useState, type ReactElement } from 'react';
import LeaveReachDialog from './LeaveReachDialog';
import { useLeaveReach } from './useLeaveReach';

/** "Saí do alcance": o jogador declara que o personagem saiu do alcance corpo a corpo de inimigos (ou desengaja). Só na fase de ação */
export default function LeaveReachButton({ combat, combatantId }: { combat: Combat; combatantId: string }): ReactElement {
    const [ open, setOpen ] = useState(false);
    const { busy, declare, disengage } = useLeaveReach();

    return (
        <>
            <Button
                size="small"
                variant="outlined"
                startIcon={<DirectionsRun fontSize="small" />}
                onClick={() => { setOpen(true); }}
                sx={{ textTransform: 'none', mb: 1.5 }}
            >
                Saí do alcance de inimigos
            </Button>
            <LeaveReachDialog
                open={open}
                onClose={() => { setOpen(false); }}
                combatants={combat.combatants ?? []}
                moverId={combatantId}
                busy={busy}
                onDeclare={(moverId, reactorIds) => { void declare(moverId, reactorIds).then(done => { if (done) setOpen(false); }); }}
                onDisengage={(moverId) => { void disengage(moverId).then(done => { if (done) setOpen(false); }); }}
            />
        </>
    );
}
