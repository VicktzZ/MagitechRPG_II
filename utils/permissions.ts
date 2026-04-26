import { type User } from '@models/entities';
import { 
    Permission, 
    SubscriptionPlan, 
    SubscriptionStatus,
    getPermissionsForPlan,
    planHasPermission,
    SubscriptionPlanMetadata
} from '@enums/subscriptionEnum';
import type { PermissionCheck } from '@models/types/subscription';

/**
 * Verifica se um usuário tem uma permissão específica
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
    if (!user?.subscription) {
        return false;
    }

    // Verifica se a assinatura está ativa
    if (user.subscription.status !== SubscriptionStatus.ACTIVE) {
        return false;
    }

    const userPermissions = getPermissionsForPlan(user.subscription.plan);
    return userPermissions.includes(permission);
}

/**
 * Verifica se um usuário tem todas as permissões especificadas
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Verifica se um usuário tem pelo menos uma das permissões especificadas
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Verifica permissão e retorna informações detalhadas
 */
export function checkPermission(user: User | null, permission: Permission): PermissionCheck {
    if (!user?.subscription) {
        return {
            hasPermission: false,
            permission,
            currentPlan: SubscriptionPlan.FREEMIUM,
            message: 'Usuário não autenticado'
        };
    }

    const currentPlan = user.subscription.plan;
    const hasAccess = hasPermission(user, permission);

    if (hasAccess) {
        return {
            hasPermission: true,
            permission,
            currentPlan
        };
    }

    // Encontra o plano mínimo necessário para esta permissão
    const requiredPlan = findMinimumPlanForPermission(permission);

    return {
        hasPermission: false,
        permission,
        currentPlan,
        requiredPlan,
        message: requiredPlan 
            ? `Esta funcionalidade requer o plano ${SubscriptionPlanMetadata[requiredPlan].displayName}`
            : 'Permissão não disponível'
    };
}

/**
 * Encontra o plano mínimo necessário para uma permissão
 */
function findMinimumPlanForPermission(permission: Permission): SubscriptionPlan | undefined {
    const plans = [
        SubscriptionPlan.FREEMIUM,
        SubscriptionPlan.PREMIUM,
        SubscriptionPlan.PREMIUM_PLUS
    ];

    for (const plan of plans) {
        if (planHasPermission(plan, permission)) {
            return plan;
        }
    }

    return undefined;
}

/**
 * Verifica se um usuário pode acessar campanhas
 */
export function canAccessCampaigns(user: User | null): boolean {
    return hasPermission(user, Permission.ACCESS_CAMPAIGNS);
}

/**
 * Verifica se um usuário pode criar sistemas customizados
 */
export function canCreateCustomSystems(user: User | null): boolean {
    return hasPermission(user, Permission.CREATE_CUSTOM_SYSTEMS);
}

/**
 * Verifica se um usuário tem acesso ao Discord
 */
export function hasDiscordAccess(user: User | null): boolean {
    return hasPermission(user, Permission.DISCORD_ACCESS);
}

/**
 * Verifica se um usuário tem o cargo VIP no Discord
 */
export function hasDiscordVIP(user: User | null): boolean {
    return hasPermission(user, Permission.DISCORD_VIP_ROLE);
}

/**
 * Obtém todas as permissões do usuário
 */
export function getUserPermissions(user: User | null): Permission[] {
    if (!user?.subscription) {
        return [];
    }

    return getPermissionsForPlan(user.subscription.plan);
}

/**
 * Verifica se a assinatura do usuário está ativa
 */
export function isSubscriptionActive(user: User | null): boolean {
    if (!user?.subscription) {
        return false;
    }

    const { status, endDate } = user.subscription;

    // Se o status não é ativo, retorna falso
    if (status !== SubscriptionStatus.ACTIVE) {
        return false;
    }

    // Se há uma data de término, verifica se já passou
    if (endDate) {
        const now = new Date();
        const end = new Date(endDate);
        return now < end;
    }

    return true;
}

/**
 * Verifica se a assinatura expirou
 */
export function isSubscriptionExpired(user: User | null): boolean {
    if (!user?.subscription) {
        return false;
    }

    const { endDate } = user.subscription;

    if (!endDate) {
        return false;
    }

    const now = new Date();
    const end = new Date(endDate);
    return now >= end;
}

/**
 * Verifica se o usuário pode fazer upgrade para um plano específico
 */
export function canUpgradeToPlan(user: User | null, targetPlan: SubscriptionPlan): boolean {
    if (!user?.subscription) {
        return false;
    }

    const currentPlan = user.subscription.plan;
  
    const planHierarchy = {
        [SubscriptionPlan.FREEMIUM]: 0,
        [SubscriptionPlan.PREMIUM]: 1,
        [SubscriptionPlan.PREMIUM_PLUS]: 2
    };

    return planHierarchy[targetPlan] > planHierarchy[currentPlan];
}

/**
 * Verifica se o usuário pode fazer downgrade para um plano específico
 */
export function canDowngradeToPlan(user: User | null, targetPlan: SubscriptionPlan): boolean {
    if (!user?.subscription) {
        return false;
    }

    const currentPlan = user.subscription.plan;
  
    const planHierarchy = {
        [SubscriptionPlan.FREEMIUM]: 0,
        [SubscriptionPlan.PREMIUM]: 1,
        [SubscriptionPlan.PREMIUM_PLUS]: 2
    };

    return planHierarchy[targetPlan] < planHierarchy[currentPlan];
}

/**
 * Obtém informações de limite de uso baseado no plano
 */
export function getPlanLimits(plan: SubscriptionPlan) {
    const limits = {
        [SubscriptionPlan.FREEMIUM]: {
            maxCharsheets: 2, // Limitado a 2 personagens
            maxCampaigns: 0,
            maxCustomSystems: 0,
            maxStorageGB: 1,
            supportLevel: 'community'
        },
        [SubscriptionPlan.PREMIUM]: {
            maxCharsheets: -1, // ilimitado
            maxCampaigns: -1, // ilimitado
            maxCustomSystems: 0,
            maxStorageGB: 5,
            supportLevel: 'priority'
        },
        [SubscriptionPlan.PREMIUM_PLUS]: {
            maxCharsheets: -1, // ilimitado
            maxCampaigns: -1, // ilimitado
            maxCustomSystems: -1, // ilimitado
            maxStorageGB: 20,
            supportLevel: 'premium'
        }
    };

    return limits[plan];
}

/**
 * Verifica se o usuário atingiu o limite de uso de uma funcionalidade
 */
export function hasReachedLimit(
    user: User | null, 
    feature: 'charsheets' | 'campaigns' | 'customSystems' | 'storage'
): boolean {
    if (!user?.subscription || !user.usageStats) {
        return false;
    }

    const limits = getPlanLimits(user.subscription.plan);
    const stats = user.usageStats;

    switch (feature) {
    case 'charsheets':
        return limits.maxCharsheets !== -1 && stats.charsheetsCreated >= limits.maxCharsheets;
    case 'campaigns':
        return limits.maxCampaigns !== -1 && stats.campaignsCreated >= limits.maxCampaigns;
    case 'customSystems':
        return limits.maxCustomSystems !== -1 && stats.customSystemsCreated >= limits.maxCustomSystems;
    case 'storage':
        const storageUsedGB = stats.storageUsed / (1024 * 1024 * 1024);
        return storageUsedGB >= limits.maxStorageGB;
    default:
        return false;
    }
}
