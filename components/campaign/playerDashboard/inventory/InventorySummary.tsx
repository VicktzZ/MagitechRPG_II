import { CheckCircleOutline, ErrorOutline, WarningAmber } from '@mui/icons-material';
import { Box, LinearProgress, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import type { ReactElement } from 'react';
import type { CapacityState } from './inventoryList';
import { entryWeight } from './inventoryList';
import type { InventoryEntry, InventoryItemType } from './inventoryTypes';
import { formatWeight, getItemTypeConfig } from './itemTypeConfig';

interface InventorySummaryProps {
    totalItems: number;
    counts: Record<InventoryItemType, number>;
    totalWeight: number;
    /** Capacidade máxima da ficha (`capacity.max`) */
    maxCapacity: number;
    weightUnitSuffix: string;
    capacity: { percent: number; state: CapacityState };
    /** Pontos de armadura que as armaduras dão (some quando não há armadura) */
    armorAp: number;
    /** Os itens mais pesados, para sugerir o que largar quando a mochila está cheia */
    heaviest: InventoryEntry[];
    /** O que o Sobrepeso tira das perícias de DES e VIG (negativo; 0 ou ausente = sem Sobrepeso, ou sistema customizado) */
    overweightPenalty?: number;
}

const STATE = {
    ok: { role: 'success', label: 'Dentro da capacidade', Icon: CheckCircleOutline },
    near: { role: 'warning', label: 'Perto do limite', Icon: WarningAmber },
    over: { role: 'error', label: 'Sobrecarga', Icon: ErrorOutline }
} as const;

const TYPES: InventoryItemType[] = [ 'weapon', 'armor', 'item' ];

/** Resumo do inventário: peso carregado contra a capacidade (com o estado por extenso, não só pela cor), contagem por tipo e o que largar se estiver cheio */
export default function InventorySummary({ totalItems, counts, totalWeight, maxCapacity, weightUnitSuffix, capacity, armorAp, heaviest, overweightPenalty = 0 }: InventorySummaryProps): ReactElement {
    const { role, label, Icon } = STATE[capacity.state];
    const excess = totalWeight - maxCapacity;

    return (
        <Box
            data-testid="inventory-summary"
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'background.raised',
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                        Capacidade
                    </Typography>
                    <Box data-testid="capacity-state" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: `${role}.light` }}>
                        <Icon sx={{ fontSize: 16 }} />
                        <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>{label}</Typography>
                    </Box>
                </Box>
                <Typography sx={{ fontFamily: font.mono, fontSize: 22, lineHeight: 1.3 }} data-testid="capacity-weight">
                    {formatWeight(totalWeight, '')}{' '}
                    <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary', fontFamily: font.mono }}>
                        {`/ ${formatWeight(maxCapacity, weightUnitSuffix)}`}
                    </Typography>
                </Typography>
                <LinearProgress
                    variant="determinate"
                    role="meter"
                    aria-label="Peso carregado"
                    aria-valuemin={0}
                    aria-valuemax={maxCapacity}
                    aria-valuenow={Math.round(totalWeight * 10) / 10}
                    value={Math.min(capacity.percent, 100)}
                    sx={{ mt: 1, height: 8, borderRadius: 1, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: `${role}.main`, borderRadius: 1 } }}
                />
                {capacity.state === 'over' && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'error.light' }} data-testid="capacity-excess">
                        {`${formatWeight(excess, weightUnitSuffix)} acima da capacidade`}
                    </Typography>
                )}
                {overweightPenalty < 0 && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'warning.light' }} data-testid="capacity-overweight">
                        {`Sobrepeso: ${overweightPenalty} no modificador das perícias de DES e VIG`}
                    </Typography>
                )}
                {capacity.state !== 'ok' && heaviest.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }} data-testid="capacity-hint">
                        {`Para aliviar: ${heaviest.map(entry => `${entry.item.name} (${formatWeight(entryWeight(entry), weightUnitSuffix)})`).join(', ')}`}
                    </Typography>
                )}
            </Box>

            <Box
                role="group"
                aria-label={`${totalItems} ${totalItems === 1 ? 'item' : 'itens'} no inventário`}
                sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', alignItems: 'start', gap: 1.5 }}
            >
                {TYPES.map(type => {
                    const config = getItemTypeConfig(type);
                    const Glyph = config.icon;
                    return (
                        <Box key={type} data-testid={`inventory-count-${type}`}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <Glyph aria-hidden sx={{ fontSize: 16 }} />
                                <Typography component="span" sx={{ fontSize: 12, fontWeight: 600 }}>{config.plural}</Typography>
                            </Box>
                            <Typography sx={{ fontFamily: font.mono, fontSize: 22, lineHeight: 1.3 }}>{counts[type]}</Typography>
                            {type === 'armor' && armorAp > 0 && (
                                <Typography variant="caption" color="text.secondary" data-testid="inventory-armor-ap">{`+${armorAp} AP`}</Typography>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
