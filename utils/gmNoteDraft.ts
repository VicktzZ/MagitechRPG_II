/**
 * Estado de uma anotação do mestre enquanto ele digita: o que está na tela (rascunho) contra o que está salvo
 * (o documento que chega do Firestore em tempo real). O rascunho é `null` quando a tela só segue o salvo.
 */

export type NoteStatus = 'saved' | 'unsaved' | 'saving' | 'error';

/** O que mostrar no campo: o rascunho, se há, senão o texto salvo */
export const visibleNoteText = (draft: string | null, saved: string): string => draft ?? saved;

/** O rascunho já é o que está salvo: a tela volta a só seguir o salvo (sem piscar o texto antigo entre os dois) */
export const draftIsPersisted = (draft: string | null, saved: string): boolean => draft !== null && draft === saved;

/** Falta salvar? */
export const hasUnsavedNote = (draft: string | null, saved: string): boolean => draft !== null && draft !== saved;

interface NoteStatusInput {
    draft: string | null;
    saved: string;
    saving: boolean;
    /** O último envio falhou e o rascunho ainda não foi salvo */
    failed: boolean;
}

export function noteStatus({ draft, saved, saving, failed }: NoteStatusInput): NoteStatus {
    if (saving) return 'saving';
    if (!hasUnsavedNote(draft, saved)) return 'saved';
    return failed ? 'error' : 'unsaved';
}

export const NOTE_STATUS_LABEL: Record<NoteStatus, string> = {
    saved: 'Salvo',
    unsaved: 'Alterações não salvas',
    saving: 'Salvando…',
    error: 'Não foi possível salvar'
};

/** Espera sem digitar, em ms, antes de gravar o rascunho */
export const NOTE_AUTOSAVE_DELAY = 1000;
