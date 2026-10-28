import { renderToStaticMarkup } from 'react-dom/server';
import { ThemeProvider, createTheme } from '@mui/material';
import ActionPips from '../ActionPips';

const render = (props: Parameters<typeof ActionPips>[0]): string =>
    renderToStaticMarkup(<ThemeProvider theme={createTheme()}><ActionPips {...props} /></ThemeProvider>);

const pip = (html: string, slot: string): string => {
    const match = new RegExp(`<button[^>]*data-testid="action-pip-${slot}"[^>]*>`).exec(html);
    if (!match) throw new Error(`marcador ${slot} não encontrado`);
    return match[0];
};

describe('ActionPips', () => {
    const budget = { padrao: 1, bonus: 0, movimento: 1, reacao: 0 };

    it('mostra os quatro espaços com o estado no rótulo acessível', () => {
        const html = render({ budget });

        expect(pip(html, 'padrao')).toContain('aria-label="Padrão: disponível"');
        expect(pip(html, 'bonus')).toContain('aria-label="Bônus: gasta"');
        expect(pip(html, 'movimento')).toContain('aria-label="Movimento: disponível"');
        expect(pip(html, 'reacao')).toContain('aria-label="Reação: gasta"');
    });

    it('mostra a quantidade quando há mais de uma ação (extras)', () => {
        const html = render({ budget: { ...budget, padrao: 2 } });

        expect(pip(html, 'padrao')).toContain('aria-label="Padrão: disponível, 2"');
        expect(html).toContain('×2');
    });

    it('sem onSelect são só de leitura', () => {
        const html = render({ budget });

        expect(pip(html, 'padrao')).toContain('disabled');
    });

    it('com onSelect ficam clicáveis; o gasto pode ser travado para o jogador', () => {
        const open = render({ budget, onSelect: () => undefined });
        expect(pip(open, 'padrao')).not.toContain('disabled');
        expect(pip(open, 'bonus')).not.toContain('disabled');

        const playerView = render({ budget, onSelect: () => undefined, disableSpent: true });
        expect(pip(playerView, 'padrao')).not.toContain('disabled');
        expect(pip(playerView, 'bonus')).toContain('disabled');
    });

    it('esperando o servidor nada é clicável', () => {
        const html = render({ budget, onSelect: () => undefined, busy: true });

        expect(pip(html, 'padrao')).toContain('disabled');
    });
});
