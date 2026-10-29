import {
    draftIsPersisted,
    hasUnsavedNote,
    NOTE_AUTOSAVE_DELAY,
    NOTE_STATUS_LABEL,
    noteStatus,
    visibleNoteText
} from '../gmNoteDraft';

describe('visibleNoteText', () => {
    it('sem rascunho, mostra o salvo', () => {
        expect(visibleNoteText(null, 'salvo')).toBe('salvo');
    });

    it('com rascunho, ele manda (mesmo se o salvo mudou de fora)', () => {
        expect(visibleNoteText('digitando', 'salvo')).toBe('digitando');
    });

    it('rascunho vazio é um rascunho: o mestre apagou tudo e o campo fica vazio, não volta o salvo', () => {
        expect(visibleNoteText('', 'salvo')).toBe('');
    });
});

describe('hasUnsavedNote e draftIsPersisted', () => {
    it('sem rascunho não falta nada', () => {
        expect(hasUnsavedNote(null, 'salvo')).toBe(false);
        expect(draftIsPersisted(null, 'salvo')).toBe(false);
    });

    it('rascunho diferente do salvo falta salvar', () => {
        expect(hasUnsavedNote('novo', 'salvo')).toBe(true);
        expect(draftIsPersisted('novo', 'salvo')).toBe(false);
    });

    it('rascunho igual ao salvo já está salvo e a tela pode voltar a seguir o salvo', () => {
        expect(hasUnsavedNote('salvo', 'salvo')).toBe(false);
        expect(draftIsPersisted('salvo', 'salvo')).toBe(true);
    });

    it('apagar tudo falta salvar quando havia texto, e já está salvo quando não havia', () => {
        expect(hasUnsavedNote('', 'salvo')).toBe(true);
        expect(hasUnsavedNote('', '')).toBe(false);
        expect(draftIsPersisted('', '')).toBe(true);
    });
});

describe('noteStatus', () => {
    it('salvo quando não há o que gravar', () => {
        expect(noteStatus({ draft: null, saved: 'a', saving: false, failed: false })).toBe('saved');
        expect(noteStatus({ draft: 'a', saved: 'a', saving: false, failed: false })).toBe('saved');
    });

    it('alterações não salvas enquanto espera para gravar', () => {
        expect(noteStatus({ draft: 'b', saved: 'a', saving: false, failed: false })).toBe('unsaved');
    });

    it('salvando tem prioridade sobre o resto', () => {
        expect(noteStatus({ draft: 'b', saved: 'a', saving: true, failed: false })).toBe('saving');
        expect(noteStatus({ draft: 'b', saved: 'a', saving: true, failed: true })).toBe('saving');
    });

    it('erro só vale enquanto o rascunho ainda não foi salvo', () => {
        expect(noteStatus({ draft: 'b', saved: 'a', saving: false, failed: true })).toBe('error');
        // o salvo chegou igual ao rascunho (por exemplo, o envio passou mesmo com a resposta perdida)
        expect(noteStatus({ draft: 'b', saved: 'b', saving: false, failed: true })).toBe('saved');
    });
});

describe('textos e tempo', () => {
    it('todo estado tem um texto', () => {
        (Object.keys(NOTE_STATUS_LABEL) as Array<keyof typeof NOTE_STATUS_LABEL>).forEach(status => {
            expect(NOTE_STATUS_LABEL[status]).toBeTruthy();
        });
        expect(Object.keys(NOTE_STATUS_LABEL).sort()).toEqual([ 'error', 'saved', 'saving', 'unsaved' ]);
    });

    it('a espera para gravar é curta, mas não é a cada tecla', () => {
        expect(NOTE_AUTOSAVE_DELAY).toBeGreaterThanOrEqual(500);
        expect(NOTE_AUTOSAVE_DELAY).toBeLessThanOrEqual(3000);
    });
});
