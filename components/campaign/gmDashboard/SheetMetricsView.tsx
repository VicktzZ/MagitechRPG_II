import { HourglassTop, Leaderboard } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import type { SheetMetrics } from '@utils/charsheetMetrics';
import type { ReactElement } from 'react';

const OVERALL_HINT = 'Overall: soma dos atributos, dos valores de perícia e do nível';
const MP_LIMIT_HINT = 'Limite de MP por turno: o máximo que o personagem gasta em magias entre o início do seu turno e o início do próximo';

interface SheetMetricsViewProps {
    metrics: SheetMetrics;
    /** `tiles`: dois blocos lado a lado (resumo e aba Informações); `inline`: linha compacta de ícone e número (cartão do jogador) */
    variant?: 'tiles' | 'inline';
}

/** "3/8" em combate (gasto neste turno e limite) e só "8" fora dele */
const formatMpLimit = ({ mpLimit, mpSpent }: SheetMetrics): string => (mpSpent === null ? String(mpLimit) : `${mpSpent}/${mpLimit}`);

const mpLimitLabel = ({ mpLimit, mpSpent }: SheetMetrics): string =>
    mpSpent === null ? `Limite de MP por turno: ${mpLimit}` : `Limite de MP por turno: gastou ${mpSpent} de ${mpLimit} neste turno`;

/**
 * Overall da ficha e limite de MP por turno, para o mestre ver sem abrir a ficha. O limite some onde a regra não vale
 * (Roguelite, sistema customizado); o Overall sempre aparece.
 */
export default function SheetMetricsView({ metrics, variant = 'tiles' }: SheetMetricsViewProps): ReactElement {
    const hasMpLimit = metrics.mpLimit !== null;

    if (variant === 'inline') {
        return (
            <>
                <Box className="stat" title={OVERALL_HINT}>
                    <Leaderboard aria-hidden />
                    <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>Overall:</Box>
                    <Typography component="span" className="value">{metrics.overall}</Typography>
                </Box>
                {hasMpLimit && (
                    <Box className="stat" title={MP_LIMIT_HINT}>
                        <HourglassTop aria-hidden />
                        <Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{mpLimitLabel(metrics)}</Box>
                        <Typography component="span" className="value" aria-hidden>{formatMpLimit(metrics)} MP</Typography>
                    </Box>
                )}
            </>
        );
    }

    return (
        <Box
            data-testid="sheet-metrics"
            sx={{ display: 'grid', gridTemplateColumns: hasMpLimit ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: 1 }}
        >
            <Box
                title={OVERALL_HINT}
                sx={{ p: 1.25, borderRadius: 2, bgcolor: 'background.raised', border: '1px solid', borderColor: 'divider' }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                    <Leaderboard aria-hidden sx={{ fontSize: 16 }} />
                    <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>Overall</Typography>
                </Box>
                <Typography sx={{ fontFamily: font.mono, fontSize: 20, color: 'primary.main', lineHeight: 1.3 }}>{metrics.overall}</Typography>
            </Box>

            {hasMpLimit && (
                <Box
                    role="group"
                    title={MP_LIMIT_HINT}
                    aria-label={mpLimitLabel(metrics)}
                    sx={{ p: 1.25, borderRadius: 2, bgcolor: 'background.raised', border: '1px solid', borderColor: 'divider' }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
                        <HourglassTop aria-hidden sx={{ fontSize: 16 }} />
                        <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>MP por turno</Typography>
                    </Box>
                    <Typography sx={{ fontFamily: font.mono, fontSize: 20, color: 'info.light', lineHeight: 1.3 }}>
                        {formatMpLimit(metrics)}
                        {metrics.mpSpent !== null && (
                            <Typography component="span" sx={{ ml: 0.75, fontSize: 12, color: 'text.secondary', fontFamily: font.text }}>gasto / limite</Typography>
                        )}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
