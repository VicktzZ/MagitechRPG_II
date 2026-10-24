'use client';

import { useCampaignContext } from '@contexts';
import { charsheetService } from '@services';
import { errorMessage } from '@utils/errors';
import { isCombatantInTurn } from '@utils/combatTurn';
import { usesStageUnlock } from '@utils/spellStages';
import type { VitalKey } from '@utils/vitals';
import { enqueueSnackbar } from 'notistack';
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

    // O servidor soma a variação ao valor de agora; a barra muda sozinha quando a ficha chega do Firestore
    const adjustVital = async (key: VitalKey, delta: number): Promise<void> => {
        try {
            await charsheetService.adjustStats(charsheet.id, { [key]: delta });
        } catch (error) {
            console.error('Erro ao ajustar pontos vitais:', error);
            enqueueSnackbar(`Erro ao ajustar pontos vitais: ${errorMessage(error, 'tente novamente')}`, { variant: 'error' });
        }
    };

    return (
        <>
            <SummaryView
                charsheet={charsheet}
                inTurn={isCombatantInTurn(campaign.session?.combat, charsheet)}
                showEvolution={usesStageUnlock(charsheet, campaign.mode)}
                onOpenSection={kind => openWindow(kind, charsheet.id)}
                onAdjustVital={(key, delta) => { void adjustVital(key, delta); }}
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
