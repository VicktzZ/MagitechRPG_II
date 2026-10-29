'use client';

import type { Combat } from '@models';
import { opportunitiesByMover, opportunitiesForReactor } from '@utils/combat/opportunities';
import type { ReactElement } from 'react';
import OpportunityOffersPanel from './OpportunityOffersPanel';
import { useLeaveReach } from './useLeaveReach';

/** As ofertas de ataque de oportunidade e as saídas declaradas do personagem do jogador (ver `OpportunityOffersPanel`) */
export default function OpportunityOffers({ combat, combatantId }: { combat: Combat; combatantId: string }): ReactElement | null {
    const { dismiss } = useLeaveReach();

    return (
        <OpportunityOffersPanel
            offers={opportunitiesForReactor(combat.opportunities, combatantId)}
            provoked={opportunitiesByMover(combat.opportunities, combatantId)}
            onDismiss={(id) => { void dismiss(id); }}
        />
    );
}
