import type { Combatant } from '@models';
import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { healthySheet } from '@utils/__tests__/charsheetFixture';
import theme from '../../../../../../themes/theme';
import type { SummarySheet } from '../../SummaryView';
import { PlayerCombatantView } from '../PlayerCombatantView';

// O hook de sistema customizado puxa os contextos do app; aqui basta o padrão (sem sistema customizado)
jest.mock('../../../useCharsheetPointsView', () => ({
    useCharsheetPointsView: () => ({
        customSystem: null,
        weightUnit: 'kg',
        hasLP: true,
        hasMP: true,
        hasAP: true,
        lpName: 'Vida',
        mpName: 'Mana',
        apName: 'Armadura'
    })
}));

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);
const noop = (): void => undefined;

const sheet = healthySheet() as unknown as SummarySheet;

const combatant = (overrides: Record<string, unknown> = {}): Combatant => ({
    id: sheet.id, name: sheet.name, type: 'player', mpSpentThisTurn: 3, effects: [], ...overrides
}) as unknown as Combatant;

const view = (props: Partial<Parameters<typeof PlayerCombatantView>[0]> = {}) => render(
    <PlayerCombatantView
        charsheet={sheet}
        combatant={combatant()}
        inTurn={false}
        metrics={{ overall: 52, mpLimit: 8, mpSpent: 3 }}
        onAdjustVital={noop}
        onToggleAction={noop}
        onGrantActions={noop}
        onSetMpSpent={noop}
        onResetMpLimit={noop}
        onApplyEffect={noop}
        onOpenSection={noop}
        onRollExpertise={noop}
        onRest={noop}
        {...props}
    />
);

describe('PlayerCombatantView (janela "Em combate" do jogador)', () => {
    it('mostra quem é, os pontos vitais da ficha com dano e cura rápidos e as ações da rodada', () => {
        const html = view();

        expect(html).toContain(sheet.name);
        expect(html).toContain('Pontos vitais');
        expect(html).toContain('Ações da rodada');
        expect(html).not.toContain('Em turno');
    });

    it('marca de quem é a vez', () => {
        expect(view({ inTurn: true })).toContain('Em turno');
    });

    it('mostra o limite de MP da rodada com os botões do mestre; sem limite (Roguelite, sistema customizado) some', () => {
        const withLimit = view();
        expect(withLimit).toContain('player-mp-limit');
        expect(withLimit).toContain('3 / 8');
        expect(withLimit).toContain('Definir gasto');
        expect(withLimit).toContain('Resetar limite');

        expect(view({ metrics: { overall: 52, mpLimit: null, mpSpent: null } })).not.toContain('player-mp-limit');
    });

    it('habilidades de classe: automáticas com o estado de agora e ativadas com os usos que sobram, e o botão de descanso', () => {
        const withSkills = {
            ...sheet,
            skills: { class: [ { name: 'Cura Interior' }, { name: 'Muralha' }, { name: 'Perspectiva' } ], subclass: [] },
            stats: { ...sheet.stats, lp: 80, maxLp: 100 },
            abilityUses: { 'class-cura-interior': 2 }
        } as unknown as SummarySheet;
        const html = view({ charsheet: withSkills, combatant: combatant({ abilityUses: { 'class-cura-interior': 1 } }) });

        expect(html).toContain('player-abilities');
        expect(html).toContain('Cura Interior');
        expect(html).toContain('1 de 3 por dia');
        expect(html).toContain('0 de 1 por combate');
        expect(html).toContain('Renovar usos do dia');
        // Muralha só vale com o LP em 10% ou menos: com 80% a condição não vale; a habilidade que é só texto (Perspectiva) não aparece
        expect(html).toContain('Muralha');
        expect(html).toContain('condição não atendida agora');
        expect(html).not.toContain('Perspectiva');
    });

    it('sem habilidades estruturadas a seção não aparece', () => {
        expect(view()).not.toContain('player-abilities');
    });

    it('limite liberado pelo mestre aparece no chip', () => {
        expect(view({ combatant: combatant({ mpLimitOverride: true }) })).toContain('3 / 8 (liberado)');
    });

    it('lista os efeitos aplicados com o nível e o que falta, e tem o botão de aplicar outro', () => {
        const effects = [
            { id: 'e1', effectId: 'seed-cegueira', snapshot: { name: 'Cegueira' }, level: 2, remaining: 3 },
            { id: 'e2', effectId: 'seed-furtivo', snapshot: { name: 'Furtivo' }, level: 1, remaining: 0, indefinite: true },
            { id: 'e3', effectId: 'sust', snapshot: { name: 'Escudo Arcano' }, level: 1, remaining: 0, sustained: { spellKey: 'x', spellName: 'Escudo Arcano', stage: 1, cost: 4, upkeep: 2 } }
        ];
        const html = view({ combatant: combatant({ effects }) });

        expect(html).toContain('Cegueira (nível 2, 3 turnos)');
        expect(html).toContain('Furtivo (nível 1, indefinido)');
        expect(html).toContain('Escudo Arcano (mantida)');
        expect(html).toContain('Aplicar efeito');
    });

    it('sem efeitos avisa', () => {
        expect(view()).toContain('Nenhum efeito aplicado.');
    });

    it('cada perícia da ficha é um botão de rolar e há atalhos para as seções da ficha', () => {
        const html = view();

        expect(html).toContain('Perícias');
        for (const label of [ 'Resumo', 'Informações', 'Atributos', 'Inventário', 'Habilidades', 'Magias', 'Anotações' ]) {
            expect(html).toContain(`>${label}<`);
        }
    });

    it('ficha sem perícias avisa em vez de quebrar', () => {
        expect(view({ charsheet: { ...sheet, expertises: {} } as unknown as SummarySheet })).toContain('Esta ficha não possui perícias.');
    });
});
