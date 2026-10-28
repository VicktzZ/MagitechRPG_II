'use client';

import { useCampaignContext } from '@contexts';
import { Add, Close, DirectionsRun, VisibilityOff } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { useState, type ReactElement } from 'react';
import LeaveReachDialog from '../../opportunity/LeaveReachDialog';
import { useLeaveReach } from '../../opportunity/useLeaveReach';
import Section from '../../Section';
import HideDialog from './HideDialog';
import ManualAttackForm from './ManualAttackForm';
import OpportunitiesList from './OpportunitiesList';
import PendingAttackCard from './PendingAttackCard';
import UnseenList from './UnseenList';
import { useAwareness } from './useAwareness';

/**
 * Ataques declarados que o mestre ainda não resolveu (ataque assistido), com o ataque manual para as criaturas. Só aparece com combate na fase de ação.
 * O jogador declara pelo "Acerto" da arma; cada ataque abre a proposta do motor para o mestre confirmar ou trocar.
 */
export default function PendingAttacksPanel(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const [ manualOpen, setManualOpen ] = useState(false);
    const [ leaveOpen, setLeaveOpen ] = useState(false);
    const [ hideOpen, setHideOpen ] = useState(false);
    const { busy, declare } = useLeaveReach();
    const awareness = useAwareness();
    const combat = campaign.session?.combat;

    if (!combat?.isActive || combat.phase !== 'ACTION') return null;
    const pending = combat.pendingAttacks ?? [];

    return (
        <Section
            id="ataques"
            title="Ataques"
            action={(
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOff fontSize="small" />}
                        onClick={() => { setHideOpen(true); }}
                        sx={{ textTransform: 'none' }}
                    >
                        Furtividade
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DirectionsRun fontSize="small" />}
                        onClick={() => { setLeaveOpen(true); }}
                        sx={{ textTransform: 'none' }}
                    >
                        Saída de alcance
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={manualOpen ? <Close fontSize="small" /> : <Add fontSize="small" />}
                        onClick={() => { setManualOpen(open => !open); }}
                        sx={{ textTransform: 'none' }}
                    >
                        {manualOpen ? 'Fechar' : 'Ataque manual'}
                    </Button>
                </Stack>
            )}
        >
            <Stack spacing={1.5}>
                <LeaveReachDialog
                    open={leaveOpen}
                    onClose={() => { setLeaveOpen(false); }}
                    combatants={combat.combatants ?? []}
                    busy={busy}
                    onDeclare={(moverId, reactorIds) => { void declare(moverId, reactorIds).then(done => { if (done) setLeaveOpen(false); }); }}
                />
                <HideDialog
                    open={hideOpen}
                    onClose={() => { setHideOpen(false); }}
                    combatants={combat.combatants ?? []}
                    busy={awareness.busy}
                    onConfirm={(hiderId, observerIds, cause) => { void awareness.hide(hiderId, observerIds, cause).then(done => { if (done) setHideOpen(false); }); }}
                />
                <UnseenList />
                <OpportunitiesList />
                {manualOpen && <ManualAttackForm onDone={() => { setManualOpen(false); }} />}
                {pending.length === 0 && !manualOpen && (
                    <Typography variant="body2" color="text.secondary">
                        Nenhum ataque esperando. Quando um jogador escolher o alvo e rolar o acerto da arma, o ataque aparece aqui para você confirmar.
                    </Typography>
                )}
                {pending.map(attack => <PendingAttackCard key={attack.id} attack={attack} />)}
            </Stack>
        </Section>
    );
}
