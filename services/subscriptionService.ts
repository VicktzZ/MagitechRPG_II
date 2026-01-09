import type { User } from '@models/entities';
import type { PaymentHistory, PlanChange, Subscription } from '@models/types/subscription';
import type { SubscriptionPlan } from '@enums/subscriptionEnum';
import { Service } from '@utils/apiRequest';

/**
 * Serviço para gerenciar assinaturas de usuários
 */
class SubscriptionService extends Service<User> {
  /**
   * Atualiza o plano de assinatura de um usuário
   */
  async updateSubscription(
    userId: string, 
    newPlan: SubscriptionPlan,
    paymentData?: {
      paymentMethod: string;
      transactionId?: string;
    }
  ): Promise<User> {
    try {
      const response = await this.patch(`/${userId}/subscription`, {
        plan: newPlan,
        paymentData
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      throw error;
    }
  }

  /**
   * Cancela a assinatura de um usuário
   */
  async cancelSubscription(
    userId: string,
    reason?: string
  ): Promise<User> {
    try {
      const response = await this.patch(`/${userId}/subscription/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  /**
   * Reativa uma assinatura cancelada
   */
  async reactivateSubscription(userId: string): Promise<User> {
    try {
      const response = await this.patch(`/${userId}/subscription/reactivate`, {});
      return response.data;
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error);
      throw error;
    }
  }

  /**
   * Obtém o histórico de pagamentos de um usuário
   */
  async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    try {
      const response = await this.get(`/${userId}/payments`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter histórico de pagamentos:', error);
      throw error;
    }
  }

  /**
   * Obtém o histórico de mudanças de plano
   */
  async getPlanChangeHistory(userId: string): Promise<PlanChange[]> {
    try {
      const response = await this.get(`/${userId}/subscription/history`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter histórico de planos:', error);
      throw error;
    }
  }

  /**
   * Verifica se a assinatura precisa ser renovada
   */
  async checkRenewal(userId: string): Promise<{
    needsRenewal: boolean;
    daysUntilExpiry?: number;
  }> {
    try {
      const response = await this.get(`/${userId}/subscription/renewal-status`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar renovação:', error);
      throw error;
    }
  }

  /**
   * Processa um pagamento de assinatura
   */
  async processPayment(
    userId: string,
    plan: SubscriptionPlan,
    paymentData: {
      method: string;
      amount: number;
      currency: string;
      token?: string;
    }
  ): Promise<{
    success: boolean;
    transactionId?: string;
    subscription?: Subscription;
    error?: string;
  }> {
    try {
      const response = await this.post(`/${userId}/subscription/payment`, {
        plan,
        paymentData
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }

  /**
   * Gera uma fatura de assinatura
   */
  async generateInvoice(userId: string, paymentId: string): Promise<Blob> {
    try {
      const response = await this.get(`/${userId}/payments/${paymentId}/invoice`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      throw error;
    }
  }

  /**
   * Migra todos os usuários existentes para o plano Freemium
   */
  async migrateAllUsersToFreemium(): Promise<{
    success: boolean;
    migratedCount: number;
    errors: string[];
  }> {
    try {
      const response = await this.post('/subscription/migrate-freemium', {});
      return response.data;
    } catch (error) {
      console.error('Erro ao migrar usuários:', error);
      throw error;
    }
  }

  /**
   * Atualiza as estatísticas de uso de um usuário
   */
  async updateUsageStats(
    userId: string,
    stats: {
      charsheetsCreated?: number;
      campaignsCreated?: number;
      customSystemsCreated?: number;
      storageUsed?: number;
    }
  ): Promise<User> {
    try {
      const response = await this.patch(`/${userId}/usage-stats`, stats);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas de uso:', error);
      throw error;
    }
  }

  /**
   * Incrementa o contador de uma estatística específica
   */
  async incrementUsageStat(
    userId: string,
    stat: 'charsheetsCreated' | 'campaignsCreated' | 'customSystemsCreated'
  ): Promise<User> {
    try {
      const response = await this.patch(`/${userId}/usage-stats/increment`, {
        stat
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao incrementar estatística:', error);
      throw error;
    }
  }

  /**
   * Obtém uma comparação de planos disponíveis
   */
  async getAvailablePlans(): Promise<Array<{
    plan: SubscriptionPlan;
    metadata: any;
  }>> {
    try {
      const response = await this.get('/subscription/plans');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter planos disponíveis:', error);
      throw error;
    }
  }

  /**
   * Calcula o valor proporcional para upgrade/downgrade
   */
  async calculateProration(
    userId: string,
    targetPlan: SubscriptionPlan
  ): Promise<{
    proratedAmount: number;
    currentPlanRefund: number;
    newPlanCharge: number;
    effectiveDate: string;
  }> {
    try {
      const response = await this.post(`/${userId}/subscription/calculate-proration`, {
        targetPlan
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao calcular proporção:', error);
      throw error;
    }
  }

  /**
   * Aplica um código promocional
   */
  async applyPromoCode(
    userId: string,
    promoCode: string
  ): Promise<{
    valid: boolean;
    discount?: number;
    discountType?: 'percentage' | 'fixed';
    message?: string;
  }> {
    try {
      const response = await this.post(`/${userId}/subscription/promo-code`, {
        code: promoCode
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao aplicar código promocional:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService('/user');
