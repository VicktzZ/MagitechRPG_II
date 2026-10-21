'use client';

import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import { color as tokenColor, font } from '@themes/tokens';
import { useEffect, useState, type ReactElement } from 'react';
import { usePlayerVitals } from './usePlayerVitals';

export interface PlayerSectionLink {
    id: string;
    label: string;
}

/** O elemento está (em parte) na tela? Sem elemento, conta como visível (nada a mostrar). */
function useElementVisible(element: HTMLElement | null): boolean {
    const [ visible, setVisible ] = useState(true);

    useEffect(() => {
        if (!element) return;
        const observer = new IntersectionObserver(([ entry ]) => { setVisible(entry.isIntersecting); });
        observer.observe(element);
        return () => { observer.disconnect(); };
    }, [ element ]);

    return visible;
}

/** A seção da lista que está no topo da leitura (a última cujo título já passou da barra fixa) */
function useActiveSection(ids: string[]): string | undefined {
    const [ activeId, setActiveId ] = useState<string>();
    const key = ids.join('|');

    useEffect(() => {
        const visible = new Set<string>();
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) visible.add(entry.target.id);
                else visible.delete(entry.target.id);
            }
            // Das que estão na faixa de leitura, a mais baixa da lista (a que o jogador acabou de alcançar)
            setActiveId([ ...ids ].reverse().find(id => visible.has(id)));
        }, { rootMargin: '-120px 0px -55% 0px' });

        for (const id of ids) {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        }
        return () => { observer.disconnect(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ key ]);

    return activeId;
}

const scrollBehavior = (): ScrollBehavior =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

/**
 * Barra que acompanha o jogador na rolagem: os pontos de vida, mana e armadura (só quando o cabeçalho com os
 * controles saiu da tela; tocar leva até ele) e os atalhos para cada seção da ficha.
 */
export default function PlayerStickyBar({ headerElement, sections }: { headerElement: HTMLElement | null; sections: PlayerSectionLink[] }): ReactElement {
    const { charsheet, vitals } = usePlayerVitals();
    const headerVisible = useElementVisible(headerElement);
    const activeId = useActiveSection(sections.map(section => section.id));

    return (
        <Box
            component="nav"
            aria-label="Seções da ficha"
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 5,
                py: 1,
                bgcolor: 'background.default',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            {!headerVisible && vitals.length > 0 && (
                <ButtonBase
                    onClick={() => { headerElement?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }); }}
                    aria-label="Ir para os pontos de vida, mana e armadura"
                    sx={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: { xs: 1.5, sm: 3 },
                        px: 1.5,
                        py: 1,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: 'background.raised',
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: 'left'
                    }}
                >
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600, minWidth: 0, flex: '0 1 160px', display: { xs: 'none', sm: 'block' } }}>
                        {charsheet.name}
                    </Typography>
                    {vitals.map(vital => (
                        <Box
                            key={vital.key}
                            role="meter"
                            aria-label={vital.label}
                            aria-valuemin={0}
                            aria-valuemax={vital.max}
                            aria-valuenow={vital.current}
                            sx={{ flex: 1, minWidth: 0 }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={0.5}>
                                <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{vital.shortLabel}</Typography>
                                <Typography component="span" sx={{ fontSize: 12, fontFamily: font.mono, fontWeight: 700 }}>{vital.current}/{vital.max}</Typography>
                            </Stack>
                            <Box sx={{ height: 4, mt: 0.5, bgcolor: 'divider', borderRadius: '2px', overflow: 'hidden' }}>
                                <Box
                                    sx={{
                                        height: '100%',
                                        width: `${Math.min((vital.current / Math.max(vital.max, 1)) * 100, 100)}%`,
                                        bgcolor: vital.current > vital.max ? tokenColor.amber : vital.color
                                    }}
                                />
                            </Box>
                        </Box>
                    ))}
                </ButtonBase>
            )}

            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5, scrollbarWidth: 'thin' }}>
                {sections.map(section => (
                    <Chip
                        key={section.id}
                        label={section.label}
                        clickable
                        component="a"
                        href={`#${section.id}`}
                        onClick={(event: React.MouseEvent) => {
                            event.preventDefault();
                            document.getElementById(section.id)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
                        }}
                        aria-current={activeId === section.id ? 'true' : undefined}
                        variant={activeId === section.id ? 'filled' : 'outlined'}
                        color={activeId === section.id ? 'primary' : 'default'}
                        sx={{ flexShrink: 0 }}
                    />
                ))}
            </Stack>
        </Box>
    );
}
