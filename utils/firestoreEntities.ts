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
import { waitForFirebaseAuth } from './firebaseAuth';

/**
 * Se a consulta só filtra pelo campo `id` (== ou in), devolve os IDs.
 * Essas consultas são feitas como leituras de documento por ID: as regras do
 * Firestore liberam ler um documento conhecido pelo ID, mas não listar a
 * coleção inteira — e uma consulta `where('id', 'in', ...)` conta como listagem.
 */
function extractIdLookup(options: FirestoreQueryOptions): string[] | null {
    const filters = options.filters ?? [];
    if (filters.length !== 1 || options.orderBy?.length || options.pagination) return null;

    const [ filter ] = filters;
    if (filter.field !== 'id') return null;
    if (filter.operator === '==' && typeof filter.value === 'string') return [ filter.value ];
    if (filter.operator === 'in' && Array.isArray(filter.value)) {
        return [ ...new Set(filter.value.filter((v: unknown): v is string => typeof v === 'string' && v !== '')) ];
    }
    return null;
}

export class FirestoreEntity<T extends DocumentData = DocumentData> {
    collection: CollectionReference<T>;

    constructor(collection: CollectionReference<T>) {
        this.collection = collection;
    }

    async findById(id: string): Promise<T | null> {
        try {
            await waitForFirebaseAuth();
            const docSnap = await getDoc(doc(this.collection, id));
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error('Erro ao buscar documento por ID:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<T>): Promise<void> {
        try {
            await waitForFirebaseAuth();
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
            await waitForFirebaseAuth();

            const ids = extractIdLookup(options);
            if (ids) {
                const snaps = await Promise.all(ids.map(async id => await getDoc(doc(this.collection, id))));
                const found = snaps.filter(snap => snap.exists()).map(snap => ({ id: snap.id, ...snap.data() }) as T);
                return options.limit ? found.slice(0, options.limit) : found;
            }

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
            await waitForFirebaseAuth();
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
            const ids = extractIdLookup(options);
            if (ids) return this.subscribeByIds(ids, options, callback);

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

    /**
     * Equivalente realtime de `where('id', 'in', ids)` feito com um listener
     * por documento. Entrega a lista agregada (na ordem dos IDs) depois que
     * todos responderam pela primeira vez e, daí em diante, a cada mudança.
     */
    private subscribeByIds(
        ids: string[],
        options: RealtimeOptions<T>,
        callback: (data: T[]) => void
    ): Unsubscribe {
        if (ids.length === 0) {
            const empty: T[] = [];
            callback(empty);
            options.onNext?.(empty);
            return () => {};
        }

        const results = new Map<string, T>();
        const responded = new Set<string>();

        const emit = () => {
            if (responded.size < ids.length) return;
            const data = ids.map(id => results.get(id)).filter((item): item is T => item !== undefined);
            callback(data);
            options.onNext?.(data);
        };

        const unsubscribers = ids.map(id => onSnapshot(
            doc(this.collection, id),
            (snapshot) => {
                const existed = results.has(id);
                if (snapshot.exists()) {
                    results.set(id, { id: snapshot.id, ...snapshot.data() } as T);
                    options.onChange?.(existed ? 'modified' : 'added', snapshot);
                } else if (existed) {
                    results.delete(id);
                    options.onChange?.('removed', snapshot);
                }
                responded.add(id);
                emit();
            },
            (error) => {
                // Sem permissão / inexistente: trata como ausente para não travar o carregamento dos demais
                console.error(`[FirestoreEntity] Erro na subscription de ${this.collection.id}/${id}:`, error);
                options.onError?.(error);
                results.delete(id);
                responded.add(id);
                emit();
            }
        ));

        return () => { unsubscribers.forEach(unsubscribe => { unsubscribe(); }); };
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
