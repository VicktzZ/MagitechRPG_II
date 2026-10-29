import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { type ReactElement, useState } from 'react';
import PerkPlayerAccordion from './PerkPlayerAccordion';
import type { PlayerWithPerks } from './usePlayersWithPerks';

interface AcquiredPerksListProps {
    /** Jogadores que já receberam vantagens nesta campanha (`usePlayersWithPerks`) */
    players: PlayerWithPerks[];
    /** Há jogadores na campanha, mas as fichas ainda não chegaram */
    pending: boolean;
}

/**
 * As vantagens que cada jogador recebeu na campanha, um acordeão por jogador. Fica dentro do modal "Vantagens adquiridas" (menu "Mais ações" do mestre); antes era uma seção
 * fixa do dashboard.
 */
export default function AcquiredPerksList({ players, pending }: AcquiredPerksListProps): ReactElement {
    const [ expandedPlayer, setExpandedPlayer ] = useState<string | false>(false);

    return (
        <Box data-testid="acquired-perks">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Vantagens obtidas por cada jogador nesta campanha
            </Typography>

            {pending ? (
                <Stack spacing={1}>
                    <Skeleton variant="rounded" height={60} />
                    <Skeleton variant="rounded" height={60} />
                </Stack>
            ) : players.length === 0 ? (
                <Paper
                    data-testid="acquired-perks-empty"
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: 'divider',
                        bgcolor: 'transparent'
                    }}
                >
                    <Typography variant="body1" color="text.secondary">
                        Nenhuma vantagem adquirida ainda
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        As vantagens aparecerão aqui quando os jogadores as selecionarem
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={1}>
                    {players.map(player => (
                        <PerkPlayerAccordion
                            key={player.charsheetId}
                            player={player}
                            expanded={expandedPlayer === player.charsheetId}
                            onChange={(isExpanded) => { setExpandedPlayer(isExpanded ? player.charsheetId : false); }}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
}
