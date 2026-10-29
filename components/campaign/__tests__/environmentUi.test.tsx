import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { AppliedEffect } from '@models';
import theme from '../../../themes/theme';
import AmbientNotice from '../AmbientNotice';
import EnvironmentView from '../gmDashboard/environment/EnvironmentView';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);

const effect = (name: string, modifiers: Array<Record<string, unknown>>, effectId = name): AppliedEffect =>
    ({ id: name, effectId, level: 1, remaining: 2, snapshot: { name, levels: [ { level: 1, modifiers } ] } }) as unknown as AppliedEffect;

const visaoAprimorada = effect('Visão Aprimorada', [ { kind: 'flag', target: 'dim_vision' } ]);
const botas = effect('Botas do Pântano', [ { kind: 'flag', target: 'terrain_immunity' } ]);

describe('AmbientNotice', () => {
    it('luz clara e terreno normal não desenham nada', () => {
        expect(render(<AmbientNotice environment={{ light: 'claro', difficultTerrainIds: [ 'outro' ] }} combatantId="cs-ana" effects={[]} />)).toBe('');
        expect(render(<AmbientNotice environment={undefined} combatantId="cs-ana" effects={[]} />)).toBe('');
        expect(render(<AmbientNotice environment={null} combatantId="cs-ana" effects={undefined} />)).toBe('');
    });

    it('penumbra: o aviso diz a luz e o que ela faz com a visão do personagem', () => {
        const html = render(<AmbientNotice environment={{ light: 'penumbra', difficultTerrainIds: [] }} combatantId="cs-ana" effects={[]} />);

        expect(html).toContain('data-testid="ambient-light"');
        expect(html).toContain('Iluminação: Penumbra');
        expect(html).toContain('No acerto: Penumbra: cobertura parcial, −1d20.');
        expect(html).toContain('MuiChip-colorWarning');
        expect(html).not.toContain('ambient-terrain');
    });

    it('com Visão Aprimorada a penumbra não pesa: a luz aparece, sem aviso de acerto', () => {
        const html = render(<AmbientNotice environment={{ light: 'penumbra', difficultTerrainIds: [] }} combatantId="cs-ana" effects={[ visaoAprimorada ]} />);

        expect(html).toContain('Iluminação: Penumbra');
        expect(html).not.toContain('ambient-notes');
        expect(html).not.toContain('MuiChip-colorWarning');
    });

    it('terreno difícil: deslocamento pela metade, ou imune com a marca do efeito', () => {
        const env = { light: 'claro' as const, difficultTerrainIds: [ 'cs-ana' ] };

        expect(render(<AmbientNotice environment={env} combatantId="cs-ana" effects={[]} />)).toContain('Terreno difícil: deslocamento pela metade');
        expect(render(<AmbientNotice environment={env} combatantId="cs-ana" effects={[ botas ]} />)).toContain('Terreno difícil: imune');
        expect(render(<AmbientNotice environment={env} combatantId="cs-bia" effects={[]} />)).toBe('');
    });
});

describe('EnvironmentView (controle do mestre)', () => {
    const combatants = [ { id: 'cs-ana', name: 'Aria Valen' }, { id: 'goblin-1', name: 'Goblin Saqueador' } ];
    const noop = (): void => undefined;

    it('mostra a luz marcada com a regra dela e quem está em terreno difícil', () => {
        const html = render(
            <EnvironmentView environment={{ light: 'penumbra', difficultTerrainIds: [ 'goblin-1' ] }} combatants={combatants} busy={false} onLight={noop} onTerrain={noop} />
        );

        expect(html).toContain('data-testid="environment-panel"');
        expect(html).toContain('data-testid="light-claro"');
        expect(html).toContain('data-testid="light-penumbra"');
        expect(html).toContain('data-testid="light-escuridao"');
        expect(html).toMatch(/data-testid="light-penumbra"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-testid="light-penumbra"/);
        expect(html).toContain('Cobertura parcial: desvantagem no acerto');
        expect(html).toMatch(/aria-pressed="true"[^>]*data-testid="terrain-goblin-1"|data-testid="terrain-goblin-1"[^>]*aria-pressed="true"/);
        expect(html).toMatch(/aria-pressed="false"[^>]*data-testid="terrain-cs-ana"|data-testid="terrain-cs-ana"[^>]*aria-pressed="false"/);
    });

    it('sem ambiente gravado a luz é clara e ninguém está em terreno difícil', () => {
        const html = render(<EnvironmentView environment={undefined} combatants={combatants} busy={false} onLight={noop} onTerrain={noop} />);

        expect(html).toContain('Sem efeito.');
        expect(html).not.toMatch(/data-testid="terrain-[^"]*"[^>]*aria-pressed="true"/);
    });

    it('sem combatentes avisa que não há ninguém', () => {
        expect(render(<EnvironmentView environment={undefined} combatants={[]} busy={false} onLight={noop} onTerrain={noop} />)).toContain('Ninguém no combate.');
    });
});
