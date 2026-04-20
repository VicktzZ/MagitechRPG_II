import type { SubscriptionPlan, SubscriptionStatus, Permission } from '@enums/subscriptionEnum';

/**
 * Interface para os dados de assinatura do usuário
 */
export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  cancelledAt?: string;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: string;
  nextBillingDate?: string;
}

/**
 * Interface para histórico de pagamentos
 */
export interface PaymentHistory {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Interface para upgrade/downgrade de planos
 */
export interface PlanChange {
  userId: string;
  fromPlan: SubscriptionPlan;
  toPlan: SubscriptionPlan;
  changeDate: string;
  reason?: string;
  prorated?: boolean;
  proratedAmount?: number;
}

/**
 * Interface para verificação de permissões
 */
export interface PermissionCheck {
  hasPermission: boolean;
  permission: Permission;
  currentPlan: SubscriptionPlan;
  requiredPlan?: SubscriptionPlan;
  message?: string;
}

/**
 * Interface para estatísticas de uso do plano
 */
export interface PlanUsageStats {
  charsheetsCreated: number;
  campaignsCreated: number;
  customSystemsCreated: number;
  storageUsed: number;
  lastActiveDate: string;
}
