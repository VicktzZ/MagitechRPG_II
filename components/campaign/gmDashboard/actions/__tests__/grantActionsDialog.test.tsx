import { ThemeProvider, createTheme } from '@mui/material';
import { renderToStaticMarkup } from 'react-dom/server';
import { freshBudget } from '@utils/combat/engine/actionBudget';
import { GRANTABLE_SLOTS, GrantActionsForm } from '../GrantActionsDialog';

type FormProps = Parameters<typeof GrantActionsForm>[0];

const render = (props: Partial<FormProps> = {}): string =>
    renderToStaticMarkup(
        <ThemeProvider theme={createTheme()}>
            <GrantActionsForm name="Goblin" draft={{ now: freshBudget(), perRound: freshBudget() }} changed={false} onChange={() => undefined} {...props} />
        </ThemeProvider>
    );

describe('GrantActionsForm', () => {
    it('só oferece Padrão, Bônus e Movimento (a Reação segue a regra de uma por rodada)', () => {
        expect(GRANTABLE_SLOTS).toEqual([ 'padrao', 'bonus', 'movimento' ]);
    });

    it('mostra o nome, o teto de 9 e um par de números (agora e por rodada) para cada tipo de ação', () => {
        const html = render({ draft: { now: { padrao: 2, bonus: 1, movimento: 1, reacao: 1 }, perRound: { padrao: 2, bonus: 1, movimento: 3, reacao: 1 } } });

        expect(html).toContain('Goblin: até 9 ações de cada tipo');
        for (const slot of GRANTABLE_SLOTS) expect(html).toContain(`data-testid="grant-row-${slot}"`);
        expect(html).not.toContain('grant-row-reacao');
        expect(html).toContain('aria-label="Padrão agora: 2"');
        expect(html).toContain('aria-label="Padrão por rodada: 2"');
        expect(html).toContain('aria-label="Movimento por rodada: 3"');
    });

    it('sem mudança o resumo pede para mexer nos números; com mudança diz como fica', () => {
        expect(render()).toContain('Mexa nos números para dar ou tirar ações.');

        const html = render({ changed: true, draft: { now: { padrao: 2, bonus: 1, movimento: 1, reacao: 1 }, perRound: { padrao: 2, bonus: 1, movimento: 1, reacao: 1 } } });
        expect(html).toContain('Fica: Padrão 2, Bônus 1, Movimento 1, Reação 1. Por rodada: Padrão 2.');
    });

    it('nos limites os botões ficam desligados: não tira abaixo de 0 nem passa de 9', () => {
        const html = render({ draft: { now: { padrao: 0, bonus: 9, movimento: 1, reacao: 1 }, perRound: { padrao: 0, bonus: 9, movimento: 1, reacao: 1 } } });

        expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Tirar uma ação: Padrão agora"/);
        expect(html).toMatch(/<button[^>]*disabled[^>]*aria-label="Dar uma ação: Bônus agora"/);
        expect(html).toMatch(/<button[^>]*(?<!disabled)[^>]*aria-label="Dar uma ação: Movimento agora"/);
    });

    it('esperando o servidor nenhum botão mexe', () => {
        const html = render({ saving: true });

        expect(html.match(/<button/g)?.length).toBe(html.match(/<button[^>]*disabled/g)?.length);
    });
});
