import type { Combatant } from '@models';
import { ThemeProvider } from '@mui/material';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import AttackTargetPicker from '../AttackTargetPicker';
import type { AttackTargeting } from '../useWeaponRolls';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const targeting = (patch: Partial<AttackTargeting> = {}): AttackTargeting => ({
    enabled: true,
    targets: [ { id: 'goblin-1', name: 'Goblin', type: 'creature' }, { id: 'caio', name: 'Caio', type: 'player' } ] as unknown as Combatant[],
    targetId: '',
    setTargetId: () => undefined,
    pending: [],
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
        expect(html).toContain('Com um alvo, o acerto e o dano vão para o mestre confirmar.');
        expect(html).toContain('Goblin');
    });

    it('mostra o que cada ataque dele espera', () => {
        const pending = [
            { id: 'a1', name: 'Espada', targetName: 'Goblin' },
            { id: 'a2', name: 'Adaga', targetName: 'Orc', damageRolled: 6 }
        ] as unknown as PendingAttackData[];
        const html = render(<AttackTargetPicker targeting={targeting({ pending })} />);

        expect(html).toContain('Espada contra Goblin: role o dano');
        expect(html).toContain('Adaga contra Orc: aguardando o mestre');
    });
});
