/**
 * Enum para os planos de assinatura disponíveis
 */
export enum SubscriptionPlan {
  FREEMIUM = 'FREEMIUM',
  PREMIUM = 'PREMIUM',
  PREMIUM_PLUS = 'PREMIUM_PLUS'
}

/**
 * Enum para o status da assinatura
 */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  TRIAL = 'TRIAL'
}

/**
 * Permissões disponíveis no sistema
 */
export enum Permission {
  // Permissões básicas (Freemium)
  CREATE_CHARSHEET = 'CREATE_CHARSHEET',
  VIEW_CHARSHEET = 'VIEW_CHARSHEET',
  EDIT_CHARSHEET = 'EDIT_CHARSHEET',
  
  // Permissões Premium
  ACCESS_CAMPAIGNS = 'ACCESS_CAMPAIGNS',
  CREATE_CAMPAIGN = 'CREATE_CAMPAIGN',
  JOIN_CAMPAIGN = 'JOIN_CAMPAIGN',
  DISCORD_ACCESS = 'DISCORD_ACCESS',
  
  // Permissões Premium+
  CREATE_CUSTOM_SYSTEMS = 'CREATE_CUSTOM_SYSTEMS',
  EDIT_CUSTOM_SYSTEMS = 'EDIT_CUSTOM_SYSTEMS',
  DISCORD_VIP_ROLE = 'DISCORD_VIP_ROLE',
  ADVANCED_CUSTOMIZATION = 'ADVANCED_CUSTOMIZATION',
  PRIORITY_SUPPORT = 'PRIORITY_SUPPORT'
}

/**
 * Metadados dos planos
 */
export const SubscriptionPlanMetadata = {
  [SubscriptionPlan.FREEMIUM]: {
    name: 'Freemium',
    displayName: 'Plano Gratuito',
    price: 0,
    priceFormatted: 'Grátis',
    currency: 'BRL',
    description: 'Perfeito para começar sua jornada no RPG',
    features: [
      'Criação limitada a 2 personagens',
      'Acesso a todas as classes e raças básicas',
      'Sistema de progressão completo',
      'Gerenciamento de inventário',
      'Calculadora de dados integrada',
      'Acesso aos sistemas de RPG padrão'
    ],
    permissions: [
      Permission.CREATE_CHARSHEET,
      Permission.VIEW_CHARSHEET,
      Permission.EDIT_CHARSHEET
    ],
    limitations: [
      'Sem acesso à página de Campanhas',
      'Sem acesso ao Discord exclusivo',
      'Não é possível criar sistemas customizados'
    ],
    color: '#9E9E9E',
    icon: '⚡',
    popular: false
  },
  [SubscriptionPlan.PREMIUM]: {
    name: 'Premium',
    displayName: 'Plano Premium',
    price: 34.90,
    priceFormatted: 'R$ 34,90',
    currency: 'BRL',
    billingPeriod: 'mensal',
    description: 'Desbloqueie o poder das campanhas colaborativas',
    features: [
      'Tudo do plano Freemium',
      'Acesso completo à página de Campanhas',
      'Criação e gerenciamento de campanhas',
      'Convite de jogadores para suas campanhas',
      'Chat em tempo real nas campanhas',
      'Gerenciamento de sessões',
      'Acesso exclusivo ao Discord da aplicação',
      'Sistema de notificações avançado',
      'Suporte prioritário'
    ],
    permissions: [
      Permission.CREATE_CHARSHEET,
      Permission.VIEW_CHARSHEET,
      Permission.EDIT_CHARSHEET,
      Permission.ACCESS_CAMPAIGNS,
      Permission.CREATE_CAMPAIGN,
      Permission.JOIN_CAMPAIGN,
      Permission.DISCORD_ACCESS
    ],
    limitations: [
      'Não é possível criar sistemas de RPG customizados',
      'Sem cargo VIP no Discord'
    ],
    color: '#2196F3',
    icon: '👑',
    popular: true,
    badge: 'MAIS POPULAR'
  },
  [SubscriptionPlan.PREMIUM_PLUS]: {
    name: 'Premium+',
    displayName: 'Plano Premium+',
    price: 74.90,
    priceFormatted: 'R$ 74,90',
    currency: 'BRL',
    billingPeriod: 'mensal',
    description: 'Para mestres que querem criar mundos únicos',
    features: [
      'Tudo do plano Premium',
      'Criação de Sistemas de RPG Customizados',
      'Editor completo de regras personalizadas',
      'Criação de classes e raças exclusivas',
      'Sistema de habilidades customizado',
      'Importação/Exportação de sistemas',
      'Cargo "VIP" no Discord',
      'Canal exclusivo para criadores',
      'Acesso antecipado a novos recursos',
      'Backup automático de dados',
      'Suporte premium com resposta prioritária'
    ],
    permissions: [
      Permission.CREATE_CHARSHEET,
      Permission.VIEW_CHARSHEET,
      Permission.EDIT_CHARSHEET,
      Permission.ACCESS_CAMPAIGNS,
      Permission.CREATE_CAMPAIGN,
      Permission.JOIN_CAMPAIGN,
      Permission.DISCORD_ACCESS,
      Permission.CREATE_CUSTOM_SYSTEMS,
      Permission.EDIT_CUSTOM_SYSTEMS,
      Permission.DISCORD_VIP_ROLE,
      Permission.ADVANCED_CUSTOMIZATION,
      Permission.PRIORITY_SUPPORT
    ],
    limitations: [],
    color: '#9C27B0',
    icon: '💎',
    popular: false,
    badge: 'MELHOR VALOR'
  }
} as const;

/**
 * Helper para obter permissões de um plano
 */
export function getPermissionsForPlan(plan: SubscriptionPlan): Permission[] {
  return SubscriptionPlanMetadata[plan].permissions;
}

/**
 * Helper para verificar se um plano tem uma permissão específica
 */
export function planHasPermission(plan: SubscriptionPlan, permission: Permission): boolean {
  return SubscriptionPlanMetadata[plan].permissions.includes(permission);
}

/**
 * Helper para obter o plano pelo nome
 */
export function getPlanByName(name: string): SubscriptionPlan | null {
  const entry = Object.entries(SubscriptionPlanMetadata).find(
    ([_, metadata]) => metadata.name === name
  );
  return entry ? (entry[0] as SubscriptionPlan) : null;
}
