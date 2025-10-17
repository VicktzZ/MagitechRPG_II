import { z } from 'zod';
import {
    collection,
    doc,
    Firestore,
    getFirestore,
    type FirestoreDataConverter,
    type QueryDocumentSnapshot,
    type SnapshotOptions,
} from 'firebase/firestore';
import { Ficha } from '@types';
import { app } from '@utils/database';

const skillSchema = z.object({
    name: z.string(),
    description: z.string(),
    type: z.enum(['Poder Mágico', 'Classe', 'Linhagem', 'Subclasse', 'Bônus', 'Profissão', 'Exclusivo', 'Raça']),
    origin: z.string(),
    effects: z.array(z.number()).optional(),
    level: z.number().optional(),
});

const magicPowerSkillSchema = skillSchema.extend({
    _id: z.string().optional(),
    mastery: z.string().optional(),
    element: z.string().optional(),
});

const itemSchema = z.object({
    name: z.string(),
    description: z.string(),
    quantity: z.number().optional(),
    rarity: z.string(),
    kind: z.string(),
    weight: z.number(),
    effects: z.union([z.array(z.number()), z.array(z.string())]).optional(),
    level: z.number().optional(),
});

const weaponSchema = z.object({
    name: z.string(),
    description: z.string(),
    rarity: z.string(),
    kind: z.union([z.string(), z.array(z.string())]),
    categ: z.string(),
    range: z.string(),
    weight: z.number(),
    hit: z.string(),
    ammo: z.string(),
    magazineSize: z.number().optional(),
    quantity: z.number().optional(),
    accessories: z.array(z.string()).optional(),
    bonus: z.enum(['Luta', 'Agilidade', 'Furtividade', 'Pontaria', 'Magia', 'Tecnologia', 'Controle', 'Força']).optional(),
    effect: z.object({
        value: z.string(),
        critValue: z.string(),
        critChance: z.number(),
        effectType: z.string(),
    }),
});

const armorSchema = z.object({
    name: z.string(),
    description: z.string(),
    rarity: z.string(),
    kind: z.string(),
    categ: z.enum(['Leve', 'Média', 'Pesada']),
    quantity: z.number().optional(),
    weight: z.number(),
    value: z.number(),
    displacementPenalty: z.number(),
    accessories: z.array(z.string()).optional(),
});

const traitSchema = z.object({
    name: z.string(),
    value: z.number(),
    target: z.union([
        z.object({ kind: z.literal('attribute'), name: z.union([z.enum(['DES','VIG','LOG','SAB','FOC','CAR']), z.enum(['des','vig','log','sab','foc','car'])]) }),
        z.object({ kind: z.literal('expertise'), name: z.string() }),
    ]),
});

const passiveSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    occasion: z.union([
        z.literal('Início do turno'),
        z.literal('Final do turno'),
        z.literal('Ao ser atacado'),
        z.literal('Ao atacar'),
        z.literal('Ao usar magia'),
        z.literal('Ao sofrer dano'),
        z.literal('Ao causar dano'),
        z.literal('Sempre ativo'),
        z.literal('Quando curar'),
        z.literal('Ao se deslocar'),
        z.literal('Condição específica'),
        z.literal('Personalizado'),
    ]),
    custom: z.boolean().optional(),
});

const statusSchema = z.object({
    name: z.string(),
    type: z.enum(['buff', 'debuff', 'normal']),
});

const sessionInfoSchema = z.object({
    campaignCode: z.string(),
    attributes: z.object({
        maxLp: z.number(),
        maxMp: z.number(),
    }),
});

const expertisesValueSchema = z.object({
    value: z.number(),
    defaultAttribute: z.union([z.enum(['des','vig','log','sab','foc','car']), z.null()]).optional(),
});

const fichaSchema = z.object({
    _id: z.string().optional(),
    playerName: z.string(),
    mode: z.enum(['Apocalypse', 'Classic']),
    userId: z.string(),
    name: z.string(),
    age: z.number(),
    class: z.string(),
    race: z.union([z.string(), z.object({ name: z.string(), description: z.string(), effect: z.number(), skill: skillSchema.optional() })]),
    lineage: z.union([
        z.string(),
        z.object({ name: z.string(), description: z.string(), effects: z.array(z.number()), item: itemSchema }),
    ]),
    ORMLevel: z.number(),
    inventory: z.object({
        items: z.array(itemSchema),
        weapons: z.array(weaponSchema),
        armors: z.array(armorSchema),
        money: z.number(),
    }),
    displacement: z.number(),
    magics: z.array(z.any()),
    anotacoes: z.string().optional(),
    magicsSpace: z.number(),
    mpLimit: z.number(),
    overall: z.number(),
    gender: z.enum(['Masculino', 'Feminino', 'Não-binário', 'Outro', 'Não definido']),
    elementalMastery: z.string(),
    level: z.number(),
    subclass: z.union([z.string(), z.object({ name: z.string(), description: z.string(), skills: z.array(skillSchema) })]),
    financialCondition: z.enum(['Miserável', 'Pobre', 'Estável', 'Rico']),
    expertises: z.record(expertisesValueSchema),
    traits: z.array(traitSchema),
    session: z.array(sessionInfoSchema).optional(),
    passives: z.array(passiveSchema),
    status: z.array(statusSchema),
    dices: z.array(z.any()),
    capacity: z.object({
        cargo: z.number(),
        max: z.number(),
    }),
    skills: z.object({
        lineage: z.array(skillSchema),
        class: z.array(skillSchema),
        subclass: z.array(skillSchema),
        bonus: z.array(skillSchema),
        powers: z.array(magicPowerSkillSchema),
        race: z.array(skillSchema),
    }),
    points: z.object({
        attributes: z.number(),
        expertises: z.number(),
        skills: z.number(),
        magics: z.number(),
    }),
    attributes: z.object({
        lp: z.number(),
        mp: z.number(),
        ap: z.number(),
        des: z.number(),
        vig: z.number(),
        log: z.number(),
        sab: z.number(),
        foc: z.number(),
        car: z.number(),
        maxLp: z.number(),
        maxMp: z.number(),
        maxAp: z.number(),
    }),
    ammoCounter: z.object({
        current: z.number(),
        max: z.number(),
    }),
    mods: z.object({
        attributes: z.object({
            des: z.number(),
            vig: z.number(),
            log: z.number(),
            sab: z.number(),
            foc: z.number(),
            car: z.number(),
        }),
        discount: z.number(),
    }),
});

const fichaConverter: FirestoreDataConverter<any> = {
    toFirestore: (data) => {
        const { _id, ...rest } = fichaSchema.parse(data);
        return rest;
    },
    fromFirestore: (snap: QueryDocumentSnapshot, options: SnapshotOptions) => {
        const raw = snap.data(options) as any;
        const parsed = fichaSchema.omit({ _id: true }).parse(raw);
        return { _id: snap.id, ...parsed };
    },
};

export const fichaCollection = collection(getFirestore(app), 'fichas').withConverter(fichaConverter);

export const fichaDoc = (id: string) =>
    doc(fichaCollection, id);