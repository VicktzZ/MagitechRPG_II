import type { Combatant } from '@models';
import { ThemeProvider } from '@mui/material';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import AttackTargetPicker from '../AttackTargetPicker';
import type { AttackTargeting } from '../useAttackTargeting';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const targeting = (patch: Partial<AttackTargeting> = {}): AttackTargeting => ({
    enabled: true,
    targets: [ { id: 'goblin-1', name: 'Goblin', type: 'creature' }, { id: 'caio', name: 'Caio', type: 'player' } ] as unknown as Combatant[],
    targetId: '',
    setTargetId: () => undefined,
    extraTargetIds: [],
    setExtraTargetIds: () => undefined,
    pending: [],
    opportunity: { current: null, active: false, setUse: () => undefined },
    ...patch
});

describe('AttackTargetPicker', () => {
    it('fora do combate (ou fora da fase de ação) não aparece', () => {
        expect(render(<AttackTargetPicker targeting={targeting({ enabled: false })} />)).toBe('');
    });

    it('em combate oferece o alvo e explica o que muda', () => {
        const html = render(<AttackTargetPicker targeting={targeting({ targetId: 'goblin-1' })} />);

        expect(html).toContain('attack-target-picker');
        expect(html).toContain('Alvo do ataque');
        expect(html).toContain('Com um alvo, o ataque da arma ou da magia vai para o mestre confirmar.');
        expect(html).toContain('Goblin');
    });

    it('sem alvo principal não oferece alvos extras; com ele, oferece o ataque em área', () => {
        expect(render(<AttackTargetPicker targeting={targeting()} />)).not.toContain('extra-targets');

        const html = render(<AttackTargetPicker targeting={targeting({ targetId: 'goblin-1' })} />);
        expect(html).toContain('extra-targets');
        expect(html).toContain('Outros alvos (ataque em área)');
        expect(html).toContain('um cartão por alvo');
    });

    it('mostra os alvos extras já escolhidos', () => {
        const html = render(<AttackTargetPicker targeting={targeting({ targetId: 'goblin-1', extraTargetIds: [ 'caio' ] })} />);
        expect(html).toContain('Caio');
    });

    it('sem saída de alcance aberta não oferece ataque de oportunidade', () => {
        expect(render(<AttackTargetPicker targeting={targeting({ targetId: 'goblin-1' })} />)).not.toContain('Ataque de oportunidade');
    });

    it('com uma saída aberta contra o alvo oferece o ataque de oportunidade, marcado por padrão', () => {
        const current = { id: 'o1', moverId: 'goblin-1', moverName: 'Goblin', reactorId: 'caio', reactorName: 'Caio', createdAt: '2026-10-28T12:00:00.000Z' };
        const html = render(<AttackTargetPicker targeting={targeting({ targetId: 'goblin-1', opportunity: { current, active: true, setUse: () => undefined } })} />);

        expect(html).toContain('opportunity-toggle');
        expect(html).toContain('Ataque de oportunidade contra Goblin');
        expect(html).toContain('Gasta a Reação');
        expect(html).toMatch(/<input[^>]*checked[^>]*type="checkbox"|<input[^>]*type="checkbox"[^>]*checked/);
    });

    it('desmarcado, o ataque volta a ser comum', () => {
        const current = { id: 'o1', moverId: 'goblin-1', moverName: 'Goblin', reactorId: 'caio', reactorName: 'Caio', createdAt: '2026-10-28T12:00:00.000Z' };
        const html = render(<AttackTargetPicker targeting={targeting({ targetId: 'goblin-1', opportunity: { current, active: false, setUse: () => undefined } })} />);

        expect(html).toContain('opportunity-toggle');
        expect(html).not.toMatch(/<input[^>]*checked[^>]*type="checkbox"|<input[^>]*type="checkbox"[^>]*checked/);
    });

    it('mostra o que cada ataque dele espera', () => {
        const pending = [
            { id: 'a1', name: 'Espada', source: 'weapon', targetName: 'Goblin' },
            { id: 'a2', name: 'Adaga', source: 'weapon', targetName: 'Orc', damageRolled: 6 },
            { id: 'a3', name: 'Faca de Vento', source: 'spell', targetName: 'Goblin' }
        ] as unknown as PendingAttackData[];
        const html = render(<AttackTargetPicker targeting={targeting({ pending })} />);

        expect(html).toContain('Espada contra Goblin: role o dano');
        expect(html).toContain('Adaga contra Orc: aguardando o mestre');
        expect(html).toContain('Faca de Vento contra Goblin: efetue a magia');
    });
});
