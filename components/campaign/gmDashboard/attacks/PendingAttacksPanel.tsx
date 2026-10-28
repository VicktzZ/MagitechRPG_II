'use client';

import { useCampaignContext } from '@contexts';
import { Add, Close } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';
import { useState, type ReactElement } from 'react';
import Section from '../../Section';
import ManualAttackForm from './ManualAttackForm';
import PendingAttackCard from './PendingAttackCard';

/**
 * Ataques declarados que o mestre ainda não resolveu (ataque assistido), com o ataque manual para as criaturas. Só aparece com combate na fase de ação.
 * O jogador declara pelo "Acerto" da arma; cada ataque abre a proposta do motor para o mestre confirmar ou trocar.
 */
export default function PendingAttacksPanel(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const [ manualOpen, setManualOpen ] = useState(false);
    const combat = campaign.session?.combat;

    if (!combat?.isActive || combat.phase !== 'ACTION') return null;
    const pending = combat.pendingAttacks ?? [];

    return (
        <Section
            id="ataques"
            title="Ataques"
            action={(
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={manualOpen ? <Close fontSize="small" /> : <Add fontSize="small" />}
                    onClick={() => { setManualOpen(open => !open); }}
                    sx={{ textTransform: 'none' }}
                >
                    {manualOpen ? 'Fechar' : 'Ataque manual'}
                </Button>
            )}
        >
            <Stack spacing={1.5}>
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
