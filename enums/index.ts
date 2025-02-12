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
    SUBSCRIPTION = 'pusher:subscription_succeeded',
    MEMBER_ADDED = 'pusher:member_added',
    MEMBER_REMOVED = 'pusher:member_removed',
    CAMPAIGN_UPDATED = 'update-campaign',
    FICHA_UPDATED = 'client-ficha-updated',
    NEW_MESSAGE = 'new-message',
    SERVER_MESSAGE = 'server-message',
    USER_ENTER = 'client-user-enter',
    USER_EXIT = 'client-user-exit',
    USER_CONNECTED = 'user-connected',
    USER_DISCONNECTED = 'user-disconnected',
    TEST_REQUEST = 'client-test-request',
    TEST_RESULT = 'client-test-result'
}