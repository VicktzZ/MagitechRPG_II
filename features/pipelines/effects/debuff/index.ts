import { damageWeakness } from '@constants/damage';
import { debuffCategory } from '@features/pipelines/enum';
import { createMockEffectContext } from '@features/pipelines/tests/effectPipeline';
import type { EffectContext, EffectFunction } from '@features/pipelines/types/effectContext';
import { Chance } from 'chance';

// const roll = chance.bool({ likelihood: 50 });
const chance = new Chance();
const debuffStageDamage: Record<number, string> = {
    0: '2d6',
    1: '3d6',
    2: '4d8',
    4: '5d8'
}

function calculateWeaknessDamage(ctx: EffectContext) {
    const creatureElementalType = ctx.creature.elementalMastery;
    const weakness = ctx.damageType === damageWeakness[creatureElementalType];
    const resistance = ctx.damageType === creatureElementalType || damageWeakness[ctx.damageType] === creatureElementalType;
    
    if (weakness) {
        ctx.damageModifier = 2;
        ctx.log.push('[2X] O dano é super efetivo!');
    }

    if (resistance) {
        ctx.damageModifier = 0.5;
        ctx.log.push('[0.5X] O dano não é efetivo!');
    }
}

export const statusDamageEffect: EffectFunction = ({ ...ctx }) => {
    const statusDamage = ctx.creature.effects.find(e => e.name === ctx.effectName);
    if (statusDamage) {
        const damageRoll = chance.rpg(debuffStageDamage[statusDamage.stage]);
        let damage = damageRoll.reduce((acc, die) => acc + die, 0);
        calculateWeaknessDamage(ctx);
        damage = Math.floor(damage * ctx.damageModifier);
        ctx.log.push(`${ctx.effectName} [${debuffCategory[statusDamage.stage]}] causou ${damage} de dano em ${ctx.creature.name}! ${damageRoll.join(' + ')}`);
    }
    return ctx   
}

// const statusDamagePipeline = statusDamageEffect(createMockEffectContext())

console.log(createMockEffectContext())