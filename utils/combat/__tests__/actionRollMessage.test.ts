import type { SpellDTO } from '@models/dtos';
import type { Weapon } from '@models';
import {
    buildActionRollText,
    parseActionRoll,
    rollModifier,
    rollNumbers,
    type ActionRoll
} from '../actionRollMessage';
import { buildSpellCastMessage, castSpell } from '../spellRoller';
import { buildDamageMessageText, buildHitMessageText } from '../weaponRoller';

// diceRoller importa o barril de @enums, que puxa subscriptionEnum.ts (o ts-jest barra um erro de tipo antigo dele)
jest.mock('@enums', () => ({
    MessageType: { TEXT: 'text', ROLL: 'roll', DICE: 'dice', ERROR: 'error', SYSTEM: 'system', EXPERTISE: 'expertise', COMBAT_LOG: 'combat_log' }
}));

const spell = (patch: Record<string, unknown> = {}): SpellDTO => ({
    id: 'arco-de-luz',
    name: 'Arco de Luz',
    element: 'LUZ',
    level: 2,
    mpCost: 3,
    stages: [ 'Causa 1d6 de dano.', 'Causa 3d12+6 de dano e 2d12+4 de dano de luz.', 'Causa 5d12 de dano.' ],
    ...patch
}) as unknown as SpellDTO;

const weapon = (patch: Record<string, unknown> = {}): Weapon => ({
    id: 'pistola',
    name: 'Pistola',
    hit: 'des',
    effect: { value: '2d6+2', critValue: '4d6+2', effectType: 'Perfurante' },
    ...patch
}) as unknown as Weapon;

describe('rollNumbers / rollModifier', () => {
    it('lê os dados e o modificador de um resultado detalhado', () => {
        expect(rollNumbers('[1, 8, 4] + 6')).toEqual([ 1, 8, 4 ]);
        expect(rollModifier('[1, 8, 4] + 6')).toBe('+ 6');
        expect(rollModifier('[3, 5] - 2')).toBe('- 2');
    });

    it('junta vários grupos de dados e ignora o que não é número', () => {
        expect(rollNumbers('[3] + [5, 2]')).toEqual([ 3, 5, 2 ]);
        expect(rollNumbers('[]')).toEqual([]);
    });

    it('dano fixo (sem colchetes) não tem dado nem modificador', () => {
        expect(rollNumbers('5')).toEqual([]);
        expect(rollModifier('5')).toBe('');
    });
});

describe('buildActionRollText / parseActionRoll', () => {
    const base: ActionRoll = {
        kind: 'magia',
        player: 'TESTE da SILVA',
        title: 'Arco de Luz',
        detail: 'LUZ · Estágio 3',
        critical: false,
        total: 31,
        cost: 4,
        segments: [
            { notation: '3d12+6', display: '[1, 8, 4] + 6', total: 19 },
            { notation: '2d12+4', display: '[4, 4] + 4', total: 12 }
        ]
    };

    it('o texto começa com o marcador e é legível', () => {
        expect(buildActionRollText(base)).toBe([
            '[AÇÃO] magia',
            '**Arco de Luz**',
            'Detalhe: LUZ · Estágio 3',
            'Jogador: TESTE da SILVA',
            'Total: **31**',
            'Custo: **4 MP**',
            '- 3d12+6: [1, 8, 4] + 6 = 19',
            '- 2d12+4: [4, 4] + 4 = 12'
        ].join('\n'));
    });

    it('ida e volta: o que se escreve é o que se lê', () => {
        expect(parseActionRoll(buildActionRollText(base))).toEqual(base);
    });

    it('arma crítica, sem custo', () => {
        const arma: ActionRoll = {
            kind: 'arma',
            player: 'Aria',
            title: 'Pistola',
            detail: 'Dano crítico · Perfurante',
            critical: true,
            total: 18,
            cost: null,
            segments: [ { notation: '4d6+2', display: '[3, 5, 4, 4] + 2', total: 18 } ]
        };
        const text = buildActionRollText(arma);
        expect(text.split('\n')[0]).toBe('[AÇÃO] arma crítico');
        expect(text).not.toContain('Custo:');
        expect(parseActionRoll(text)).toEqual(arma);
    });

    it('magia sem dado: sem Total e sem rolagens, só o custo', () => {
        const text = buildActionRollText({ ...base, total: null, segments: [] });
        expect(text).not.toContain('Total:');
        expect(text).not.toContain('- ');
        expect(parseActionRoll(text)).toMatchObject({ total: null, cost: 4, segments: [] });
    });

    it('dano fixo (número puro) volta como rolagem sem dados', () => {
        const parsed = parseActionRoll(buildActionRollText({
            ...base, kind: 'arma', cost: null, total: 5, segments: [ { notation: '5', display: '5', total: 5 } ]
        }));
        expect(parsed?.segments).toEqual([ { notation: '5', display: '5', total: 5 } ]);
        expect(rollNumbers(parsed!.segments[0]!.display)).toEqual([]);
    });

    it('nome com negrito ou quebra de linha não quebra o formato', () => {
        const parsed = parseActionRoll(buildActionRollText({ ...base, title: 'Bola **de**\nFogo', player: 'Fulano\n**X**' }));
        expect(parsed?.title).toBe('Bola de Fogo');
        expect(parsed?.player).toBe('Fulano X');
        expect(parsed?.total).toBe(31);
    });

    it('total negativo e modificador negativo são lidos', () => {
        const parsed = parseActionRoll(buildActionRollText({
            ...base, total: -1, segments: [ { notation: '1d4-5', display: '[3] - 5', total: -2 } ]
        }));
        expect(parsed?.total).toBe(-1);
        expect(parsed?.segments[0]?.total).toBe(-2);
    });

    it.each([
        [ 'texto comum', 'oi, pessoal' ],
        [ 'log de combate antigo', '⚔️ **Aria** conjurou **Arco de Luz** (Estágio 3)\nTotal: **31**' ],
        [ 'dado avulso', '3d6+2: [1, 3, 5] + 2 = 11' ],
        [ 'dado personalizado', '**Ataque** (2d6+3)\nRolagens: [3, 4]\nTotal: **10**' ],
        [ 'marcador sem título', '[AÇÃO] magia\nDetalhe: LUZ' ],
        [ 'tipo desconhecido', '[AÇÃO] poder\n**X**' ],
        [ 'vazio', '' ]
    ])('%s não é uma ação', (_nome, text) => {
        expect(parseActionRoll(text)).toBeNull();
    });
});

describe('mensagens reais de magia e arma', () => {
    afterEach(() => jest.restoreAllMocks());

    it('conjuração: custo de MP, estágio no detalhe e uma rolagem por expressão de dado', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        const result = castSpell(spell(), 2);
        const parsed = parseActionRoll(buildSpellCastMessage('Aria', result));

        expect(parsed).not.toBeNull();
        expect(parsed).toMatchObject({ kind: 'magia', player: 'Aria', title: 'Arco de Luz', detail: 'LUZ · Estágio 2', critical: false, cost: result.mpCost });
        expect(parsed!.cost).toBeGreaterThan(0);
        expect(parsed!.segments.map(s => s.notation)).toEqual([ '3d12+6', '2d12+4' ]);
        expect(parsed!.total).toBe(result.totalDamage);
        expect(parsed!.segments.reduce((sum, s) => sum + s.total, 0)).toBe(parsed!.total);
    });

    it('conjuração sem dado no texto do estágio: só o custo', () => {
        const result = castSpell(spell({ stages: [ 'Cura aliados.', 'Cura mais.', 'Cura tudo.' ] }), 1);
        const parsed = parseActionRoll(buildSpellCastMessage('Aria', result));

        expect(parsed).toMatchObject({ kind: 'magia', total: null, segments: [], cost: result.mpCost });
    });

    it('o 3º estágio do nível 4 de elemento primário é a Maestria; de elemento secundário é "Estágio 3"', () => {
        const primary = parseActionRoll(buildSpellCastMessage('Aria', castSpell(spell({ level: 4 }), 3)));
        const secondary = parseActionRoll(buildSpellCastMessage('Aria', castSpell(spell({ level: 4, element: 'RADIAÇÃO' }), 3)));

        expect(primary?.detail).toBe('LUZ · Maestria');
        expect(secondary?.detail).toBe('RADIAÇÃO · Estágio 3');
    });

    it('dano da arma: normal e crítico', () => {
        const normal = parseActionRoll(buildDamageMessageText('Aria', weapon(), { notation: '2d6+2', display: '[3, 4] + 2', total: 9, isCritical: false }));
        const critical = parseActionRoll(buildDamageMessageText('Aria', weapon(), { notation: '4d6+2', display: '[3, 4, 1, 6] + 2', total: 16, isCritical: true }));

        expect(normal).toMatchObject({ kind: 'arma', title: 'Pistola', detail: 'Dano · Perfurante', critical: false, total: 9, cost: null });
        expect(critical).toMatchObject({ critical: true, detail: 'Dano crítico · Perfurante', total: 16 });
        expect(critical?.segments).toEqual([ { notation: '4d6+2', display: '[3, 4, 1, 6] + 2', total: 16 } ]);
    });

    it('arma sem tipo de efeito: o detalhe é só "Dano"', () => {
        const parsed = parseActionRoll(buildDamageMessageText('Aria', weapon({ effect: { value: '1d4', critValue: '2d4' } }), {
            notation: '1d4', display: '[2]', total: 2, isCritical: false
        }));
        expect(parsed?.detail).toBe('Dano');
    });

    it('a mensagem de acerto continua sendo a linha comum (não é um cartão)', () => {
        const text = buildHitMessageText('Aria', weapon(), { notation: '1d20+2', rolls: [ 12 ], bestRoll: 12, bonus: 2, bonusLabel: 'Pontaria', total: 14 });
        expect(parseActionRoll(text)).toBeNull();
    });
});
