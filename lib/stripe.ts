import Stripe from 'stripe';
import { loadStripe, type Stripe as StripeClient } from '@stripe/stripe-js';

/**
 * Instância do Stripe no servidor
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
  typescript: true
});

/**
 * Instância do Stripe no cliente
 */
let stripePromise: Promise<StripeClient | null>;

export const getStripe = (): Promise<StripeClient | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

/**
 * Mapeamento de planos para Price IDs do Stripe
 */
export const STRIPE_PRICE_IDS = {
  PREMIUM: process.env.STRIPE_PRICE_PREMIUM || '',
  PREMIUM_PLUS: process.env.STRIPE_PRICE_PREMIUM_PLUS || ''
} as const;

/**
 * Configuração de preços
 */
export const STRIPE_PRICES = {
  PREMIUM: {
    priceId: STRIPE_PRICE_IDS.PREMIUM,
    amount: 3490, // em centavos
    currency: 'brl',
    interval: 'month'
  },
  PREMIUM_PLUS: {
    priceId: STRIPE_PRICE_IDS.PREMIUM_PLUS,
    amount: 7490, // em centavos
    currency: 'brl',
    interval: 'month'
  }
} as const;
