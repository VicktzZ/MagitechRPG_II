import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Combatant, Creature } from '@models';
import theme from '../../../../../themes/theme';
import SummonAttackForm, { emptySummonAttackDraft, toSummonAttackChoice } from '../SummonAttackForm';
import SummonCard from '../SummonCard';

// O barril de @enums puxa subscriptionEnum.ts, que o ts-jest barra por um erro de tipo antigo (ver CLAUDE.md)
jest.mock('@enums', () => ({ MessageType: { TEXT: 'text', DICE: 'dice', COMBAT_LOG: 'combat_log' } }));

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const golem = { id: 'golem-1', name: 'Golem Arcano', type: 'creature', controllerId: 'u-aria', summonerId: 'aria', initiativeTotal: 14, currentLp: 40, maxLp: 40, currentMp: 0, maxMp: 0, effects: [] } as unknown as Combatant;
const creature = {
    id: 'golem', name: 'Golem Arcano', stats: { lp: 40, maxLp: 40 },
    dices: [ { id: 'soco', name: 'Soco Rúnico', description: '', dices: [ { quantity: 3, faces: 10 } ], modifiers: [] } ]
} as unknown as Creature;

const card = (props: Partial<Parameters<typeof SummonCard>[0]> = {}): string => render(
    <SummonCard summon={golem} creature={creature} summonerName="Aria" current={false} acting busyKey={null} onSpend={jest.fn()} onPassTurn={jest.fn()} onRollDice={jest.fn()} onAttack={jest.fn()} {...props} />
);

describe('SummonCard', () => {
    it('mostra o nome, de quem é, a vida, as ações da rodada, os dados dele e o botão de atacar', () => {
        const html = card();
        expect(html).toContain('data-testid="summon-card-golem-1"');
        expect(html).toContain('Golem Arcano');
        expect(html).toContain('Invocado por Aria');
        expect(html).toContain('aria-label="Vida de Golem Arcano"');
        expect(html).toContain('40/40');
        expect(html).toContain('data-testid="action-pip-padrao"');
        expect(html).toContain('aria-label="Rolar Soco Rúnico de Golem Arcano"');
        expect(html).toContain('3d10');
        expect(html).toContain('aria-label="Atacar com Golem Arcano"');
        expect(html).toContain('Init 14');
    });

    it('fora da vez dele não há "Passar o turno"; na vez dele há, com o destaque', () => {
        expect(card()).not.toContain('Passar o turno');
        expect(card()).not.toContain('data-current="true"');
        const turn = card({ current: true });
        expect(turn).toContain('aria-label="Passar o turno de Golem Arcano"');
        expect(turn).toContain('data-current="true"');
        expect(turn).toContain('Sua vez');
    });

    it('antes da fase de ação não há ações para gastar nem como atacar', () => {
        const html = card({ acting: false });
        expect(html).not.toContain('action-pip-padrao');
        expect(html).toMatch(/aria-label="Atacar com Golem Arcano"[^>]*disabled|disabled[^>]*aria-label="Atacar com Golem Arcano"/);
    });

    it('invocado sem dados cadastrados não lista dados, e sem a criatura de origem a vida vem do combatente', () => {
        const html = card({ creature: undefined });
        expect(html).not.toContain('summon-dice-golem-1');
        expect(html).toContain('40/40');
    });
});

describe('SummonAttackForm', () => {
    const targets = [ { id: 'aria', name: 'Aria' }, { id: 'orc-1', name: 'Orc' } ];
    const form = (props: Partial<Parameters<typeof SummonAttackForm>[0]> = {}): string => render(
        <SummonAttackForm summonName="Golem Arcano" targets={targets} creature={creature} draft={emptySummonAttackDraft()} onChange={jest.fn()} busy={false} onSubmit={jest.fn()} {...props} />
    );

    it('traz alvo, perícia, dado, natureza e elemento, e o botão fica desabilitado sem alvo', () => {
        const html = form();
        expect(html).toContain('Golem Arcano testa o acerto');
        expect(html).toContain('Alvo');
        expect(html).toContain('Perícia do acerto');
        expect(html).toContain('Dado do dano');
        expect(html).toContain('Natureza');
        expect(html).toMatch(/<button[^>]*disabled[^>]*>Atacar<|<button[^>]*>Atacar<[^>]*disabled/);
    });

    it('invocado sem dados avisa que o mestre diz o dano', () => {
        expect(form({ creature: { ...creature, dices: [] } as unknown as Creature })).toContain('o mestre diz o dano');
    });

    it('o rascunho só vira escolha com alvo e perícia de ataque; o resto é opcional e é aparado', () => {
        expect(toSummonAttackChoice(emptySummonAttackDraft())).toBeNull();
        expect(toSummonAttackChoice({ ...emptySummonAttackDraft(), targetId: 'orc-1', skill: 'Furtividade' })).toBeNull();
        expect(toSummonAttackChoice({ ...emptySummonAttackDraft(), targetId: 'orc-1' })).toEqual({ targetId: 'orc-1', skill: 'Luta', kind: 'fisico' });
        expect(toSummonAttackChoice({ targetId: 'orc-1', skill: 'Magia', diceId: 'soco', kind: 'magico', attackType: '  Fogo ' })).toEqual({ targetId: 'orc-1', skill: 'Magia', diceId: 'soco', kind: 'magico', attackType: 'Fogo' });
    });
});
