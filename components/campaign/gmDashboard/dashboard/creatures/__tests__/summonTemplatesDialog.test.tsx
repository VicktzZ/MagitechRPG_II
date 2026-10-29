import { ThemeProvider } from '@mui/material';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SUMMON_TEMPLATES } from '@utils/combat/summonTemplates';
import theme from '../../../../../../themes/theme';
import { SummonTemplateList } from '../SummonTemplatesDialog';

const render = (element: ReactElement): string => renderToStaticMarkup(<ThemeProvider theme={theme}>{element}</ThemeProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('SummonTemplateList', () => {
    it('lista todos os modelos com a vida, o AP, o dano e de qual habilidade vêm', () => {
        const html = render(<SummonTemplateList creatingId={null} onCreate={jest.fn()} />);
        for (const template of SUMMON_TEMPLATES) {
            expect(html).toContain(`data-testid="summon-template-${template.id}"`);
            expect(html).toContain(`aria-label="Criar ${template.name}"`);
        }
        expect(html).toContain('LP 40');
        expect(html).toContain('AP 15');
        expect(html).toContain('3d10');
        expect(html).toContain('Sentinela Rúnica (Glifomante)');
    });

    it('enquanto um modelo é criado, o botão dele diz "Criando..." e todos esperam', () => {
        const html = render(<SummonTemplateList creatingId="golem-arcano" onCreate={jest.fn()} />);
        expect(html).toContain('Criando...');
        // todos os botões desabilitados
        const buttons = html.match(/<button[^>]*aria-label="Criar [^"]+"[^>]*>/g) ?? [];
        expect(buttons).toHaveLength(SUMMON_TEMPLATES.length);
        expect(buttons.every(button => button.includes('disabled'))).toBe(true);
    });

    it('livre, os botões estão habilitados', () => {
        const html = render(<SummonTemplateList creatingId={null} onCreate={jest.fn()} />);
        const buttons = html.match(/<button[^>]*aria-label="Criar [^"]+"[^>]*>/g) ?? [];
        expect(buttons.some(button => button.includes('disabled'))).toBe(false);
    });
});
