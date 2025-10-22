import type { AxiosInstance } from 'axios'
import type { ApiBaseRequestType, ApiParams, ApiRoutes, UpdateByIdDto } from '@types'
import axios from 'axios'
import { ApiMethods } from '@enums'

class BaseRequest<T> {
    public readonly request: ApiBaseRequestType<T>;

    constructor(instance: AxiosInstance, requestMethod: ApiMethods) {
        this.request = async <L = T, K extends string = ''>(config?: ApiParams<K, L>) => {
            let url = '';
            
            if (config?.param) {
                url = `/${config.param}`;
            }
            
            if (config?.queryParams) {
                const queryString = new URLSearchParams(config.queryParams as Record<string, string>).toString();
                url += `?${queryString}`;
            }

            console.log({ requestUrl: url, method: requestMethod, baseURL: instance.defaults.baseURL });

            const requestConfig = { data: config?.body };

            switch (requestMethod) {
            case ApiMethods.GET:
                return await instance.get(url, requestConfig);
            case ApiMethods.POST:
                return await instance.post(url, config?.body);
            case ApiMethods.PUT:
                return await instance.put(url, config?.body);
            case ApiMethods.PATCH:
                return await instance.patch(url, config?.body);
            case ApiMethods.DELETE:
                return await instance.delete(url, requestConfig);
            default:
                return await instance.get(url, requestConfig);
            }
        }
    }
    
}

export class ApiInstance<T> {
    public readonly instance: AxiosInstance
    protected get: ApiBaseRequestType<T>
    protected post: ApiBaseRequestType<T>
    protected put: ApiBaseRequestType<T>
    protected patch: ApiBaseRequestType<T>
    protected delete: ApiBaseRequestType<T>

    constructor(baseURL: ApiRoutes) {
        const instance = axios.create({
            baseURL: '/api' + baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
                // TODO: Implementar autenticação e segurança
            }
        })

        this.instance = instance
        this.get = new BaseRequest<T>(instance, ApiMethods.GET).request
        this.post = new BaseRequest<T>(instance, ApiMethods.POST).request
        this.put = new BaseRequest<T>(instance, ApiMethods.PUT).request
        this.patch = new BaseRequest<T>(instance, ApiMethods.PATCH).request
        this.delete = new BaseRequest<T>(instance, ApiMethods.DELETE).request
    }
}

export class Service<T, K extends string = string> extends ApiInstance<T> {
    async fetch(config?: ApiParams<K, T>) { return (await this.get(config)).data as T[] }
    async getById(id: string, config?: ApiParams<K, T>) { return (await this.get({ param: id, ...config })).data }
    async create<L = T>(data: Partial<L>, config?: ApiParams<K, T>) { return (await this.post({ body: data, ...config })).data as unknown as L }
    async updateById<L = T>(body: UpdateByIdDto<L>, config?: ApiParams<K, T>) { return (await this.patch({ param: body.id, body: body.data, ...config })).data as unknown as L }
    async deleteById(id: string, config?: ApiParams<K, T>) { return (await this.delete({ param: id, ...config })).data }
}