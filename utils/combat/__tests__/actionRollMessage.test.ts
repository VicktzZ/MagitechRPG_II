import type { SpellDTO } from '@models/dtos';
import type { Weapon } from '@models';
import {
    buildActionRollText,
    parseActionRoll,
    rollModifier,
    rollNumbers,
    type ActionRoll
} from '../actionRollMessage';
import type { HitTestResult } from '../hitTest';
import { buildSpellCastMessage, buildSpellEffectMessage, getSpellMpCost, hasSpellEffectDice, rollSpellEffect } from '../spellRoller';
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

const test = (patch: Partial<HitTestResult> = {}): HitTestResult => ({
    notation: '2d20+5', rolls: [ 12, 7 ], bestRoll: 12, bonus: 5, bonusLabel: 'Magia', total: 17, extraDice: 0, lessDice: 0, keep: 'highest', notes: [], critical: false, critMargin: 20, ...patch
});

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
    const effect: ActionRoll = {
        kind: 'efeito',
        player: 'TESTE da SILVA',
        title: 'Arco de Luz',
        detail: 'LUZ · Estágio 3 · Efeito',
        critical: false,
        total: 31,
        cost: null,
        dt: null,
        segments: [
            { notation: '3d12+6', display: '[1, 8, 4] + 6', total: 19 },
            { notation: '2d12+4', display: '[4, 4] + 4', total: 12 }
        ]
    };

    const cast: ActionRoll = {
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

    it('o texto do efeito começa com o marcador e é legível', () => {
        expect(buildActionRollText(effect)).toBe([
            '[AÇÃO] efeito',
            '**Arco de Luz**',
            'Detalhe: LUZ · Estágio 3 · Efeito',
            'Jogador: TESTE da SILVA',
            'Total: **31**',
            '- 3d12+6: [1, 8, 4] + 6 = 19',
            '- 2d12+4: [4, 4] + 4 = 12'
        ].join('\n'));
    });

    it('o texto da conjuração leva o total do teste, a DT e o custo de MP', () => {
        expect(buildActionRollText(cast)).toBe([
            '[AÇÃO] conjuração',
            '**Arco de Luz**',
            'Detalhe: LUZ · Estágio 3 · Conjuração',
            'Jogador: TESTE da SILVA',
            'Total: **17**',
            'DT: **20**',
            'Custo: **4 MP**',
            '- 2d20+5: [12, 7] + 5 Magia = 17'
        ].join('\n'));
    });

    it('ida e volta: o que se escreve é o que se lê', () => {
        expect(parseActionRoll(buildActionRollText(effect))).toEqual(effect);
        expect(parseActionRoll(buildActionRollText(cast))).toEqual(cast);
    });

    it('arma crítica, sem custo nem DT', () => {
        const arma: ActionRoll = {
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
        const text = buildActionRollText(arma);
        expect(text.split('\n')[0]).toBe('[AÇÃO] arma crítico');
        expect(text).not.toContain('Custo:');
        expect(text).not.toContain('DT:');
        expect(parseActionRoll(text)).toEqual(arma);
    });

    it('efeito sem dado: sem Total e sem rolagens', () => {
        const text = buildActionRollText({ ...effect, total: null, segments: [] });
        expect(text).not.toContain('Total:');
        expect(text).not.toContain('- ');
        expect(parseActionRoll(text)).toMatchObject({ kind: 'efeito', total: null, segments: [] });
    });

    it('dano fixo (número puro) volta como rolagem sem dados', () => {
        const parsed = parseActionRoll(buildActionRollText({
            ...effect, kind: 'arma', total: 5, segments: [ { notation: '5', display: '5', total: 5 } ]
        }));
        expect(parsed?.segments).toEqual([ { notation: '5', display: '5', total: 5 } ]);
        expect(rollNumbers(parsed!.segments[0]!.display)).toEqual([]);
    });

    it('nome com negrito ou quebra de linha não quebra o formato', () => {
        const parsed = parseActionRoll(buildActionRollText({ ...effect, title: 'Bola **de**\nFogo', player: 'Fulano\n**X**' }));
        expect(parsed?.title).toBe('Bola de Fogo');
        expect(parsed?.player).toBe('Fulano X');
        expect(parsed?.total).toBe(31);
    });

    it('total negativo e modificador negativo são lidos', () => {
        const parsed = parseActionRoll(buildActionRollText({
            ...effect, total: -1, segments: [ { notation: '1d4-5', display: '[3] - 5', total: -2 } ]
        }));
        expect(parsed?.total).toBe(-1);
        expect(parsed?.segments[0]?.total).toBe(-2);
    });

    it.each([
        [ 'texto comum', 'oi, pessoal' ],
        [ 'log de combate antigo', '⚔️ **Aria** conjurou **Arco de Luz** (Estágio 3)\nTotal: **31**' ],
        [ 'dado avulso', '3d6+2: [1, 3, 5] + 2 = 11' ],
        [ 'dado personalizado', '**Ataque** (2d6+3)\nRolagens: [3, 4]\nTotal: **10**' ],
        [ 'marcador sem título', '[AÇÃO] efeito\nDetalhe: LUZ' ],
        [ 'tipo desconhecido', '[AÇÃO] poder\n**X**' ],
        [ 'o marcador do rascunho antigo', '[AÇÃO] magia\n**X**' ],
        [ 'vazio', '' ]
    ])('%s não é uma ação', (_nome, text) => {
        expect(parseActionRoll(text)).toBeNull();
    });
});

describe('mensagens reais de magia e arma', () => {
    afterEach(() => jest.restoreAllMocks());

    it('conjuração: o teste de magia é o total, a DT é a do nível e do estágio, e o custo de MP vai junto', () => {
        const lanca = spell();
        const parsed = parseActionRoll(buildSpellCastMessage('Aria', lanca, 2, test(), getSpellMpCost(lanca, 2)));

        expect(parsed).toMatchObject({
            kind: 'conjuração', player: 'Aria', title: 'Arco de Luz', detail: 'LUZ · Estágio 2 · Conjuração', critical: false, total: 17, dt: 21
        });
        expect(parsed!.cost).toBe(getSpellMpCost(lanca, 2));
        expect(parsed!.cost).toBeGreaterThan(0);
        expect(parsed!.segments).toEqual([ { notation: '2d20+5', display: '[12, 7] + 5 Magia', total: 17 } ]);
        expect(rollNumbers(parsed!.segments[0]!.display)).toEqual([ 12, 7 ]);
        expect(rollModifier(parsed!.segments[0]!.display)).toBe('+ 5 Magia');
    });

    it('conjuração com bônus negativo e sem rótulo de perícia', () => {
        const parsed = parseActionRoll(buildSpellCastMessage('Aria', spell(), 1, test({ rolls: [ 9 ], bestRoll: 9, bonus: -2, bonusLabel: '—', total: 7, notation: '1d20-2' }), 3));

        expect(parsed?.segments[0]).toEqual({ notation: '1d20-2', display: '[9] - 2', total: 7 });
        expect(parsed?.total).toBe(7);
        expect(parsed?.dt).toBe(18);
    });

    it('a DT acompanha o nível e o estágio da tabela', () => {
        const dtOf = (level: number, stage: 1 | 2 | 3) => parseActionRoll(buildSpellCastMessage('Aria', spell({ level }), stage, test(), 1))?.dt;

        expect([ dtOf(1, 1), dtOf(1, 3), dtOf(3, 2), dtOf(4, 3) ]).toEqual([ 15, 20, 24, 30 ]);
    });

    it('o 3º estágio do nível 4 de elemento primário é a Maestria; de elemento secundário é "Estágio 3"', () => {
        const primary = parseActionRoll(buildSpellCastMessage('Aria', spell({ level: 4 }), 3, test(), 10));
        const secondary = parseActionRoll(buildSpellCastMessage('Aria', spell({ level: 4, element: 'RADIAÇÃO' }), 3, test(), 10));

        expect(primary?.detail).toBe('LUZ · Maestria · Conjuração');
        expect(secondary?.detail).toBe('RADIAÇÃO · Estágio 3 · Conjuração');
    });

    it('efeito: uma rolagem por expressão de dado, sem custo e sem DT (já foram pagos e testados na conjuração)', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
        const result = rollSpellEffect(spell(), 2);
        const parsed = parseActionRoll(buildSpellEffectMessage('Aria', result));

        expect(parsed).toMatchObject({ kind: 'efeito', player: 'Aria', title: 'Arco de Luz', detail: 'LUZ · Estágio 2 · Efeito', cost: null, dt: null });
        expect(parsed!.segments.map(s => s.notation)).toEqual([ '3d12+6', '2d12+4' ]);
        expect(parsed!.total).toBe(result.totalDamage);
        expect(parsed!.segments.reduce((sum, s) => sum + s.total, 0)).toBe(parsed!.total);
    });

    it('só há o que efetuar quando o texto do estágio tem dado', () => {
        const cura = spell({ stages: [ 'Cura aliados.', 'Cura 2d8 de LP.', 'Cura tudo.' ] });

        expect([ hasSpellEffectDice(cura, 1), hasSpellEffectDice(cura, 2), hasSpellEffectDice(cura, 3) ]).toEqual([ false, true, false ]);
        expect(parseActionRoll(buildSpellEffectMessage('Aria', rollSpellEffect(cura, 1)))).toMatchObject({ total: null, segments: [] });
    });

    it('custo de MP: base mais o extra do estágio', () => {
        const lanca = spell({ level: 2, mpCost: 4 });

        expect(getSpellMpCost(lanca, 1)).toBe(4);
        expect(getSpellMpCost(lanca, 2)).toBeGreaterThan(getSpellMpCost(lanca, 1));
        expect(getSpellMpCost(lanca, 3)).toBeGreaterThan(getSpellMpCost(lanca, 2));
    });

    it('dano da arma: normal e crítico', () => {
        const normal = parseActionRoll(buildDamageMessageText('Aria', weapon(), { notation: '2d6+2', display: '[3, 4] + 2', total: 9, rolled: 9, extras: [], isCritical: false }));
        const critical = parseActionRoll(buildDamageMessageText('Aria', weapon(), { notation: '4d6+2', display: '[3, 4, 1, 6] + 2', total: 16, rolled: 16, extras: [], isCritical: true }));

        expect(normal).toMatchObject({ kind: 'arma', title: 'Pistola', detail: 'Dano · Perfurante', critical: false, total: 9, cost: null, dt: null });
        expect(critical).toMatchObject({ critical: true, detail: 'Dano crítico · Perfurante', total: 16 });
        expect(critical?.segments).toEqual([ { notation: '4d6+2', display: '[3, 4, 1, 6] + 2', total: 16 } ]);
    });

    it('arma sem tipo de efeito: o detalhe é só "Dano"', () => {
        const parsed = parseActionRoll(buildDamageMessageText('Aria', weapon({ effect: { value: '1d4', critValue: '2d4' } }), {
            notation: '1d4', display: '[2]', total: 2, rolled: 2, extras: [], isCritical: false
        }));
        expect(parsed?.detail).toBe('Dano');
    });

    it('conjuração com desvantagem líquida: o marcador diz que vale o menor e os efeitos vão numa linha, e tudo volta na leitura', () => {
        const text = buildSpellCastMessage('Aria', spell(), 1, test({
            rolls: [ 15, 4 ], bestRoll: 4, total: 9, keep: 'lowest', lessDice: 1, notes: [ 'Cegueira: desvantagem, −1d20' ]
        }), 2);
        const parsed = parseActionRoll(text);

        expect(text.split('\n')[0]).toBe('[AÇÃO] conjuração menor');
        expect(text).toContain('Efeitos: Cegueira: desvantagem, −1d20');
        expect(parsed).toMatchObject({ kind: 'conjuração', keepLowest: true, notes: [ 'Cegueira: desvantagem, −1d20' ], total: 9 });
    });

    it('vários efeitos ficam separados na linha e voltam como lista; sem efeitos não há linha', () => {
        const text = buildSpellCastMessage('Aria', spell(), 1, test({ notes: [ 'Precisão: vantagem, +1d20', 'Cegueira: desvantagem, −1d20' ] }), 2);

        expect(text).toContain('Efeitos: Precisão: vantagem, +1d20 | Cegueira: desvantagem, −1d20');
        expect(parseActionRoll(text)?.notes).toEqual([ 'Precisão: vantagem, +1d20', 'Cegueira: desvantagem, −1d20' ]);
        expect(buildSpellCastMessage('Aria', spell(), 1, test(), 2)).not.toContain('Efeitos:');
        expect(parseActionRoll(buildSpellCastMessage('Aria', spell(), 1, test(), 2))).not.toHaveProperty('keepLowest');
    });

    it('a mensagem de acerto diz a origem das vantagens e desvantagens e qual d20 vale', () => {
        const text = buildHitMessageText('Aria', weapon(), test({
            notation: '2d20+2', rolls: [ 18, 6 ], bestRoll: 6, bonus: 2, bonusLabel: 'Pontaria', total: 8, keep: 'lowest', lessDice: 1, notes: [ 'Cegueira: desvantagem, −1d20' ]
        }));

        expect(text).toContain('(Pontaria, Cegueira: desvantagem, −1d20, vale o menor)');
        expect(text).toContain('[18, 6: 6] +2 = **8**');
    });

    it('o furtivo continua escrito como sempre no acerto', () => {
        const text = buildHitMessageText('Aria', weapon(), test({ rolls: [ 12, 9 ], bestRoll: 12, extraDice: 1, notes: [ 'furtivo: vantagem, +1d20' ] }));

        expect(text).toContain('(Magia, furtivo: vantagem, +1d20)');
    });

    it('a mensagem de acerto continua sendo a linha comum (não é um cartão)', () => {
        const text = buildHitMessageText('Aria', weapon(), test({ notation: '1d20+2', rolls: [ 12 ], bonus: 2, bonusLabel: 'Pontaria', total: 14 }));
        expect(parseActionRoll(text)).toBeNull();
    });
});
