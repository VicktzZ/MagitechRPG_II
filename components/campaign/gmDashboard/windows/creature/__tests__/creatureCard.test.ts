import type { Creature } from '@models';
import { toCreatureCard } from '../creatureCard';

const card = (raw: Record<string, unknown>) => toCreatureCard(raw as unknown as Creature);

describe('toCreatureCard', () => {
    it('lê uma criatura completa criada pelo editor', () => {
        const result = card({
            id: 'goblin',
            name: 'Goblin Saqueador',
            type: 'Humanoide',
            description: 'Rouba o que vê.',
            imageUrl: 'https://exemplo/g.png',
            level: 3,
            attributes: { vig: 5, des: 10, log: 0 },
            stats: { lp: 20, maxLp: 25, mp: 4, maxMp: 6, ap: 2 },
            expertises: { Furtividade: { value: 4, defaultAttribute: 'des' }, Atletismo: { value: 0, defaultAttribute: 'vig' } },
            skills: [ { id: 's1', name: 'Emboscada', type: 'Classe', description: 'Ataca primeiro.' } ],
            spells: [ { id: 'm1', name: 'Fagulha', level: 1, element: 'FOGO', cost: 2, description: 'Uma fagulha.' } ]
        });

        expect(result).toMatchObject({ id: 'goblin', name: 'Goblin Saqueador', type: 'Humanoide', level: 3, imageUrl: 'https://exemplo/g.png' });
        expect(result.stats).toEqual({ lp: 20, maxLp: 25, mp: 4, maxMp: 6, ap: 2 });
        expect(result.skills).toEqual([ { id: 's1', name: 'Emboscada', type: 'Classe', description: 'Ataca primeiro.' } ]);
        expect(result.spells).toEqual([ { id: 'm1', name: 'Fagulha', level: 1, element: 'FOGO', cost: 2, description: 'Uma fagulha.' } ]);
    });

    it('os atributos mantêm as chaves do sistema (inclusive customizado) e trazem o modificador da criatura', () => {
        const { attributes } = card({ attributes: { vig: 0, des: 4, log: 5, sab: 12, car: 30, forca_bruta: 7 } });
        expect(attributes.map(attribute => [ attribute.label, attribute.value, attribute.mod ])).toEqual([
            [ 'VIG', 0, -1 ],
            [ 'DES', 4, 0 ],
            [ 'LOG', 5, 1 ],
            [ 'SAB', 12, 2 ],
            [ 'CAR', 30, 5 ],
            [ 'FORCA_BRUTA', 7, 1 ]
        ]);
    });

    it('mostra só as perícias com valor (as demais são sem treino), com o atributo em maiúsculas', () => {
        const { expertises } = card({ expertises: { A: { value: 0 }, B: { value: 3, defaultAttribute: 'foc' }, C: { value: -1, defaultAttribute: null }, D: 'lixo' } });
        expect(expertises).toEqual([
            { name: 'B', value: 3, attribute: 'FOC' },
            { name: 'C', value: -1, attribute: '' }
        ]);
    });

    it('magia no formato do catálogo (mpCost e stages) também aparece', () => {
        const { spells } = card({ spells: [ { id: 'x', name: 'Brasa Voraz', level: 2, element: 'FOGO', mpCost: 5, stages: [ 'Estágio 1', 'Estágio 2' ] } ] });
        expect(spells[0]).toMatchObject({ name: 'Brasa Voraz', cost: 5, description: 'Estágio 1' });
    });

    it('criatura antiga ou incompleta não quebra e não mostra NaN', () => {
        const result = card({ id: 'x', stats: { lp: '12', mp: 'abc' }, skills: 'nada', spells: [ null, 5, {} ], attributes: null, expertises: [ 1 ] });
        expect(result.name).toBe('Criatura sem nome');
        expect(result.stats).toEqual({ lp: 12, maxLp: 12, mp: 0, maxMp: 0, ap: 0 });
        expect(result.attributes).toEqual([]);
        expect(result.expertises).toEqual([]);
        expect(result.skills).toEqual([]);
        expect(result.spells).toHaveLength(1);
        expect(result.spells[0]).toMatchObject({ id: 'spell-0', name: 'Magia sem nome', cost: 0 });
        expect(JSON.stringify(result)).not.toContain('NaN');
    });

    it('máximos que faltam valem o valor atual (criatura que só tem lp e mp)', () => {
        expect(card({ stats: { lp: 8, mp: 3 } }).stats).toMatchObject({ lp: 8, maxLp: 8, mp: 3, maxMp: 3 });
    });
});
