'use client';

import { useCampaignContext } from '@contexts';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { useReactions } from './useReactions';

/**
 * Ofertas de reação abertas (de graça, ao resolver um ataque, ou pelo "Abrir reação"): o que aconteceu e quem pode reagir. Quando quem reage é um jogador, ele mesmo decide
 * (só vê a oferta se tem uma magia de Reação que combina); criatura reage pelas mãos do mestre. Dispensar fecha a oferta sem reação.
 */
export default function ReactionsList(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const { dismiss } = useReactions();
    const reactions = campaign.session?.combat?.reactions ?? [];
    const combatants = campaign.session?.combat?.combatants ?? [];

    if (reactions.length === 0) return null;

    return (
        <Stack spacing={0.5} data-testid="reactions-list">
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Reações abertas (a Reação é gasta ao reagir)</Typography>
            {reactions.map(entry => {
                const reactorIsCreature = combatants.find(candidate => candidate.id === entry.reactorId)?.type === 'creature';
                return (
                    <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }} data-testid={`reaction-${entry.id}`}>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                            {entry.text}: {entry.reactorName} pode reagir
                            <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                                {reactorIsCreature ? ' (criatura: você decide)' : ' (o jogador decide)'}
                            </Typography>
                        </Typography>
                        <Button size="small" color="inherit" onClick={() => { void dismiss(entry.id); }} sx={{ textTransform: 'none' }}>
                            Dispensar
                        </Button>
                    </Box>
                );
            })}
        </Stack>
    );
}
