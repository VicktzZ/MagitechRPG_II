'use client';

import { alpha, Box, Tooltip, Typography } from '@mui/material';
import { color, font } from '@themes/tokens';
import type { TurnOrderItem } from '@utils/combat/turnOrder';
import { useEffect, useRef, type ReactElement } from 'react';

interface TurnOrderStripProps {
    items: readonly TurnOrderItem[];
    /** Menos espaço (a barra fixa do jogador): retratos e nomes menores */
    dense?: boolean;
}

const prefersReducedMotion = (): boolean => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A cor da barra de LP: verde, laranja, vermelho (os mesmos tokens da barra de vida da ficha) */
const lpColor = (percent: number): string => (percent > 50 ? color.success : percent > 25 ? color.warning : color.lp);

function describe(item: TurnOrderItem): string {
    return [
        item.name,
        item.initiative !== null ? `iniciativa ${item.initiative}` : null,
        item.lp ? `LP ${item.lp.current}/${item.lp.max}` : null,
        item.effects.length > 0 ? `efeitos: ${item.effects.join(', ')}` : null,
        item.isCurrent ? 'tem a vez' : null,
        item.hasActed ? 'já agiu nesta rodada' : null,
        item.isViewer ? 'é você' : null
    ].filter(Boolean).join(', ');
}

/**
 * A faixa de retratos da ordem de turnos (a do jogador fica na barra fixa; a do mestre vem depois). Um retrato por combatente, na ordem de ação: quem tem a vez ganha o filete
 * âmbar, quem já agiu na rodada fica esmaecido e quem está vendo leva "você". A vida só aparece onde se mostra (jogadores; criaturas se o mestre deixou). A faixa rola sozinha até
 * o turno atual quando ele muda.
 */
export default function TurnOrderStrip({ items, dense = false }: TurnOrderStripProps): ReactElement {
    const listRef = useRef<HTMLDivElement>(null);
    const currentId = items.find(item => item.isCurrent)?.id;

    useEffect(() => {
        const list = listRef.current;
        if (!list || !currentId) return;
        const target = list.querySelector<HTMLElement>('[data-current="true"]');
        if (!target) return;
        // Rola só a faixa (scrollIntoView mexeria também na página)
        list.scrollTo({ left: Math.max(0, target.offsetLeft - (list.clientWidth - target.clientWidth) / 2), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }, [ currentId ]);

    const portrait = dense ? 24 : 30;

    return (
        <Box
            ref={listRef}
            role="list"
            aria-label="Ordem de turnos"
            data-testid="turn-order"
            sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', py: 0.25, scrollbarWidth: 'thin', minWidth: 0 }}
        >
            {items.map(item => (
                <Tooltip key={item.id} title={describe(item)} arrow placement="bottom">
                    <Box
                        role="listitem"
                        aria-current={item.isCurrent ? 'step' : undefined}
                        data-testid={`turn-order-${item.id}`}
                        data-current={item.isCurrent ? 'true' : undefined}
                        sx={{
                            flex: '0 0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            minWidth: 0,
                            maxWidth: dense ? 132 : 164,
                            px: 0.75,
                            py: 0.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: item.isCurrent ? 'primary.main' : 'divider',
                            borderLeftWidth: item.isCurrent ? 3 : 1,
                            bgcolor: item.isCurrent ? color.amberSubtle : 'background.raised',
                            opacity: item.hasActed && !item.isCurrent ? 0.6 : 1
                        }}
                    >
                        <Box
                            aria-hidden
                            sx={{
                                flex: '0 0 auto',
                                width: portrait,
                                height: portrait,
                                borderRadius: '50%',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: font.mono,
                                color: item.type === 'player' ? 'text.primary' : 'warning.light',
                                bgcolor: item.type === 'player' ? 'background.paper' : alpha(color.warning, 0.14),
                                border: '1px solid',
                                borderColor: item.type === 'player' ? 'divider' : 'warning.main',
                                overflow: 'hidden',
                                ...(item.avatar ? { backgroundImage: `url(${item.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {})
                            }}
                        >
                            {item.initials}
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography noWrap sx={{ fontSize: 12, fontWeight: item.isCurrent ? 700 : 500, lineHeight: 1.3 }}>
                                {item.name}
                            </Typography>
                            <Typography noWrap sx={{ fontSize: 12, lineHeight: 1.3, color: item.isViewer ? 'primary.light' : 'text.secondary', fontFamily: font.mono }}>
                                {item.initiative !== null ? item.initiative : '-'}
                                {item.isViewer ? ' · você' : ''}
                                {item.hasActed ? ' · agiu' : ''}
                            </Typography>
                            {item.lp && (
                                <Box
                                    role="meter"
                                    aria-label={`LP de ${item.name}`}
                                    aria-valuemin={0}
                                    aria-valuemax={item.lp.max}
                                    aria-valuenow={item.lp.current}
                                    sx={{ height: 3, mt: 0.25, bgcolor: 'divider', borderRadius: '2px', overflow: 'hidden' }}
                                >
                                    <Box sx={{ height: '100%', width: `${item.lp.percent}%`, bgcolor: lpColor(item.lp.percent) }} />
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Tooltip>
            ))}
        </Box>
    );
}
