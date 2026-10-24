import { renderToStaticMarkup } from 'react-dom/server';
import { MessageType } from '@enums';
import { buildActionRollText, type ActionRoll } from '@utils/combat/actionRollMessage';
import { ActionRollCard, ActionRollDetails, castOutcomeText } from '../ActionRollCard';
import { DiceMessage } from '../DiceMessage';

// O barril de @enums puxa subscriptionEnum.ts, que o ts-jest barra por um erro de tipo antigo; aqui só vale o MessageType
jest.mock('@enums', () => ({
    MessageType: { TEXT: 'text', ROLL: 'roll', DICE: 'dice', ERROR: 'error', SYSTEM: 'system', EXPERTISE: 'expertise', COMBAT_LOG: 'combat_log' }
}));

// O efeito da magia (os dados de dano, cura, duração...), sem custo
const spellAction: ActionRoll = {
    kind: 'efeito',
    player: 'TESTE da SILVA',
    title: 'Arco de Luz',
    detail: 'LUZ · Estágio 3 · Efeito',
    critical: false,
    total: 31,
    cost: null,
    dt: null,
    segments: [
        { notation: '3d12+6', display: '[1, 8, 12] + 6', total: 27 },
        { notation: '2d12+4', display: '[4, 4] + 4', total: 12 }
    ]
};

const weaponAction: ActionRoll = {
    kind: 'arma',
    player: 'Aria',
    title: 'Pistola',
    detail: 'Dano crítico · Perfurante',
    critical: true,
    total: 18,
    cost: null,
    dt: null,
    segments: [ { notation: '4d6+2', display: '[3, 5, 4, 4] + 2', total: 18 } ]
};

// A conjuração: o teste de magia contra a DT, mais o MP gasto
const castAction: ActionRoll = {
    kind: 'conjuração',
    player: 'TESTE da SILVA',
    title: 'Arco de Luz',
    detail: 'LUZ · Estágio 3 · Conjuração',
    critical: false,
    total: 17,
    cost: 4,
    dt: 20,
    segments: [ { notation: '2d20+5', display: '[12, 7] + 5 Magia', total: 17 } ]
};

describe('ActionRollCard', () => {
    it('efeito da magia: título com o jogador, detalhe, expressões em cinza e total à vista, sem custo', () => {
        const html = renderToStaticMarkup(<ActionRollCard action={spellAction} />);

        expect(html).toContain('[TESTE da SILVA] Arco de Luz');
        expect(html).toContain('LUZ · Estágio 3 · Efeito');
        expect(html).toContain('(3d12+6 · 2d12+4)');
        expect(html).toContain('Total 31');
        expect(html).not.toContain('Custo');
        expect(html).not.toContain('DT ');
        expect(html).not.toContain('Crítico');
    });

    it('conjuração: custo de MP, DT e o resultado do teste à vista', () => {
        const failed = renderToStaticMarkup(<ActionRollCard action={castAction} />);
        const passed = renderToStaticMarkup(<ActionRollCard action={{ ...castAction, total: 20 }} />);

        expect(failed).toContain('Custo 4 MP');
        expect(failed).toContain('DT 20');
        expect(failed).toContain('Total 17');
        expect(failed).toMatch(/data-testid="action-roll-result"[^>]*>.*?Falhou/);
        expect(passed).toMatch(/data-testid="action-roll-result"[^>]*>.*?Sucesso/);
        expect(passed).toContain('MuiChip-colorSuccess');
        expect(failed).toContain('MuiChip-colorError');
    });

    it('as rolagens ficam no dropdown, fechado de início', () => {
        const html = renderToStaticMarkup(<ActionRollCard action={spellAction} />);

        expect(html).toContain('aria-expanded="false"');
        expect(html).toContain('aria-label="Ver detalhes"');
        expect(html).not.toContain('Rolagens:');
        expect(html).not.toContain('Subtotal');
    });

    it('arma: sem custo, com "Crítico" no dano crítico', () => {
        const html = renderToStaticMarkup(<ActionRollCard action={weaponAction} />);

        expect(html).toContain('[Aria] Pistola');
        expect(html).toContain('Dano crítico · Perfurante');
        expect(html).toContain('Total 18');
        expect(html).toContain('Crítico');
        expect(html).not.toContain('Custo');
    });

    it('dano normal da arma não mostra "Crítico"', () => {
        expect(renderToStaticMarkup(<ActionRollCard action={{ ...weaponAction, critical: false }} />)).not.toContain('>Crítico<');
    });

    it('efeito sem dado: sem total e sem dropdown', () => {
        const html = renderToStaticMarkup(<ActionRollCard action={{ ...spellAction, total: null, segments: [] }} />);

        expect(html).toContain('[TESTE da SILVA] Arco de Luz');
        expect(html).not.toContain('Total');
        expect(html).not.toContain('aria-expanded');
    });
});

describe('ActionRollDetails (conteúdo do dropdown)', () => {
    it('lista cada expressão com os dados, o modificador e o total, mais subtotal e média de todos os dados', () => {
        const html = renderToStaticMarkup(<ActionRollDetails action={spellAction} />);

        expect(html).toContain('Rolagens:');
        expect(html.match(/data-testid="action-roll-segment"/g)).toHaveLength(2);
        expect(html).toContain('3d12+6');
        expect(html).toContain('+ 6');
        expect(html).toContain('= 27');
        expect(html).toContain('= 12');
        // dados: 1 + 8 + 12 + 4 + 4 = 29 em 5 dados
        expect(html).toContain('Subtotal 29');
        expect(html).toContain('Média 5.80');
    });

    it('o maior valor possível do dado é destacado como sucesso e o 1 como erro', () => {
        const html = renderToStaticMarkup(<ActionRollDetails action={spellAction} />);

        // d12: o 12 (sucesso) e o 1 (erro); o 8 não destaca
        expect(html).toMatch(/MuiChip-colorSuccess[^>]*>.*?<span class="MuiChip-label[^"]*">12</);
        expect(html).toMatch(/MuiChip-colorError[^>]*>.*?<span class="MuiChip-label[^"]*">1</);
    });

    it('teste de magia: o maior dado vem destacado, sem subtotal nem média, e o texto diz se passou na DT', () => {
        const html = renderToStaticMarkup(<ActionRollDetails action={castAction} />);

        expect(html).toContain('Teste de magia (vale o maior dado):');
        expect(html).toContain('2d20+5');
        expect(html).toContain('+ 5 Magia');
        expect(html).toContain('= 17');
        expect(html).toMatch(/MuiChip-colorPrimary[^>]*>.*?<span class="MuiChip-label[^"]*">12</);
        expect(html).not.toMatch(/MuiChip-colorSuccess/);
        expect(html).not.toContain('Subtotal');
        expect(html).not.toContain('Média');
        expect(html).toContain('Total 17 contra DT 20: falhou por 3');
    });

    it('castOutcomeText: falhou, passou na DT exata e passou por mais', () => {
        expect(castOutcomeText(17, 20)).toBe('Total 17 contra DT 20: falhou por 3');
        expect(castOutcomeText(20, 20)).toBe('Total 20 contra DT 20: passou na DT exata');
        expect(castOutcomeText(24, 20)).toBe('Total 24 contra DT 20: passou por 4');
    });

    it('dano fixo não tem dados: sem subtotal nem média', () => {
        const html = renderToStaticMarkup(
            <ActionRollDetails action={{ ...weaponAction, total: 5, segments: [ { notation: '5', display: '5', total: 5 } ] }} />
        );

        expect(html).toContain('= 5');
        expect(html).not.toContain('Subtotal');
    });
});

describe('DiceMessage com o texto da ação', () => {
    it('mensagem de dados com o marcador vira o cartão, na conjuração e no efeito', () => {
        const cast = renderToStaticMarkup(<DiceMessage text={buildActionRollText(castAction)} type={MessageType.DICE} />);
        const effect = renderToStaticMarkup(<DiceMessage text={buildActionRollText(spellAction)} type={MessageType.DICE} />);

        expect(cast).toContain('data-testid="action-roll-card"');
        expect(cast).toContain('Custo 4 MP');
        expect(cast).toContain('DT 20');
        expect(effect).toContain('data-testid="action-roll-card"');
        expect(effect).toContain('Total 31');
    });

    it('o texto cru da ação não aparece "por extenso"', () => {
        const html = renderToStaticMarkup(<DiceMessage text={buildActionRollText(weaponAction)} type={MessageType.DICE} />);

        expect(html).not.toContain('[AÇÃO]');
        expect(html).not.toContain('Jogador:');
    });

    it('log de combate com o marcador continua log (o cartão é só para mensagem de dados)', () => {
        const html = renderToStaticMarkup(<DiceMessage text={buildActionRollText(weaponAction)} type={MessageType.COMBAT_LOG} />);

        expect(html).not.toContain('data-testid="action-roll-card"');
    });

    it('dado personalizado e perícia seguem como antes', () => {
        const custom = renderToStaticMarkup(<DiceMessage text={'**Ataque** (2d6+3)\nRolagens: [3, 4]\nTotal: **10**'} type={MessageType.ROLL} />);
        const expertise = renderToStaticMarkup(<DiceMessage text="🎲 [Aria] ATLETISMO - 2d20+3: [12, 7: 12] = 15" type={MessageType.EXPERTISE} />);

        expect(custom).not.toContain('data-testid="action-roll-card"');
        expect(custom).toContain('Total 10');
        expect(expertise).not.toContain('data-testid="action-roll-card"');
        expect(expertise).toContain('Total 15');
    });
});
