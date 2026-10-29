import { Expertises } from '@models/Expertises';
import { completeCreatureExpertises, defaultCreatureExpertises } from '../creatureExpertises';
import { rollCreatureExpertise } from '../creatureRoll';

const DEFAULT_NAMES = Object.keys(new Expertises());

describe('perícias padrão da criatura', () => {
    it('são todas as do Magitech, em 0, com o atributo padrão de cada uma', () => {
        const defaults = defaultCreatureExpertises();

        expect(Object.keys(defaults)).toEqual(DEFAULT_NAMES);
        expect(Object.values(defaults).every(expertise => expertise.value === 0)).toBe(true);
        expect(defaults['Atletismo']).toEqual({ value: 0, defaultAttribute: 'vig' });
        expect(defaults['Eficácia']).toEqual({ value: 0, defaultAttribute: null });
    });
});

describe('completeCreatureExpertises', () => {
    it('criatura sem perícias ganha todas, em 0', () => {
        expect(Object.keys(completeCreatureExpertises(undefined))).toEqual(DEFAULT_NAMES);
        expect(Object.keys(completeCreatureExpertises({}))).toEqual(DEFAULT_NAMES);
    });

    it('as que a criatura tem (com bônus ou ônus) não mudam e as que faltam entram em 0', () => {
        const result = completeCreatureExpertises({ Diplomacia: { value: 8, defaultAttribute: 'car' }, Furtividade: { value: -2, defaultAttribute: 'des' } });

        expect(Object.keys(result)).toHaveLength(DEFAULT_NAMES.length);
        expect(result['Diplomacia']).toEqual({ value: 8, defaultAttribute: 'car' });
        expect(result['Furtividade']).toEqual({ value: -2, defaultAttribute: 'des' });
        expect(result['Percepção']).toEqual({ value: 0, defaultAttribute: 'foc' });
    });

    it('criatura de sistema customizado (chaves que não são do Magitech) fica como está', () => {
        const custom = { forca_bruta: { value: 3, defaultAttribute: 'str' } };

        expect(completeCreatureExpertises(custom)).toBe(custom);
    });

    it('não altera o que recebe', () => {
        const stored = { Diplomacia: { value: 8, defaultAttribute: 'car' } };
        completeCreatureExpertises(stored);

        expect(Object.keys(stored)).toEqual([ 'Diplomacia' ]);
    });
});

describe('rolagem de perícia da criatura sem bônus', () => {
    it('perícia padrão que a criatura não guardou vale 0 em vez de "não tem a perícia"', () => {
        const creature = { attributes: { foc: 10 }, expertises: { Diplomacia: { value: 8, defaultAttribute: 'car' } } };
        const roll = rollCreatureExpertise(creature, 'Percepção', () => 0.5);

        expect(roll).not.toBeNull();
        expect(roll).toMatchObject({ bonus: 0, dice: 3 });
    });

    it('perícia que não existe em lugar nenhum continua sem rolagem', () => {
        expect(rollCreatureExpertise({ attributes: {}, expertises: {} }, 'Inventada')).toBeNull();
    });
});
