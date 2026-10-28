'use client';

import type { AppliedEffect } from '@models';
import type { CharsheetDTO } from '@models/dtos';
import { Backpack, DirectionsRun, LocalPolice, MonetizationOn } from '@mui/icons-material';
import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import useNumbersWithSpaces from '@hooks/useNumbersWithSpace';
import { getEvolutionPoints } from '@utils/spellStages';
import type { SheetMetrics } from '@utils/charsheetMetrics';
import type { VitalKey } from '@utils/vitals';
import type { ReactElement, ReactNode } from 'react';
import { useCharsheetPointsView } from '../useCharsheetPointsView';
import SheetMetricsView from '../SheetMetricsView';
import EffectStatsNotice from '../../EffectStatsNotice';
import VitalsPanel from './VitalsPanel';
import { charsheetVitalRows } from './vitalRows';
import { SHEET_WINDOW_KINDS, WINDOW_KIND_LABEL, type SheetWindowKind } from './windowKinds';

export type SummarySheet = Required<CharsheetDTO>;

const ATTRIBUTES = [
    { key: 'vig', label: 'VIG', name: 'Vigor' },
    { key: 'des', label: 'DES', name: 'Destreza' },
    { key: 'foc', label: 'FOC', name: 'Foco' },
    { key: 'log', label: 'LOG', name: 'Lógica' },
    { key: 'sab', label: 'SAB', name: 'Sabedoria' },
    { key: 'car', label: 'CAR', name: 'Carisma' }
] as const;

const SPENDABLE_POINTS = [
    { key: 'attributes', label: 'Atributos' },
    { key: 'expertises', label: 'Perícias' },
    { key: 'skills', label: 'Habilidades' },
    { key: 'magics', label: 'Magias' }
] as const;

const asNumber = (value: unknown): number => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

function Heading({ children }: { children: ReactNode }): ReactElement {
    return (
        <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
            {children}
        </Typography>
    );
}

/** O que o mestre faz com o jogador a partir do resumo (as mesmas ações do menu do cartão) */
export interface SummaryActions {
    canGrantEvolution: boolean;
    onAddItem: () => void;
    onGrantEvolution: () => void;
    onNotify: () => void;
    onRemove: () => void;
}

interface SummaryViewProps {
    charsheet: SummarySheet;
    inTurn: boolean;
    /** Efeitos aplicados ao jogador no combate ativo (vazio fora dele): mudam o máximo das barras e as estatísticas mostradas */
    effects?: readonly AppliedEffect[] | null;
    /** Overall e limite de MP por turno (o limite some onde a regra não vale) */
    metrics: SheetMetrics;
    /** A regra de estágios (e o ponto de evolução) vale para esta ficha */
    showEvolution: boolean;
    onOpenSection: (kind: SheetWindowKind) => void;
    /** Dano ou cura rápidos: variação (negativa = dano ou gasto) de um ponto vital */
    onAdjustVital: (key: VitalKey, delta: number) => void;
    actions: SummaryActions;
}

/**
 * Resumo de uma ficha para o mestre: quem é, pontos vitais (com dano e cura rápidos), atributos, bolsa e pontos para
 * gastar, mais as ações do jogador e os atalhos para as seções. O resto é só leitura; cada seção se edita na própria janela.
 */
export function SummaryView({ charsheet, inTurn, effects, metrics, showEvolution, onOpenSection, onAdjustVital, actions }: SummaryViewProps): ReactElement {
    const view = useCharsheetPointsView(charsheet);
    const spacedMoney = useNumbersWithSpaces();

    const ammo = charsheet.ammoCounter;
    const vitalRows = charsheetVitalRows(charsheet, view, effects);
    const pendingPoints = SPENDABLE_POINTS
        .map(point => ({ ...point, value: asNumber(charsheet.points?.[point.key]) }))
        .filter(point => point.value > 0);

    return (
        <Stack spacing={2.5}>
            <Box>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                    <Typography component="p" sx={{ fontFamily: font.display, fontSize: 18, fontWeight: 600 }}>
                        {charsheet.name}
                    </Typography>
                    {inTurn && <Chip label="Em turno" size="small" color="primary" />}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    ({charsheet.id})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Nv. {charsheet.level} • {charsheet.class as string} • {charsheet.lineage as unknown as string}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {[ charsheet.race, charsheet.playerName ].filter(Boolean).join(' • ')}
                </Typography>
            </Box>

            <EffectStatsNotice
                effects={effects}
                bases={{ displacement: charsheet.displacement, ap: charsheet.stats?.ap, maxLp: charsheet.stats?.maxLp, maxMp: charsheet.stats?.maxMp }}
            />

            {vitalRows.length > 0 && (
                <VitalsPanel charsheetName={charsheet.name} rows={vitalRows} onAdjust={onAdjustVital} />
            )}

            <SheetMetricsView metrics={metrics} />

            <Box>
                <Heading>Atributos</Heading>
                <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
                    {ATTRIBUTES.map(attribute => {
                        const mod = asNumber(charsheet.mods?.attributes?.[attribute.key]);
                        return (
                            <Box
                                key={attribute.key}
                                sx={{ p: 1, borderRadius: 2, bgcolor: 'background.raised', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}
                            >
                                <Typography component="dt" title={attribute.name} sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
                                    {attribute.label}
                                </Typography>
                                <Typography component="dd" sx={{ m: 0, fontFamily: font.mono, fontSize: 18 }}>
                                    {asNumber(charsheet.attributes?.[attribute.key])}
                                </Typography>
                                <Typography sx={{ fontSize: 12, fontFamily: font.mono, color: 'text.secondary' }}>
                                    mod {mod > 0 ? `+${mod}` : mod}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Box>
                <Heading>Bolsa e deslocamento</Heading>
                <Box
                    component="dl"
                    sx={{
                        m: 0,
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        columnGap: 1.5,
                        rowGap: 0.75,
                        alignItems: 'center',
                        '& dt': { display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', fontSize: 13 },
                        '& dt svg': { fontSize: 16 },
                        '& dd': { m: 0, fontFamily: font.mono, fontSize: 13, textAlign: 'right' }
                    }}
                >
                    <dt><MonetizationOn aria-hidden />Dinheiro</dt>
                    <dd>{spacedMoney(asNumber(charsheet.inventory?.money))}</dd>
                    {(asNumber(ammo?.max) > 0 || asNumber(ammo?.current) > 0) && (
                        <>
                            <dt><LocalPolice aria-hidden />Munição</dt>
                            <dd>{asNumber(ammo?.current)}/{asNumber(ammo?.max)}</dd>
                        </>
                    )}
                    <dt><Backpack aria-hidden />Carga</dt>
                    <dd>{asNumber(charsheet.capacity?.cargo)}/{asNumber(charsheet.capacity?.max)}{view.weightUnit ? ` ${view.weightUnit}` : ''}</dd>
                    <dt><DirectionsRun aria-hidden />Deslocamento</dt>
                    <dd>{asNumber(charsheet.displacement)}m</dd>
                </Box>
            </Box>

            {(pendingPoints.length > 0 || showEvolution) && (
                <Box>
                    <Heading>Pontos para gastar</Heading>
                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                        {pendingPoints.map(point => (
                            <Chip key={point.key} size="small" variant="outlined" label={`${point.label}: ${point.value}`} />
                        ))}
                        {showEvolution && (
                            <Chip size="small" variant="outlined" label={`Evolução: ${getEvolutionPoints(charsheet.points)}`} />
                        )}
                    </Stack>
                </Box>
            )}

            <Divider />

            <Box>
                <Heading>Abrir seção</Heading>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                    {SHEET_WINDOW_KINDS.filter(kind => kind !== 'summary').map(kind => (
                        <Button key={kind} variant="outlined" size="small" onClick={() => onOpenSection(kind)}>
                            {WINDOW_KIND_LABEL[kind]}
                        </Button>
                    ))}
                </Stack>
            </Box>

            <Box>
                <Heading>Ações</Heading>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                    <Button variant="outlined" size="small" onClick={actions.onAddItem}>Adicionar item</Button>
                    {actions.canGrantEvolution && (
                        <Button variant="outlined" size="small" onClick={actions.onGrantEvolution}>Conceder ponto de evolução</Button>
                    )}
                    <Button variant="outlined" size="small" onClick={actions.onNotify}>Enviar notificação</Button>
                    <Button variant="outlined" size="small" color="error" onClick={actions.onRemove}>Remover da campanha</Button>
                </Stack>
            </Box>
        </Stack>
    );
}
