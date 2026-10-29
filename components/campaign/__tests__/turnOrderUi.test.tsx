import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Combat, Combatant } from '@models';
import theme from '../../../themes/theme';
import { summarizeTurnOrder } from '@utils/combat/turnOrder';
import CombatOrderList from '../combatStatus/CombatOrderList';
import EffectBadges from '../gmDashboard/actions/EffectBadges';
import TurnOrderStrip from '../combat/TurnOrderStrip';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);

const combatant = (id: string, name: string, type: Combatant['type'], extra: Partial<Combatant> = {}): Combatant =>
    ({ id, name, type, initiativeRoll: 10, initiativeBonus: 0, initiativeTotal: 12, hasActed: false, currentLp: 20, maxLp: 40, currentMp: 0, maxMp: 0, effects: [], ...extra }) as Combatant;

const combat = (overrides: Partial<Combat> = {}): Combat => ({
    isActive: true,
    phase: 'ACTION',
    round: 2,
    currentTurnIndex: 1,
    combatants: [
        combatant('cs-ana', 'Aria Valen', 'player', { initiativeTotal: 21 }),
        combatant('cs-bia', 'Borin Pedraferro', 'player', { initiativeTotal: 18, hasActed: true }),
        combatant('goblin-1', 'Goblin Saqueador', 'creature', { initiativeTotal: 15, currentLp: 9, maxLp: 20 })
    ],
    ...overrides
}) as Combat;

describe('faixa de ordem de turnos', () => {
    const items = summarizeTurnOrder(combat(), { viewerId: 'cs-ana' })!.items;

    it('um retrato por combatente, na ordem, com o turno atual marcado', () => {
        const html = render(<TurnOrderStrip items={items} />);

        expect(html).toContain('data-testid="turn-order"');
        expect(html).toContain('aria-label="Ordem de turnos"');
        expect(html.indexOf('turn-order-cs-ana')).toBeLessThan(html.indexOf('turn-order-cs-bia'));
        expect(html.indexOf('turn-order-cs-bia')).toBeLessThan(html.indexOf('turn-order-goblin-1'));
        // só o de Borin tem a vez
        expect(html.match(/aria-current="step"/g)).toHaveLength(1);
        expect(html).toMatch(/data-testid="turn-order-cs-bia"[^>]*data-current="true"/);
    });

    it('mostra iniciativa, "você" no personagem de quem vê e "agiu" em quem já agiu', () => {
        const html = render(<TurnOrderStrip items={items} />);

        expect(html).toContain('21');
        expect(html).toContain(' · você');
        expect(html).toContain(' · agiu');
    });

    it('a vida só aparece onde o resumo a trouxe (criatura sem vida à mostra não leva barra)', () => {
        const html = render(<TurnOrderStrip items={items} />);

        expect(html).toContain('aria-label="LP de Aria Valen"');
        expect(html).not.toContain('aria-label="LP de Goblin Saqueador"');
    });

    it('com a vida das criaturas à mostra a barra delas entra', () => {
        const shown = summarizeTurnOrder(combat(), { viewerId: 'cs-ana', showCreatureLp: true })!.items;
        expect(render(<TurnOrderStrip items={shown} />)).toContain('aria-label="LP de Goblin Saqueador"');
    });

    it('sem ninguém não quebra', () => {
        expect(render(<TurnOrderStrip items={[]} />)).toContain('data-testid="turn-order"');
    });
});

describe('lista "Ordem de Combate" do card', () => {
    const playerStats = (id: string) => (id === 'cs-ana' ? { lp: 30, maxLp: 45, mp: 5, maxMp: 10 } : null);

    it('marca o turno atual, quem agiu e o personagem de quem vê, sem glifos ✓ ou ○', () => {
        const html = render(<CombatOrderList combat={combat()} viewerId="cs-ana" showEnemyLp={false} playerStats={playerStats} />);

        expect(html).toContain('Ordem de Combate:');
        expect(html).toContain('Aria Valen (você)');
        expect(html).toMatch(/data-testid="combat-order-cs-bia"[^>]*aria-current="step"/);
        expect(html).toContain('agiu');
        expect(html).not.toContain('✓');
        expect(html).not.toContain('○');
    });

    it('a vida da ficha vale mais que a do combatente; a criatura só mostra vida se o mestre deixou', () => {
        const hidden = render(<CombatOrderList combat={combat()} showEnemyLp={false} playerStats={playerStats} />);
        expect(hidden).toContain('30/45');
        expect(hidden).not.toContain('9/20');

        const shown = render(<CombatOrderList combat={combat()} showEnemyLp playerStats={playerStats} />);
        expect(shown).toContain('9/20');
    });

    it('na fase de iniciativa ninguém tem a vez', () => {
        const html = render(<CombatOrderList combat={combat({ phase: 'INITIATIVE' })} showEnemyLp={false} playerStats={playerStats} />);
        expect(html).not.toContain('aria-current="step"');
    });
});

describe('efeitos aplicados', () => {
    const applied = (icon?: string) => ({
        id: 'e1',
        effectId: 'seed-cegueira',
        level: 1,
        remaining: 3,
        snapshot: { name: 'Cegueira', ...(icon ? { icon } : {}), timing: 'turn', levels: [ { level: 1, formula: '0', duration: 3, modifiers: [] } ] }
    });

    it('efeito sem ícone não escreve "undefined" no rótulo', () => {
        const html = render(<EffectBadges effects={[ applied() as never ]} />);
        expect(html).not.toContain('undefined');
        expect(html).toContain('Cegueira');
    });

    it('com ícone o ícone vem antes do nome', () => {
        expect(render(<EffectBadges effects={[ applied('X') as never ]} />)).toContain('X Cegueira');
    });
});
