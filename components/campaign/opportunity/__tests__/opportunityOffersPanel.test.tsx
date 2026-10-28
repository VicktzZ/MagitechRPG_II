import { ThemeProvider } from '@mui/material';
import type { OpportunityData } from '@utils/combat/opportunities';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../../themes/theme';
import OpportunityOffersPanel from '../OpportunityOffersPanel';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

const entry = (patch: Partial<OpportunityData> = {}): OpportunityData => ({
    id: 'o1', moverId: 'goblin-1', moverName: 'Goblin', reactorId: 'caio', reactorName: 'Caio', createdAt: '2026-10-28T12:00:00.000Z', ...patch
});

describe('OpportunityOffersPanel', () => {
    it('sem ofertas nem saídas declaradas não aparece', () => {
        expect(render(<OpportunityOffersPanel offers={[]} provoked={[]} onDismiss={() => undefined} />)).toBe('');
    });

    it('a oferta diz quem está saindo, como atacar e deixa passar', () => {
        const html = render(<OpportunityOffersPanel offers={[ entry() ]} provoked={[]} onDismiss={() => undefined} />);

        expect(html).toContain('opportunity-offer-o1');
        expect(html).toContain('Goblin está saindo do seu alcance');
        expect(html).toContain('gasta a Reação');
        expect(html).toContain('arma branca');
        expect(html).toContain('magia de Reação de alcance Curto');
        expect(html).toContain('Deixar passar');
        expect(html).not.toContain('Você saiu do alcance');
    });

    it('a saída que o próprio personagem declarou aparece com a opção de cancelar', () => {
        const provoked = entry({ id: 'o2', moverId: 'caio', moverName: 'Caio', reactorId: 'goblin-1', reactorName: 'Goblin' });
        const html = render(<OpportunityOffersPanel offers={[]} provoked={[ provoked ]} onDismiss={() => undefined} />);

        expect(html).toContain('opportunity-provoked-o2');
        expect(html).toContain('Você saiu do alcance de Goblin');
        expect(html).toContain('Cancelar');
        expect(html).not.toContain('Deixar passar');
    });
});
