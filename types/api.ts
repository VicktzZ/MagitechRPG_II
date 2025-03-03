import type { QueryParamsDto, UpdateByIdDto } from './dto'

export interface ApiRequest<T> {
    get: <K extends string = ''>(params?: { queryParams?: QueryParamsDto<K>, param?: string }) => Promise<T> 
    post: <K = T>(body: K) => Promise<T>
    delete: (id: string) => Promise<T>
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