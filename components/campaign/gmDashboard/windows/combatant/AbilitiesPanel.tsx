'use client';

import type { Combatant } from '@models';
import { Bolt } from '@mui/icons-material';
import { Box, Button, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { describeLimits, limitStatuses, ownedPassives, readAbilityDayUses, type PassiveContext } from '@utils/combat/passives';
import { hasStealthEffect } from '@utils/combat/stealth';
import { passiveModifiers } from '@utils/combat/passives';
import type { ReactElement } from 'react';

interface AbilitiesPanelProps {
    /** A ficha do jogador (habilidades liberadas, usos por dia, LP e maestria) */
    charsheet: PassiveContext['sheet'] & { abilityUses?: unknown };
    combatant: Combatant;
    /** O mestre renova os usos por dia (descanso) deste jogador */
    onRest: () => void;
}

/**
 * As habilidades de classe e subclasse do jogador que o app trata sozinho (`utils/combat/passives`): as automáticas, com o estado de agora (a condição vale ou não), e as ativadas, com os
 * usos que sobram por dia e neste combate. O mestre renova os usos por dia aqui. As habilidades que são só texto não aparecem: ficam na janela de habilidades da ficha.
 */
export default function AbilitiesPanel({ charsheet, combatant, onRest }: AbilitiesPanelProps): ReactElement | null {
    const passives = ownedPassives(charsheet);
    if (passives.length === 0) return null;

    const context: PassiveContext = { sheet: charsheet, stealthy: hasStealthEffect(combatant.effects) };
    const uses = { day: readAbilityDayUses(charsheet), combat: combatant.abilityUses ?? {} };
    const hasDayLimit = passives.some(passive => passive.activation?.limits?.some(limit => limit.per === 'dia'));

    return (
        <Box data-testid="player-abilities">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    Habilidades de classe
                </Typography>
                {hasDayLimit && (
                    <Tooltip title="Renova os usos por dia das habilidades deste jogador (descanso)">
                        <Button size="small" variant="outlined" onClick={onRest} sx={{ textTransform: 'none' }}>Renovar usos do dia</Button>
                    </Tooltip>
                )}
            </Box>
            <Stack spacing={0.75}>
                {passives.map(passive => {
                    const statuses = passive.activation ? limitStatuses(passive.activation, passive.key, uses) : [];
                    // Automática: vale agora se tem algo a dar nas condições de agora (ou se é só de rolagem, que vale sempre)
                    const rollOnly = (passive.rules ?? []).every(rule => !([ 'stat', 'flag', 'defense', 'dealtPct' ] as string[]).includes(rule.kind));
                    const active = passive.mode === 'automatica' && (rollOnly || passiveModifiers(passive, context).length > 0);
                    return (
                        <Box key={passive.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }} data-testid="player-ability">
                            <Bolt fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{passive.name}</Typography>
                            <Chip size="small" variant="outlined" label={passive.mode === 'ativada' ? 'Ativada' : 'Automática'} />
                            {passive.mode === 'automatica' && !active && <Typography variant="caption" color="text.secondary">condição não atendida agora</Typography>}
                            {statuses.length > 0 && <Typography variant="caption" color="text.secondary">{describeLimits(statuses)}</Typography>}
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
}
