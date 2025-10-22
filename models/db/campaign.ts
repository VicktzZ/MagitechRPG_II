/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { z } from 'zod';
import { collection, doc, getFirestore, type FirestoreDataConverter, type QueryDocumentSnapshot, type SnapshotOptions } from 'firebase/firestore';
import type { Campaign as CampaignType } from '@types';
import { app } from '@utils/database';

// Subschemas
const playerSchema = z.object({
    userId: z.string(),
    fichaId: z.string()
});

const messageSchema = z.object({
    id: z.string().optional(),
    timestamp: z.string().optional(),
    type: z.string().optional(), // MessageType (usar string para não acoplar enum runtime)
    text: z.string(),
    isHTML: z.boolean().optional(),
    by: z.object({
        id: z.string(),
        image: z.string(),
        name: z.string(),
        isBot: z.boolean().optional(),
        isGM: z.boolean().optional()
    })
});

const noteSchema = z.object({
    _id: z.string().optional(),
    content: z.string(),
    timestamp: z.string().optional()
});

const sessionSchema = z.object({
    users: z.array(z.string()),
    messages: z.array(messageSchema).optional()
});

const campaignSchema = z.object({
    _id: z.string().optional(),
    admin: z.array(z.string()),
    campaignCode: z.string(),
    title: z.string(),
    description: z.string(),
    players: z.array(playerSchema),
    notes: z.array(noteSchema),
    myFicha: z.any().nullable().optional(),
    session: sessionSchema,
    custom: z.object({
        magias: z.array(z.any()),
        creatures: z.array(z.any()),
        skills: z.array(z.any()),
        items: z.object({
            weapon: z.array(z.any()),
            armor: z.array(z.any()),
            item: z.array(z.any())
        })
    })
});

const campaignConverter: FirestoreDataConverter<CampaignType> = {
    toFirestore: (data) => {
        const {  ...rest } = campaignSchema.parse(data);
        return rest;
    },
    fromFirestore: (snap: QueryDocumentSnapshot, options: SnapshotOptions) => {
        const raw = snap.data(options) as unknown;
        const parsed = campaignSchema.omit({ _id: true }).parse(raw);
        return { _id: snap.id, ...parsed } as unknown as CampaignType;
    }
};

export const campaignCollection = collection(getFirestore(app), 'campaigns').withConverter(campaignConverter);

export const campaignDoc = (id: string) =>
    doc(campaignCollection, id);