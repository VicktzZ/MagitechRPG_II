import { ApiMethod } from '@enums'
import type { ApiRequest, QueryParamsDto } from '@types'

export function apiRequest<T>(baseUrl: string): ApiRequest<T> {
    const url = '/api/' + baseUrl

    return {
        get: async <K extends string = ''>(params?: { queryParams?: QueryParamsDto<K>, param?: string }) => {
            let apiUrl = url;

            if (params?.param) {
                apiUrl += '/' + params.param;
            }
            if (params?.queryParams) {
                const queryString = new URLSearchParams(params.queryParams as Record<string, string>).toString();
                apiUrl += '?' + queryString;
            }

            return await fetch(apiUrl, {
                method: ApiMethod.GET,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(async r => await r.json());
        },

        post: async <K = T>(body: K) => {
            return await fetch(url, {
                method: ApiMethod.POST,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(async r => await r.json())
        },

        delete: async (id: string) => {
            const response = await fetch(`${url}/${id}`, {
                method: ApiMethod.DELETE,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(async r => await r.json())
            return response
        },

        patch: async <K = T>(id: string, body: K) => {
            const response = await fetch(`${url}/${id}`, {
                method: ApiMethod.PATCH,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(async r => await r.json())
            return response
        },

        put: async <K = T>(id: string, body: K) => {
            const response = await fetch(`${url}/${id}`, {
                method: ApiMethod.PUT,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(async r => await r.json())
            return response
        },

        url: (address: string) => {
            return apiRequest<T>(baseUrl + '/' + address)
        }
    }
}