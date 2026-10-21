import type { CharsheetDTO } from '@models/dtos';
import type { Charsheet } from '@models/entities';
import { People } from '@mui/icons-material';
import { Box, Paper, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import Section from '../../Section';
import PlayerCard from '../PlayerCard';

interface PlayersSectionProps {
    playerCharsheets: Charsheet[];
    /** Há jogadores na campanha, mas as fichas ainda não chegaram */
    pending: boolean;
}

/** Lista de jogadores da campanha: um cartão por ficha, com estado de carregamento e de lista vazia */
export default function PlayersSection({ playerCharsheets, pending }: PlayersSectionProps): ReactElement {
    return (
        <Section 
            title="Jogadores da campanha" 
            icon={<People sx={{ color: 'text.secondary' }} />}
        >
            <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {playerCharsheets?.length || 0} ficha{(playerCharsheets?.length || 0) !== 1 ? 's' : ''} ativa{(playerCharsheets?.length || 0) !== 1 ? 's' : ''}
                </Typography>
                
                {pending ? (
                    <Stack spacing={2}>
                        <Skeleton variant="rounded" height={140} />
                        <Skeleton variant="rounded" height={140} />
                        <Skeleton variant="rounded" height={140} />
                    </Stack>
                ) : (!playerCharsheets || playerCharsheets.length === 0) ? (
                    <Paper 
                        sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            border: '2px dashed',
                            borderColor: 'divider',
                            bgcolor: 'transparent'
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            Nenhum jogador encontrado
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Os jogadores da campanha aparecerão aqui quando se juntarem.
                        </Typography>
                    </Paper>
                ) : (
                    <Box 
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                lg: 'repeat(3, 1fr)'
                            },
                            gap: 3
                        }}
                    >
                        {playerCharsheets.map(charsheet => (
                            <PlayerCard
                                key={charsheet.id}
                                charsheet={charsheet as unknown as Required<CharsheetDTO>}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Section>
    );
}
