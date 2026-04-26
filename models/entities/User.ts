import { Collection } from 'fireorm'
import { SubscriptionPlan, SubscriptionStatus } from '@enums/subscriptionEnum'
import type { Subscription, PlanUsageStats } from '@models/types/subscription'

@Collection('users')
export class User {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: string = new Date().toISOString();
    charsheets?: string[] = [];
    
    // Informações de assinatura
    subscription: Subscription = {
        plan: SubscriptionPlan.FREEMIUM,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date().toISOString(),
        autoRenew: false
    };
    
    // Estatísticas de uso
    usageStats?: PlanUsageStats = {
        charsheetsCreated: 0,
        campaignsCreated: 0,
        customSystemsCreated: 0,
        storageUsed: 0,
        lastActiveDate: new Date().toISOString()
    };
    
    // Histórico de planos
    subscriptionHistory?: Array<{
        plan: SubscriptionPlan;
        startDate: string;
        endDate?: string;
    }> = [];

    constructor(user?: Partial<User>) {
        Object.assign(this, user)
        
        // Garante que novos usuários sempre terão o plano Freemium
        if (!this.subscription) {
            this.subscription = {
                plan: SubscriptionPlan.FREEMIUM,
                status: SubscriptionStatus.ACTIVE,
                startDate: new Date().toISOString(),
                autoRenew: false
            };
        }
    }
}