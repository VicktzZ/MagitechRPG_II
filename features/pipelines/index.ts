import type { EffectContext, EffectFunction } from './types/effectContext';

export const effectPipe = (...effects: EffectFunction[]) => 
    (initialContext: EffectContext) =>
        effects.reduce((context, effect) => effect(context), initialContext);