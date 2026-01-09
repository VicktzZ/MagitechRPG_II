import { useContext, useMemo } from 'react';
import { userContext } from '@contexts/userContext';
import { useSession } from 'next-auth/react';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import type { User } from '@models/entities';
import { 
  Permission, 
  SubscriptionPlan,
  SubscriptionPlanMetadata
} from '@enums/subscriptionEnum';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  checkPermission,
  canAccessCampaigns,
  canCreateCustomSystems,
  hasDiscordAccess,
  hasDiscordVIP,
  getUserPermissions,
  isSubscriptionActive,
  isSubscriptionExpired,
  canUpgradeToPlan,
  canDowngradeToPlan,
  getPlanLimits,
  hasReachedLimit
} from '@utils/permissions';
import type { PermissionCheck } from '@models/types/subscription';

/**
 * Hook para gerenciar a assinatura do usuário
 * Busca automaticamente do contexto ou do Firestore se necessário
 */
export function useSubscription() {
  const { user: contextUser } = useContext(userContext);
  const { data: session } = useSession();
  const { data: allUsers } = useFirestoreRealtime('user');
  
  // Tentar buscar usuário do contexto primeiro, senão buscar do Firestore
  const user = useMemo(() => {
    if (contextUser && contextUser.subscription) {
      return contextUser as User;
    }
    
    // Se não tem no contexto, buscar do Firestore
    if (session?.user?.id && allUsers) {
      const firestoreUser = allUsers.find((u: User) => u.id === session.user.id);
      return firestoreUser as User || null;
    }
    
    return null;
  }, [contextUser, session?.user?.id, allUsers]);

  const subscriptionData = useMemo(() => {
    if (!user || !user.subscription) {
      return null;
    }
    return user.subscription;
  }, [user]);

  const currentPlan = useMemo(() => {
    return subscriptionData?.plan || SubscriptionPlan.FREEMIUM;
  }, [subscriptionData]);

  const planMetadata = useMemo(() => {
    return SubscriptionPlanMetadata[currentPlan];
  }, [currentPlan]);

  const isActive = useMemo(() => {
    return isSubscriptionActive(user);
  }, [user]);

  const isExpired = useMemo(() => {
    return isSubscriptionExpired(user);
  }, [user]);

  const permissions = useMemo(() => {
    return getUserPermissions(user);
  }, [user]);

  return {
    subscription: subscriptionData,
    currentPlan,
    planMetadata,
    isActive,
    isExpired,
    permissions,
    user: user as User | null
  };
}

/**
 * Hook para verificar permissões específicas
 */
export function usePermission(permission: Permission): PermissionCheck {
  const { user: contextUser } = useContext(userContext);
  const { data: session } = useSession();
  const { data: allUsers } = useFirestoreRealtime('user');
  
  const user = useMemo(() => {
    if (contextUser && contextUser.subscription) return contextUser as User;
    if (session?.user?.id && allUsers) {
      return allUsers.find((u: User) => u.id === session.user.id) as User || null;
    }
    return null;
  }, [contextUser, session?.user?.id, allUsers]);

  return useMemo(() => {
    return checkPermission(user, permission);
  }, [user, permission]);
}

/**
 * Hook para verificar múltiplas permissões
 */
export function usePermissions(permissions: Permission[]) {
  const { user: contextUser } = useContext(userContext);
  const { data: session } = useSession();
  const { data: allUsers } = useFirestoreRealtime('user');
  
  const user = useMemo(() => {
    if (contextUser && contextUser.subscription) return contextUser as User;
    if (session?.user?.id && allUsers) {
      return allUsers.find((u: User) => u.id === session.user.id) as User || null;
    }
    return null;
  }, [contextUser, session?.user?.id, allUsers]);

  return useMemo(() => {
    return {
      hasAll: hasAllPermissions(user, permissions),
      hasAny: hasAnyPermission(user, permissions),
      checks: permissions.map(permission => checkPermission(user, permission))
    };
  }, [user, permissions]);
}

/**
 * Hook para funcionalidades específicas de campanhas
 */
export function useCampaignAccess() {
  const { user: contextUser } = useContext(userContext);
  const { data: session } = useSession();
  const { data: allUsers } = useFirestoreRealtime('user');
  
  const user = useMemo(() => {
    if (contextUser && contextUser.subscription) return contextUser as User;
    if (session?.user?.id && allUsers) {
      return allUsers.find((u: User) => u.id === session.user.id) as User || null;
    }
    return null;
  }, [contextUser, session?.user?.id, allUsers]);

  return useMemo(() => {
    const access = canAccessCampaigns(user);
    const check = checkPermission(user, Permission.ACCESS_CAMPAIGNS);
    
    return {
      hasAccess: access,
      canCreate: hasPermission(user, Permission.CREATE_CAMPAIGN),
      canJoin: hasPermission(user, Permission.JOIN_CAMPAIGN),
      permissionCheck: check
    };
  }, [user]);
}

/**
 * Hook para funcionalidades de sistemas customizados
 */
export function useCustomSystemsAccess() {
  const { user: contextUser } = useContext(userContext);
  const { data: session } = useSession();
  const { data: allUsers } = useFirestoreRealtime('user');
  
  const user = useMemo(() => {
    if (contextUser && contextUser.subscription) return contextUser as User;
    if (session?.user?.id && allUsers) {
      return allUsers.find((u: User) => u.id === session.user.id) as User || null;
    }
    return null;
  }, [contextUser, session?.user?.id, allUsers]);

  return useMemo(() => {
    const access = canCreateCustomSystems(user);
    const check = checkPermission(user, Permission.CREATE_CUSTOM_SYSTEMS);
    
    return {
      canCreate: access,
      canEdit: hasPermission(user, Permission.EDIT_CUSTOM_SYSTEMS),
      permissionCheck: check
    };
  }, [user]);
}

/**
 * Hook para funcionalidades do Discord
 */
export function useDiscordAccess() {
  const { user: contextUser } = useContext(userContext);
  const { data: session } = useSession();
  const { data: allUsers } = useFirestoreRealtime('user');
  
  const user = useMemo(() => {
    if (contextUser && contextUser.subscription) return contextUser as User;
    if (session?.user?.id && allUsers) {
      return allUsers.find((u: User) => u.id === session.user.id) as User || null;
    }
    return null;
  }, [contextUser, session?.user?.id, allUsers]);

  return useMemo(() => {
    return {
      hasAccess: hasDiscordAccess(user),
      hasVIP: hasDiscordVIP(user),
      accessCheck: checkPermission(user, Permission.DISCORD_ACCESS),
      vipCheck: checkPermission(user, Permission.DISCORD_VIP_ROLE)
    };
  }, [user]);
}

/**
 * Hook para verificar possibilidade de upgrade/downgrade
 */
export function usePlanChange() {
  const { user: contextUser } = useContext(userContext);
  const { data: session } = useSession();
  const { data: allUsers } = useFirestoreRealtime('user');
  
  const user = useMemo(() => {
    if (contextUser && contextUser.subscription) return contextUser as User;
    if (session?.user?.id && allUsers) {
      return allUsers.find((u: User) => u.id === session.user.id) as User || null;
    }
    return null;
  }, [contextUser, session?.user?.id, allUsers]);

  return useMemo(() => {
    return {
      canUpgradeToPremium: canUpgradeToPlan(user, SubscriptionPlan.PREMIUM),
      canUpgradeToPremiumPlus: canUpgradeToPlan(user, SubscriptionPlan.PREMIUM_PLUS),
      canDowngradeToFreemium: canDowngradeToPlan(user, SubscriptionPlan.FREEMIUM),
      canDowngradeToPremium: canDowngradeToPlan(user, SubscriptionPlan.PREMIUM)
    };
  }, [user]);
}

/**
 * Hook para verificar limites de uso do plano
 */
export function usePlanLimits() {
  const { user, currentPlan } = useSubscription();

  return useMemo(() => {
    const limits = getPlanLimits(currentPlan);
    
    return {
      limits,
      usage: user?.usageStats,
      hasReachedCharsheetsLimit: hasReachedLimit(user, 'charsheets'),
      hasReachedCampaignsLimit: hasReachedLimit(user, 'campaigns'),
      hasReachedCustomSystemsLimit: hasReachedLimit(user, 'customSystems'),
      hasReachedStorageLimit: hasReachedLimit(user, 'storage')
    };
  }, [user, currentPlan]);
}

/**
 * Hook para comparação entre planos
 */
export function usePlanComparison() {
  const { currentPlan } = useSubscription();

  return useMemo(() => {
    const plans = Object.entries(SubscriptionPlanMetadata).map(([key, metadata]) => ({
      plan: key as SubscriptionPlan,
      ...metadata,
      isCurrent: key === currentPlan
    }));

    return {
      plans,
      currentPlanData: plans.find(p => p.isCurrent),
      availableUpgrades: plans.filter(p => {
        const hierarchy = {
          [SubscriptionPlan.FREEMIUM]: 0,
          [SubscriptionPlan.PREMIUM]: 1,
          [SubscriptionPlan.PREMIUM_PLUS]: 2
        };
        return hierarchy[p.plan] > hierarchy[currentPlan];
      })
    };
  }, [currentPlan]);
}
