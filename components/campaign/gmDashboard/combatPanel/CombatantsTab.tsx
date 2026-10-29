'use client';

import { useCampaignContext } from '@contexts';
import type { Combat, Creature } from '@models';
import { Box, Typography } from '@mui/material';
import { combatantVitalsView, mpLimitView } from '@utils/combat/combatPanel';
import { findBaseCreature } from '@utils/combatCreatureLookup';
import type { ReactElement } from 'react';
import AddCombatantsPanel from '../actions/combat/AddCombatantsPanel';
import type { PlayerInfo } from '../actions/types';
import CombatantRow from './CombatantRow';
import type { DamageHealKind } from './useDamageHealDialog';
import { useCombatantActions } from './useCombatantActions';
import type { GmCombatControls } from './useGmCombat';

interface CombatantsTabProps {
    combat: Combat;
    players: PlayerInfo[];
    creatures: Creature[];
    controls: GmCombatControls;
    onDamageHeal: (type: DamageHealKind, targetId: string) => void;
}

/** A lista de combatentes na ordem do combate, com o "Adicionar ao combate" em cima. Os diálogos das ações (efeito, MP gasto) são um só para a lista inteira */
export default function CombatantsTab({ combat, players, creatures, controls, onDamageHeal }: CombatantsTabProps): ReactElement {
    const { campaign, charsheets } = useCampaignContext();
    const actions = useCombatantActions(onDamageHeal);
    const combatants = combat.combatants ?? [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <AddCombatantsPanel
                players={players}
                creatures={creatures}
                inCombat={new Set(combatants.map(combatant => combatant.id))}
                phase={combat.phase}
                disabled={controls.busy}
                onAdd={controls.addCombatants}
            />

            {combatants.length === 0 ? (
                <Typography color="text.secondary">Ninguém no combate ainda. Use &quot;Adicionar ao combate&quot;.</Typography>
            ) : (
                <Box component="ul" aria-label="Combatentes" sx={{ m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {combatants.map((combatant, index) => (
                        <CombatantRow
                            key={combatant.id}
                            combatant={combatant}
                            phase={combat.phase}
                            current={combat.phase === 'ACTION' && index === combat.currentTurnIndex}
                            vitals={combatantVitalsView(combatant, { charsheets, creatures })}
                            mp={mpLimitView(combatant, { charsheets, creatures, mode: campaign.mode })}
                            creature={combatant.type === 'creature' ? findBaseCreature(combatant.id, creatures) : undefined}
                            actions={actions}
                            busy={controls.busy}
                            onRollInitiative={(id, value) => { void controls.rollInitiative(id, value); }}
                        />
                    ))}
                </Box>
            )}
            {actions.dialogs}
        </Box>
    );
}
