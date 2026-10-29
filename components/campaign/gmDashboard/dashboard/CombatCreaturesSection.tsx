import { Pets } from '@mui/icons-material';
import { Box } from '@mui/material';
import type { ReactElement } from 'react';
import { useCampaignContext } from '@contexts';
import Section from '../../Section';
import { campaignService } from '@services';
import { errorMessage } from '@utils/errors';
import { getCreatureMpLimit, isCreatureMpLimitEnforced } from '@utils/mpLimit';
import { enqueueSnackbar } from 'notistack';
import { useQuickEffect } from '../actions/useQuickEffect';
import { useSetMpSpent } from '../actions/useSetMpSpent';
import { useGMWindowActions } from '../windows/GMWindowProvider';
import CombatCreatureCard from './CombatCreatureCard';
import { useCombatCreatures } from './useCombatCreatures';
import { useCreatureExpertiseRoll } from './useCreatureExpertiseRoll';

/** Ficha das criaturas em combate (sempre visível durante combate) */
export default function CombatCreaturesSection(): ReactElement | null {
    const { currentCreatureInTurn, allCreaturesInCombat } = useCombatCreatures();
    const { openWindow } = useGMWindowActions();
    const { campaign } = useCampaignContext();
    const { openEffectFor, effectDialog } = useQuickEffect(campaign.id);
    const { openSetMpSpent, setMpSpentDialog } = useSetMpSpent(campaign.id);
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
                        onApplyEffect={() => { openEffectFor({ id: combatant.id, name: combatant.name || creature.name }); }}
                        mpLimit={isCreatureMpLimitEnforced(creature, campaign.mode) ? getCreatureMpLimit(creature) : 0}
                        onSetMpSpent={() => {
                            openSetMpSpent({ id: combatant.id, name: combatant.name || creature.name, spent: combatant.mpSpentThisTurn ?? 0, limit: getCreatureMpLimit(creature) });
                        }}
                        onResetMpLimit={() => {
                            campaignService.resetMpLimit(campaign.id, { combatantId: combatant.id })
                                .catch((error: unknown) => { enqueueSnackbar(errorMessage(error, 'Erro ao resetar o limite de MP'), { variant: 'error' }); });
                        }}
                        onRollExpertise={async (nome, expertise) => await handleCreatureExpertiseRoll(nome, expertise, creature, combatant)}
                    />
                ))}
            </Box>
            {effectDialog}
            {setMpSpentDialog}
        </Section>
    );
}
