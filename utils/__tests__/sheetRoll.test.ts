import { describeSheetPlan, formatSheetRollText, planSheetRoll, rollSheetPlan } from '../sheetRoll';

// Mesmo padrão que o chat usa para reconhecer uma rolagem de perícia (components/misc/DiceMessage.tsx)
const CHAT_PATTERN = /(.+?)\s+-\s+(\d*d\d+)([+-]\d+)?:\s+\[([^\]]+)\]\s*=\s*(\d+)/i;

const sheet = (mods: Record<string, number>, expertises: Record<string, unknown> = { Atletismo: { value: 3, defaultAttribute: 'vig' } }) => ({
    level: 5,
    mods: { attributes: mods },
    attributes: {},
    expertises
});

/** Sequência fixa de "sorteios" (0 a 1) para testar sem acaso */
const sequence = (...values: number[]) => {
    let index = 0;
    return () => values[index++ % values.length];
};

describe('planSheetRoll (regra do botão da perícia na ficha)', () => {
    it('modificador zero rola 1 d20; positivo rola mod + 1 e vale o maior', () => {
        expect(planSheetRoll(sheet({ vig: 0 }), 'Atletismo')).toEqual({ dice: 1, keep: 'highest', bonus: 3 });
        expect(planSheetRoll(sheet({ vig: 1 }), 'Atletismo')).toEqual({ dice: 2, keep: 'highest', bonus: 3 });
        expect(planSheetRoll(sheet({ vig: 3 }), 'Atletismo')).toEqual({ dice: 4, keep: 'highest', bonus: 3 });
    });

    it('modificador negativo rola 2 d20 e vale o menor (desvantagem), seja -1 ou -4', () => {
        expect(planSheetRoll(sheet({ vig: -1 }), 'Atletismo')).toEqual({ dice: 2, keep: 'lowest', bonus: 3 });
        expect(planSheetRoll(sheet({ vig: -4 }), 'Atletismo')).toEqual({ dice: 2, keep: 'lowest', bonus: 3 });
    });

    it('é diferente da regra do teste: com mod 1 o teste rola 1 d20 e a ficha rola 2', () => {
        expect(planSheetRoll(sheet({ vig: 1 }), 'Atletismo')?.dice).toBe(2);
    });

    it('limita a quantidade de d20 (modificador absurdo não trava a página)', () => {
        expect(planSheetRoll(sheet({ vig: 500 }), 'Atletismo')?.dice).toBe(20);
    });

    it('atributo sem modificador na ficha, ou valor inválido, conta como zero', () => {
        expect(planSheetRoll(sheet({}), 'Atletismo')).toEqual({ dice: 1, keep: 'highest', bonus: 3 });
        expect(planSheetRoll(sheet({ vig: Number.NaN }), 'Atletismo')).toEqual({ dice: 1, keep: 'highest', bonus: 3 });
    });

    it('acha o modificador também quando a chave do atributo está em maiúsculas', () => {
        const upper = sheet({ vig: 2 }, { Atletismo: { value: 3, defaultAttribute: 'VIG' } });
        expect(planSheetRoll(upper, 'Atletismo')?.dice).toBe(3);
    });

    it('valor da perícia inválido vale zero e negativo entra na conta', () => {
        expect(planSheetRoll(sheet({ vig: 0 }, { Atletismo: { value: 'x', defaultAttribute: 'vig' } }), 'Atletismo')?.bonus).toBe(0);
        expect(planSheetRoll(sheet({ vig: 0 }, { Atletismo: { value: -2, defaultAttribute: 'vig' } }), 'Atletismo')?.bonus).toBe(-2);
    });

    it('perícia que a ficha não tem, ficha ausente ou nome vazio: sem plano', () => {
        expect(planSheetRoll(sheet({ vig: 1 }), 'Furtividade')).toBeNull();
        expect(planSheetRoll(null, 'Atletismo')).toBeNull();
        expect(planSheetRoll(undefined, 'Atletismo')).toBeNull();
        expect(planSheetRoll(sheet({ vig: 1 }), '')).toBeNull();
    });

    describe('sistema customizado', () => {
        const system = {
            attributes: [
                { key: 'forca', name: 'Força', abbreviation: 'FOR', testInfluence: { mode: 'advantage', formula: 'attr', advantageEveryNPoints: 0 } },
                { key: 'agil', name: 'Agilidade', abbreviation: 'AGI', testInfluence: { mode: 'sum', formula: 'attr' } }
            ]
        } as never;

        const custom = (attributes: Record<string, number>, expertises: Record<string, unknown>) => ({
            systemId: 'sistema-1',
            level: 3,
            attributes,
            mods: { attributes: { forca: 5 } },
            expertises
        });

        it('sem o sistema carregado não rola (a regra padrão daria o resultado errado)', () => {
            expect(planSheetRoll(custom({ forca: 2 }, { Luta: { value: 4, defaultAttribute: 'forca' } }), 'Luta')).toBeNull();
        });

        it('vantagem do atributo vira d20 extras e o modificador da ficha é ignorado', () => {
            const plan = planSheetRoll(custom({ forca: 2 }, { Luta: { value: 4, defaultAttribute: 'forca' } }), 'Luta', system);
            expect(plan).toEqual({ dice: 3, keep: 'highest', bonus: 4 });
        });

        it('influência por soma vira bônus fixo', () => {
            const plan = planSheetRoll(custom({ agil: 3 }, { Furtar: { value: 2, defaultAttribute: 'agil' } }), 'Furtar', system);
            expect(plan).toEqual({ dice: 1, keep: 'highest', bonus: 5 });
        });
    });
});

describe('rollSheetPlan', () => {
    it('vale o maior d20 (e soma a perícia)', () => {
        // 0.55 → 12, 0.3 → 7
        const result = rollSheetPlan({ dice: 2, keep: 'highest', bonus: 3 }, sequence(0.55, 0.3));
        expect(result).toEqual({ rolls: [ 12, 7 ], used: 12, total: 15 });
    });

    it('com desvantagem vale o menor', () => {
        const result = rollSheetPlan({ dice: 2, keep: 'lowest', bonus: 3 }, sequence(0.55, 0.3));
        expect(result).toEqual({ rolls: [ 12, 7 ], used: 7, total: 10 });
    });

    it('um d20 só, e bônus negativo', () => {
        expect(rollSheetPlan({ dice: 1, keep: 'highest', bonus: -2 }, sequence(0.95))).toEqual({ rolls: [ 20 ], used: 20, total: 18 });
    });

    it('sempre dá d20 entre 1 e 20, mesmo nos extremos do sorteio', () => {
        expect(rollSheetPlan({ dice: 1, keep: 'highest', bonus: 0 }, () => 0).rolls).toEqual([ 1 ]);
        expect(rollSheetPlan({ dice: 1, keep: 'highest', bonus: 0 }, () => 0.999999).rolls).toEqual([ 20 ]);
    });
});

describe('formatSheetRollText', () => {
    it('segue o formato do chat com o nome do personagem entre colchetes', () => {
        const text = formatSheetRollText({
            who: 'Aria Valen',
            label: 'Atletismo',
            plan: { dice: 2, keep: 'highest', bonus: 3 },
            result: { rolls: [ 12, 7 ], used: 12, total: 15 }
        });
        expect(text).toBe('🎲 [Aria Valen] ATLETISMO - 2d20+3: [12, 7: 12] = 15');
    });

    it('um d20 mostra só o valor, e bônus negativo leva o sinal', () => {
        const text = formatSheetRollText({
            who: 'Aria Valen',
            label: 'Furtividade',
            plan: { dice: 1, keep: 'highest', bonus: -2 },
            result: { rolls: [ 14 ], used: 14, total: 12 }
        });
        expect(text).toBe('🎲 [Aria Valen] FURTIVIDADE - 1d20-2: [14] = 12');
    });

    it('desvantagem aparece no nome', () => {
        const text = formatSheetRollText({
            who: 'Aria Valen',
            label: 'Atletismo',
            plan: { dice: 2, keep: 'lowest', bonus: 3 },
            result: { rolls: [ 12, 7 ], used: 7, total: 10 }
        });
        expect(text).toBe('🎲 [Aria Valen] ATLETISMO (desvantagem) - 2d20+3: [12, 7: 7] = 10');
    });

    it('sem nome do personagem, sem colchetes', () => {
        const text = formatSheetRollText({ who: '', label: 'Luta', plan: { dice: 1, keep: 'highest', bonus: 0 }, result: { rolls: [ 5 ], used: 5, total: 5 } });
        expect(text).toBe('🎲 LUTA - 1d20+0: [5] = 5');
    });

    it('o chat reconhece o texto como rolagem de perícia, com o total certo', () => {
        const text = formatSheetRollText({
            who: 'Aria Valen',
            label: 'Atletismo',
            plan: { dice: 3, keep: 'highest', bonus: 4 },
            result: { rolls: [ 3, 17, 9 ], used: 17, total: 21 }
        });
        const match = text.replace(/^🎲\s*/, '').match(CHAT_PATTERN);
        expect(match).not.toBeNull();
        expect(match?.[1]).toBe('[Aria Valen] ATLETISMO');
        expect(match?.[2]).toBe('3d20');
        expect(match?.[3]).toBe('+4');
        expect(match?.[4]).toBe('3, 17, 9: 17');
        expect(match?.[5]).toBe('21');
    });
});

describe('describeSheetPlan', () => {
    it('resume dados, quem vale e bônus', () => {
        expect(describeSheetPlan({ dice: 1, keep: 'highest', bonus: 3 })).toBe('1d20 +3');
        expect(describeSheetPlan({ dice: 3, keep: 'highest', bonus: -1 })).toBe('3d20 (vale o maior) -1');
        expect(describeSheetPlan({ dice: 2, keep: 'lowest', bonus: 0 })).toBe('2d20 (desvantagem: vale o menor) +0');
    });
});

describe('planSheetRoll com Sobrepeso (−1 por kg excedido nas perícias de DES e VIG)', () => {
    // 10 kg carregados contra 8 de capacidade: 2 kg acima
    const heavy = (mods: Record<string, number>, expertises?: Record<string, unknown>) => ({ ...sheet(mods, expertises), ...{ capacity: { max: 8 }, inventory: { weapons: [ { id: 'w1', name: 'Marreta', weight: 10 } ] } } });
    const expertises = {
        Atletismo: { value: 3, defaultAttribute: 'vig' },
        Furtividade: { value: 4, defaultAttribute: 'des' },
        Investigação: { value: 5, defaultAttribute: 'log' }
    };

    it('tira do bônus das perícias de VIG e de DES', () => {
        expect(planSheetRoll(heavy({ vig: 1, des: 0 }, expertises), 'Atletismo')).toEqual({ dice: 2, keep: 'highest', bonus: 1 });
        expect(planSheetRoll(heavy({ vig: 1, des: 0 }, expertises), 'Furtividade')).toEqual({ dice: 1, keep: 'highest', bonus: 2 });
    });

    it('também na desvantagem (modificador negativo)', () => {
        expect(planSheetRoll(heavy({ vig: -1 }, expertises), 'Atletismo')).toEqual({ dice: 2, keep: 'lowest', bonus: 1 });
    });

    it('perícias de outros atributos não sofrem', () => {
        expect(planSheetRoll(heavy({ log: 2 }, expertises), 'Investigação')).toEqual({ dice: 3, keep: 'highest', bonus: 5 });
    });

    it('sem excesso de peso nada muda', () => {
        const light = { ...sheet({ vig: 1 }, expertises), capacity: { max: 30 }, inventory: { weapons: [ { id: 'w1', name: 'Marreta', weight: 10 } ] } };
        expect(planSheetRoll(light, 'Atletismo')).toEqual({ dice: 2, keep: 'highest', bonus: 3 });
    });

    it('ficha de sistema customizado não sofre a penalidade', () => {
        const custom = { ...heavy({ vig: 1 }, expertises), systemId: 'sys-1' };
        expect(planSheetRoll(custom, 'Atletismo', { attributes: [] })?.bonus).toBe(3);
    });
});

describe('planSheetRoll com vantagem e desvantagem dos efeitos', () => {
    const blind = { advantages: 0, disadvantages: 1, notes: [ 'Cegueira: desvantagem, −1d20' ] };
    const precision = { advantages: 1, disadvantages: 0, notes: [ 'Precisão: vantagem, +1d20' ] };

    it('desvantagem num teste de 1 d20 rola 2 e vale o menor; o plano guarda a origem', () => {
        expect(planSheetRoll(sheet({ vig: 0 }), 'Atletismo', null, blind)).toEqual({ dice: 2, keep: 'lowest', bonus: 3, notes: [ 'Cegueira: desvantagem, −1d20' ] });
    });

    it('a desvantagem dos efeitos cancela com os d20 do mod: mod 2 (3 dados) e 1 desvantagem rolam 2 e valem o maior', () => {
        expect(planSheetRoll(sheet({ vig: 2 }), 'Atletismo', null, blind)).toMatchObject({ dice: 2, keep: 'highest' });
    });

    it('vantagem num teste de mod zero rola 2 e vale o maior', () => {
        expect(planSheetRoll(sheet({ vig: 0 }), 'Atletismo', null, precision)).toMatchObject({ dice: 2, keep: 'highest', notes: [ 'Precisão: vantagem, +1d20' ] });
    });

    it('mod negativo (2 dados, o menor) mais uma vantagem vira 1 dado; mais uma desvantagem, 3 dados e o menor', () => {
        expect(planSheetRoll(sheet({ vig: -1 }), 'Atletismo', null, precision)).toMatchObject({ dice: 1, keep: 'highest' });
        expect(planSheetRoll(sheet({ vig: -1 }), 'Atletismo', null, blind)).toMatchObject({ dice: 3, keep: 'lowest' });
    });

    it('sem efeitos (ou com saldo zero) o plano é o de sempre, sem notas', () => {
        expect(planSheetRoll(sheet({ vig: 2 }), 'Atletismo', null, { advantages: 0, disadvantages: 0, notes: [] })).toEqual({ dice: 3, keep: 'highest', bonus: 3 });
        expect(planSheetRoll(sheet({ vig: 2 }), 'Atletismo')).toEqual({ dice: 3, keep: 'highest', bonus: 3 });
    });

    it('o texto do chat diz a origem e continua no formato que o chat reconhece', () => {
        const plan = planSheetRoll(sheet({ vig: 0 }), 'Atletismo', null, blind)!;
        const text = formatSheetRollText({ who: 'Aria Valen', label: 'Atletismo', plan, result: { rolls: [ 15, 4 ], used: 4, total: 7 } });

        expect(text).toBe('🎲 [Aria Valen] ATLETISMO (desvantagem; Cegueira: desvantagem, −1d20) - 2d20+3: [15, 4: 4] = 7');
        expect(CHAT_PATTERN.test(text)).toBe(true);
    });

    it('vantagem aparece no nome com a origem', () => {
        const plan = planSheetRoll(sheet({ vig: 0 }), 'Atletismo', null, precision)!;
        const text = formatSheetRollText({ who: 'Aria Valen', label: 'Atletismo', plan, result: { rolls: [ 4, 15 ], used: 15, total: 18 } });

        expect(text).toBe('🎲 [Aria Valen] ATLETISMO (Precisão: vantagem, +1d20) - 2d20+3: [4, 15: 15] = 18');
    });
});
