import { z } from 'zod';
import {
    collection,
    doc,
    getFirestore,
    type FirestoreDataConverter,
    type QueryDocumentSnapshot,
    type SnapshotOptions
} from 'firebase/firestore';
import { type MagicPower } from '@types';
import { app } from '@utils/database';
import { ElementoToUpperEnum } from '@schemas/zodEnums';

const powerSchema = z.object({
    _id: z.string(),
    elemento: ElementoToUpperEnum,
    nome: z.string(),
    'descrição': z.string(),
    maestria: z.string(),
    'pré-requisito': z.string().optional()
});

const powerConverter: FirestoreDataConverter<MagicPower> = {
    toFirestore: (data) => {
        const {  ...rest } = powerSchema.parse(data);
        return rest;
    },
    fromFirestore: (snap: QueryDocumentSnapshot, options: SnapshotOptions) => {
        const raw = snap.data(options) as any;
        const parsed = powerSchema.omit({ _id: true }).parse(raw);
        return { _id: snap.id, ...parsed } as unknown as MagicPower;
    }
};

export const powerCollection = collection(getFirestore(app), 'powers').withConverter(powerConverter);

export const powerDoc = (id: string) =>
    doc(powerCollection, id);