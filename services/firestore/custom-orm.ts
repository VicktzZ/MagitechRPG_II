import { 
    deleteDoc,
    getDoc,
    onSnapshot,
    setDoc,
    updateDoc,
    where,
    serverTimestamp,
    addDoc,
    doc,
    orderBy,
    startAfter,
    endBefore,
    query,
    limit,
    getDocs,
    type Unsubscribe,
    type CollectionReference,
    type DocumentData,
    type DocumentReference,
    type Query,
    type QueryConstraint
} from '@firebase/firestore';
import type { BatchOperation, FirestoreQueryOptions, RealtimeOptions } from './types';

export class FirestoreEntity<T extends DocumentData = DocumentData> {
    collection: CollectionReference<T>;

    constructor(collection: CollectionReference<T>) {
        this.collection = collection;
    }

    // === MÉTODOS BÁSICOS (CRUD) ===

    async create(data: Partial<T>): Promise<string> {
        try {
            const docData = {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            } as unknown as T;

            const docRef = await addDoc(this.collection, docData);
            return docRef.id;
        } catch (error) {
            console.error('Erro ao criar documento:', error);
            throw error;
        }
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

    async delete(id: string): Promise<void> {
        try {
            await deleteDoc(doc(this.collection, id));
        } catch (error) {
            console.error('Erro ao deletar documento:', error);
            throw error;
        }
    }

    async upsert(id: string | null, data: Partial<T>): Promise<string> {
        try {
            if (id) {
                await this.update(id, data);
                return id;
            } else {
                return await this.create(data);
            }
        } catch (error) {
            console.error('Erro ao fazer upsert:', error);
            throw error;
        }
    }

    // === MÉTODOS DE CONSULTA ===

    private buildQuery(options: FirestoreQueryOptions = {}): Query<T> {
        const constraints: QueryConstraint[] = [];

        // Aplicar filtros
        if (options.filters) {
            options.filters.forEach(filter => {
                constraints.push(where(filter.field, filter.operator, filter.value));
            });
        }

        // Aplicar ordenação
        if (options.orderBy) {
            options.orderBy.forEach(order => {
                constraints.push(orderBy(order.field, order.direction));
            });
        }

        // Aplicar paginação
        if (options.pagination) {
            if (options.pagination.startAfter) {
                constraints.push(startAfter(options.pagination.startAfter));
            }
            if (options.pagination.endBefore) {
                constraints.push(endBefore(options.pagination.endBefore));
            }
        }

        // Aplicar limite
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
                _id: doc.id,
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

    // === MÉTODOS EM TEMPO REAL ===

    subscribe(
        options: FirestoreQueryOptions & RealtimeOptions<T> = {},
        callback: (data: T[]) => void
    ): Unsubscribe {
        try {
            const q = this.buildQuery(options);
            console.log(`[FirestoreEntity] Iniciando subscription para ${this.collection.id}`);

            return onSnapshot(
                q,
                (snapshot) => {
                    const data = snapshot.docs.map(doc => ({
                        _id: doc.id,
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
            console.log(`[FirestoreEntity] Iniciando subscription para documento ${id}`);

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

    // === MÉTODOS DE BATCH ===

    async batch(operations: BatchOperation[]): Promise<void> {
        try {
            const batch = [];
            for (const operation of operations) {
                const docRef = operation.docRef;
                switch (operation.type) {
                case 'set':
                    batch.push(setDoc(docRef, operation.data));
                    break;
                case 'update':
                    batch.push(updateDoc(docRef, operation.data));
                    break;
                case 'delete':
                    batch.push(deleteDoc(docRef));
                    break;
                }
            }
            await Promise.all(batch);
        } catch (error) {
            console.error('Erro ao executar batch:', error);
            throw error;
        }
    }

    // === MÉTODOS DE UTILIDADE ===

    getDocumentReference(id: string): DocumentReference<T> {
        return doc(this.collection, id);
    }

    getCollectionReference(): CollectionReference<T> {
        return this.collection;
    }

    async getCollectionStats(): Promise<{
        count: number;
        lastUpdated?: Date;
        size?: number;
    }> {
        try {
            const results = await this.find({ limit: 1000 });
            const count = results.length;

            // Estimar data da última atualização (simplificado)
            let lastUpdated: Date | undefined;
            if (results.length > 0) {
                const docsWithTimestamp = results.filter(doc =>
                    doc.updatedAt || doc.createdAt
                );
                if (docsWithTimestamp.length > 0) {
                    const timestamps = docsWithTimestamp.map(doc =>
                        doc.updatedAt?.toDate() || doc.createdAt?.toDate()
                    ).filter(Boolean);
                    lastUpdated = timestamps.length > 0 ?
                        new Date(Math.max(...timestamps.map(t => t.getTime()))) :
                        undefined;
                }
            }

            return { count, lastUpdated };
        } catch (error) {
            console.error('Erro ao obter estatísticas da coleção:', error);
            throw error;
        }
    }
}