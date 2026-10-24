'use client';

import { useCampaignContext } from '@contexts';
import type { CharsheetDTO } from '@models/dtos';
import { Typography } from '@mui/material';
import { isCombatantInTurn } from '@utils/combatTurn';
import { usesStageUnlock } from '@utils/spellStages';
import { useState, type ReactElement } from 'react';
import { CharsheetDetailsModal } from '../modals';
import { SummaryView } from './SummaryView';

type Sheet = Required<CharsheetDTO>;

/** Conteúdo da janela de resumo: acompanha a ficha em tempo real pela campanha */
export default function SummaryWindow({ charsheetId }: { charsheetId: string }): ReactElement {
    const { campaign, charsheets } = useCampaignContext();
    const [ fullSheetOpen, setFullSheetOpen ] = useState(false);

    const charsheet = charsheets.find(sheet => sheet.id === charsheetId);
    if (!charsheet) {
        return <Typography color="text.secondary">Esta ficha não está mais na campanha.</Typography>;
    }

    const sheet = charsheet as unknown as Sheet;

    return (
        <>
            <SummaryView
                charsheet={sheet}
                inTurn={isCombatantInTurn(campaign.session?.combat, sheet)}
                showEvolution={usesStageUnlock(sheet, campaign.mode)}
                onOpenFullSheet={() => setFullSheetOpen(true)}
            />
            <CharsheetDetailsModal open={fullSheetOpen} onClose={() => setFullSheetOpen(false)} charsheet={sheet} />
        </>
    );
}
