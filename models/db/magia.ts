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
import { Magia } from '@types';
import { app } from '@utils/database';
import { ElementoToUpperEnum } from '@schemas/zodEnums';

const spellSchema = z.object({
    _id: z.string(),
    'elemento': ElementoToUpperEnum,
    'nome': z.string(),
    'nível': z.number(),
    'custo': z.number(),
    'tipo': z.string(),
    'execução': z.string(),
    'alcance': z.string(),
    'estágio 1': z.string(),
    'estágio 2': z.string().optional(),
    'estágio 3': z.string().optional(),
    'maestria': z.string().optional()
});

const spellConverter: FirestoreDataConverter<Magia> = {
    toFirestore: (data) => {
        const { _id, ...rest } = spellSchema.parse(data);
        return rest;
    },
    fromFirestore: (snap: QueryDocumentSnapshot, options: SnapshotOptions) => {
        const raw = snap.data(options) as any;
        const parsed = spellSchema.omit({ _id: true }).parse(raw);
        return { _id: snap.id, ...parsed };
    },
};

export const spellCollection = collection(getFirestore(app), 'spells').withConverter(spellConverter);

export const spellDoc = (id: string) =>
    doc(spellCollection, id);