import type { FirestoreFilter, FirestoreOrderBy } from './types';

export const QueryBuilder = {
    // Filtros comuns
    where: (field: string, operator: any, value: any): FirestoreFilter => ({
        field,
        operator,
        value
    }),

    equals: (field: string, value: any): FirestoreFilter => ({
        field,
        operator: '==',
        value
    }),

    notEquals: (field: string, value: any): FirestoreFilter => ({
        field,
        operator: '!=',
        value
    }),

    greaterThan: (field: string, value: any): FirestoreFilter => ({
        field,
        operator: '>',
        value
    }),

    greaterThanOrEqual: (field: string, value: any): FirestoreFilter => ({
        field,
        operator: '>=',
        value
    }),

    lessThan: (field: string, value: any): FirestoreFilter => ({
        field,
        operator: '<',
        value
    }),

    lessThanOrEqual: (field: string, value: any): FirestoreFilter => ({
        field,
        operator: '<=',
        value
    }),

    in: (field: string, values: any[]): FirestoreFilter => ({
        field,
        operator: 'in',
        value: values
    }),

    notIn: (field: string, values: any[]): FirestoreFilter => ({
        field,
        operator: 'not-in',
        value: values
    }),

    arrayContains: (field: string, value: any): FirestoreFilter => ({
        field,
        operator: 'array-contains',
        value
    }),

    arrayContainsAny: (field: string, values: any[]): FirestoreFilter => ({
        field,
        operator: 'array-contains-any',
        value: values
    }),

    // Ordenação
    orderBy: (field: string, direction: 'asc' | 'desc' = 'asc'): FirestoreOrderBy => ({
        field,
        direction
    }),

    asc: (field: string): FirestoreOrderBy => ({ field, direction: 'asc' }),
    desc: (field: string): FirestoreOrderBy => ({ field, direction: 'desc' })
};