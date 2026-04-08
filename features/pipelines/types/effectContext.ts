import type { Creature } from '@models';
import type { Charsheet } from '@models/entities';
import type { DamageType } from '@models/types/string';
import type { EffectName } from './effects';

export interface EffectContext {
    creature: Creature | Charsheet;
    damage: number;
    damageModifier: number;
    damageType: DamageType;
    effectName: EffectName;
    critical: boolean;
    hit: boolean;
    log: string[];
}

export type EffectFunction = (context: EffectContext) => EffectContext;