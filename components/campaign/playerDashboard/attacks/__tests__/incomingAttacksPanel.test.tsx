import { ThemeProvider } from '@mui/material';
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
