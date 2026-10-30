import { sanitizeCreatureDices } from '../creatureDice';
import { sanitizeDamageModifiers } from '../creatureDefense';
import { findSummonTemplate, SUMMON_TEMPLATES, summonTemplateBody, uniqueSummonName } from '../summonTemplates';

describe('modelos de invocação (utils/combat/summonTemplates.ts)', () => {
    it('o golem arcano é o do texto da Sentinela Rúnica: 40 LP, 15 AP e 3d10 por turno', () => {
        const golem = findSummonTemplate('golem-arcano')!;
        expect(golem.stats).toMatchObject({ lp: 40, ap: 15 });
        expect(golem.dices[0]).toMatchObject({ name: 'Soco Rúnico', dices: [ { quantity: 3, faces: 10 } ] });
    });

    it('os lacaios e os espíritos seguem o texto: 15 LP e 1d10; 20 LP e só ataque mágico os atinge', () => {
        expect(findSummonTemplate('lacaio-morto-vivo')).toMatchObject({ stats: { lp: 15 }, dices: [ { dices: [ { quantity: 1, faces: 10 } ] } ] });
        for (const id of [ 'espirito-de-cura', 'espirito-de-ataque', 'espirito-protetor', 'espirito-guerreiro', 'espirito-da-morte' ]) {
            const spirit = findSummonTemplate(id)!;
            expect(spirit.stats.lp).toBe(20);
            expect(spirit.magicOnly).toBe(true);
        }
        expect(findSummonTemplate('espirito-guerreiro')!.dices[0]!.dices).toEqual([ { quantity: 4, faces: 10 } ]);
        expect(findSummonTemplate('espirito-de-ataque')!.dices[0]!.dices).toEqual([ { quantity: 2, faces: 8 } ]);
        expect(findSummonTemplate('espirito-da-morte')!.dices[0]!.dices).toEqual([ { quantity: 3, faces: 6 } ]);
        expect(findSummonTemplate('espirito-de-cura')!.dices[0]!.dices).toEqual([ { quantity: 1, faces: 4 } ]);
    });

    it('ids e nomes não se repetem, e todo dado passa na limpeza que o servidor faz', () => {
        expect(new Set(SUMMON_TEMPLATES.map(template => template.id)).size).toBe(SUMMON_TEMPLATES.length);
        expect(new Set(SUMMON_TEMPLATES.map(template => template.name)).size).toBe(SUMMON_TEMPLATES.length);
        for (const template of SUMMON_TEMPLATES) {
            expect(sanitizeCreatureDices(template.dices)).toHaveLength(template.dices.length);
            expect(template.stats.lp).toBeGreaterThan(0);
            expect(template.description.trim()).not.toBe('');
        }
    });

    it('o corpo do POST leva vida cheia, tipo "Invocado" e a resistência física dos espíritos (aceita pela limpeza das defesas)', () => {
        const body = summonTemplateBody(findSummonTemplate('espirito-guerreiro')!, []);
        expect(body).toMatchObject({ name: 'Espírito Guerreiro', type: 'Invocado', level: 20, stats: { lp: 20, maxLp: 20, mp: 0, maxMp: 0, ap: 0 } });
        expect(sanitizeDamageModifiers(body['damageModifiers'])).toEqual([ { kind: 'resistance', element: 'Físico', value: '100%' } ]);
        expect(String(body['description'])).toContain('atributos são sugestão');

        // o golem não tem a imunidade
        expect(summonTemplateBody(findSummonTemplate('golem-arcano')!, [])).not.toHaveProperty('damageModifiers');
    });

    it('o corpo é uma cópia: mexer nele não estraga o modelo', () => {
        const body = summonTemplateBody(findSummonTemplate('golem-arcano')!, []) as { attributes: { vig: number }; dices: Array<{ dices: Array<{ quantity: number }> }> };
        body.attributes.vig = 99;
        body.dices[0]!.dices[0]!.quantity = 99;
        expect(findSummonTemplate('golem-arcano')!.attributes.vig).toBe(10);
        expect(findSummonTemplate('golem-arcano')!.dices[0]!.dices[0]!.quantity).toBe(3);
    });

    it('nome repetido na campanha vira "Nome (2)", "Nome (3)", sem olhar caixa nem espaços', () => {
        expect(uniqueSummonName('Golem Arcano', [])).toBe('Golem Arcano');
        expect(uniqueSummonName('Golem Arcano', [ 'golem arcano ' ])).toBe('Golem Arcano (2)');
        expect(uniqueSummonName('Golem Arcano', [ 'Golem Arcano', 'Golem Arcano (2)' ])).toBe('Golem Arcano (3)');
        expect(summonTemplateBody(findSummonTemplate('golem-arcano')!, [ 'Golem Arcano' ])).toMatchObject({ name: 'Golem Arcano (2)' });
    });
});
