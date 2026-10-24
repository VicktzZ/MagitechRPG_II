'use client';

import { useCampaignContext } from '@contexts';
import { isCombatantInTurn } from '@utils/combatTurn';
import { usesStageUnlock } from '@utils/spellStages';
import type { ReactElement } from 'react';
import { usePlayerActions } from '../usePlayerActions';
import { useGMWindowActions } from './GMWindowProvider';
import { SheetWindow } from './SectionWindows';
import { SummaryView, type SummarySheet } from './SummaryView';

/** Corpo da janela de resumo: acompanha a ficha em tempo real e leva as ações do jogador junto dos diálogos delas */
function SummaryBody({ charsheet }: { charsheet: SummarySheet }): ReactElement {
    const { campaign } = useCampaignContext();
    const { openWindow } = useGMWindowActions();
    const actions = usePlayerActions(charsheet);

    return (
        <>
            <SummaryView
                charsheet={charsheet}
                inTurn={isCombatantInTurn(campaign.session?.combat, charsheet)}
                showEvolution={usesStageUnlock(charsheet, campaign.mode)}
                onOpenSection={kind => openWindow(kind, charsheet.id)}
                actions={{
                    canGrantEvolution: actions.canGrantEvolution,
                    onAddItem: actions.openAddItem,
                    onGrantEvolution: () => { void actions.grantEvolutionPoint(); },
                    onNotify: actions.openNotification,
                    onRemove: actions.openRemove
                }}
            />
            {actions.dialogs}
        </>
    );
}

/** Conteúdo da janela de resumo */
export default function SummaryWindow({ charsheetId }: { charsheetId: string }): ReactElement {
    return (
        <SheetWindow charsheetId={charsheetId}>
            {charsheet => <SummaryBody charsheet={charsheet} />}
        </SheetWindow>
    );
}
