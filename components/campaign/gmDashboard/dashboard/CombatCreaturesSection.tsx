import { Pets } from '@mui/icons-material';
import { Box } from '@mui/material';
import type { ReactElement } from 'react';
import Section from '../../Section';
import { useGMWindowActions } from '../windows/GMWindowProvider';
import CombatCreatureCard from './CombatCreatureCard';
import { useCombatCreatures } from './useCombatCreatures';
import { useCreatureExpertiseRoll } from './useCreatureExpertiseRoll';

/** Ficha das criaturas em combate (sempre visível durante combate) */
export default function CombatCreaturesSection(): ReactElement | null {
    const { currentCreatureInTurn, allCreaturesInCombat } = useCombatCreatures();
    const { openWindow } = useGMWindowActions();
    const handleCreatureExpertiseRoll = useCreatureExpertiseRoll(currentCreatureInTurn);

    if (allCreaturesInCombat.length === 0) return null;

    return (
        <Section 
            title="Criaturas em combate" 
            icon={<Pets sx={{ color: 'text.secondary' }} />}
        >
            <Box>
                {allCreaturesInCombat.map(({ combatant, creature, isCurrentTurn }, index) => (
                    <CombatCreatureCard
                        key={combatant.id}
                        combatant={combatant}
                        creature={creature}
                        isCurrentTurn={isCurrentTurn}
                        isLast={index === allCreaturesInCombat.length - 1}
                        onOpenWindow={() => openWindow('combatant', combatant.id)}
                        onRollExpertise={async (nome, expertise) => await handleCreatureExpertiseRoll(nome, expertise, creature, combatant)}
                    />
                ))}
            </Box>
        </Section>
    );
}
