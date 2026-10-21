import { useCampaignContext } from '@contexts';
import type { Charsheet } from '@models/entities';
import { CardGiftcard } from '@mui/icons-material';
import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { type ReactElement, useState } from 'react';
import Section from '../../Section';
import PerkPlayerAccordion from './PerkPlayerAccordion';
import { usePlayersWithPerks } from './usePlayersWithPerks';

interface PerksSectionProps {
    playerCharsheets: Charsheet[];
    /** Há jogadores na campanha, mas as fichas ainda não chegaram */
    pending: boolean;
}

/**
 * Seção de Vantagens Adquiridas — visível no Roguelite (sempre) ou
 * em qualquer modo quando algum jogador já recebeu vantagens
 */
export default function PerksSection({ playerCharsheets, pending }: PerksSectionProps): ReactElement | null {
    const { campaign } = useCampaignContext();
    const [ expandedPlayer, setExpandedPlayer ] = useState<string | false>(false);
    const playersWithPerks = usePlayersWithPerks(playerCharsheets);

    if (campaign.mode !== 'Roguelite' && playersWithPerks.length === 0) return null;

    return (
        <Section
            title="Vantagens adquiridas"
            icon={<CardGiftcard sx={{ color: 'text.secondary' }} />}
        >
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Vantagens obtidas por cada jogador nesta campanha
                </Typography>
                
                {pending ? (
                    <Stack spacing={1}>
                        <Skeleton variant="rounded" height={60} />
                        <Skeleton variant="rounded" height={60} />
                    </Stack>
                ) : playersWithPerks.length === 0 ? (
                    <Paper 
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
                        {playersWithPerks.map(player => (
                            <PerkPlayerAccordion
                                key={player.charsheetId}
                                player={player}
                                expanded={expandedPlayer === player.charsheetId}
                                onChange={(isExpanded) => setExpandedPlayer(isExpanded ? player.charsheetId : false)}
                            />
                        ))}
                    </Stack>
                )}
            </Box>
        </Section>
    );
}
