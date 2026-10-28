import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { actionBlocks } from '@utils/combat/actionFlags';
import type { AppliedEffect } from '@models';
import theme from '../../../themes/theme';
import ActionBlocksNotice from '../ActionBlocksNotice';
import { handleHealingBlocked } from '../healBlocked';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);

const effect = (name: string, modifiers: Array<Record<string, unknown>>): AppliedEffect =>
    ({ id: name, effectId: name, level: 1, remaining: 2, snapshot: { name, levels: [ { level: 1, modifiers } ] } }) as unknown as AppliedEffect;

describe('ActionBlocksNotice', () => {
    it('um aviso por flag, dizendo qual efeito a dá', () => {
        const html = render(<ActionBlocksNotice blocks={actionBlocks([ effect('Paralisia', [ { kind: 'skip_turn' }, { kind: 'no_actions' }, { kind: 'no_spells' } ]), effect('Necrose', [ { kind: 'no_healing' } ]) ])} who="Aria" />);

        expect(html).toContain('data-testid="action-block-skip_turn"');
        expect(html).toContain('Aria está com Paralisia: o turno pode ser pulado.');
        expect(html).toContain('Aria está com Paralisia e não pode agir.');
        expect(html).toContain('Aria está com Paralisia e não pode conjurar magias.');
        expect(html).toContain('Aria está com Necrose: a cura é bloqueada.');
    });

    it('sem nenhuma flag não desenha nada', () => {
        expect(render(<ActionBlocksNotice blocks={actionBlocks([ effect('Cegueira', [ { kind: 'disadvantage', target: 'attack' } ]) ])} who="Aria" />)).toBe('');
    });
});

describe('handleHealingBlocked', () => {
    const snackbar = () => ({ enqueueSnackbar: jest.fn(), closeSnackbar: jest.fn() });

    it('mestre: avisa e oferece "Curar mesmo assim", que fica na tela até decidir', () => {
        const api = snackbar();
        const handled = handleHealingBlocked({ code: 'HEALING_BLOCKED', error: 'Aria está com Necrose: a cura é bloqueada.', canForce: true }, api, jest.fn());

        expect(handled).toBe(true);
        expect(api.enqueueSnackbar).toHaveBeenCalledWith('Aria está com Necrose: a cura é bloqueada.', expect.objectContaining({ variant: 'warning', persist: true, action: expect.any(Function) }));
    });

    it('jogador: só o aviso, sem o botão de forçar', () => {
        const api = snackbar();
        const handled = handleHealingBlocked({ code: 'HEALING_BLOCKED', error: 'Aria está com Necrose: a cura é bloqueada. Peça ao mestre.', canForce: false }, api, jest.fn());

        expect(handled).toBe(true);
        const options = api.enqueueSnackbar.mock.calls[0]![1] as Record<string, unknown>;
        expect(options['action']).toBeUndefined();
        expect(options['persist']).toBeUndefined();
    });

    it('qualquer outra resposta não é tratada aqui', () => {
        const api = snackbar();

        expect(handleHealingBlocked({ code: 'OUTRO', error: 'x' }, api, jest.fn())).toBe(false);
        expect(handleHealingBlocked(null, api, jest.fn())).toBe(false);
        expect(api.enqueueSnackbar).not.toHaveBeenCalled();
    });
});
