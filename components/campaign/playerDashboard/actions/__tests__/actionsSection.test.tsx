import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import ActionsSection from '../ActionsSection';

const mockCampaign = jest.fn();
const mockCharsheet = jest.fn();
const mockWeaponRolls = jest.fn();
const mockCasting = jest.fn();

jest.mock('@contexts', () => ({
    useCampaignContext: () => mockCampaign(),
    useCampaignCurrentCharsheetContext: () => mockCharsheet()
}));
// O barril de @enums puxa subscriptionEnum.ts, que o ts-jest barra por um erro de tipo antigo (ver CLAUDE.md)
jest.mock('@enums', () => ({ MessageType: { TEXT: 'text', DICE: 'dice', COMBAT_LOG: 'combat_log' } }));
jest.mock('../../inventory/useWeaponRolls', () => ({ useWeaponRolls: () => mockWeaponRolls() }));
jest.mock('../../spells/SpellCastingContext', () => ({ useSpellCasting: () => mockCasting() }));
jest.mock('../useItemUse', () => ({ useItemUse: () => ({ activateItem: jest.fn() }) }));

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const sword = { id: 'w1', name: 'Espada Longa', categ: 'Arma Branca', range: 'Corpo-a-corpo', effect: { value: '1d8', critValue: '2d8' } };
const spell = (patch: Record<string, unknown> = {}) => ({ id: 's1', name: 'Brasa Voraz', level: 1, element: 'FOGO', type: 'Ataque (imediato)', execution: 'Padrão', mpCost: 2, stages: [], ...patch });

const sheet = (patch: Record<string, unknown> = {}) => ({
    id: 'aria', name: 'Aria', class: 'Mago', stats: { mp: 10 }, expertises: {},
    inventory: {
        weapons: [ sword ],
        armors: [],
        items: [
            { id: 'i1', name: 'Poção de Cura', kind: 'Consumível', description: 'Recupera vida.', quantity: 1 },
            { id: 'i2', name: 'Corda', kind: 'Utilidade', quantity: 1 },
            { id: 'i3', name: 'Balas', kind: 'Munição', quantity: 20 }
        ]
    },
    spells: [ spell(), spell({ id: 's2', name: 'Cura Leve', type: 'Cura (imediato)', execution: 'Bônus' }), spell({ id: 's3', name: 'Escudo', type: 'Defesa (imediato)', execution: 'Reação' }) ],
    ...patch
});

const combatWith = (patch: Record<string, unknown> = {}, me: Record<string, unknown> = {}) => ({
    isActive: true, phase: 'ACTION', round: 1, currentTurnIndex: 0, logs: [], pendingAttacks: [],
    combatants: [ { id: 'aria', name: 'Aria', type: 'player', effects: [], ...me }, { id: 'goblin-1', name: 'Goblin', type: 'creature', effects: [] } ],
    ...patch
});

const setup = (options: { combat?: Record<string, unknown> | null; me?: Record<string, unknown>; targetId?: string; sheetPatch?: Record<string, unknown> } = {}) => {
    const combat = options.combat === null ? undefined : combatWith(options.combat, options.me);
    mockCampaign.mockReturnValue({ campaign: { id: 'c1', session: { combat } } });
    mockCharsheet.mockReturnValue({ charsheet: sheet(options.sheetPatch) });
    const targeting = {
        enabled: true,
        targets: [ { id: 'goblin-1', name: 'Goblin', type: 'creature' } ],
        targetId: options.targetId ?? '',
        setTargetId: jest.fn(),
        extraTargetIds: [],
        setExtraTargetIds: jest.fn(),
        pending: [],
        opportunity: { current: null, active: false, setUse: jest.fn() }
    };
    mockWeaponRolls.mockReturnValue({ handleWeaponHit: jest.fn(), handleWeaponDamage: jest.fn(), targeting });
    mockCasting.mockReturnValue({
        stageRule: false, sustainedActive: {}, pendingEffects: {}, castingSpellId: null, effectingSpellId: null,
        castSpell: jest.fn(), endSustained: jest.fn(), effectSpell: jest.fn()
    });
};

/** Os quadrados de um grupo, como [nome, estado] */
const tilesOf = (html: string, category: string): Array<[ string, string ]> => {
    const group = new RegExp(`data-testid="actions-group-${category}"[\\s\\S]*?(?=data-testid="actions-group-|$)`).exec(html)?.[0] ?? '';
    return [ ...group.matchAll(/data-testid="action-tile" data-state="(\w+)"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/g) ].map(match => [ match[2]!, match[1]! ]);
};

describe('ActionsSection', () => {
    it('só aparece em combate ativo, para quem está nele', () => {
        setup({ combat: null });
        expect(render(<ActionsSection />)).toBe('');

        setup({ combat: { isActive: false } });
        expect(render(<ActionsSection />)).toBe('');

        setup({ combat: { combatants: [ { id: 'goblin-1', name: 'Goblin', type: 'creature', effects: [] } ] } });
        expect(render(<ActionsSection />)).toBe('');
    });

    it('mostra as ações da rodada, o filtro por ação com os contadores e os três grupos', () => {
        setup();
        const html = render(<ActionsSection />);

        expect(html).toContain('Ações');
        expect(html).toContain('data-testid="action-pip-padrao"');
        expect(html).toContain('Tudo (');
        for (const label of [ 'Padrão (', 'Movimento (', 'Bônus (', 'Reação (', 'Completa (' ]) expect(html).toContain(label);
        for (const label of [ 'Ataque', 'Cura', 'Outros' ]) expect(html).toContain(`>${label}<`);
    });

    it('separa armas, magias e itens em Ataque, Cura e Outros; item inerte (munição) não entra', () => {
        setup();
        const html = render(<ActionsSection />);

        expect(tilesOf(html, 'attack').map(([ name ]) => name)).toEqual([ 'Espada Longa', 'Brasa Voraz' ]);
        expect(tilesOf(html, 'heal').map(([ name ]) => name)).toEqual([ 'Cura Leve', 'Poção de Cura' ]);
        expect(tilesOf(html, 'other').map(([ name ]) => name)).toEqual([ 'Escudo', 'Corda' ]);
        expect(html).not.toContain('Balas');
    });

    it('o alvo do ataque é escolhido aqui, no grupo de Ataque, e sem alvo os quadrados de ataque ficam bloqueados (cura e outros seguem livres)', () => {
        setup();
        const html = render(<ActionsSection />);

        expect(html).toContain('data-testid="attack-target-picker"');
        expect(tilesOf(html, 'attack')).toEqual([ [ 'Espada Longa', 'blocked' ], [ 'Brasa Voraz', 'blocked' ] ]);
        expect(tilesOf(html, 'heal').every(([ , state ]) => state === 'ready')).toBe(true);
        expect(tilesOf(html, 'other').every(([ , state ]) => state === 'ready')).toBe(true);
    });

    it('com o alvo definido os quadrados de ataque ficam prontos', () => {
        setup({ targetId: 'goblin-1' });

        expect(tilesOf(render(<ActionsSection />), 'attack')).toEqual([ [ 'Espada Longa', 'ready' ], [ 'Brasa Voraz', 'ready' ] ]);
    });

    it('gastar a Padrão deixa cinza e desativado todo quadrado de Padrão (de qualquer grupo), e só eles', () => {
        setup({ targetId: 'goblin-1', me: { actions: { padrao: 0, bonus: 1, movimento: 1, reacao: 1 } } });
        const html = render(<ActionsSection />);

        expect(tilesOf(html, 'attack')).toEqual([ [ 'Espada Longa', 'spent' ], [ 'Brasa Voraz', 'spent' ] ]);
        // Bônus, Reação e Movimento continuam livres
        expect(tilesOf(html, 'heal')).toEqual([ [ 'Cura Leve', 'ready' ], [ 'Poção de Cura', 'ready' ] ]);
        expect(tilesOf(html, 'other')).toEqual([ [ 'Escudo', 'ready' ], [ 'Corda', 'ready' ] ]);
        expect(html).toMatch(/data-state="spent"[^>]*data-execution="Padrão"/);
        expect(html).toContain('Padrão · gasta');
        expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Espada Longa: Sem a ação Padrão nesta rodada\."/);
    });

    it('gastar o Movimento apaga a Poção e a Corda; gastar a Reação apaga o Escudo', () => {
        setup({ targetId: 'goblin-1', me: { actions: { padrao: 1, bonus: 1, movimento: 0, reacao: 0 } } });
        const html = render(<ActionsSection />);

        expect(tilesOf(html, 'heal')).toEqual([ [ 'Cura Leve', 'ready' ], [ 'Poção de Cura', 'spent' ] ]);
        expect(tilesOf(html, 'other')).toEqual([ [ 'Escudo', 'spent' ], [ 'Corda', 'spent' ] ]);
        expect(tilesOf(html, 'attack').every(([ , state ]) => state === 'ready')).toBe(true);
    });

    it('antes da fase de ação nada está pronto e o campo do alvo espera a fase', () => {
        setup({ combat: { phase: 'INITIATIVE' } });
        const html = render(<ActionsSection />);

        for (const category of [ 'attack', 'heal', 'other' ]) {
            expect(tilesOf(html, category).every(([ , state ]) => state === 'blocked')).toBe(true);
        }
        expect(html).toContain('As ações abrem quando a iniciativa estiver definida.');
    });

    it('arma que acertou e espera o dano mostra Dano e Crítico no quadrado; magia conjurada com sucesso mostra Efetuar', () => {
        setup({ targetId: 'goblin-1', combat: { pendingAttacks: [ { id: 'p1', attackerId: 'aria', source: 'weapon', name: 'Espada Longa', targetId: 'goblin-1', createdAt: 'x' } ] } });
        mockCasting.mockReturnValue({ ...mockCasting(), pendingEffects: { s1: 1 } });
        const html = render(<ActionsSection />);

        expect(html).toContain('>Dano<');
        expect(html).toContain('>Crítico<');
        expect(html).toContain('aria-label="Efetuar Brasa Voraz"');
    });

    it('a vez do personagem aparece marcada', () => {
        setup({ targetId: 'goblin-1' });
        expect(render(<ActionsSection />)).toContain('Sua vez');

        setup({ combat: { currentTurnIndex: 1 } });
        expect(render(<ActionsSection />)).not.toContain('Sua vez');
    });
});
