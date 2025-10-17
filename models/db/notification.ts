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
import { Notification } from '@types';
import { app } from '@utils/database';

const notificationSchema = z.object({
    _id: z.string(),
    userId: z.string(),
    title: z.string(),
    content: z.string(),
    timestamp: z.date(),
    read: z.boolean(),
    type: z.enum(['levelUp', 'newMessage', 'newPlayer', 'other']),
    link: z.string().optional()
});

const notificationConverter: FirestoreDataConverter<Notification> = {
    toFirestore: (data) => {
        const { _id, ...rest } = notificationSchema.parse(data);
        return rest;
    },
    fromFirestore: (snap: QueryDocumentSnapshot, options: SnapshotOptions) => {
        const raw = snap.data(options) as any;
        const parsed = notificationSchema.omit({ _id: true }).parse(raw);
        return { _id: snap.id, ...parsed };
    },
};

export const notificationCollection = collection(getFirestore(app), 'notifications').withConverter(notificationConverter);

export const notificationDoc = (id: string) =>
    doc(notificationCollection, id);