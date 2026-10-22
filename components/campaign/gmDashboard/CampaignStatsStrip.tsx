import { Chip, Paper, Skeleton, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import type { ReactElement, ReactNode } from 'react';

interface CampaignStatsStripProps {
    totalPlayers: number;
    averageLevel: number;
    highestLevel: number;
    /** Rodada do combate ativo; sem combate ativo fica indefinido e o chip não aparece */
    combatRound?: number;
    /** Fichas ainda chegando: mostra um esqueleto da faixa */
    loading?: boolean;
}

/** Número da faixa: fonte mono na cor do texto principal (sem cor por métrica) */
function Num({ children }: { children: ReactNode }): ReactElement {
    return <Typography component="span" sx={{ fontFamily: font.mono, color: 'text.primary', fontWeight: 500 }}>{children}</Typography>;
}

/** Trecho que nunca quebra no meio: a linha só quebra entre um trecho e outro */
function Segment({ children }: { children: ReactNode }): ReactElement {
    return <Typography component="span" sx={{ whiteSpace: 'nowrap' }}>{children}</Typography>;
}

/**
 * Faixa compacta com o resumo da campanha para o mestre: jogadores, nível médio e maior nível,
 * mais o chip do combate quando há um ativo. Substitui a antiga seção grande de estatísticas.
 */
export default function CampaignStatsStrip({ totalPlayers, averageLevel, highestLevel, combatRound, loading = false }: CampaignStatsStripProps): ReactElement {
    if (loading) return <Skeleton variant="rounded" height={52} />;

    const hasLevels = highestLevel > 0;

    return (
        <Paper
            variant="outlined"
            role="group"
            aria-label="Resumo da campanha"
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                columnGap: 2,
                rowGap: 1,
                px: 2,
                py: 1.5,
                bgcolor: 'background.raised',
                borderRadius: 2
            }}
        >
            <Typography variant="body2" color="text.secondary" component="p" sx={{ m: 0 }}>
                <Segment><Num>{totalPlayers}</Num> {totalPlayers === 1 ? 'jogador' : 'jogadores'}{hasLevels ? ' ·' : ''}</Segment>
                {hasLevels && (
                    <>
                        {' '}
                        <Segment>nível médio <Num>{averageLevel}</Num> ·</Segment>
                        {' '}
                        <Segment>maior nível <Num>{highestLevel}</Num></Segment>
                    </>
                )}
            </Typography>
            {combatRound !== undefined && (
                <Chip
                    label={`Combate · R${combatRound}`}
                    size="small"
                    sx={{ bgcolor: 'error.main', color: 'error.contrastText', fontWeight: 600 }}
                />
            )}
        </Paper>
    );
}
