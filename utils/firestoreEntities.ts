/* eslint-disable @typescript-eslint/no-shadow */
import {
    doc,
    endBefore,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    startAfter,
    updateDoc,
    where,
    type CollectionReference,
    type DocumentData,
    type DocumentReference,
    type Query,
    type QueryConstraint,
    type Unsubscribe
} from '@firebase/firestore';
import { campaignCollection, charsheetCollection, notificationsCollection, powersCollection, spellsCollection, userCollection } from '@models/docs';
import type { Campaign, Charsheet, Notification, Power, Spell, User } from '@models/entities';
import type { FirestoreQueryOptions, RealtimeOptions } from '@models/types/firestoreRealtime';

export class FirestoreEntity<T extends DocumentData = DocumentData> {
    collection: CollectionReference<T>;

    constructor(collection: CollectionReference<T>) {
        this.collection = collection;
    }

    async findById(id: string): Promise<T | null> {
        try {
            const docSnap = await getDoc(doc(this.collection, id));
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error('Erro ao buscar documento por ID:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<T>): Promise<void> {
        try {
            const docRef = doc(this.collection, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Erro ao atualizar documento:', error);
            throw error;
        }
    }

    private buildQuery(options: FirestoreQueryOptions = {}): Query<T> {
        const constraints: QueryConstraint[] = [];

        if (options.filters) {
            options.filters.forEach(filter => {
                constraints.push(where(filter.field, filter.operator, filter.value));
            });
        }

        if (options.orderBy) {
            options.orderBy.forEach(order => {
                constraints.push(orderBy(order.field, order.direction));
            });
        }

        if (options.pagination) {
            if (options.pagination.startAfter) {
                constraints.push(startAfter(options.pagination.startAfter));
            }
            if (options.pagination.endBefore) {
                constraints.push(endBefore(options.pagination.endBefore));
            }
        }

        if (options.limit) {
            constraints.push(limit(options.limit));
        }

        return query(this.collection, ...constraints);
    }

    async find(options: FirestoreQueryOptions = {}): Promise<T[]> {
        try {
            const q = this.buildQuery(options);
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erro ao buscar documentos:', error);
            throw error;
        }
    }

    async findOne(options: FirestoreQueryOptions = {}): Promise<T | null> {
        try {
            const results = await this.find({ ...options, limit: 1 });
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            console.error('Erro ao buscar um documento:', error);
            throw error;
        }
    }

    async count(options: FirestoreQueryOptions = {}): Promise<number> {
        try {
            const results = await this.find(options);
            return results.length;
        } catch (error) {
            console.error('Erro ao contar documentos:', error);
            throw error;
        }
    }

    async exists(id: string): Promise<boolean> {
        try {
            const docSnap = await getDoc(doc(this.collection, id));
            return docSnap.exists();
        } catch (error) {
            console.error('Erro ao verificar existência do documento:', error);
            throw error;
        }
    }

    subscribe(
        options: FirestoreQueryOptions & RealtimeOptions<T> = {},
        callback: (data: T[]) => void
    ): Unsubscribe {
        try {
            const q = this.buildQuery(options);

            return onSnapshot(
                q,
                (snapshot) => {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Callback de mudança individual (opcional)
                    snapshot.docChanges().forEach(change => {
                        options.onChange?.(change.type, change.doc);
                    });

                    // Callback principal com todos os dados
                    callback(data);

                    // Callback personalizado
                    options.onNext?.(data);
                },
                (error) => {
                    console.error(`[FirestoreEntity] Erro na subscription de ${this.collection.id}:`, error);
                    options.onError?.(error);
                },
                () => {
                    console.log(`[FirestoreEntity] Subscription finalizada para ${this.collection.id}`);
                }
            );
        } catch (error) {
            console.error('Erro ao criar subscription:', error);
            throw error;
        }
    }

    subscribeToDocument(
        id: string,
        options: RealtimeOptions<T> & {
            onNext?: (data: T | null) => void;
        } = {}
    ): Unsubscribe {
        try {
            const docRef = doc(this.collection, id);

            return onSnapshot(
                docRef,
                (docSnapshot) => {
                    const data = docSnapshot.exists() ? docSnapshot.data() : null;
                    options.onNext?.(data);
                },
                (error) => {
                    console.error(`[FirestoreEntity] Erro na subscription do documento ${id}:`, error);
                    options.onError?.(error);
                },
                () => {
                    console.log(`[FirestoreEntity] Subscription do documento ${id} finalizada`);
                }
            );
        } catch (error) {
            console.error('Erro ao criar subscription do documento:', error);
            throw error;
        }
    }

    getDocumentReference(id: string): DocumentReference<T> {
        return doc(this.collection, id);
    }

    getCollectionReference(): CollectionReference<T> {
        return this.collection;
    }
}
export const charsheetEntity = new FirestoreEntity<Charsheet>(charsheetCollection);
export const userEntity = new FirestoreEntity<User>(userCollection);
export const campaignEntity = new FirestoreEntity<Campaign>(campaignCollection);
export const notificationEntity = new FirestoreEntity<Notification>(notificationsCollection);
export const spellEntity = new FirestoreEntity<Spell>(spellsCollection);
export const powerEntity = new FirestoreEntity<Power>(powersCollection);
