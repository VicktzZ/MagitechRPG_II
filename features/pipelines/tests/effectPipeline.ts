import { createMock } from 'ts-auto-mock';
import type { EffectContext } from '../types/effectContext';
import { faker } from '@faker-js/faker';
import { elements } from '@constants';
import { effects, damages } from '@constants/dataTypes';

/**
 * Cria um mock completo de EffectContext com valores aleatórios
 */

export function createMockEffectContext(): EffectContext {
    const creatureMock = createMock<EffectContext['creature']>();

    return {
        creature: {
            ...creatureMock,
            name: faker.person.firstName(),
            elementalMastery: faker.helpers.arrayElement(elements as any),
            effects: [
                {
                    name: faker.helpers.arrayElement(effects as any),
                    stage: faker.number.int({ min: 0, max: 4 }),
                    duration: faker.number.int({ min: 1, max: 10 }),
                    stackable: faker.datatype.boolean(),
                    maxStacks: faker.number.int({ min: 1, max: 5 })
                }
            ],
            // Propriedades típicas de Creature/Charsheet
            level: faker.number.int({ min: 1, max: 100 }),
            stats: {
                lp: faker.number.int({ min: 1, max: 100 }),
                mp: faker.number.int({ min: 1, max: 100 }),
                ap: faker.number.int({ min: 1, max: 100 }),
                maxLp: faker.number.int({ min: 1, max: 100 }),
                maxMp: faker.number.int({ min: 1, max: 100 }),
                maxAp: faker.number.int({ min: 1, max: 100 })
            }
        },
        damage: faker.number.int({ min: 0, max: 999 }),
        damageModifier: faker.number.float({ min: 0.5, max: 2.0, fractionDigits: 2 }),
        damageType: faker.helpers.arrayElement(damages),
        effectName: faker.helpers.arrayElement(effects as any),
        critical: faker.datatype.boolean(),
        hit: faker.datatype.boolean(),
        log: faker.helpers.multiple(
            () => faker.lorem.sentences(1),
            { count: { min: 1, max: 5 } }
        )
    };
}