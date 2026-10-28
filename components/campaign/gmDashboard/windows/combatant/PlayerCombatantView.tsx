'use client';

import type { Combatant, Expertise } from '@models';
import { Edit, RestartAlt } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { combatantBudget } from '@utils/combat/actionBudgets';
import type { ActionSlot } from '@utils/combat/engine/actionBudget';
import type { SheetMetrics } from '@utils/charsheetMetrics';
import { filterAndSortExpertises } from '@utils/expertiseList';
import type { VitalKey } from '@utils/vitals';
import type { ReactElement, ReactNode } from 'react';
import ActionPips from '../../../ActionPips';
import ExpertiseListControls, { ExpertiseNoResults, useExpertiseListState } from '../../../ExpertiseListControls';
import CreatureExpertiseButton from '../../dashboard/CreatureExpertiseButton';
import { useCharsheetPointsView } from '../../useCharsheetPointsView';
import VitalsPanel from '../VitalsPanel';
import { charsheetVitalRows } from '../vitalRows';
import { SHEET_WINDOW_KINDS, WINDOW_KIND_LABEL, type SheetWindowKind } from '../windowKinds';
import type { SummarySheet } from '../SummaryView';

function Heading({ children }: { children: ReactNode }): ReactElement {
    return (
        <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
            {children}
        </Typography>
    );
}

interface PlayerCombatantViewProps {
    charsheet: SummarySheet;
    /** O combatente do jogador (guarda as ações da rodada, o MP gasto e os efeitos aplicados) */
    combatant: Combatant;
    inTurn: boolean;
    imageUrl?: string;
    /** Limite de MP por turno e MP gasto na rodada (o limite some onde a regra não vale) */
    metrics: SheetMetrics;
    /** Dano ou cura rápidos: variação (negativa = dano ou gasto) de um ponto vital da ficha */
    onAdjustVital: (key: VitalKey, delta: number) => void;
    /** O mestre gasta ou devolve uma ação da rodada */
    onToggleAction: (slot: ActionSlot, available: boolean) => void;
    onSetMpSpent: () => void;
    onResetMpLimit: () => void;
    onApplyEffect: () => void;
    onOpenSection: (kind: SheetWindowKind) => void;
    /** O mestre rola a perícia pelo jogador (resultado no chat) */
    onRollExpertise: (name: string) => void;
}

/** "Atordoamento (nível 2, 3 turnos)": o efeito aplicado, com o nível e quanto falta */
function describeEffect(effect: NonNullable<Combatant['effects']>[number]): string {
    const name = effect.snapshot?.name ?? 'Efeito';
    if (effect.sustained) return `${name} (mantida)`;
    const duration = effect.indefinite ? 'indefinido' : `${effect.remaining} turno${effect.remaining === 1 ? '' : 's'}`;
    return `${name} (nível ${effect.level}, ${duration})`;
}

/**
 * Um jogador que está no combate agora, na janela "Em combate" (a mesma das criaturas): de quem é a vez, pontos vitais da ficha com dano e cura rápidos, as
 * ações da rodada, o limite de MP por turno, os efeitos aplicados e as perícias, que o mestre rola pelo jogador. A ficha inteira abre pelos atalhos de seção.
 */
export function PlayerCombatantView({
    charsheet, combatant, inTurn, imageUrl, metrics, onAdjustVital, onToggleAction, onSetMpSpent, onResetMpLimit, onApplyEffect, onOpenSection, onRollExpertise
}: PlayerCombatantViewProps): ReactElement {
    const view = useCharsheetPointsView(charsheet);
    const list = useExpertiseListState();
    const vitalRows = charsheetVitalRows(charsheet, view);
    const expertises = Object.entries((charsheet.expertises ?? {}) as unknown as Record<string, Expertise>);
    const visibleExpertises = filterAndSortExpertises(expertises, { query: list.query, sort: list.sort, nameOf: ([ expertiseName ]) => expertiseName, valueOf: ([ , expertise ]) => Number(expertise?.value) || 0 });
    const effects = Array.isArray(combatant.effects) ? combatant.effects : [];
    const mpLimit = metrics.mpLimit ?? 0;
    const mpSpent = metrics.mpSpent ?? combatant.mpSpentThisTurn ?? 0;
    const mpReleased = Boolean(combatant.mpLimitOverride);

    return (
        <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar src={imageUrl || undefined} alt="" sx={{ width: 48, height: 48 }}>
                    {charsheet.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                        <Typography component="p" sx={{ fontFamily: font.display, fontSize: 18, fontWeight: 600 }}>
                            {charsheet.name}
                        </Typography>
                        {inTurn && <Chip label="Em turno" size="small" color="primary" />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Nv. {charsheet.level} • {String(charsheet.class ?? '')}{charsheet.playerName ? ` • ${charsheet.playerName}` : ''}
                    </Typography>
                </Box>
            </Box>

            {vitalRows.length > 0 && <VitalsPanel charsheetName={charsheet.name} rows={vitalRows} onAdjust={onAdjustVital} />}

            <Box>
                <Heading>Ações da rodada</Heading>
                <ActionPips budget={combatantBudget(combatant)} onSelect={onToggleAction} />
            </Box>

            {metrics.mpLimit !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }} data-testid="player-mp-limit">
                    <Typography variant="body2" color="text.secondary">Limite de MP nesta rodada</Typography>
                    <Chip
                        size="small"
                        label={`${mpSpent} / ${mpLimit}${mpReleased ? ' (liberado)' : ''}`}
                        color={mpReleased ? 'success' : mpSpent >= mpLimit ? 'error' : 'info'}
                        sx={{ fontFamily: font.mono, fontWeight: 700 }}
                    />
                    <Button size="small" variant="outlined" startIcon={<Edit fontSize="small" />} onClick={onSetMpSpent} sx={{ textTransform: 'none' }}>
                        Definir gasto
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<RestartAlt fontSize="small" />} onClick={onResetMpLimit} sx={{ textTransform: 'none' }}>
                        Resetar limite
                    </Button>
                </Box>
            )}

            <Box>
                <Heading>Efeitos</Heading>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} alignItems="center">
                    {effects.length === 0 && <Typography variant="body2" color="text.secondary">Nenhum efeito aplicado.</Typography>}
                    {effects.map(effect => (
                        <Chip key={effect.id} size="small" variant="outlined" label={describeEffect(effect)} data-testid="player-effect" />
                    ))}
                    <Button size="small" variant="outlined" onClick={onApplyEffect} sx={{ textTransform: 'none' }}>Aplicar efeito</Button>
                </Stack>
            </Box>

            <Box>
                <Heading>Perícias</Heading>
                {expertises.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Esta ficha não possui perícias.</Typography>
                ) : (
                    <Stack spacing={1.5}>
                        <ExpertiseListControls state={list} shown={visibleExpertises.length} total={expertises.length} />
                        {visibleExpertises.length === 0 ? (
                            <ExpertiseNoResults query={list.query} onClear={() => { list.setQuery('') }} />
                        ) : (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 1.5 }}>
                                {visibleExpertises.map(([ expertiseName, expertise ]) => (
                                    <CreatureExpertiseButton
                                        key={`${combatant.id}-${expertiseName}`}
                                        name={expertiseName}
                                        expertise={{ ...expertise, value: Number(expertise?.value) || 0 }}
                                        onRoll={async () => { onRollExpertise(expertiseName); }}
                                    />
                                ))}
                            </Box>
                        )}
                    </Stack>
                )}
            </Box>

            <Divider />

            <Box>
                <Heading>Abrir ficha</Heading>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                    {SHEET_WINDOW_KINDS.map(kind => (
                        <Button key={kind} variant="outlined" size="small" onClick={() => onOpenSection(kind)}>
                            {WINDOW_KIND_LABEL[kind]}
                        </Button>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
}
