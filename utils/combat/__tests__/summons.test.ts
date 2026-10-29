import { controlsSummon, isSummon, resolveController, summonFields, summonSentence, summonsOf } from '../summons';

const golem = { id: 'golem-1', name: 'Golem Arcano', type: 'creature' as const, controllerId: 'u-aria', summonerId: 'cs-aria' };
const orc = { id: 'orc-1', name: 'Orc', type: 'creature' as const };
const aria = { id: 'cs-aria', name: 'Aria', type: 'player' as const, controllerId: 'u-aria' };

describe('invocados (utils/combat/summons.ts)', () => {
    it('é invocado a criatura que tem um jogador no controle', () => {
        expect(isSummon(golem)).toBe(true);
        expect(isSummon(orc)).toBe(false);
        expect(isSummon(null)).toBe(false);
        expect(isSummon(undefined)).toBe(false);
    });

    it('jogador nunca é invocado, mesmo que o campo apareça nele', () => {
        expect(isSummon(aria)).toBe(false);
    });

    it('só o jogador controlador controla, e nunca por engano com id vazio', () => {
        expect(controlsSummon(golem, 'u-aria')).toBe(true);
        expect(controlsSummon(golem, 'u-borin')).toBe(false);
        expect(controlsSummon(golem, '')).toBe(false);
        expect(controlsSummon(golem, undefined)).toBe(false);
        expect(controlsSummon(orc, 'u-aria')).toBe(false);
    });

    it('lista os invocados de cada jogador na ordem do combate', () => {
        const second = { ...golem, id: 'golem-2' };
        const other = { ...golem, id: 'espirito', controllerId: 'u-borin' };
        const list = [ aria, golem, orc, other, second ];
        expect(summonsOf(list, 'u-aria').map(entry => entry.id)).toEqual([ 'golem-1', 'golem-2' ]);
        expect(summonsOf(list, 'u-borin').map(entry => entry.id)).toEqual([ 'espirito' ]);
        expect(summonsOf(list, 'u-caio')).toEqual([]);
        expect(summonsOf(undefined, 'u-aria')).toEqual([]);
    });

    it('o servidor só aceita como controlador um jogador da campanha com ficha', () => {
        const players = [ { userId: 'u-aria', charsheetId: 'cs-aria' }, { userId: 'u-borin', charsheetId: '' } ];
        expect(resolveController('u-aria', players)).toEqual({ userId: 'u-aria', charsheetId: 'cs-aria' });
        expect(resolveController('u-borin', players)).toBeNull();
        expect(resolveController('u-estranho', players)).toBeNull();
        expect(resolveController('', players)).toBeNull();
        expect(resolveController(42, players)).toBeNull();
        expect(resolveController('u-aria', undefined)).toBeNull();
    });

    it('os campos do invocado: controlador, invocador e lado aliado; sem controlador nada muda', () => {
        expect(summonFields({ userId: 'u-aria', charsheetId: 'cs-aria' })).toEqual({ controllerId: 'u-aria', summonerId: 'cs-aria', side: 'ally' });
        expect(summonFields(null)).toEqual({});
    });

    it('a frase do log', () => {
        expect(summonSentence('Golem Arcano', 'Aria')).toBe('Golem Arcano, invocado por Aria');
        expect(summonSentence('Golem Arcano', undefined)).toBe('Golem Arcano');
    });
});
