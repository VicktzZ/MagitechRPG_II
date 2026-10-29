import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { healthySheet } from '../../../../../../utils/__tests__/charsheetFixture';
import theme from '../../../../../../themes/theme';
import SpellsTab from '../SpellsTab';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);
const noop = (): void => undefined;

const stages = [ 'Causa 2d6 de dano.', 'Causa 3d6 de dano e queima.', 'Causa 4d6 de dano em área e queima.' ];
const spell = (overrides: Record<string, unknown>) => ({ id: 'x', name: 'Magia', level: 2, element: 'FOGO', mpCost: 4, range: 'Curto', execution: 'Padrão', type: 'Ataque (imediato)', stages, ...overrides });

const fire = spell({ id: 'brasa', name: 'Brasa Voraz' });
const water = spell({ id: 'mare', name: 'Maré Alta', level: 3, element: 'ÁGUA', mpCost: 7 });
const blood = spell({ id: 'hemo', name: 'Hemorragia', level: 4, element: 'SANGUE', mpCost: 12 });

const sheet = (overrides: Record<string, unknown> = {}) => ({ ...healthySheet(), class: 'Arcano', spellSpace: 2, elementalMastery: '', points: { ...healthySheet().points, evolution: 4 }, spells: [], ...overrides }) as never;

// Sem as tags <style> do emotion, para casar o texto e os atributos sem ruído
const view = (spells: Array<Record<string, unknown>>, sheetOverrides: Record<string, unknown> = {}, props: Record<string, unknown> = {}): string =>
    render(
        <SpellsTab
            charsheet={sheet({ spells, ...sheetOverrides })}
            editedData={{}}
            isEditing={false}
            updateNestedField={noop}
            spells={spells as never}
            {...props}
        />
    ).replace(/<style[\s\S]*?<\/style>/g, '');

describe('SpellsTab (visão do mestre)', () => {
    it('sem magias mostra o aviso', () => {
        expect(view([])).toContain('Este personagem não possui magias');
    });

    it('resume as magias: total, por nível, custo médio, maestria, estágios e pontos de evolução', () => {
        const html = view([ fire, water, blood ], { elementalMastery: 'FOGO', spellUnlocked: { brasa: 2, mare: 1, hemo: 1 } });
        expect(html).toContain('data-testid="spells-overview"');
        expect(html).toContain('2 espaços livres');
        expect(html).toContain('Maestria elemental');
        // custo base médio (4 + 7 + 12) / 3 = 7,67 → 8
        expect(html).toMatch(/Custo médio de MP<\/div><p[^>]*>8<span/);
        // 2 + 1 + 1 estágios liberados, de 9
        expect(html).toMatch(/data-testid="spells-stages-total"[^>]*>4<span/);
        expect(html).toContain('de 9');
        expect(html).toMatch(/data-testid="spells-evolution-points"[^>]*>4</);
    });

    it('cada magia mostra todos os estágios liberados e o que muda entre eles (poucas magias abrem sozinhas)', () => {
        const html = view([ fire ], { spellUnlocked: { brasa: 2 }, spellStages: { brasa: 2 } });
        expect(html).toContain('data-testid="gm-spell-card"');
        expect(html).toContain('2 de 3 estágios');
        expect(html).toContain('data-testid="stage-row-1"');
        expect(html).toContain('data-testid="stage-row-2"');
        expect(html).toContain('Causa 2d6 de dano.');
        expect(html).toMatch(/<mark[^>]*>3d6<\/mark>/);
        // o estágio 3 é o próximo e mostra o custo do nível 2
        expect(html).toContain('Custa 1 ponto de evolução');
        expect(html).not.toContain('4d6');
    });

    it('o custo dos estágios bloqueados segue o nível da magia', () => {
        expect(view([ water ])).toContain('Custa 2 pontos de evolução');
        expect(view([ blood ])).toContain('Custa 3 pontos de evolução');
        expect(view([ spell({ id: 'f4', name: 'Inferno', level: 4, element: 'FOGO' }) ], { spellUnlocked: { f4: 2 } })).toContain('Abre sozinho com maestria em fogo');
    });

    it('elemento secundário não ganha selo nem observação (só o nome do elemento)', () => {
        const html = view([ blood ]);
        expect(html).not.toMatch(/secundári/i);
        expect(html).toContain('SANGUE 1');
    });

    it('maestria no elemento abre a Maestria do nível 4 sozinha, sem editar nada', () => {
        const inferno = spell({ id: 'f4', name: 'Inferno', level: 4, element: 'FOGO' });
        const html = view([ inferno ], { elementalMastery: 'FOGO', spellUnlocked: { f4: 2 } });
        expect(html).toContain('3 de 3 estágios');
        expect(html).toContain('Aberta pela maestria');
    });

    it('sem maestria no elemento a Maestria não abre de jeito nenhum: nem com o 3 gravado, nem pelo ajuste do mestre', () => {
        const inferno = spell({ id: 'f4', name: 'Inferno', level: 4, element: 'FOGO' });
        const html = view([ inferno ], { elementalMastery: '', spellUnlocked: { f4: 3 } }, { isEditing: true });
        // o 3 gravado vale só até o estágio 2
        expect(html).toContain('2 de 3 estágios');
        expect(html).not.toContain('Aberta pela maestria');
        // o botão da Maestria fica desabilitado e a tela diz por quê; os estágios 1 e 2 seguem ajustáveis
        expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Liberar até o Maestria de Inferno"/);
        expect(html).not.toMatch(/<button[^>]*disabled[^>]*aria-label="Liberar até o Estágio 2 de Inferno"/);
        expect(html).toContain('A Maestria só abre para quem tem a maestria elemental em fogo.');
        // com a maestria no elemento o botão volta e o aviso some
        const mastered = view([ inferno ], { elementalMastery: 'FOGO', spellUnlocked: { f4: 2 } }, { isEditing: true });
        expect(mastered).not.toMatch(/<button[^>]*disabled[^>]*aria-label="Liberar até o Maestria de Inferno"/);
        expect(mastered).not.toContain('A Maestria só abre');
    });

    it('elemento secundário no nível 4 tem "Estágio 3" (não Maestria) e ele abre pagando, mesmo com maestria em outro elemento', () => {
        const hemo = spell({ id: 'hemo', name: 'Hemorragia', level: 4, element: 'SANGUE', mpCost: 12 });
        const bought = view([ hemo ], { elementalMastery: 'FOGO', spellUnlocked: { hemo: 3 } }, { isEditing: true });
        expect(bought).toContain('3 de 3 estágios');
        expect(bought).toContain('aria-label="Liberar até o Estágio 3 de Hemorragia"');
        expect(bought).not.toContain('Maestria de Hemorragia');
        expect(bought).not.toContain('Aberta pela maestria');
        expect(bought).not.toMatch(/<button[^>]*disabled[^>]*aria-label="Liberar até o Estágio 3 de Hemorragia"/);
    });

    it('com muitas magias a lista abre fechada e ganha busca e filtros', () => {
        const many = [ fire, water, blood, spell({ id: 'f2', name: 'Fagulha', level: 1 }) ];
        const html = view(many);
        expect(html).toContain('aria-label="Buscar magia"');
        expect(html).toContain('aria-label="Filtrar por elemento"');
        expect(html).toContain('aria-label="Filtrar por nível"');
        expect(html).not.toContain('data-testid="stage-ladder"');
        expect(html).toContain('Expandir todas');
    });

    it('em edição o mestre ajusta o estágio liberado e exclui a magia', () => {
        const html = view([ fire ], {}, { isEditing: true });
        expect(html).toContain('aria-label="Estágio liberado de Brasa Voraz"');
        expect(html).toContain('aria-label="Excluir Brasa Voraz"');
        expect(html).toContain('Ajuste direto do mestre: não gasta ponto de evolução.');
        expect(view([ fire ])).not.toContain('Estágio liberado de Brasa Voraz');
    });

    it('sistema customizado: tudo liberado, sem custos nem pontos de evolução', () => {
        const html = view([ fire ], { systemId: 'sistema-1' });
        expect(html).not.toContain('Custa');
        expect(html).not.toContain('data-testid="spells-evolution-points"');
        expect(html).toContain('4d6');
    });
});
