import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import DefensesSection from '../DefensesSection';
import { buildInitialCreature } from '../creatureStats';
import type { CreatureData } from '../types';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const noop = (): void => undefined;

const creature = (patch: Partial<CreatureData> = {}): CreatureData => ({ ...buildInitialCreature(null, []), name: 'Goblin', ...patch });

describe('DefensesSection', () => {
    it('sem defesas diz que o dano recebido não muda e oferece adicionar', () => {
        const html = render(<DefensesSection creatureData={creature()} setCreatureData={noop} isReadOnly={false} />);

        expect(html).toContain('Defesas');
        expect(html).toContain('Só o mestre vê');
        expect(html).toContain('Nenhuma. Sem elas o dano recebido não muda.');
        expect(html).toContain('Adicionar resistência ou vulnerabilidade');
    });

    it('lista cada resistência com tipo, alvo e valor, e avisa de valor inválido', () => {
        const html = render(
            <DefensesSection
                creatureData={creature({ damageModifiers: [ { kind: 'resistance', element: 'Fogo', value: '25%' }, { kind: 'vulnerability', value: 'muito' } ] })}
                setCreatureData={noop}
                isReadOnly={false}
            />
        );

        expect(html).toContain('damage-modifier-0');
        expect(html).toContain('damage-modifier-1');
        expect(html).toContain('value="25%"');
        expect(html).toContain('Use 25% ou 3');
        expect(html).toContain('aria-label="Remover resistência ou vulnerabilidade"');
    });

    it('só leitura: sem adicionar nem remover', () => {
        const html = render(
            <DefensesSection creatureData={creature({ damageModifiers: [ { kind: 'resistance', value: '10%' } ] })} setCreatureData={noop} isReadOnly />
        );

        expect(html).not.toContain('Adicionar resistência ou vulnerabilidade');
        expect(html).not.toContain('Remover resistência ou vulnerabilidade');
    });
});

describe('buildInitialCreature com defesas', () => {
    it('criatura nova começa sem defesas e a antiga (sem os campos) também', () => {
        expect(buildInitialCreature(null, [])).toMatchObject({ elementalMastery: '', weaknesses: [], damageModifiers: [] });
        const old = { name: 'Velha', description: '', level: 1, attributes: {}, stats: { lp: 5, maxLp: 5, mp: 1, maxMp: 1, ap: 2 }, skills: [], spells: [], expertises: {} };
        expect(buildInitialCreature(old, [])).toMatchObject({ elementalMastery: '', weaknesses: [], damageModifiers: [] });
    });

    it('criatura salva com defesas as mantém ao abrir no editor', () => {
        const saved = creature({ elementalMastery: 'Fogo', weaknesses: [ 'Cortante' ], damageModifiers: [ { kind: 'resistance', value: '10%' } ] });
        expect(buildInitialCreature(saved, [])).toMatchObject({ elementalMastery: 'Fogo', weaknesses: [ 'Cortante' ], damageModifiers: [ { kind: 'resistance', value: '10%' } ] });
    });
});
