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
import { User } from '@types';
import { app } from '@utils/database';

const userSchema = z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string(),
    fichas: z.array(z.string())
});

const userConverter: FirestoreDataConverter<User> = {
    toFirestore: (data) => {
        const { _id, ...rest } = userSchema.parse(data);
        return rest;
    },
    fromFirestore: (snap: QueryDocumentSnapshot, options: SnapshotOptions) => {
        const raw = snap.data(options) as any;
        const parsed = userSchema.omit({ _id: true }).parse(raw);
        return { _id: snap.id, ...parsed };
    },
};

export const userCollection = collection(getFirestore(app), 'users').withConverter(userConverter);

export const userDoc = (id: string) =>
    doc(userCollection, id);