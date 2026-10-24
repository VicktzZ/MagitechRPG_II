import type { Combatant, Creature } from '@models';
import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../../themes/theme';
import { CombatantView } from '../CombatantView';
import { toCreatureCard } from '../creatureCard';
import { CreatureView } from '../CreatureView';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);

const noop = (): void => undefined;
const asyncNoop = async (): Promise<void> => undefined;

const rawCreature = {
    id: 'goblin',
    name: 'Goblin Saqueador',
    type: 'Humanoide',
    description: 'Rouba o que vê.',
    level: 3,
    attributes: { vig: 5, des: 10 },
    stats: { lp: 20, maxLp: 25, mp: 4, maxMp: 6, ap: 2 },
    expertises: { Furtividade: { value: 4, defaultAttribute: 'des' }, Atletismo: { value: 0, defaultAttribute: 'vig' } },
    skills: [ { id: 's1', name: 'Emboscada', type: 'Classe', description: 'Ataca primeiro.' } ],
    spells: [ { id: 'm1', name: 'Fagulha', level: 1, element: 'FOGO', cost: 2, description: 'Uma fagulha.' } ]
};
const creature = rawCreature as unknown as Creature;

const combatant = (overrides: Record<string, unknown> = {}): Combatant => ({
    id: 'goblin-1', name: 'Goblin A', type: 'creature', currentLp: 9, maxLp: 25, currentMp: 1, maxMp: 6, ...overrides
}) as unknown as Combatant;

describe('CreatureView', () => {
    const view = (raw: Record<string, unknown> = {}) => render(<CreatureView creature={toCreatureCard({ ...rawCreature, ...raw } as unknown as Creature)} onEdit={noop} onDelete={noop} />);

    it('mostra quem é, vida e mana base, atributos, perícias, habilidades e magias', () => {
        const html = view();
        expect(html).toContain('Goblin Saqueador');
        expect(html).toContain('Nv. 3 • Humanoide');
        expect(html).toContain('Rouba o que vê.');
        expect(html).toContain('aria-label="Vida de Goblin Saqueador"');
        expect(html).toContain('20/25');
        expect(html).toContain('aria-label="Mana de Goblin Saqueador"');
        expect(html).toContain('>VIG<');
        expect(html).toContain('mod +2');
        expect(html).toContain('Furtividade +4 (DES)');
        expect(html).toContain('Habilidades (1)');
        expect(html).toContain('Emboscada');
        expect(html).toContain('Magias (1)');
        expect(html).toContain('Fagulha');
        expect(html).toContain('Nv. 1 • FOGO • 2 MP');
    });

    it('perícia sem valor não aparece (só poluiria a janela)', () => {
        expect(view()).not.toContain('Atletismo');
    });

    it('tem as ações de editar e excluir', () => {
        const html = view();
        expect(html).toContain('Editar criatura');
        expect(html).toContain('Excluir criatura');
    });

    it('criatura vazia explica que não há perícias, habilidades nem magias, sem quebrar', () => {
        const html = view({ expertises: {}, skills: [], spells: [], attributes: {}, description: '', type: '' });
        expect(html).toContain('Nenhuma perícia com valor.');
        expect(html).toContain('Nenhuma habilidade.');
        expect(html).toContain('Nenhuma magia.');
        expect(html).not.toContain('Atributos');
        expect(html).not.toContain('NaN');
        expect(html).not.toContain('undefined');
    });

    it('só mostra a armadura quando há', () => {
        expect(view()).toContain('Armadura (AP)');
        expect(view({ stats: { lp: 5, maxLp: 5, mp: 0, maxMp: 0, ap: 0 } })).not.toContain('Armadura (AP)');
    });
});

describe('CombatantView', () => {
    const view = (props: Partial<Parameters<typeof CombatantView>[0]> = {}) => render(
        <CombatantView combatant={combatant()} creature={creature} inTurn={false} onAdjustVital={noop} onRollExpertise={asyncNoop} onOpenCreature={noop} {...props} />
    );

    it('mostra o que mudou no combate (vida e mana do combatente, não os da criatura base)', () => {
        const html = view();
        expect(html).toContain('Goblin A');
        expect(html).toContain('aria-label="Vida de Goblin A"');
        expect(html).toContain('9/25');
        expect(html).toContain('1/6');
        expect(html).not.toContain('20/25');
    });

    it('tem dano e cura rápidos: um campo de valor e − e + para vida e mana, com o nome da criatura', () => {
        const html = view();
        expect(html).toContain('Pontos vitais');
        expect(html).toContain('aria-label="Valor a aplicar em Goblin A"');
        expect(html).toContain('aria-label="Reduzir Vida de Goblin A em 1"');
        expect(html).toContain('aria-label="Aumentar Vida de Goblin A em 1"');
        expect(html).toContain('aria-label="Reduzir Mana de Goblin A em 1"');
        expect(html).toContain('aria-label="Aumentar Mana de Goblin A em 1"');
    });

    it('sem mana máxima só vida tem dano e cura rápidos', () => {
        const html = view({ combatant: combatant({ currentMp: 0, maxMp: 0 }), creature: { ...rawCreature, stats: { lp: 20, maxLp: 25, mp: 0, maxMp: 0 } } as unknown as Creature });
        expect(html).toContain('Reduzir Vida de Goblin A');
        expect(html).not.toContain('Reduzir Mana');
    });

    it('sem vida atual no combatente, cai nos valores da criatura', () => {
        const html = view({ combatant: combatant({ currentLp: undefined, maxLp: undefined, currentMp: undefined, maxMp: undefined }) });
        expect(html).toContain('20/25');
        expect(html).toContain('4/6');
    });

    it('marca de quem é a vez', () => {
        expect(view()).not.toContain('Em turno');
        expect(view({ inTurn: true })).toContain('Em turno');
    });

    it('cada perícia da criatura é um botão de rolar, como no cartão do combate', () => {
        const html = view();
        expect(html).toContain('Furtividade');
        expect(html).toContain('Atletismo');
        expect(html.match(/<button/g)?.length).toBeGreaterThanOrEqual(2);
    });

    it('as perícias começam em ordem alfabética e dá para buscar e trocar a ordem', () => {
        const html = view();
        expect(html).toContain('aria-label="Buscar perícia"');
        expect(html).toContain('aria-label="Ordenar perícias"');
        expect(html).toContain('value="alpha-asc"');
        // a criatura guarda Furtividade antes de Atletismo; a lista mostra A → Z
        expect(html.indexOf('Atletismo')).toBeGreaterThan(-1);
        expect(html.indexOf('Atletismo')).toBeLessThan(html.indexOf('Furtividade'));
    });

    it('criatura sem perícias não mostra os controles', () => {
        const html = view({ creature: { ...rawCreature, expertises: {} } as unknown as Creature });
        expect(html).not.toContain('aria-label="Buscar perícia"');
    });

    it('o nível de cada perícia aparece em português, não com o nome interno em inglês', () => {
        const html = view();
        expect(html).toContain('Treinado');
        expect(html).toContain('Destreinado');
        expect(html).not.toMatch(/Trained|Novice|Expert\b|Legendary/);
    });

    it('tem o atalho para a ficha da criatura quando ela existe', () => {
        expect(view()).toContain('Ver ficha da criatura');
        expect(view({ onOpenCreature: undefined })).not.toContain('Ver ficha da criatura');
    });

    it('criatura excluída da campanha: mostra o estado do combate e explica que não há perícias', () => {
        const html = view({ creature: null });
        expect(html).toContain('Goblin A');
        expect(html).toContain('9/25');
        expect(html).toContain('não está mais na campanha');
        expect(html).not.toContain('Ver ficha da criatura');
    });

    it('criatura sem perícias configuradas avisa', () => {
        const html = view({ creature: { ...rawCreature, expertises: {} } as unknown as Creature });
        expect(html).toContain('Esta criatura não possui perícias configuradas.');
    });

    it('sem mana máxima não desenha a barra de mana', () => {
        const html = view({ combatant: combatant({ currentMp: 0, maxMp: 0 }), creature: { ...rawCreature, stats: { lp: 20, maxLp: 25, mp: 0, maxMp: 0 } } as unknown as Creature });
        expect(html).not.toContain('Mana de');
    });
});
