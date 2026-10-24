import { Box, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import type { ReactElement } from 'react';

/** Quanto da barra preencher (0 a 100): sem máximo ou valor inválido, vazia; acima do máximo, cheia */
export function meterPercent(value: number, max: number): number {
    const safeValue = Number.isFinite(value) ? value : 0;
    const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
    return safeMax > 0 ? Math.min(100, Math.max(0, (safeValue / safeMax) * 100)) : 0;
}

interface StatMeterProps {
    /** Rótulo curto visível (LP, MP, AP ou o nome do sistema customizado) */
    label: string;
    /** Nome acessível completo, ex.: "Vida de Aria Valen" */
    ariaLabel: string;
    value: number;
    max: number;
    /** Cor da barra: um dos tokens `color.lp`, `color.mp` ou `color.ap` */
    barColor: string;
}

/**
 * Medidor de um recurso do personagem (LP, MP ou AP): rótulo, "atual/máx" em fonte mono e uma barra fina.
 * A cor é só reforço: o valor sempre aparece em texto e o `role="meter"` anuncia o nível ao leitor de tela.
 * O valor pode passar do máximo (o mestre pode dar LP/MP acima do teto): a barra para em 100% e o texto mostra o real.
 */
export default function StatMeter({ label, ariaLabel, value, max, barColor }: StatMeterProps): ReactElement {
    const safeValue = Number.isFinite(value) ? value : 0;
    const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
    const percent = meterPercent(value, max);

    return (
        <Box
            role="meter"
            aria-label={ariaLabel}
            aria-valuemin={0}
            aria-valuemax={safeMax}
            aria-valuenow={Math.min(Math.max(safeValue, 0), safeMax)}
            aria-valuetext={`${safeValue} de ${safeMax}`}
            sx={{ width: '100%' }}
        >
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', letterSpacing: '0.04em' }}>
                    {label}
                </Typography>
                <Typography component="span" sx={{ fontSize: 13, fontFamily: font.mono, color: 'text.primary' }}>
                    {safeValue}/{safeMax}
                </Typography>
            </Box>
            <Box sx={{ height: 6, borderRadius: 1, bgcolor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ width: `${percent}%`, height: '100%', bgcolor: barColor }} />
            </Box>
        </Box>
    );
}
