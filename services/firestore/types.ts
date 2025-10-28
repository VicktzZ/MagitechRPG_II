// === TIPOS PARA O ORM FIRESTORE ===

import type {
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    FieldPath,
    OrderByDirection,
    WhereFilterOp
} from 'firebase/firestore';

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

export interface RealtimeOptions<T = DocumentData> {
    onNext?: (data: T[]) => void;
    onError?: (error: Error) => void;
    onChange?: (type: 'added' | 'modified' | 'removed', doc: DocumentSnapshot) => void;
    includeMetadataChanges?: boolean;
    enabled?: boolean;
}

export interface BatchOperation {
    type: 'set' | 'update' | 'delete';
    docRef: DocumentReference;
    data?: any;
}

// Tipos para filtros
export type FirestoreFilterOp = WhereFilterOp;
export type FirestoreOrderDirection = OrderByDirection;

// Interface para filtros
export interface IFirestoreFilter {
    field: string;
    operator: FirestoreFilterOp;
    value: any;
}

// Interface para ordenação
export interface IFirestoreOrderBy {
    field: string;
    direction: FirestoreOrderDirection;
}

// Interface para paginação
export interface IFirestorePagination {
    pageSize: number;
    startAfter?: DocumentSnapshot;
    endBefore?: DocumentSnapshot;
}

// Interface para opções de query
export interface IFirestoreQueryOptions {
    filters?: IFirestoreFilter[];
    orderBy?: IFirestoreOrderBy[];
    limit?: number;
    pagination?: IFirestorePagination;
}

// Interface para opções de tempo real
export interface IRealtimeOptions<T = DocumentData> {
    onNext?: (data: T[]) => void;
    onError?: (error: Error) => void;
    onChange?: (type: 'added' | 'modified' | 'removed', doc: DocumentSnapshot) => void;
    includeMetadataChanges?: boolean;
}

// Interface para operações em batch
export interface IBatchOperation {
    type: 'set' | 'update' | 'delete';
    docRef: any; // DocumentReference
    data?: any;
}

// === TIPOS PARA HOOKS ===

// Tipos para hooks de entidade
export interface IUseFirestoreEntityResult<T> {
    data: T[] | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

// Tipos para hooks de tempo real
export interface IUseFirestoreRealtimeResult<T> {
    data: T[];
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

// Tipos para hooks de documento
export interface IUseFirestoreDocumentResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    update: (data: Partial<T>) => Promise<void>;
    delete: () => Promise<void>;
}

// Tipos para hooks CRUD
export interface IUseFirestoreCRUDResult<T> {
    create: (data: Partial<T>) => Promise<string>;
    update: (id: string, data: Partial<T>) => Promise<void>;
    remove: (id: string) => Promise<void>;
    upsert: (id: string | null, data: Partial<T>) => Promise<string>;
}

// Tipos para paginação
export interface IUseFirestorePaginationResult<T> {
    data: T[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// === TIPOS PARA ENTIDADES ESPECÍFICAS ===

// Campaign Types
export interface ICampaignQueryOptions extends IFirestoreQueryOptions {
    byUser?: string; // Buscar campanhas de um usuário específico
    byCode?: string; // Buscar por código da campanha
    isPublic?: boolean; // Filtrar por campanhas públicas
    hasPlayers?: boolean; // Filtrar por campanhas com jogadores
}

export interface ICampaignStats {
    total: number;
    public: number;
    private: number;
    withPlayers: number;
    averagePlayers: number;
}

// Charsheet Types
export interface ICharsheetQueryOptions extends IFirestoreQueryOptions {
    byUser?: string; // Buscar charsheets de um usuário específico
    byCampaign?: string; // Buscar charsheets de uma campanha específica
    byClass?: string; // Filtrar por classe
    byLevel?: number; // Filtrar por nível
    minLevel?: number; // Nível mínimo
    maxLevel?: number; // Nível máximo
}

export interface ICharsheetStats {
    total: number;
    byClass: Record<string, number>;
    averageLevel: number;
    maxLevel: number;
}

// User Types
export interface IUserQueryOptions extends IFirestoreQueryOptions {
    byCampaign?: string; // Buscar usuários de uma campanha específica
    hasCharsheets?: boolean; // Filtrar por usuários com charsheets
}

// Spell Types
export interface ISpellQueryOptions extends IFirestoreQueryOptions {
    byElement?: string; // Filtrar por elemento
    byLevel?: number; // Filtrar por nível
    byType?: string; // Filtrar por tipo
    minLevel?: number; // Nível mínimo
    maxLevel?: number; // Nível máximo
}

export interface ISpellStats {
    total: number;
    byElement: Record<string, number>;
    byLevel: Record<number, number>;
    averageLevel: number;
}

// Power Types
export interface IPowerQueryOptions extends IFirestoreQueryOptions {
    byElement?: string; // Filtrar por elemento
    byType?: string; // Filtrar por tipo
}

export interface IPowerStats {
    total: number;
    byElement: Record<string, number>;
    byType: Record<string, number>;
}

// === TIPOS PARA EXEMPLOS ===

// Tipos para os exemplos de uso
export interface IExampleProps {
    userId: string;
    campaignId: string;
    elemento: string;
    searchTerm: string;
}

// === ENUMS E CONSTANTES ===

// Operadores de filtro disponíveis
export const FILTER_OPERATORS = {
    EQUALS: '==',
    NOT_EQUALS: '!=',
    GREATER_THAN: '>',
    GREATER_THAN_OR_EQUAL: '>=',
    LESS_THAN: '<',
    LESS_THAN_OR_EQUAL: '<=',
    IN: 'in',
    NOT_IN: 'not-in',
    ARRAY_CONTAINS: 'array-contains',
    ARRAY_CONTAINS_ANY: 'array-contains-any'
} as const;

// Direções de ordenação
export const ORDER_DIRECTIONS = {
    ASC: 'asc',
    DESC: 'desc'
} as const;

// Tamanhos de página padrão
export const DEFAULT_PAGE_SIZES = [ 10, 20, 50, 100 ] as const;

// Elementos disponíveis para magias/poderes
export const ELEMENTS = [
    'FOGO', 'AGUA', 'TERRA', 'AR', 'ELETRICIDADE',
    'TREVAS', 'LUZ', 'NAO_ELEMENTAL'
] as const;

// Classes disponíveis
export const CLASSES = [
    'Guerreiro', 'Mago', 'Ladino', 'Clérigo', 'Druida',
    'Bárbaro', 'Paladino', 'Ranger', 'Feiticeiro', 'Bruxo'
] as const;

// === TIPOS PARA VALIDAÇÃO ===

// Tipos para validação de parâmetros
export type ValidElement = typeof ELEMENTS[number];
export type ValidClass = typeof CLASSES[number];
export type ValidPageSize = typeof DEFAULT_PAGE_SIZES[number];
export type ValidFilterOperator = keyof typeof FILTER_OPERATORS;
export type ValidOrderDirection = keyof typeof ORDER_DIRECTIONS;

// === INTERFACES PARA CONFIGURAÇÃO ===

// Configuração para inicialização do ORM
export interface IFirestoreORMConfig {
    enableLogging?: boolean;
    defaultPageSize?: number;
    maxRetries?: number;
    retryDelay?: number;
}

// Configuração para cache
export interface ICacheConfig {
    staleTime?: number;
    gcTime?: number;
    enableCache?: boolean;
}

// === TIPOS PARA ERROS ===

// Tipos de erro específicos do ORM
export class FirestoreORMError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: any
    ) {
        super(message);
        this.name = 'FirestoreORMError';
    }
}

export const ERROR_CODES = {
    DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    QUOTA_EXCEEDED: 'QUOTA_EXCEEDED'
} as const;

// === TIPOS PARA EVENTOS ===

// Tipos para eventos de mudança
export interface IChangeEvent<T = DocumentData> {
    type: 'added' | 'modified' | 'removed';
    doc: DocumentSnapshot<T>;
    oldIndex?: number;
    newIndex?: number;
}

// Tipos para eventos de documento
export interface IDocumentEvent<T = DocumentData> {
    data: T | null;
    exists: boolean;
    metadata: {
        fromCache: boolean;
        hasPendingWrites: boolean;
    };
}

// === INTERFACES PARA CONFIGURAÇÃO DE SUBSCRIPTION ===

// Configuração para subscription
export interface ISubscriptionConfig<T = DocumentData> {
    query?: IFirestoreQueryOptions;
    documentId?: string;
    callbacks?: IRealtimeOptions<T>;
    autoStart?: boolean;
}

// Estado da subscription
export interface ISubscriptionState {
    isActive: boolean;
    isLoading: boolean;
    error: Error | null;
    lastUpdate: Date | null;
}

// === TIPOS PARA BATCH OPERATIONS ===

// Configuração para operações em batch
export interface IBatchConfig {
    maxOperations?: number;
    continueOnError?: boolean;
    retryOnFailure?: boolean;
}

// Resultado de operação em batch
export interface IBatchResult {
    success: boolean;
    operationsCompleted: number;
    operationsFailed: number;
    errors: Error[];
    duration: number;
}

// === TIPOS PARA EXPORTAÇÃO ===

// Tipos que podem ser exportados
export type ExportableData = DocumentData;
export type ExportFormat = 'json' | 'csv' | 'excel';

// Configuração para exportação
export interface IExportConfig {
    format: ExportFormat;
    filename?: string;
    includeMetadata?: boolean;
    filters?: IFirestoreQueryOptions;
}

// === TIPOS PARA SINCRONIZAÇÃO OFFLINE ===

// Configuração para sincronização offline
export interface IOfflineConfig {
    enableOffline?: boolean;
    syncOnReconnect?: boolean;
    maxStorageSize?: number;
}

// Estado de sincronização offline
export interface IOfflineState {
    isOnline: boolean;
    pendingChanges: number;
    lastSync: Date | null;
    storageUsed: number;
}
