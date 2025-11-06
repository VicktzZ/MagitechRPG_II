export enum ApiMethods {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
    PUT = 'PUT'
}

export enum SearchOptions {
    SEARCH = 'search',
    FILTER = 'filter',
    SORT = 'sort',
    PAGE = 'page',
    LIMIT = 'limit',
    ORDER = 'order'
}

export enum PusherEvent {
    SUBSCRIPTION = 'pusher:subscription_succeeded',
    MEMBER_ADDED = 'pusher:member_added',
    MEMBER_REMOVED = 'pusher:member_removed',
    NEW_MESSAGE = 'client-new_message',
    MESSAGE_SENT = 'message:sent',
    CAMPAIGN_UPDATED = 'campaign:updated',
    CHARSHEET_UPDATED = 'charsheet:updated',
    NOTES_UPDATED = 'notes:updated',
    TEST_REQUEST = 'test:requested',
    TEST_RESULT = 'test:responded',
    SESSION_USERS_UPDATED = 'client-session_users_updated',
    USER_ENTER = 'client-user_enter',
    ITEM_ADDED = 'client-item_added',
    USER_EXIT = 'user:exit'
}

export enum SkillType {
    ALL = 'all',
    CLASS = 'class',
    SUBCLASS = 'subclass',
    LINEAGE = 'lineage',
    POWERS = 'powers',
    BONUS = 'bonus'
}

export enum AmmoType {
    BULLET = 'bullet',
    ARROW = 'arrow',
    ENERGY = 'energy',
    SPECIAL = 'special'
}

export enum SpellType {
    ATTACK = 'attack',
    DEFENSE = 'defense',
    SUPPORT = 'support',
    HEALING = 'healing',
    UTILITY = 'utility'
}

export enum MessageType {
    TEXT = 'text',
    ROLL = 'roll',
    DICE = 'dice',
    ERROR = 'error',
    SYSTEM = 'system',
    EXPERTISE = 'expertise'
}
