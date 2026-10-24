'use client';

import { useCampaignContext } from '@contexts';
import { Portal } from '@mui/material';
import type { ReactElement } from 'react';
import FloatingWindow from './FloatingWindow';
import { useGMWindowActions, useGMWindowView } from './GMWindowProvider';
import { WINDOW_KIND_LABEL } from './windowKinds';
import type { WindowEntry } from './windowState';
import {
    AttributesWindow,
    ExpertisesWindow,
    InfoWindow,
    InventoryWindow,
    SkillsWindow,
    SpellsWindow
} from './SectionWindows';
import NotesWindow from './NotesWindow';
import SummaryWindow from './SummaryWindow';

/** Conteúdo de cada tipo de janela */
function WindowContent({ entry }: { entry: WindowEntry }): ReactElement {
    switch (entry.kind) {
    case 'summary':
        return <SummaryWindow charsheetId={entry.charsheetId} />;
    case 'info':
        return <InfoWindow charsheetId={entry.charsheetId} />;
    case 'attributes':
        return <AttributesWindow charsheetId={entry.charsheetId} />;
    case 'expertises':
        return <ExpertisesWindow charsheetId={entry.charsheetId} />;
    case 'inventory':
        return <InventoryWindow charsheetId={entry.charsheetId} />;
    case 'skills':
        return <SkillsWindow charsheetId={entry.charsheetId} />;
    case 'spells':
        return <SpellsWindow charsheetId={entry.charsheetId} />;
    case 'notes':
        return <NotesWindow charsheetId={entry.charsheetId} />;
    }
}

/**
 * Desenha as janelas abertas num portal no `body`: o painel do chat tem `transform` e criaria um bloco de
 * contenção para elementos `fixed` (ver CLAUDE.md), e as janelas precisam ficar por cima da página inteira.
 */
export default function GMWindowLayer(): ReactElement | null {
    const { charsheets } = useCampaignContext();
    const { windows, frontKey, focusRequest, bounds, mobile } = useGMWindowView();
    const { focusWindow, closeWindow, commitRect, toggleCollapse } = useGMWindowActions();

    if (windows.length === 0) return null;

    const stackOrder = [ ...windows ].sort((a, b) => a.z - b.z).map(entry => entry.key);

    return (
        <Portal>
            {windows.map(entry => {
                const sheetName = charsheets.find(sheet => sheet.id === entry.charsheetId)?.name ?? 'ficha indisponível';

                return (
                    <FloatingWindow
                        key={entry.key}
                        entry={entry}
                        title={`${WINDOW_KIND_LABEL[entry.kind]}: ${sheetName}`}
                        rank={stackOrder.indexOf(entry.key)}
                        isFront={entry.key === frontKey}
                        bounds={bounds}
                        mobile={mobile}
                        focusToken={focusRequest?.key === entry.key ? focusRequest.n : 0}
                        onFocus={focusWindow}
                        onClose={closeWindow}
                        onCommit={commitRect}
                        onToggleCollapse={toggleCollapse}
                    >
                        <WindowContent entry={entry} />
                    </FloatingWindow>
                );
            })}
        </Portal>
    );
}
