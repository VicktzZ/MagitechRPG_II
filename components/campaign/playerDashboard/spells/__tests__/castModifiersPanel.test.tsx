import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../../themes/theme';
import { findPassiveByKey, type PassiveDef } from '../../../../../utils/combat/passives';

// O painel puxa @contexts (que o ts-jest barra por um erro de tipo antigo) e o contexto de conjuração: aqui só se renderiza a parte pura
jest.mock('@contexts', () => ({ useCampaignContext: () => ({}), useCampaignCurrentCharsheetContext: () => ({}) }));
jest.mock('../../passives/usePassives', () => ({ usePassives: () => ({ passives: [] }) }));
jest.mock('../SpellCastingContext', () => ({ useSpellCasting: () => ({}) }));
jest.mock('@utils/firestoreEntities', () => ({ charsheetEntity: {} }));
jest.mock('notistack', () => ({ useSnackbar: () => ({ enqueueSnackbar: () => undefined }) }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CastModifiersView } = require('../CastModifiersPanel') as typeof import('../CastModifiersPanel');

const noop = (): void => undefined;
const defs = (...keys: string[]): PassiveDef[] => keys.map(key => {
    const def = findPassiveByKey(key);
    if (!def) throw new Error(`${key} não está no catálogo`);
    return def;
});

type Props = Parameters<typeof CastModifiersView>[0];
const base: Props = {
    passives: [], selected: [], onToggleOption: noop, twin: { available: false, armed: false, waitingSecond: false }, onArmTwin: noop, onCancelTwin: noop,
    quickCastReady: false, inCombat: false, guidedLabel: null, spells: [], fixedKey: null, onFixSpell: noop
};
const render = (props: Partial<Props>): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{(CastModifiersView({ ...base, ...props }) ?? <span />) as ReactElement}</ThemeProvider>);

describe('CastModifiersView', () => {
    it('sem nenhuma habilidade de conjuração não desenha nada', () => {
        expect(render({})).not.toContain('cast-modifiers');
    });

    it('Intensificação e Estágio Quatro viram chips com o custo, e o ligado fica pressionado', () => {
        const passives = defs('subclass:intensificacao magica', 'subclass:estagio quatro');
        const html = render({ passives, selected: [ 'intensify' ] });
        expect(html).toContain('data-testid="cast-option-intensify"');
        expect(html).toContain('data-testid="cast-option-stageFour"');
        expect(html).toContain('(+2 MP)');
        expect(html).toContain('(+12/20 MP)');
        expect(html).toMatch(/aria-pressed="true"[^>]*data-testid="cast-option-intensify"|data-testid="cast-option-intensify"[^>]*aria-pressed="true"/);
        expect(html).toMatch(/aria-pressed="false"[^>]*data-testid="cast-option-stageFour"|data-testid="cast-option-stageFour"[^>]*aria-pressed="false"/);
    });

    it('Teia da Realidade: armada pede o par; esperando a segunda mostra como cancelar', () => {
        const passives = defs('subclass:teia da realidade');
        expect(render({ passives, twin: { available: true, armed: false, waitingSecond: false } })).toContain('Teia da Realidade (+1 MP cada)');
        expect(render({ passives, twin: { available: true, armed: true, waitingSecond: true } })).toContain('falta a 2ª magia (cancelar)');
    });

    it('Conjuração Rápida: fora de combate só existe; em combate diz se está pronta', () => {
        const passives = defs('subclass:conjuracao rapida');
        expect(render({ passives })).toContain('>Conjuração Rápida<');
        expect(render({ passives, inCombat: true, quickCastReady: true })).toContain('Conjuração Rápida: pronta');
        expect(render({ passives, inCombat: true, quickCastReady: false })).toContain('já usada ou sem Bônus');
    });

    it('Magia Guiada mostra a sequência atual', () => {
        const passives = defs('class:magia guiada');
        const html = render({ passives, guidedLabel: 'Magia Guiada: 2 acertos de Brasa Voraz em Goblin (+2d4)' });
        expect(html).toContain('data-testid="cast-guided"');
        expect(html).toContain('+2d4');
    });

    it('Fixação Mágica oferece escolher entre as magias da ficha', () => {
        const passives = defs('class:fixacao magica');
        const html = render({ passives, spells: [ { key: 'a', name: 'Brasa Voraz' }, { key: 'b', name: 'Raio Gélido' } ], fixedKey: 'a' });
        expect(html).toContain('data-testid="cast-fixed-spell"');
        expect(html).toContain('Magia fixada (Fixação Mágica)');
    });
});
