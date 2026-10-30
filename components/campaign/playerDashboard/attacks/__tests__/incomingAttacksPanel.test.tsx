import { ThemeProvider } from '@mui/material';
import { buildAttackReaction, reactionOptionsFor } from '@utils/combat/attackReactions';
import { findPassiveByKey, NO_USES } from '@utils/combat/passives';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import IncomingAttacksPanel from '../IncomingAttacksPanel';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const attack = (patch: Partial<PendingAttackData> = {}): PendingAttackData => ({
    id: 'a1', attackerId: 'goblin-1', attackerName: 'Goblin', targetId: 'caio', targetName: 'Caio', source: 'manual', name: 'Machadada', kind: 'fisico',
    attackType: 'Cortante', attackTotal: 17, rolls: [], bonus: 0, createdAt: '2026-10-28T12:00:00.000Z', ...patch
});

const panel = (props: Partial<Parameters<typeof IncomingAttacksPanel>[0]> = {}): string => render(
    <IncomingAttacksPanel awaiting={[ attack() ]} answered={[]} hasReaction busyId={null} onDefend={() => undefined} {...props} />
);

describe('IncomingAttacksPanel', () => {
    it('sem ataques ao personagem não aparece', () => {
        expect(panel({ awaiting: [], answered: [] })).toBe('');
    });

    it('diz quem atacou, com o quê e o total, e oferece as três defesas', () => {
        const html = panel();

        expect(html).toContain('Goblin atacou você');
        expect(html).toContain('Machadada · Cortante');
        expect(html).toContain('17');
        expect(html).toContain('Esquivar (Reflexos)');
        expect(html).toContain('Resistir (RES Física)');
        expect(html).toContain('Não me defender');
    });

    it('a resistência pede a RES da natureza do ataque, e magia Psíquica pede a mental', () => {
        expect(panel({ awaiting: [ attack({ kind: 'magico', attackType: 'FOGO' }) ] })).toContain('Resistir (RES Mágica)');
        expect(panel({ awaiting: [ attack({ kind: 'magico', attackType: 'PSÍQUICO' }) ] })).toContain('Resistir (RES Mental)');
    });

    it('não oferece a esquiva sem Reação, contra ataque mental nem contra área grande', () => {
        const disabledDodge = /<button[^>]*disabled[^>]*>[^<]*(<span[^>]*>.*?<\/span>)?Esquivar/;

        expect(panel({ hasReaction: false })).toMatch(disabledDodge);
        expect(panel({ awaiting: [ attack({ kind: 'mental' }) ] })).toMatch(disabledDodge);
        expect(panel({ awaiting: [ attack({ areaMeters: 6 }) ] })).toMatch(disabledDodge);
        expect(panel()).not.toMatch(disabledDodge);
    });

    it('não oferece a esquiva contra quem ele não via (ataque de surpresa); a resistência continua', () => {
        const disabledDodge = /<button[^>]*disabled[^>]*>[^<]*(<span[^>]*>.*?<\/span>)?Esquivar/;

        expect(panel({ isSurprised: () => true })).toMatch(disabledDodge);
        expect(panel({ isSurprised: () => false })).not.toMatch(disabledDodge);
        const resist = panel({ isSurprised: () => true }).split('<button').find(chunk => chunk.includes('Resistir ('));
        expect(resist).toBeDefined();
        expect(resist).not.toContain('disabled');
    });

    it('enquanto responde um ataque, os botões dele ficam desabilitados', () => {
        expect(panel({ busyId: 'a1' })).toMatch(/<button[^>]*disabled[^>]*>[^<]*(<span[^>]*>.*?<\/span>)?Não me defender/);
    });

    it('o ataque já respondido mostra a defesa e que espera o mestre, sem botões', () => {
        const html = panel({
            awaiting: [],
            answered: [ attack({ id: 'a2', defense: { choice: 'dodge', skill: 'Reflexos', total: 18, rolls: [ 15, 9 ], used: 15, bonus: 3 } }) ]
        });

        expect(html).toContain('Reflexos: [15, 9: 15] + 3 = 18');
        expect(html).toContain('aguardando o mestre');
        expect(html).not.toContain('Esquivar');
    });
});

describe('Reagir (habilidades de reação no cartão do ataque)', () => {
    const passives = [ 'subclass:barreira de ki', 'subclass:resposta tatica' ].map(key => findPassiveByKey(key)!);
    const reactionsFor = (mp: number) => (target: PendingAttackData) => reactionOptionsFor(passives, target, mp, NO_USES);
    const withReactions = (props: Partial<Parameters<typeof IncomingAttacksPanel>[0]> = {}): string =>
        panel({ reactionsFor: reactionsFor(30), onReact: () => undefined, ...props });

    it('sem as props de reação o painel é o de sempre, sem a barra', () => {
        expect(panel()).not.toContain('Reagir:');
    });

    it('ficha sem habilidade de reação não ganha a barra', () => {
        const html = panel({ reactionsFor: () => [], onReact: () => undefined });
        expect(html).not.toContain('Reagir:');
        expect(html).not.toContain('reaction-bar-');
    });

    it('oferece as habilidades de reação da ficha; a que não se aplica fica desabilitada', () => {
        const html = withReactions();

        expect(html).toContain('Reagir:');
        expect(html).toContain('data-testid="reaction-bar-a1"');
        expect(html).toContain('data-testid="react-subclass:barreira de ki"');
        // Resposta Tática só contra ataque corpo a corpo, e este não declarou melee
        const resposta = html.split('<button').find(chunk => chunk.includes('react-subclass:resposta tatica'));
        expect(resposta).toContain('disabled');
        const barreira = html.split('<button').find(chunk => chunk.includes('react-subclass:barreira de ki'));
        expect(barreira).not.toContain('disabled');
    });

    it('contra ataque corpo a corpo a Resposta Tática se habilita', () => {
        const html = withReactions({ awaiting: [ attack({ melee: true }) ], reactionsFor: (target) => reactionOptionsFor(passives, target, 30, NO_USES) });
        const resposta = html.split('<button').find(chunk => chunk.includes('react-subclass:resposta tatica'));
        expect(resposta).not.toContain('disabled');
    });

    it('sem MP a Barreira de Ki fica desabilitada', () => {
        const html = withReactions({ reactionsFor: reactionsFor(3) });
        const barreira = html.split('<button').find(chunk => chunk.includes('react-subclass:barreira de ki'));
        expect(barreira).toContain('disabled');
    });

    it('quem já reagiu mostra o que a reação faz no lugar do botão', () => {
        const def = findPassiveByKey('subclass:barreira de ki')!;
        const reaction = buildAttackReaction(def, { id: 'caio', name: 'Caio' }, 'r1', '2026-10-30T12:00:00.000Z')!;
        const reacted = attack({ reactions: [ reaction ] });
        const html = withReactions({ awaiting: [ reacted ], reactionsFor: (target) => reactionOptionsFor(passives, target, 30, NO_USES) });

        expect(html).toContain('data-testid="declared-reaction-subclass:barreira de ki"');
        expect(html).toContain('Barreira de Ki: +10 de AP');
        expect(html).not.toContain('data-testid="react-subclass:barreira de ki"');
    });

    it('enquanto uma reação é enviada, todos os botões ficam sem clique', () => {
        const html = withReactions({ reactBusyKey: 'a1:subclass:barreira de ki' });
        expect(html).toContain('Reagindo...');
        for (const chunk of html.split('<button').filter(part => part.includes('data-testid="react-'))) expect(chunk).toContain('disabled');
    });

    it('o ataque já respondido ainda aceita reação (o mestre não resolveu)', () => {
        const html = withReactions({
            awaiting: [],
            answered: [ attack({ id: 'a2', defense: { choice: 'none', skill: '', total: 0, rolls: [], used: 0, bonus: 0 } }) ]
        });
        expect(html).toContain('data-testid="reaction-bar-a2"');
    });
});
