import { collection, doc } from '@firebase/firestore';
import type { CollectionNames } from '@models/types/misc';
import { db } from '@utils/database';

// Notifications
export const notificationsCollection = collection(db, 'notifications');
export const notificationsDoc = (id: string) =>
    doc(notificationsCollection, id);

// Spells
export const spellsCollection = collection(db, 'spells');
export const spellsDoc = (id: string) =>
    doc(spellsCollection, id);

// Powers
export const powersCollection = collection(db, 'powers');
export const powersDoc = (id: string) =>
    doc(powersCollection, id);

// Charsheet
export const charsheetCollection = collection(db, 'charsheets');
export const charsheetDoc = (id: string) =>
    doc(charsheetCollection, id);

// User
export const userCollection = collection(db, 'users');
export const userDoc = (id: string) =>
    doc(userCollection, id);

// Campaign
export const campaignCollection = collection(db, 'campaigns');
export const campaignDoc = (id: string) =>
    doc(campaignCollection, id);

export function getCollectionDoc(collectionName: CollectionNames, id: string) {
    switch (collectionName) {
    case 'campaigns':
        return campaignDoc(id)
    case 'charsheets':
        return charsheetDoc(id)
    case 'spells':
        return spellsDoc(id)
    case 'powers':
        return powersDoc(id)
    case 'users':
        return userDoc(id)
    case 'notifications':
        return notificationsDoc(id)
    }
}