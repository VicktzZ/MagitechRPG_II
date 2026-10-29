import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import theme from '../../../themes/theme';
import type { ReactionOfferData } from '@utils/combat/reactions';
import ReactionOffersPanel from '../reaction/ReactionOffersPanel';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>);

const offer = (overrides: Partial<ReactionOfferData> = {}): ReactionOfferData => ({
    id: 'r1', trigger: 'miss', text: 'Um ataque contra Borin errou', subjectId: 'cs-bia', subjectName: 'Borin', reactorId: 'cs-bia', reactorName: 'Borin', createdAt: 't', ...overrides
});

describe('ReactionOffersPanel', () => {
    it('sem ofertas não desenha nada', () => {
        expect(render(<ReactionOffersPanel entries={[]} onReact={() => undefined} onDismiss={() => undefined} />)).toBe('');
    });

    it('diz o que aconteceu, as magias de Reação que combinam e os dois botões', () => {
        const html = render(
            <ReactionOffersPanel entries={[ { offer: offer(), spells: [ { name: 'Retaliação Sombria' }, { name: 'Fio da Sorte' } ] } ]} onReact={() => undefined} onDismiss={() => undefined} />
        );

        expect(html).toContain('data-testid="reaction-offers"');
        expect(html).toContain('data-testid="reaction-offer-r1"');
        expect(html).toContain('Um ataque contra Borin errou');
        expect(html).toContain('Magias de Reação que combinam: Retaliação Sombria, Fio da Sorte.');
        expect(html).toContain('Ver magias de Reação');
        expect(html).toContain('Deixar passar');
    });

    it('oferta livre do mestre (sem magia que combine) deixa só "Deixar passar"', () => {
        const html = render(
            <ReactionOffersPanel entries={[ { offer: offer({ id: 'o', trigger: 'other', text: 'o chão cedeu' }), spells: [] } ]} onReact={() => undefined} onDismiss={() => undefined} />
        );

        expect(html).toContain('o chão cedeu');
        expect(html).toContain('como o mestre disser');
        expect(html).not.toContain('Ver magias de Reação');
        expect(html).toContain('Deixar passar');
    });

    it('uma oferta por linha', () => {
        const html = render(
            <ReactionOffersPanel
                entries={[ { offer: offer({ id: 'a' }), spells: [ { name: 'Retaliação Sombria' } ] }, { offer: offer({ id: 'b', text: 'Aria caiu a 0 LP' }), spells: [ { name: 'Último Suspiro' } ] } ]}
                onReact={() => undefined}
                onDismiss={() => undefined}
            />
        );

        expect(html).toContain('reaction-offer-a');
        expect(html).toContain('reaction-offer-b');
        expect(html).toContain('Aria caiu a 0 LP');
    });
});
