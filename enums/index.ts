export enum ApiMethod {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE',
    PATCH = 'PATCH'
}

export enum SearchOptions {
    SEARCH = 'search',
    FILTER = 'filter',
    SORT = 'sort',
    ORDER = 'order'
}

export enum PusherEvent {
    CONNECTION = 'connection',
    DISCONNECTION = 'disconnection',
    UPDATE_CAMPAIGN = 'update-campaign'
}