'use client';

import { useCampaignContext } from '@contexts';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { useLeaveReach } from '../../opportunity/useLeaveReach';

/**
 * Saídas de alcance abertas (ataque de oportunidade): quem saiu e quem ainda pode reagir. Quando o inimigo é um jogador, ele mesmo escolhe atacar; quando é uma
 * criatura, o mestre declara o ataque em "Ataque manual" (com "Ataque de oportunidade" marcado). Dispensar fecha a oportunidade sem ataque.
 */
export default function OpportunitiesList(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const { dismiss } = useLeaveReach();
    const opportunities = campaign.session?.combat?.opportunities ?? [];
    const combatants = campaign.session?.combat?.combatants ?? [];

    if (opportunities.length === 0) return null;

    return (
        <Stack spacing={0.5} data-testid="opportunities-list">
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Saídas de alcance abertas (ataque de oportunidade)</Typography>
            {opportunities.map(entry => {
                const reactorIsCreature = combatants.find(candidate => candidate.id === entry.reactorId)?.type === 'creature';
                return (
                    <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }} data-testid={`opportunity-${entry.id}`}>
                        <Typography variant="body2" sx={{ flex: 1 }}>
                            {entry.moverName} saiu do alcance de {entry.reactorName}
                            <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                                {reactorIsCreature ? ' (criatura: declare o ataque em "Ataque manual")' : ' (o jogador decide se ataca)'}
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
