'use client';

import type { Combatant, Creature, Expertise } from '@models';
import { Pets } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Stack, Typography, alpha } from '@mui/material';
import { color, font } from '@themes/tokens';
import { combatantVitals, type CombatantVitalKey } from '@utils/combatantVitals';
import { filterAndSortExpertises } from '@utils/expertiseList';
import type { ReactElement, ReactNode } from 'react';
import ExpertiseListControls, { ExpertiseNoResults, useExpertiseListState } from '../../../ExpertiseListControls';
import CreatureExpertiseButton from '../../dashboard/CreatureExpertiseButton';
import VitalsPanel, { type VitalRow } from '../VitalsPanel';

function Heading({ children }: { children: ReactNode }): ReactElement {
    return (
        <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
            {children}
        </Typography>
    );
}

interface CombatantViewProps {
    combatant: Combatant;
    /** A criatura personalizada que o combatente representa; sem ela (foi excluída) só dá para ver o estado no combate */
    creature: Creature | null;
    inTurn: boolean;
    /** Dano ou cura rápidos: variação (negativa = dano ou gasto) de vida ou mana */
    onAdjustVital: (key: CombatantVitalKey, delta: number) => void;
    onRollExpertise: (name: string, expertise: Expertise) => Promise<void>;
    /** Abre a ficha da criatura (a janela "Criatura") */
    onOpenCreature?: () => void;
}

/**
 * Uma criatura que está no combate agora: de quem é a vez, vida e mana atuais (com dano e cura rápidos) e as perícias, que o
 * mestre rola pela criatura (resultado no chat). Os valores vêm do combatente, que é onde o combate guarda o que mudou durante a luta.
 */
export function CombatantView({ combatant, creature, inTurn, onAdjustVital, onRollExpertise, onOpenCreature }: CombatantViewProps): ReactElement {
    const expertises: Array<[ string, Expertise ]> = Object.entries(creature?.expertises ?? {});
    const list = useExpertiseListState();
    const visibleExpertises = filterAndSortExpertises(expertises, { query: list.query, sort: list.sort, nameOf: ([ expertiseName ]) => expertiseName, valueOf: ([ , expertise ]) => expertise.value });
    const { lp, maxLp, mp, maxMp } = combatantVitals(combatant, creature);
    const name = combatant.name || creature?.name || 'Criatura';

    const vitalRows: VitalRow[] = [ { key: 'lp', label: 'LP', name: 'Vida', value: lp, max: maxLp, barColor: color.lp } ];
    if (maxMp > 0) vitalRows.push({ key: 'mp', label: 'MP', name: 'Mana', value: mp, max: maxMp, barColor: color.mp });

    return (
        <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                    src={creature?.imageUrl || undefined}
                    alt=""
                    sx={{ width: 48, height: 48, bgcolor: theme => alpha(theme.palette.warning.main, inTurn ? 0.28 : 0.14), color: 'warning.main' }}
                >
                    <Pets />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                        <Typography component="p" sx={{ fontFamily: font.display, fontSize: 18, fontWeight: 600 }}>
                            {name}
                        </Typography>
                        {inTurn && <Chip label="Em turno" size="small" color="primary" />}
                    </Stack>
                    {creature && (
                        <Typography variant="body2" color="text.secondary">
                            Nv. {creature.level}{creature.type ? ` • ${creature.type}` : ''}
                        </Typography>
                    )}
                </Box>
            </Box>

            <VitalsPanel
                charsheetName={name}
                rows={vitalRows}
                onAdjust={(key, delta) => { if (key === 'lp' || key === 'mp') onAdjustVital(key, delta); }}
            />

            <Box>
                <Heading>Perícias</Heading>
                {!creature ? (
                    <Typography variant="body2" color="text.secondary">
                        A criatura que deu origem a este combatente não está mais na campanha, então não há perícias para rolar.
                    </Typography>
                ) : expertises.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Esta criatura não possui perícias configuradas.</Typography>
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
                                        expertise={expertise}
                                        onRoll={async () => await onRollExpertise(expertiseName, expertise)}
                                    />
                                ))}
                            </Box>
                        )}
                    </Stack>
                )}
            </Box>

            {creature && onOpenCreature && (
                <Box>
                    <Button variant="outlined" size="small" onClick={onOpenCreature}>Ver ficha da criatura</Button>
                </Box>
            )}
        </Stack>
    );
}
