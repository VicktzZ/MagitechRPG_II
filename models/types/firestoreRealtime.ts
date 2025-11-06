import type { DocumentData, DocumentSnapshot, FieldPath, OrderByDirection, WhereFilterOp } from '@firebase/firestore';

export type FirestoreOnChange = (type: 'added' | 'modified' | 'removed', doc: DocumentSnapshot) => void

export interface RealtimeOptions<T = DocumentData> {
    onNext?: (data: T[]) => void;
    onError?: (error: Error) => void;
    onChange?: FirestoreOnChange;
    includeMetadataChanges?: boolean;
    enabled?: boolean;
}

export interface FirestoreFilter {
    field: string | FieldPath;
    operator: WhereFilterOp;
    value: any;
}

export interface FirestoreOrderBy {
    field: string | FieldPath;
    direction: OrderByDirection;
}

export interface FirestorePaginationOptions {
    pageSize: number;
    startAfter?: DocumentSnapshot;
    endBefore?: DocumentSnapshot;
}

export interface FirestoreQueryOptions {
    filters?: FirestoreFilter[];
    orderBy?: FirestoreOrderBy[];
    limit?: number;
    pagination?: FirestorePaginationOptions;
}