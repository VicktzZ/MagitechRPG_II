import { renderToStaticMarkup } from 'react-dom/server';
import { MessageType } from '@enums';
import { buildActionRollText, type ActionRoll } from '@utils/combat/actionRollMessage';
import { ActionRollCard, ActionRollDetails } from '../ActionRollCard';
import { DiceMessage } from '../DiceMessage';

// O barril de @enums puxa subscriptionEnum.ts, que o ts-jest barra por um erro de tipo antigo; aqui só vale o MessageType
jest.mock('@enums', () => ({
    MessageType: { TEXT: 'text', ROLL: 'roll', DICE: 'dice', ERROR: 'error', SYSTEM: 'system', EXPERTISE: 'expertise', COMBAT_LOG: 'combat_log' }
}));

const spellAction: ActionRoll = {
    kind: 'magia',
    player: 'TESTE da SILVA',
    title: 'Arco de Luz',
    detail: 'LUZ · Estágio 3',
    critical: false,
    total: 31,
    cost: 4,
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
    segments: [ { notation: '4d6+2', display: '[3, 5, 4, 4] + 2', total: 18 } ]
};

describe('ActionRollCard', () => {
    it('magia: título com o jogador, detalhe, expressões em cinza, total e custo de MP à vista', () => {
        const html = renderToStaticMarkup(<ActionRollCard action={spellAction} />);

        expect(html).toContain('[TESTE da SILVA] Arco de Luz');
        expect(html).toContain('LUZ · Estágio 3');
        expect(html).toContain('(3d12+6 · 2d12+4)');
        expect(html).toContain('Total 31');
        expect(html).toContain('Custo 4 MP');
        expect(html).not.toContain('Crítico');
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

    it('magia sem dado: só o custo, sem total e sem dropdown', () => {
        const html = renderToStaticMarkup(<ActionRollCard action={{ ...spellAction, total: null, segments: [] }} />);

        expect(html).toContain('Custo 4 MP');
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

    it('dano fixo não tem dados: sem subtotal nem média', () => {
        const html = renderToStaticMarkup(
            <ActionRollDetails action={{ ...weaponAction, total: 5, segments: [ { notation: '5', display: '5', total: 5 } ] }} />
        );

        expect(html).toContain('= 5');
        expect(html).not.toContain('Subtotal');
    });
});

describe('DiceMessage com o texto da ação', () => {
    it('mensagem de dados com o marcador vira o cartão', () => {
        const html = renderToStaticMarkup(<DiceMessage text={buildActionRollText(spellAction)} type={MessageType.DICE} />);

        expect(html).toContain('data-testid="action-roll-card"');
        expect(html).toContain('Custo 4 MP');
        expect(html).toContain('Total 31');
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
