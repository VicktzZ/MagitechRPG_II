import { z } from 'zod';

// Schema base para todos os itens
export const defaultValidationSchema = {
    name: z.string().min(1, { message: 'Nome é obrigatório' }),
    description: z.string().min(1, { message: 'Descrição é obrigatória' }),
    rarity: z.string().min(1, { message: 'Raridade é obrigatória' }),
    weight: z.coerce.number().min(0, { message: 'Peso não pode ser negativo' }),
    quantity: z.coerce.number().int().min(1, { message: 'Quantidade deve ser pelo menos 1' })
};

// Schema para efeito de arma
export const weaponEffectSchema = z.object({
    effectType: z.string().min(1, { message: 'Tipo de dano é obrigatório' }),
    critChance: z.coerce.number()
        .min(0, { message: 'Chance crítica deve ser maior ou igual a 0' })
        .max(20, { message: 'Chance crítica deve ser menor ou igual a 20' }),
    critValue: z.string()
        .min(1, { message: 'Dano crítico é obrigatório' })
        .regex(/^(?:\d+d(?:\d+)(?:[-+]\d+)?)$/i, { message: 'Formato de dano deve ser XdY(+/-Z)' }),
    value: z.string()
        .min(1, { message: 'Dano é obrigatório' })
        .regex(/^(?:\d+d(?:\d+)(?:[-+]\d+)?)$/i, { message: 'Formato de dano deve ser XdY(+/-Z)' })
});

// Schema para armas
export const weaponSchema = z.object({
    ...defaultValidationSchema,
    ammo: z.string().min(1, { message: 'Munição é obrigatória' }).default('Não consome'),
    categ: z.string().min(1, { message: 'Categoria de arma é obrigatória' }),
    bonus: z.string().min(1, { message: 'Bonus de arma é obrigatória' }),
    hit: z.string().min(1, { message: 'Dano de arma é obrigatório' }),
    kind: z.string().min(1, { message: 'Tipo de arma é obrigatório' }).default('Padrão'),
    range: z.string().min(1, { message: 'Alcance é obrigatório' }),
    accessories: z.array(z.string()),
    magazineSize: z.coerce.number().int().default(0),
    effect: weaponEffectSchema
});

// Schema para armaduras
export const armorSchema = z.object({
    ...defaultValidationSchema,
    categ: z.string().min(1, { message: 'Categoria da armadura é obrigatória' }),
    displacementPenalty: z.coerce.number().int().default(0),
    defensiveBonus: z.coerce.number().int().default(0),
    defenseType: z.string().min(1, { message: 'Tipo de defesa é obrigatório' }),
    value: z.coerce.number().int().default(0),
    quantity: z.coerce.number().int().default(1),
    accessories: z.array(z.string())
});

// Schema para itens comuns
export const itemSchema = z.object({
    ...defaultValidationSchema,
    level: z.coerce.number().int().default(1),
    kind: z.string().min(1, { message: 'Tipo do item é obrigatória' })
});

// Tipos inferidos dos schemas
export type WeaponFormFields = z.infer<typeof weaponSchema>;
export type ArmorFormFields = z.infer<typeof armorSchema>;
export type ItemFormFields = z.infer<typeof itemSchema>;
