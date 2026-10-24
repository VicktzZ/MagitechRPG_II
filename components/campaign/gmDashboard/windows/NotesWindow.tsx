'use client';

import { useCampaignContext } from '@contexts';
import { useGmNote } from '@hooks/useGmNote';
import type { CharsheetDTO } from '@models/dtos';
import { campaignService } from '@services';
import { errorMessage } from '@utils/errors';
import {
    draftIsPersisted,
    hasUnsavedNote,
    NOTE_AUTOSAVE_DELAY,
    noteStatus,
    visibleNoteText
} from '@utils/gmNoteDraft';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { NotesView } from './NotesView';
import { SheetWindow } from './SectionWindows';

type Sheet = Required<CharsheetDTO>;

/**
 * Anotação da ficha com salvamento automático: grava um pouco depois de parar de digitar, ao fechar a janela e ao
 * sair da página. Enquanto há rascunho, ele é o que aparece; quando o salvo chega igual, a tela volta a seguir o
 * salvo (e acompanha mudanças feitas em outra aba do mestre).
 */
function NotesBody({ charsheet }: { charsheet: Sheet }): ReactElement {
    const { campaign } = useCampaignContext();
    const note = useGmNote(campaign.id, charsheet.id);

    const [ draft, setDraft ] = useState<string | null>(null);
    const [ saving, setSaving ] = useState(false);
    const [ failed, setFailed ] = useState(false);

    // Valores de agora para os ganchos de saída (fechar a janela, sair da página), que não podem depender de render
    const latest = useRef({ draft, saved: note.text, campaignId: campaign.id, charsheetId: charsheet.id });
    latest.current = { draft, saved: note.text, campaignId: campaign.id, charsheetId: charsheet.id };

    const save = useCallback(async (text: string): Promise<void> => {
        setSaving(true);
        setFailed(false);
        try {
            await campaignService.saveGmNote(campaign.id, charsheet.id, text);
        } catch (error) {
            console.error('Erro ao salvar a anotação do mestre:', error);
            setFailed(true);
            enqueueSnackbar(`Erro ao salvar a anotação: ${errorMessage(error, 'tente novamente')}`, { variant: 'error' });
        } finally {
            setSaving(false);
        }
    }, [ campaign.id, charsheet.id ]);

    // Grava depois de um tempo sem digitar
    useEffect(() => {
        if (!hasUnsavedNote(draft, note.text) || failed || draft === null) return;

        const timeout = window.setTimeout(() => { void save(draft); }, NOTE_AUTOSAVE_DELAY);
        return () => window.clearTimeout(timeout);
    }, [ draft, note.text, failed, save ]);

    // O salvo chegou igual ao rascunho: volta a seguir o salvo
    useEffect(() => {
        if (!saving && draftIsPersisted(draft, note.text)) setDraft(null);
    }, [ draft, note.text, saving ]);

    // Fechar a janela com texto por salvar não perde o texto
    useEffect(() => () => {
        const { draft: pending, saved, campaignId, charsheetId } = latest.current;
        if (pending === null || !hasUnsavedNote(pending, saved)) return;
        void campaignService.saveGmNote(campaignId, charsheetId, pending).catch(error => {
            console.error('Erro ao salvar a anotação do mestre ao fechar:', error);
            enqueueSnackbar('A anotação não pôde ser salva ao fechar a janela.', { variant: 'error' });
        });
    }, []);

    // Sair da página (fechar a aba) também não perde: keepalive deixa o envio terminar
    useEffect(() => {
        const onPageHide = () => {
            const { draft: pending, saved, campaignId, charsheetId } = latest.current;
            if (pending === null || !hasUnsavedNote(pending, saved)) return;
            void fetch(`/api/campaign/${campaignId}/gm-notes/${charsheetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: pending }),
                keepalive: true
            }).catch(() => undefined);
        };
        window.addEventListener('pagehide', onPageHide);
        return () => window.removeEventListener('pagehide', onPageHide);
    }, []);

    return (
        <NotesView
            charsheetName={charsheet.name}
            value={visibleNoteText(draft, note.text)}
            status={noteStatus({ draft, saved: note.text, saving, failed })}
            loading={note.loading}
            loadError={note.error !== null}
            onChange={value => {
                setFailed(false);
                setDraft(value);
            }}
            onRetry={() => { if (draft !== null) void save(draft); }}
        />
    );
}

/** Janela de anotações privadas do mestre sobre uma ficha */
export default function NotesWindow({ charsheetId }: { charsheetId: string }): ReactElement {
    return (
        <SheetWindow charsheetId={charsheetId}>
            {charsheet => <NotesBody charsheet={charsheet} />}
        </SheetWindow>
    );
}
