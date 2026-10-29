import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { AppliedEffect } from '@models';
import theme from '../../../themes/theme';
import EffectStatsNotice from '../EffectStatsNotice';
import { charsheetVitalRows } from '../gmDashboard/windows/vitalRows';

// O hook de sistema customizado puxa `@contexts`, que o ts-jest barra por um erro de tipo antigo: aqui só o formato da vista interessa
jest.mock('../gmDashboard/useCharsheetPointsView', () => ({ useCharsheetPointsView: jest.fn() }));

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);

const effect = (name: string, modifiers: Array<Record<string, unknown>>): AppliedEffect =>
    ({ id: name, effectId: name, level: 1, remaining: 2, snapshot: { name, levels: [ { level: 1, modifiers } ] } }) as unknown as AppliedEffect;

const velocidade = effect('Velocidade', [ { kind: 'stat_bonus', target: 'displacement', value: '+25%' }, { kind: 'stat_bonus', target: 'initiative', value: 2 } ]);
const eletrizacao = effect('Eletrização', [ { kind: 'stat_penalty', target: 'ap', value: -2 } ]);
const fragilidade = effect('Fragilidade', [ { kind: 'stat_penalty', target: 'maxLp', value: '-25%' } ]);
const sobrecura = effect('Sobrecura', [ { kind: 'overflow_stat', target: 'lp', value: '+50%' } ]);

describe('EffectStatsNotice', () => {
    it('um marcador por estatística mudada, com o valor de agora e se é ganho ou perda', () => {
        const html = render(
            <EffectStatsNotice effects={[ velocidade, eletrizacao, fragilidade, sobrecura ]} bases={{ displacement: 9, ap: 8, maxLp: 40, maxMp: 10 }} />
        );

        expect(html).toContain('data-testid="effect-stats"');
        expect(html).toContain('Efeitos nas estatísticas');
        expect(html).toContain('Deslocamento: 9 m → 11,25 m');
        expect(html).toContain('Iniciativa: +2');
        expect(html).toContain('AP: 8 → 6');
        expect(html).toContain('LP máximo: 40 → 30');
        expect(html).toContain('LP acima do máximo: até 45 (+50%)');
        expect(html).toContain('data-testid="effect-stat-ap"');
        // ganho é verde (success), perda é vermelha (error)
        expect(html.match(/MuiChip-colorSuccess/g)?.length).toBe(3);
        expect(html.match(/MuiChip-colorError/g)?.length).toBe(2);
    });

    it('o título pode sair (já há um perto) e, sem efeito nas estatísticas, nada é desenhado', () => {
        expect(render(<EffectStatsNotice effects={[ velocidade ]} bases={{ displacement: 9 }} heading={null} />)).not.toContain('Efeitos nas estatísticas');
        expect(render(<EffectStatsNotice effects={[ effect('Cegueira', [ { kind: 'disadvantage', target: 'attack' } ]) ]} />)).toBe('');
        expect(render(<EffectStatsNotice effects={undefined} />)).toBe('');
    });
});

describe('charsheetVitalRows com efeitos', () => {
    const view = { hasLP: true, hasMP: true, hasAP: true, customSystem: undefined, lpName: 'Vida', mpName: 'Mana', apName: 'Armadura' } as unknown as Parameters<typeof charsheetVitalRows>[1];
    const sheet = { stats: { lp: 30, maxLp: 40, mp: 8, maxMp: 10, ap: 4, maxAp: 8 } } as unknown as Parameters<typeof charsheetVitalRows>[0];

    it('o máximo de LP é o de agora; o resto da ficha não muda', () => {
        const rows = charsheetVitalRows(sheet, view, [ fragilidade ]);

        expect(rows.map(row => [ row.key, row.value, row.max ])).toEqual([ [ 'lp', 30, 30 ], [ 'mp', 8, 10 ], [ 'ap', 4, 8 ] ]);
        expect(sheet.stats?.maxLp).toBe(40);
    });

    it('sem efeitos o máximo é o gravado', () => {
        expect(charsheetVitalRows(sheet, view).map(row => row.max)).toEqual([ 40, 10, 8 ]);
        expect(charsheetVitalRows(sheet, view, []).map(row => row.max)).toEqual([ 40, 10, 8 ]);
    });
});
