'use client';

import { useCampaignContext } from '@contexts';
import { Add, Bolt, Close, DirectionsRun, VisibilityOff } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { useState, type ReactElement } from 'react';
import LeaveReachDialog from '../../opportunity/LeaveReachDialog';
import { useLeaveReach } from '../../opportunity/useLeaveReach';
import OpenReactionDialog from '../../reaction/OpenReactionDialog';
import ReactionsList from '../../reaction/ReactionsList';
import { useReactions } from '../../reaction/useReactions';
import HideDialog from './HideDialog';
import ManualAttackForm from './ManualAttackForm';
import OpportunitiesList from './OpportunitiesList';
import PendingAttackCard from './PendingAttackCard';
import UnseenList from './UnseenList';
import { useAwareness } from './useAwareness';

/**
 * Ataques declarados que o mestre ainda não resolveu (ataque assistido), com o ataque manual para as criaturas e as ferramentas da luta (furtividade, reação, saída
 * de alcance). Só aparece com combate na fase de ação; mora na aba "Ataques" do painel de combate. O jogador declara pelo "Acerto" da arma; cada ataque abre a
 * proposta do motor para o mestre confirmar ou trocar.
 */
export default function PendingAttacksPanel(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const [ manualOpen, setManualOpen ] = useState(false);
    const [ leaveOpen, setLeaveOpen ] = useState(false);
    const [ hideOpen, setHideOpen ] = useState(false);
    const [ reactionOpen, setReactionOpen ] = useState(false);
    const reactions = useReactions();
    const { busy, declare } = useLeaveReach();
    const awareness = useAwareness();
    const combat = campaign.session?.combat;

    if (!combat?.isActive || combat.phase !== 'ACTION') return null;
    const pending = combat.pendingAttacks ?? [];

    return (
        <Stack spacing={1.5} id="ataques">
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
                    startIcon={<Bolt fontSize="small" />}
                    onClick={() => { setReactionOpen(true); }}
                    sx={{ textTransform: 'none' }}
                >
                        Abrir reação
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
                <OpenReactionDialog
                    open={reactionOpen}
                    onClose={() => { setReactionOpen(false); }}
                    combatants={combat.combatants ?? []}
                    busy={reactions.busy}
                    onOpen={(input) => { void reactions.open(input).then(done => { if (done) setReactionOpen(false); }); }}
                />
                <UnseenList />
                <OpportunitiesList />
                <ReactionsList />
                {manualOpen && <ManualAttackForm onDone={() => { setManualOpen(false); }} />}
                {pending.length === 0 && !manualOpen && (
                    <Typography variant="body2" color="text.secondary">
                        Nenhum ataque esperando. Quando um jogador escolher o alvo e rolar o acerto da arma, o ataque aparece aqui para você confirmar.
                    </Typography>
                )}
                {pending.map(attack => <PendingAttackCard key={attack.id} attack={attack} />)}
            </Stack>
        </Stack>
    );
}
