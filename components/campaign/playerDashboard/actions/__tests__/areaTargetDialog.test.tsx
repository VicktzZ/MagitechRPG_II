import { ThemeProvider, createTheme } from '@mui/material';
import { renderToStaticMarkup } from 'react-dom/server';
import { AreaTargetForm, areaHelp, type AreaCandidate } from '../AreaTargetDialog';

type FormProps = Parameters<typeof AreaTargetForm>[0];

const candidates: AreaCandidate[] = [
    { id: 'aria', name: 'Aria Valen', side: 'ally', self: true },
    { id: 'borin', name: 'Borin', side: 'ally', self: false },
    { id: 'caio', name: 'Caio', side: 'ally', self: false }
];

const render = (props: Partial<FormProps> = {}): string =>
    renderToStaticMarkup(
        <ThemeProvider theme={createTheme()}>
            <AreaTargetForm
                spec={{ affects: 'allies' }}
                candidates={candidates}
                selected={[ 'aria', 'borin' ]}
                onToggle={() => undefined}
                onSelectAll={() => undefined}
                onClear={() => undefined}
                {...props}
            />
        </ThemeProvider>
    );

describe('AreaTargetForm', () => {
    it('lista cada candidato com a caixa marcada para quem está selecionado, o lado e "(você)" em quem usa', () => {
        const html = render();

        expect(html).toContain('Aria Valen');
        expect(html).toContain('(você)');
        expect(html).toContain('Borin');
        expect(html).toContain('Aliado');
        expect(html).toContain('aria-label="Atinge Aria Valen"');
        // Aria e Borin marcados, Caio não
        expect(html.match(/checked=""/g)).toHaveLength(2);
    });

    it('conta quantos estão marcados', () => {
        expect(render()).toMatch(/2 de 3 marcados/);
        expect(render({ selected: [] })).toMatch(/0 de 3 marcados/);
    });

    it('oferece "Marcar aliados" na área de aliados e não na de inimigos', () => {
        expect(render()).toContain('Marcar aliados');
        expect(render({ spec: { affects: 'enemies', max: 1 }, candidates: [ { id: 'orc', name: 'Orc', side: 'enemy', self: false } ], selected: [] })).not.toContain('Marcar ');
    });

    it('no limite de alvos as caixas dos que faltam ficam desligadas, mas as marcadas continuam ligadas', () => {
        const html = render({ spec: { affects: 'allies', max: 2 } });

        // Só Caio (o terceiro, sem marca) fica desabilitado
        expect(html.match(/disabled=""/g)?.length).toBeGreaterThanOrEqual(1);
        expect(html).toMatch(/2 de 2 marcados/);
    });

    it('sem ninguém que a área possa atingir explica e some com as caixas', () => {
        const html = render({ candidates: [], selected: [] });

        expect(html).toContain('data-testid="area-target-empty"');
        expect(html).toContain('O mestre pode mudar o lado de alguém.');
        expect(html).not.toContain('type="checkbox"');
    });

    it('"Limpar" fica desligado sem marcas', () => {
        expect(render({ selected: [] })).toMatch(/<button[^>]*disabled[^>]*>Limpar/);
        expect(render()).not.toMatch(/<button[^>]*disabled[^>]*>Limpar/);
    });
});

describe('areaHelp', () => {
    it('diz em quem a área pega, o limite e que o app não mede distância', () => {
        expect(areaHelp({ affects: 'allies' })).toBe('Marque os aliados que a área atinge (até 20). O app não mede distância: vale a sua palavra e o mestre corrige se precisar.');
        expect(areaHelp({ affects: 'enemies', max: 1 })).toBe('Marque o inimigo que a área atinge. O app não mede distância: vale a sua palavra e o mestre corrige se precisar.');
        expect(areaHelp({ affects: 'enemies', max: 3 })).toContain('(até 3)');
    });
});
