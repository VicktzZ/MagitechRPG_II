import type { User } from '@types';
import { db } from '@utils/database';
import {
    collection,
    doc,
    type FirestoreDataConverter,
    type QueryDocumentSnapshot,
    type SnapshotOptions
} from 'firebase/firestore';
import { z } from 'zod';

const userSchema = z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string(),
    fichas: z.array(z.string())
});

const userConverter: FirestoreDataConverter<User> = {
    toFirestore: (data) => {
        const {  ...rest } = userSchema.parse(data);
        return rest;
    },
    fromFirestore: (snap: QueryDocumentSnapshot, options: SnapshotOptions) => {
        const raw = snap.data(options) as any;
        const parsed = userSchema.omit({ _id: true }).parse(raw);
        return { _id: snap.id, ...parsed };
    }
};

export const userCollection = collection(db, 'users').withConverter(userConverter);

export const userDoc = (id: string) =>
    doc(userCollection, id);