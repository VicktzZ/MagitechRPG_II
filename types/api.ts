import type { QueryParamsDto, UpdateByIdDto } from './dto'

export interface ApiRequest<T> {
    get: <K extends string = '', L = T>(params?: { queryParams?: QueryParamsDto<K>, param?: string, body?: L }) => Promise<T> 
    post: <K = T>(body: K) => Promise<T>
    delete: <K = T>(id: string, body?: K) => Promise<T>
    patch: <K = T>(id: string, body: K) => Promise<T>
    put: <K = T>(id: string, body: K) => Promise<T>

    url: (address: string) => ApiRequest<T>
}

export interface Service<T, K extends string = ''> {
    fetch: (queryParams?: QueryParamsDto<K>) => Promise<T[]>
    getById: (id: string) => Promise<T>
    create: (body: T) => Promise<T>
    updateById: (body: UpdateByIdDto<T>) => Promise<T>
    deleteById: (id: string) => Promise<T>
}