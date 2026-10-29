import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Combatant, Creature } from '@models';
import theme from '../../../../../themes/theme';
import AttentionNotice from '../AttentionNotice';
import CombatantRow from '../CombatantRow';
import GMCombatPanel from '../GMCombatPanel';
import type { CombatantActions } from '../useCombatantActions';

const mockContext = jest.fn();
jest.mock('@contexts', () => ({ useCampaignContext: () => mockContext() }));
jest.mock('@services', () => ({ campaignService: {} }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: { user: { id: 'gm' } } }) }));
// A rolagem da criatura importa o barril de enums, que o ts-jest barra por um erro de tipo antigo
jest.mock('../../dashboard/useCreatureExpertiseRoll', () => ({ useCreatureExpertiseRoll: () => async () => undefined }));

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const combatant = (patch: Partial<Combatant> = {}): Combatant => ({
    id: 'aria', name: 'Aria', type: 'player', initiativeRoll: 21, initiativeBonus: 0, initiativeTotal: 21, hasActed: false, currentLp: 38, maxLp: 45, currentMp: 21, maxMp: 30, effects: [], ...patch
} as Combatant);

const goblinCreature = {
    id: 'goblin', name: 'Goblin', level: 3, attributes: { foc: 4, des: 10 }, stats: { lp: 20, maxLp: 20, mp: 8, maxMp: 8, ap: 12 },
    expertises: { Atletismo: { value: 2, defaultAttribute: 'vig' } }
} as unknown as Creature;

const actions: CombatantActions = {
    applyEffect: jest.fn(),
    damageHeal: jest.fn(),
    removeEffect: jest.fn(),
    setMpSpent: jest.fn(),
    resetMpLimit: jest.fn(),
    releaseMpLimit: jest.fn(),
    toggleAction: jest.fn(),
    openWindow: jest.fn(),
    rollCreatureExpertise: jest.fn(),
    togglingAction: false,
    dialogs: null
};

const vitals = { lp: 38, maxLp: 45, mp: 21, maxMp: 30 };
const noMp = { enforced: false, limit: 0, spent: 0, released: false };

const row = (props: Partial<Parameters<typeof CombatantRow>[0]> = {}): string => render(
    <CombatantRow combatant={combatant()} phase="ACTION" current={false} vitals={vitals} mp={noMp} actions={actions} busy={false} onRollInitiative={jest.fn()} {...props} />
);

describe('CombatantRow', () => {
    it('jogador em turno: filete e chip "Em turno", vida e mana nomeadas e as ações da rodada', () => {
        const html = row({ current: true });

        expect(html).toContain('data-testid="combatant-row-aria"');
        expect(html).toContain('data-current="true"');
        expect(html).toContain('Em turno');
        expect(html).toContain('aria-label="Vida de Aria"');
        expect(html).toContain('aria-label="Mana de Aria"');
        expect(html).toContain('38/45');
        expect(html).toContain('data-testid="action-pip-padrao"');
        expect(html).toContain('data-testid="action-pip-reacao"');
        expect(html).toContain('aria-label="Aplicar efeito em Aria"');
        expect(html).toContain('aria-label="Aplicar dano em Aria"');
        expect(html).toContain('aria-label="Aplicar cura em Aria"');
        expect(html).toContain('aria-label="Abrir Aria em janela"');
    });

    it('fora do turno não leva o destaque, e jogador não tem "Perícias" nem chip de criatura', () => {
        const html = row();

        expect(html).not.toContain('data-current="true"');
        expect(html).not.toContain('Em turno');
        expect(html).not.toContain('Perícias');
        expect(html).not.toContain('Criatura');
    });

    it('o limite de MP por turno aparece só onde a regra vale, com o menu do mestre', () => {
        expect(row()).not.toContain('MP no turno');
        expect(row()).not.toContain('Limite de MP de Aria');

        const html = row({ mp: { enforced: true, limit: 11, spent: 4, released: false } });
        expect(html).toContain('MP no turno:');
        expect(html).toContain('4/11');
        expect(html).toContain('aria-label="Limite de MP de Aria"');

        expect(row({ mp: { enforced: true, limit: 11, spent: 4, released: true } })).toContain('(liberado)');
    });

    it('criatura: perícias recolhidas (nenhuma das 44 é desenhada até o mestre abrir)', () => {
        const html = row({ combatant: combatant({ id: 'goblin-1', name: 'Goblin', type: 'creature' }), creature: goblinCreature });

        expect(html).toContain('Criatura');
        expect(html).toContain('Perícias');
        expect(html).toContain('aria-expanded="false"');
        expect(html).not.toContain('Atletismo');
    });

    it('fase de iniciativa: sem ações da rodada; pendente mostra o d20 e o dado, e quem já rolou mostra o total', () => {
        const pending = row({ phase: 'INITIATIVE', combatant: combatant({ initiativeRoll: 0, initiativeTotal: 0 }) });
        expect(pending).not.toContain('action-pip-');
        expect(pending).toContain('Aguardando');
        expect(pending).toContain('aria-label="Valor do d20 de iniciativa de Aria"');
        expect(pending).toContain('aria-label="Rolar a iniciativa de Aria"');

        const creaturePending = row({ phase: 'INITIATIVE', combatant: combatant({ type: 'creature', initiativeRoll: 0, initiativeTotal: 0 }) });
        expect(creaturePending).not.toContain('Aguardando');
        expect(creaturePending).toContain('aria-label="Rolar a iniciativa de Aria"');

        expect(row({ phase: 'INITIATIVE', combatant: combatant({ initiativeRoll: 15, initiativeTotal: 15 }) })).toContain('Iniciativa 15');
    });

    it('efeito sem ícone não escreve "undefined"', () => {
        const effect = { id: 'e1', effectId: 'seed-cegueira', level: 1, remaining: 3, snapshot: { name: 'Cegueira Simples', levels: [] } };
        const html = row({ combatant: combatant({ effects: [ effect ] as unknown as Combatant['effects'] }) });

        expect(html).toContain('Cegueira Simples');
        expect(html).not.toContain('undefined');
    });
});

describe('AttentionNotice', () => {
    it('diz o que espera o mestre e oferece levá-lo à aba', () => {
        const html = render(<AttentionNotice attention={{ attacks: 2, opportunities: 1, reactions: 0, total: 3 }} onSee={jest.fn()} />);

        expect(html).toContain('2 ataques esperando você');
        expect(html).toContain('1 saída de alcance aberta');
        expect(html).toContain('Ver na aba Ataques');
    });

    it('sem nada esperando não desenha nada', () => {
        expect(render(<AttentionNotice attention={{ attacks: 0, opportunities: 0, reactions: 0, total: 0 }} onSee={jest.fn()} />)).toBe('');
    });
});

const campaignWith = (combat: Record<string, unknown> | undefined) => ({
    campaign: {
        id: 'c1',
        admin: [ 'gm' ],
        campaignCode: 'DEMO',
        mode: 'Classic',
        players: [],
        custom: { creatures: [ goblinCreature ] },
        session: { combat }
    },
    charsheets: [
        { id: 'aria', level: 5, attributes: { foc: 4 }, stats: { lp: 38, maxLp: 45, mp: 21, maxMp: 30 } },
        { id: 'borin', level: 5, attributes: { foc: 3 }, stats: { lp: 52, maxLp: 60, mp: 8, maxMp: 12 } }
    ],
    users: { players: [] }
});

const activeCombat = (patch: Record<string, unknown> = {}) => ({
    isActive: true,
    phase: 'ACTION',
    round: 3,
    currentTurnIndex: 1,
    logs: [],
    combatants: [
        combatant({ id: 'aria', name: 'Aria Valen' }),
        combatant({ id: 'borin', name: 'Borin Pedraferro', initiativeTotal: 18 }),
        combatant({ id: 'goblin-1', name: 'Goblin Saqueador', type: 'creature', initiativeTotal: 12, currentLp: 20, maxLp: 20 })
    ],
    ...patch
});

describe('GMCombatPanel', () => {
    it('sem combate ativo não desenha nada (começar é o diálogo "Iniciar combate")', () => {
        mockContext.mockReturnValue(campaignWith(undefined));
        expect(render(<GMCombatPanel />)).toBe('');

        mockContext.mockReturnValue(campaignWith(activeCombat({ isActive: false })));
        expect(render(<GMCombatPanel />)).toBe('');
    });

    it('fase de ação: rodada, de quem é a vez, comandos, ordem de turnos, abas e a lista de combatentes', () => {
        mockContext.mockReturnValue(campaignWith(activeCombat()));
        const html = render(<GMCombatPanel />);

        expect(html).toContain('id="combate"');
        expect(html).toContain('Rodada 3');
        expect(html).toContain('Fase de ação');
        expect(html).toContain('Borin Pedraferro');
        expect(html).toContain('Passar turno');
        expect(html).toContain('Encerrar combate');
        // dano e cura narrados ficam no topo fixo, à mão sem rolar até a linha do alvo
        expect(html).toContain('>Dano<');
        expect(html).toContain('>Cura<');
        expect(html).not.toContain('Definir ordem');
        // a faixa de ordem do topo, com todos
        expect(html).toContain('aria-label="Ordem de turnos"');
        expect(html).toContain('data-testid="turn-order-goblin-1"');
        // as abas
        expect(html).toContain('aria-label="Seções do combate"');
        expect(html).toContain('Combatentes (3)');
        expect(html).toContain('Ataques');
        expect(html).toContain('Ambiente');
        expect(html).toContain('Histórico');
        // a aba aberta é a dos combatentes: uma linha por um e só um dos em turno
        expect(html).toContain('data-testid="combatant-row-aria"');
        expect(html).toContain('data-testid="combatant-row-goblin-1"');
        expect(html.match(/data-current="true"/g)?.length).toBeGreaterThanOrEqual(1);
        // vida da criatura sempre à vista do mestre
        expect(html).toContain('aria-label="Vida de Goblin Saqueador"');
    });

    it('com ataques esperando, avisa na aba dos combatentes e o selo conta tudo que espera', () => {
        mockContext.mockReturnValue(campaignWith(activeCombat({ pendingAttacks: [ {}, {} ], opportunities: [ {} ] })));
        const html = render(<GMCombatPanel />);

        expect(html).toContain('data-testid="combat-attention"');
        expect(html).toContain('2 ataques esperando você');
        expect(html).toContain('1 saída de alcance aberta');
        expect(html).toContain('>3<');
    });

    it('sem nada esperando não há aviso', () => {
        mockContext.mockReturnValue(campaignWith(activeCombat()));
        expect(render(<GMCombatPanel />)).not.toContain('combat-attention');
    });

    it('fase de iniciativa: diz quem falta rolar e só oferece "Definir ordem" quando todos rolaram', () => {
        const waiting = activeCombat({
            phase: 'INITIATIVE',
            combatants: [ combatant({ id: 'aria', name: 'Aria Valen' }), combatant({ id: 'borin', name: 'Borin Pedraferro', initiativeRoll: 0, initiativeTotal: 0 }) ]
        });
        mockContext.mockReturnValue(campaignWith(waiting));
        const pending = render(<GMCombatPanel />);

        expect(pending).toContain('Fase de iniciativa');
        expect(pending).toContain('Falta 1 rolar a iniciativa');
        expect(pending).not.toContain('Definir ordem');
        expect(pending).not.toContain('Passar turno');
        // na iniciativa não há ataque para resolver: o aviso fica de fora
        expect(pending).not.toContain('combat-attention');

        mockContext.mockReturnValue(campaignWith(activeCombat({ phase: 'INITIATIVE' })));
        const ready = render(<GMCombatPanel />);
        expect(ready).toContain('Definir ordem');
        expect(ready).not.toContain('Passar turno');
    });
});
