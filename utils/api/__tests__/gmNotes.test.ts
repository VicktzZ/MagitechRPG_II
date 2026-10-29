import { ApiError } from '../errors';
import { assertCharsheetInCampaign, assertGmNoteBody } from '../gmNotes';
import { TEXT_LIMITS } from '../input';

const failsBody = (body: unknown): ApiError => {
    try {
        assertGmNoteBody(body);
    } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        return error as ApiError;
    }
    throw new Error('devia ter lançado');
};

describe('assertGmNoteBody', () => {
    it('devolve o texto como veio, sem aparar espaços nem quebras de linha', () => {
        expect(assertGmNoteBody({ text: 'O barão é o espião.\n\n  Segredo.  ' })).toBe('O barão é o espião.\n\n  Segredo.  ');
    });

    it('aceita texto vazio (é assim que o mestre apaga a anotação)', () => {
        expect(assertGmNoteBody({ text: '' })).toBe('');
    });

    it('aceita o tamanho máximo e recusa um caractere a mais', () => {
        expect(assertGmNoteBody({ text: 'a'.repeat(TEXT_LIMITS.note) })).toHaveLength(TEXT_LIMITS.note);
        expect(failsBody({ text: 'a'.repeat(TEXT_LIMITS.note + 1) }).status).toBe(400);
    });

    it('recusa o que não é objeto', () => {
        [ null, undefined, 'texto', 5, [ 'a' ], true ].forEach(body => expect(failsBody(body).status).toBe(400));
    });

    it('recusa texto ausente ou que não é texto', () => {
        [ {}, { text: null }, { text: undefined }, { text: 5 }, { text: [ 'a' ] }, { text: { a: 1 } } ].forEach(body => {
            expect(failsBody(body).status).toBe(400);
        });
    });

    it('recusa campo desconhecido (nada além de "text" chega ao banco)', () => {
        expect(failsBody({ text: 'x', updatedBy: 'outro' }).message).toContain('updatedBy');
        expect(failsBody({ text: 'x', updatedAt: 1 }).status).toBe(400);
    });
});

describe('assertCharsheetInCampaign', () => {
    const campaign = { players: [ { charsheetId: 'ficha-a' }, { charsheetId: 'ficha-b' }, {} ] };

    it('devolve o id de uma ficha que joga na campanha', () => {
        expect(assertCharsheetInCampaign(campaign, 'ficha-a')).toBe('ficha-a');
        expect(assertCharsheetInCampaign(campaign, 'ficha-b')).toBe('ficha-b');
    });

    it('recusa com 404 ficha que não joga nela (inclusive de outra campanha)', () => {
        try {
            assertCharsheetInCampaign(campaign, 'ficha-de-fora');
            throw new Error('devia ter lançado');
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).status).toBe(404);
        }
    });

    it('recusa com 400 id mal formado (barra, ponto, vazio, não texto) antes de olhar a campanha', () => {
        [ '', 'a/b', '..', '../x', 'a b', 5, null, undefined, 'x'.repeat(300) ].forEach(id => {
            try {
                assertCharsheetInCampaign(campaign, id);
                throw new Error('devia ter lançado');
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).status).toBe(400);
            }
        });
    });

    it('campanha sem jogadores não tem ficha nenhuma', () => {
        expect(() => assertCharsheetInCampaign({}, 'ficha-a')).toThrow(ApiError);
        expect(() => assertCharsheetInCampaign({ players: [] }, 'ficha-a')).toThrow(ApiError);
    });
});
