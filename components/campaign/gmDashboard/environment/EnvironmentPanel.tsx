'use client';

import { useCampaignContext } from '@contexts';
import type { ReactElement } from 'react';
import EnvironmentView from './EnvironmentView';
import { useEnvironment } from './useEnvironment';

/** O ambiente manual do combate, para o mestre (iluminação e terreno difícil): a aba "Ambiente" do painel de combate. Só aparece com combate ativo, em qualquer fase */
export default function EnvironmentPanel(): ReactElement | null {
    const { campaign } = useCampaignContext();
    const environment = useEnvironment();
    const combat = campaign.session?.combat;

    if (!combat?.isActive) return null;

    return (
        <EnvironmentView
            environment={combat.environment}
            combatants={combat.combatants ?? []}
            busy={environment.busy}
            onLight={(light) => { void environment.setLight(light); }}
            onTerrain={(ids, difficult) => { void environment.setTerrain(ids, difficult); }}
        />
    );
}
