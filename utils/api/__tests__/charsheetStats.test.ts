import { ApiError } from '../errors';
import { assertVitalDeltas, readStatsCampaignId } from '../charsheetStats';

const fails = (body: unknown): ApiError => {
    try {
        assertVitalDeltas(body);
    } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        return error as ApiError;
    }
    throw new Error('devia ter lançado');
};

describe('assertVitalDeltas', () => {
    it('aceita uma ou mais variações inteiras e devolve só elas', () => {
        expect(assertVitalDeltas({ lp: -5 })).toEqual({ lp: -5 });
        expect(assertVitalDeltas({ lp: -5, mp: 3, ap: 1 })).toEqual({ lp: -5, mp: 3, ap: 1 });
    });

    it('descarta variação zero, mas recusa se não sobrar nada', () => {
        expect(assertVitalDeltas({ lp: 0, mp: 4 })).toEqual({ mp: 4 });
        expect(fails({ lp: 0 }).status).toBe(400);
        expect(fails({}).status).toBe(400);
    });

    it('recusa o que não é objeto', () => {
        [ null, undefined, 'lp', 5, [ 1, 2 ], true ].forEach(body => expect(fails(body).status).toBe(400));
    });

    it('recusa campo desconhecido (inclusive os máximos: o mestre não muda o máximo por aqui)', () => {
        expect(fails({ lp: 1, maxLp: 99 }).message).toContain('maxLp');
        expect(fails({ lp: 1, nome: 'x' }).status).toBe(400);
        expect(fails({ session: { x: 1 } }).status).toBe(400);
    });

    it('recusa decimal, texto, nulo, infinito e acima do limite', () => {
        [ 1.5, '3', null, NaN, Infinity, 10000, -10000, true, {} ].forEach(value => {
            expect(fails({ lp: value }).status).toBe(400);
        });
    });

    it('aceita os extremos do limite', () => {
        expect(assertVitalDeltas({ lp: 9999, mp: -9999 })).toEqual({ lp: 9999, mp: -9999 });
    });
});

describe('campaignId no corpo (Fase 6.3)', () => {
    it('o campo é aceito quando a rota o declara, e some das variações', () => {
        expect(assertVitalDeltas({ lp: 5, campaignId: 'camp-1' }, { extraKeys: [ 'campaignId' ] })).toEqual({ lp: 5 });
    });

    it('sem a declaração da rota continua sendo campo desconhecido', () => {
        expect(fails({ lp: 5, campaignId: 'camp-1' }).message).toContain('campaignId');
    });

    it('lê o id da campanha: opcional, texto curto', () => {
        expect(readStatsCampaignId({ lp: 5, campaignId: 'camp-1' })).toBe('camp-1');
        expect(readStatsCampaignId({ lp: 5 })).toBeUndefined();
        expect(readStatsCampaignId({ campaignId: null })).toBeUndefined();
        expect(readStatsCampaignId(null)).toBeUndefined();
    });

    it('recusa id que não é texto, vazio ou enorme', () => {
        [ 5, '', 'x'.repeat(129), {}, [ 'a' ], true ].forEach(value => {
            expect(() => readStatsCampaignId({ campaignId: value })).toThrow(ApiError);
        });
    });
});
