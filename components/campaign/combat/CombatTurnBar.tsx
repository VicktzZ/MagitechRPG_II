'use client';

import { Box, Chip, Typography } from '@mui/material';
import { color, font } from '@themes/tokens';
import { describeTurnsUntil } from '@utils/combat/turnOrder';
import type { ReactElement } from 'react';
import TurnOrderStrip from './TurnOrderStrip';
import { useTurnOrder } from './useTurnOrder';

/**
 * A faixa do combate do jogador: a rodada, de quem é a vez (e quando chega a dele) e a ordem de turnos em retratos. Fica no topo do painel, dentro da barra fixa, para
 * o jogador ver o combate sem rolar. Sem combate ativo não desenha nada. A frase do turno é uma região `aria-live`, então o leitor de tela avisa quando a vez muda.
 */
export default function CombatTurnBar({ viewerId, dense = false }: { viewerId?: string | null; dense?: boolean }): ReactElement | null {
    const summary = useTurnOrder(viewerId);
    if (!summary) return null;

    const initiative = summary.phase === 'INITIATIVE';
    const until = describeTurnsUntil(summary.turnsUntilViewer);
    const status = initiative ? 'Rolando iniciativa' : summary.viewerIsCurrent ? 'Sua vez' : summary.currentName ? `Vez de ${summary.currentName}` : '';

    return (
        <Box
            data-testid="combat-turn-bar"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                minWidth: 0,
                // A coluna do painel é que decide (o chat encaixado a deixa mais estreita): resumo em cima da faixa quando estreita, ao lado quando larga
                '@container (min-width: 720px)': { flexDirection: 'row', alignItems: 'center', gap: 1.5 }
            }}
        >
            <Box
                aria-live="polite"
                sx={{
                    flex: '0 0 auto',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    columnGap: 1,
                    '@container (min-width: 720px)': { flexDirection: 'column', alignItems: 'flex-start', maxWidth: 230 }
                }}
            >
                <Typography noWrap sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', lineHeight: 1.4 }}>
                    Rodada <Box component="span" sx={{ fontFamily: font.mono, color: 'text.primary' }}>{summary.round}</Box>
                </Typography>
                {summary.viewerIsCurrent ? (
                    <Chip size="small" label="Sua vez" sx={{ height: 20, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main', color: color.onAmber }} />
                ) : (
                    <Typography noWrap sx={{ fontSize: 12, lineHeight: 1.4, minWidth: 0 }}>
                        {status}
                        {until && <Box component="span" sx={{ color: 'text.secondary' }}> · você: {until.toLowerCase()}</Box>}
                    </Typography>
                )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <TurnOrderStrip items={summary.items} dense={dense} />
            </Box>
        </Box>
    );
}
