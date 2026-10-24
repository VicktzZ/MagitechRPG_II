import { resolveViewerCharsheetId } from '../campaignViewer';

const players = [ { userId: 'ana', charsheetId: 'cs-ana' }, { userId: 'bia', charsheetId: 'cs-bia' } ];
const charsheets = [ { id: 'cs-ana', userId: 'ana' }, { id: 'cs-bia', userId: 'bia' } ];

describe('resolveViewerCharsheetId', () => {
    it('quem já está na campanha usa a ficha registrada nela', () => {
        expect(resolveViewerCharsheetId({ players, userId: 'bia', charsheets })).toBe('cs-bia');
    });

    it('a ficha registrada vale mais que a escolhida agora e que as da lista', () => {
        expect(resolveViewerCharsheetId({ players, userId: 'ana', selectedCharsheetId: 'cs-outra', charsheets: [ { id: 'cs-x', userId: 'ana' } ] })).toBe('cs-ana');
    });

    it('primeira entrada: a ficha escolhida no modal vale, mesmo sem estar em players nem na lista da campanha', () => {
        expect(resolveViewerCharsheetId({ players, userId: 'caio', selectedCharsheetId: 'cs-caio', charsheets })).toBe('cs-caio');
        expect(resolveViewerCharsheetId({ players: [], userId: 'caio', selectedCharsheetId: 'cs-caio', charsheets: [] })).toBe('cs-caio');
    });

    it('sem registro nem escolha, cai numa ficha do usuário que já esteja entre as da campanha', () => {
        expect(resolveViewerCharsheetId({ players: [], userId: 'ana', selectedCharsheetId: '', charsheets })).toBe('cs-ana');
    });

    it('sem nada (o mestre) devolve vazio, e listas ausentes não quebram', () => {
        expect(resolveViewerCharsheetId({ players, userId: 'mestre', charsheets })).toBe('');
        expect(resolveViewerCharsheetId({ userId: 'mestre' })).toBe('');
        expect(resolveViewerCharsheetId({ players: undefined, userId: '', selectedCharsheetId: undefined, charsheets: undefined })).toBe('');
    });

    it('registro com ficha vazia não vale: cai na escolhida', () => {
        expect(resolveViewerCharsheetId({ players: [ { userId: 'caio', charsheetId: '' } ], userId: 'caio', selectedCharsheetId: 'cs-caio' })).toBe('cs-caio');
    });
});
