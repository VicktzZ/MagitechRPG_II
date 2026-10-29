import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import { DEFAULT_ATTRIBUTE_DEFS, DEFAULT_EXPERTISE_DEFS } from '../constants';
import DicesTab from '../DicesTab';
import { buildInitialCreature } from '../creatureStats';
import type { CreatureData } from '../types';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const noop = (): void => undefined;

const creature = (patch: Partial<CreatureData> = {}): CreatureData => ({ ...buildInitialCreature(null, DEFAULT_ATTRIBUTE_DEFS), name: 'Lobo', ...patch });

const tab = (data: CreatureData, isReadOnly = false): string =>
    render(<DicesTab creatureData={data} isReadOnly={isReadOnly} attrDefs={DEFAULT_ATTRIBUTE_DEFS} expertiseDefs={DEFAULT_EXPERTISE_DEFS} setDices={noop} />);

describe('DicesTab', () => {
    it('sem dados diz que não há nenhum e oferece o formulário com 1d6 de partida', () => {
        const html = tab(creature());

        expect(html).toContain('Dados (0/20)');
        expect(html).toContain('Nenhum dado adicionado');
        expect(html).toContain('data-testid="dice-form"');
        expect(html).toContain('aria-label="Quantidade de dados do grupo 1"');
        expect(html).toContain('Adicionar dado');
        // Sem nome o botão fica desligado
        expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*(<[^>]*>)*Adicionar dado/);
    });

    it('lista cada dado com a expressão e as ações de editar e excluir', () => {
        const html = tab(creature({ dices: [ { id: 'a', name: 'Mordida', description: 'Dano da mordida', dices: [ { quantity: 2, faces: 6 } ], modifiers: [ { bonus: 3 }, { attribute: 'foc' } ] } ] }));

        expect(html).toContain('Dados (1/20)');
        expect(html).toContain('Mordida');
        expect(html).toContain('2d6 + 3 + FOC');
        expect(html).toContain('Dano da mordida');
        expect(html).toContain('aria-label="Editar o dado Mordida"');
        expect(html).toContain('aria-label="Excluir o dado Mordida"');
    });

    it('somente leitura não tem formulário nem botões de editar e excluir', () => {
        const html = tab(creature({ dices: [ { id: 'a', name: 'Mordida', description: '', dices: [ { quantity: 1, faces: 6 } ], modifiers: [] } ] }), true);

        expect(html).toContain('Mordida');
        expect(html).not.toContain('dice-form');
        expect(html).not.toContain('Editar o dado');
    });

    it('criatura antiga sem o campo de dados abre sem erro', () => {
        const old = { ...creature() } as Partial<CreatureData>;
        delete old.dices;
        expect(tab(old as CreatureData)).toContain('Dados (0/20)');
    });
});
