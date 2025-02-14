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
    NEW_MESSAGE = 'client-new_message',
    MESSAGE_SENT = 'client-message_sent',
    CAMPAIGN_UPDATED = 'client-campaign_updated',
    TEST_RESULT = 'client-test_result',
    TEST_REQUEST = 'client-test_request',
    SESSION_USERS_UPDATED = 'client-session_users_updated'
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
    SYSTEM = 'system'
}
