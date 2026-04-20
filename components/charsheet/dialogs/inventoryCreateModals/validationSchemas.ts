import { z } from 'zod';

/**
 * Schema de validação para campos comuns a todos os itens
 */
export const commonItemSchema = {
    name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
    rarity: z.string().min(1, { message: 'Raridade é obrigatória' }).default('Comum'),
    description: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres' }),
    weight: z.coerce.number().min(0, { message: 'Peso é obrigatório' }),
    quantity: z.coerce.number().min(1, { message: 'Quantidade deve ser maior que 0' }).default(1)
};

/**
 * Schema para itens genéricos
 */
export const itemSchema = z.object({
    ...commonItemSchema,
    kind: z.string().min(1, { message: 'Tipo é obrigatório' }).default('Padrão'),
    level: z.coerce.number().min(0, { message: 'Nível é obrigatório' }).default(0)
});

/**
 * Schema para armaduras
 */
export const armorSchema = z.object({
    ...commonItemSchema,
    kind: z.string().min(1, { message: 'Tipo é obrigatório' }).default('Padrão'),
    categ: z.string().min(1, { message: 'Categoria é obrigatória' }),
    value: z.coerce.number().min(0, { message: 'Valor de AP é obrigatório' }),
    displacementPenalty: z.coerce.number().min(0, { message: 'Penalidade de Deslocamento é obrigatória' }),
    accessories: z.array(z.string()).default([ 'Não possui acessórios' ])
});

/**
 * Schema para efeitos de armas
 */
export const weaponEffectSchema = z.object({
    value: z.string().min(1, { message: 'Dano é obrigatório' }),
    critValue: z.string().min(1, { message: 'Dano crítico é obrigatório' }),
    critChance: z.coerce.number().min(1, { message: 'Chance crítica é obrigatória' }),
    effectType: z.string().min(1, { message: 'Tipo de dano é obrigatório' })
});

/**
 * Schema para armas
 */
export const weaponSchema = z.object({
    ...commonItemSchema,
    kind: z.string().min(1, { message: 'Tipo é obrigatório' }).default('Padrão'),
    categ: z.string().min(1, { message: 'Categoria é obrigatória' }),
    bonus: z.string().min(1, { message: 'Bônus é obrigatório' }),
    range: z.string().min(1, { message: 'Alcance é obrigatório' }),
    hitType: z.string().min(1, { message: 'Tipo de acerto é obrigatório' }),
    ammo: z.string().default('Não consome'),
    accessories: z.array(z.string()).default([ 'Não possui acessórios' ]),
    effect: weaponEffectSchema
});
