import type { Creature } from '@models';
import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import CustomCreatureCard from '../CustomCreatureCard';
import CustomCreaturesSection from '../CustomCreaturesSection';
import CreatureToolbar from '../creatures/CreatureToolbar';
import type { CreatureListState } from '../creatures/useCreatureListState';

const mockContext = jest.fn();
jest.mock('@contexts', () => ({ useCampaignContext: () => mockContext() }));
jest.mock('@services', () => ({ campaignService: {} }));
// As ações e a rolagem importam o chat e o barril de enums, que o ts-jest barra por um erro de tipo antigo
jest.mock('../creatures/useCreatureActions', () => ({
    useCreatureActions: () => ({ duplicate: jest.fn(), duplicatingId: null, addToCombat: jest.fn(), addingToCombat: false, combatActive: mockContext().campaign.session?.combat?.isActive ?? false })
}));
jest.mock('../useCreatureDiceRoll', () => ({ useCreatureDiceRoll: () => async () => undefined }));

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const noop = (): void => undefined;

const goblin = {
    id: 'goblin', name: 'Goblin Saqueador', type: 'Humanoide', description: 'Rouba o que vê.', level: 3,
    attributes: { vig: 5, des: 10 }, stats: { lp: 20, maxLp: 25, mp: 4, maxMp: 6, ap: 2 },
    expertises: { Furtividade: { value: 4, defaultAttribute: 'des' } },
    skills: [ { id: 's1', name: 'Emboscada', type: 'Classe', description: 'Ataca primeiro.' } ],
    spells: [ { id: 'm1', name: 'Fagulha', level: 1, element: 'FOGO', cost: 2, description: 'Uma fagulha.' } ],
    dices: [ { id: 'd1', name: 'Mordida', description: '', dices: [ { quantity: 2, faces: 6 } ], modifiers: [ { bonus: 3 } ] } ],
    elementalMastery: 'Fogo', weaknesses: [ 'Água' ], damageModifiers: []
} as unknown as Creature;

const card = (props: Partial<Parameters<typeof CustomCreatureCard>[0]> = {}): string => render(
    <CustomCreatureCard creature={goblin} expanded={false} onToggle={noop} onView={noop} onEdit={noop} onDelete={noop} onDuplicate={noop} {...props} />
);

describe('CustomCreatureCard', () => {
    it('mostra o essencial à vista: nome, nível, tipo, LP, MP, AP, elemento e quantas habilidades, magias e dados', () => {
        const html = card();

        expect(html).toContain('Goblin Saqueador');
        expect(html).toContain('Nv. 3 • Humanoide');
        expect(html).toContain('LP 25');
        expect(html).toContain('MP 6');
        expect(html).toContain('AP 2');
        expect(html).toContain('Fogo');
        expect(html).toContain('1 habilidade • 1 magia • 1 dado');
        expect(html).toContain('Rouba o que vê.');
    });

    it('fechado não monta a ficha completa; aberto mostra atributos, perícias, defesas, habilidades, magias e dados', () => {
        expect(card()).not.toContain('creature-details');
        expect(card()).toContain('aria-expanded="false"');

        const html = card({ expanded: true });
        expect(html).toContain('aria-expanded="true"');
        expect(html).toContain('data-testid="creature-details"');
        expect(html).toContain('>VIG<');
        expect(html).toContain('Furtividade +4');
        expect(html).toContain('Fraquezas: ');
        expect(html).toContain('Água');
        expect(html).toContain('Emboscada');
        expect(html).toContain('Fagulha');
        expect(html).toContain('Nv. 1 • FOGO • 2 MP');
        expect(html).toContain('Mordida');
        expect(html).toContain('2d6 + 3');
    });

    it('o cartão diz se está aberto (é o que o estilo usa para ocupar a linha inteira da grade)', () => {
        expect(card({ expanded: true })).toContain('data-expanded="true"');
        expect(card()).toContain('data-expanded="false"');
    });

    it('as ações rápidas têm nome acessível com o nome da criatura', () => {
        const html = card();

        expect(html).toContain('aria-label="Abrir a ficha de Goblin Saqueador em janela"');
        expect(html).toContain('aria-label="Editar Goblin Saqueador"');
        expect(html).toContain('aria-label="Duplicar Goblin Saqueador"');
        expect(html).toContain('aria-label="Excluir Goblin Saqueador"');
        expect(html).toContain('aria-label="Mostrar tudo de Goblin Saqueador"');
    });

    it('adicionar ao combate só aparece quando há combate ativo (a ação é passada)', () => {
        expect(card()).not.toContain('Adicionar ao combate');
        expect(card({ onAddToCombat: noop })).toContain('aria-label="Adicionar Goblin Saqueador ao combate"');
    });

    it('diz quantas cópias estão em combate', () => {
        expect(card()).not.toContain('Em combate');
        expect(card({ copiesInCombat: 1 })).toContain('Em combate');
        expect(card({ copiesInCombat: 3 })).toContain('Em combate ×3');
    });

    it('esperando o servidor, duplicar e adicionar ao combate ficam desligados', () => {
        const html = card({ busy: true, onAddToCombat: noop });

        expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Adicionar Goblin Saqueador ao combate"/);
        expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Duplicar Goblin Saqueador"/);
        expect(html).not.toMatch(/<button[^>]*disabled[^>]*aria-label="Editar Goblin Saqueador"/);
    });

    it('criatura vazia ou de formato antigo não quebra o cartão', () => {
        const html = card({ creature: { id: 'x', name: undefined, level: 'x', stats: null, skills: 'lixo' } as unknown as Creature, expanded: true });

        expect(html).toContain('Criatura sem nome');
        expect(html).not.toContain('NaN');
        expect(html).not.toContain('undefined');
    });
});

const listState = (patch: Partial<CreatureListState> = {}): CreatureListState => ({
    query: '', setQuery: noop, type: null, setType: noop, sort: 'name', setSort: noop, expanded: new Set(), toggle: noop, expandAll: noop, collapseAll: noop, clearFilters: noop, ...patch
});

describe('CreatureToolbar', () => {
    const types = [ { type: 'Fera', label: 'Fera (2)', count: 2 } ].map(entry => ({ ...entry, label: 'Fera' }));
    const toolbar = (props: Partial<Parameters<typeof CreatureToolbar>[0]> = {}): string =>
        render(<CreatureToolbar state={listState()} types={[ ...types, { type: 'Dragão', label: 'Dragão', count: 1 } ]} total={3} shown={3} visibleIds={[ 'a', 'b', 'c' ]} {...props} />);

    it('tem busca, ordem, expandir todas e um chip por tipo com a contagem', () => {
        const html = toolbar();

        expect(html).toContain('aria-label="Buscar criaturas"');
        expect(html).toContain('Ordenar');
        expect(html).toContain('Nome (A → Z)');
        expect(html).toContain('Expandir todas');
        expect(html).toContain('Todas (3)');
        expect(html).toContain('Fera (2)');
        expect(html).toContain('Dragão (1)');
    });

    it('com um tipo só não mostra os chips de filtro (não ajudariam)', () => {
        expect(toolbar({ types: [ { type: 'Fera', label: 'Fera', count: 3 } ] })).not.toContain('creature-type-filter');
    });

    it('o resultado é uma região de status: total, ou "Mostrando X de N" quando filtrado', () => {
        expect(toolbar()).toContain('role="status"');
        expect(toolbar()).toContain('3 criaturas');
        expect(toolbar({ shown: 1 })).toContain('Mostrando 1 de 3');
    });

    it('o tipo escolhido fica marcado e, com tudo aberto, o botão vira Recolher todas', () => {
        const html = toolbar({ state: listState({ type: 'Fera', expanded: new Set([ 'a', 'b', 'c' ]) }) });

        expect(html).toMatch(/aria-pressed="true"[^>]*>(<[^>]*>)*Fera \(2\)|Fera \(2\)[\s\S]{0,200}aria-pressed="true"/);
        expect(html).toContain('Recolher todas');
    });

    it('sem criaturas na lista o botão de expandir fica desligado', () => {
        expect(toolbar({ visibleIds: [], shown: 0 })).toMatch(/<button[^>]*disabled[^>]*>(<[^>]*>)*Expandir todas/);
    });

    it('com busca mostra o botão de limpar', () => {
        expect(toolbar()).not.toContain('Limpar a busca');
        expect(toolbar({ state: listState({ query: 'lobo' }) })).toContain('aria-label="Limpar a busca"');
    });
});

describe('CustomCreaturesSection', () => {
    const campaignWith = (creatures: unknown[], session?: unknown) => ({ campaign: { id: 'c1', custom: { creatures }, session } });
    const section = (): string => render(<CustomCreaturesSection onView={noop} onEdit={noop} onDelete={noop} onCreate={noop} />);
    const make = (id: string, patch: Record<string, unknown> = {}) => ({ ...(goblin as unknown as Record<string, unknown>), id, name: `Criatura ${id}`, ...patch });

    it('sem criaturas explica e oferece criar, em vez de sumir', () => {
        mockContext.mockReturnValue(campaignWith([]));
        const html = section();

        expect(html).toContain('Criaturas customizadas');
        expect(html).toContain('data-testid="creatures-empty"');
        expect(html).toContain('Nova criatura');
        expect(html).not.toContain('creature-toolbar');
    });

    it('com poucas criaturas mostra o resumo e a grade, sem a barra de busca', () => {
        mockContext.mockReturnValue(campaignWith([ make('a'), make('b', { level: 5 }) ]));
        const html = section();

        expect(html).toContain('2 criaturas • nível médio 4 • maior nível 5');
        expect(html).toContain('data-testid="creatures-grid"');
        expect(html.match(/data-testid="custom-creature-card"/g)).toHaveLength(2);
        expect(html).not.toContain('creature-toolbar');
    });

    it('a partir de 4 criaturas aparece a barra de busca, filtro e ordem', () => {
        mockContext.mockReturnValue(campaignWith([ make('a'), make('b'), make('c', { type: 'Fera' }), make('d') ]));
        const html = section();

        expect(html).toContain('data-testid="creature-toolbar"');
        expect(html).toContain('Humanoide (3)');
        expect(html).toContain('Fera (1)');
    });

    it('com combate ativo oferece adicionar ao combate e mostra quantas cópias já estão lá', () => {
        mockContext.mockReturnValue(campaignWith([ make('a'), make('b') ], { combat: { isActive: true, combatants: [ { id: 'a-1', type: 'creature' }, { id: 'a-2', type: 'creature' } ] } }));
        const html = section();

        expect(html).toContain('aria-label="Adicionar Criatura a ao combate"');
        expect(html).toContain('Em combate ×2');
    });

    it('sem combate ativo não oferece adicionar ao combate', () => {
        mockContext.mockReturnValue(campaignWith([ make('a') ], { combat: { isActive: false, combatants: [ { id: 'a-1', type: 'creature' } ] } }));
        const html = section();

        expect(html).not.toContain('Adicionar ao combate');
        expect(html).not.toContain('Em combate');
    });
});
