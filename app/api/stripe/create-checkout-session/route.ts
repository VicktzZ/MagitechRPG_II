import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { SubscriptionPlan } from '@enums/subscriptionEnum';

/**
 * POST /api/stripe/create-checkout-session
 * 
 * Cria uma sessão de checkout do Stripe para assinatura
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    // Validar plano
    if (plan === SubscriptionPlan.FREEMIUM) {
      return NextResponse.json(
        { error: 'O plano Freemium é gratuito' },
        { status: 400 }
      );
    }

    // Obter o Price ID correto
    let priceId: string;
    if (plan === SubscriptionPlan.PREMIUM) {
      priceId = STRIPE_PRICE_IDS.PREMIUM;
    } else if (plan === SubscriptionPlan.PREMIUM_PLUS) {
      priceId = STRIPE_PRICE_IDS.PREMIUM_PLUS;
    } else {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID não configurado para este plano. Configure as variáveis de ambiente.' },
        { status: 500 }
      );
    }

    // URL base da aplicação
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Criar sessão de checkout do Stripe
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${appUrl}/app/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/app/subscription/plans?canceled=true`,
      customer_email: session.user.email || undefined,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        plan,
        email: session.user.email || ''
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pt-BR'
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    });

  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao criar sessão de checkout',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
