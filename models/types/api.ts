import type { AxiosResponse } from 'axios'
import type { QueryParamsDto } from './dto'

export type ApiRoutes = 
    '/auth' |
    '/campaign' |
    '/charsheet' |
    '/spell' |
    '/notification' |
    '/power' |
    '/pusher' |
    '/pusher/events' |
    '/events' |
    '/pusher/auth' |
    '/session' |
    '/session/connect' |
    '/connect' |
    '/session/disconnect' |
    '/disconnect' |
    '/user'

export interface ApiParams<K extends string = '', L = unknown> { queryParams?: QueryParamsDto<K>, param?: string, body?: L }
export type ApiBaseRequestType<T, K extends string = '', L = unknown> = (params?: ApiParams<K, L>) => Promise<AxiosResponse<T>>