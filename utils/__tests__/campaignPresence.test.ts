import { connectFields, disconnectFields } from '../campaignPresence';

describe('connectFields', () => {
    it('adiciona o mestre à sessão sem mexer nos jogadores', () => {
        const fields = connectFields({ session: { users: [ 'a' ] }, players: [] }, 'gm');
        expect(fields).toEqual({ 'session.users': [ 'a', 'gm' ] });
    });

    it('adiciona o jogador à sessão e à lista de jogadores', () => {
        const fields = connectFields({ session: { users: [] }, players: [ { userId: 'x', charsheetId: 'c0' } ] }, 'u1', { charsheetId: 'c1' });
        expect(fields).toEqual({
            'session.users': [ 'u1' ],
            players: [ { userId: 'x', charsheetId: 'c0' }, { userId: 'u1', charsheetId: 'c1' } ]
        });
    });

    it('não duplica quem já está na sessão nem quem já joga', () => {
        const data = { session: { users: [ 'u1' ] }, players: [ { userId: 'u1', charsheetId: 'c1' } ] };
        expect(connectFields(data, 'u1', { charsheetId: 'c1' })).toEqual({});
    });

    it('trata campanha sem sessão ou sem jogadores', () => {
        expect(connectFields(undefined, 'u1', { charsheetId: 'c1' })).toEqual({
            'session.users': [ 'u1' ],
            players: [ { userId: 'u1', charsheetId: 'c1' } ]
        });
    });
});

describe('disconnectFields', () => {
    it('tira só o usuário da sessão', () => {
        expect(disconnectFields({ session: { users: [ 'a', 'b', 'c' ] } }, 'b')).toEqual({ 'session.users': [ 'a', 'c' ] });
    });

    it('não grava nada se o usuário já não estava', () => {
        expect(disconnectFields({ session: { users: [ 'a' ] } }, 'b')).toEqual({});
        expect(disconnectFields(undefined, 'b')).toEqual({});
    });
});
