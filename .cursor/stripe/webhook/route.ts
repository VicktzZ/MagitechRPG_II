import { type NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import * as admin from 'firebase-admin';
import { SubscriptionPlan, SubscriptionStatus } from '@enums/subscriptionEnum';
import type Stripe from 'stripe';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

/**
 * POST /api/stripe/webhook
 * 
 * Webhook do Stripe para processar eventos de pagamento
 * Configurar no Stripe Dashboard: https://dashboard.stripe.com/webhooks
 */
export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Stripe signature missing' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
    // Verificar a assinatura do webhook
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (error) {
        console.error('Erro na verificação do webhook:', error);
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 }
        );
    }

    // Processar eventos do Stripe
    try {
        switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckoutSessionCompleted(event.data.object );
            break;

        case 'customer.subscription.created':
            await handleSubscriptionCreated(event.data.object );
            break;

        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object );
            break;

        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object );
            break;

        case 'invoice.paid':
            await handleInvoicePaid(event.data.object );
            break;

        case 'invoice.payment_failed':
            await handleInvoicePaymentFailed(event.data.object );
            break;

        default:
            console.log(`Evento não tratado: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Erro ao processar evento do webhook:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

/**
 * Processa checkout.session.completed
 * Quando o usuário completa o pagamento inicial
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId || session.client_reference_id;
    const plan = session.metadata?.plan as SubscriptionPlan;

    if (!userId || !plan) {
        console.error('userId ou plan não encontrado nos metadados');
        return;
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        console.error(`Usuário ${userId} não encontrado`);
        return;
    }

    const userData = userDoc.data();
    const now = new Date();

    // Atualizar assinatura do usuário
    await userRef.update({
        subscription: {
            plan,
            status: SubscriptionStatus.ACTIVE,
            startDate: now.toISOString(),
            autoRenew: true,
            paymentMethod: 'stripe',
            lastPaymentDate: now.toISOString(),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string
        },
        subscriptionHistory: admin.firestore.FieldValue.arrayUnion({
            plan,
            startDate: now.toISOString(),
            previousPlan: userData?.subscription?.plan,
            reason: 'Pagamento via Stripe'
        })
    });

    console.log(`Assinatura ativada para usuário ${userId}: ${plan}`);
}

/**
 * Processa customer.subscription.created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    const plan = subscription.metadata?.plan as SubscriptionPlan;

    if (!userId || !plan) return;

    const userRef = db.collection('users').doc(userId);
    
    const endDate = new Date(subscription.current_period_end * 1000);

    await userRef.update({
        'subscription.stripeSubscriptionId': subscription.id,
        'subscription.endDate': endDate.toISOString(),
        'subscription.nextBillingDate': endDate.toISOString()
    });

    console.log(`Assinatura Stripe criada para usuário ${userId}`);
}

/**
 * Processa customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) return;

    const userRef = db.collection('users').doc(userId);
    const endDate = new Date(subscription.current_period_end * 1000);

    await userRef.update({
        'subscription.status': subscription.status === 'active' 
            ? SubscriptionStatus.ACTIVE 
            : SubscriptionStatus.INACTIVE,
        'subscription.endDate': endDate.toISOString(),
        'subscription.nextBillingDate': endDate.toISOString(),
        'subscription.autoRenew': !subscription.cancel_at_period_end
    });

    console.log(`Assinatura Stripe atualizada para usuário ${userId}`);
}

/**
 * Processa customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) return;

    const userRef = db.collection('users').doc(userId);
    const userData = (await userRef.get()).data();

    await userRef.update({
        subscription: {
            plan: SubscriptionPlan.FREEMIUM,
            status: SubscriptionStatus.CANCELLED,
            startDate: new Date().toISOString(),
            autoRenew: false,
            cancelledAt: new Date().toISOString()
        },
        subscriptionHistory: admin.firestore.FieldValue.arrayUnion({
            plan: SubscriptionPlan.FREEMIUM,
            startDate: new Date().toISOString(),
            previousPlan: userData?.subscription?.plan,
            reason: 'Assinatura cancelada/expirada no Stripe'
        })
    });

    console.log(`Assinatura Stripe cancelada para usuário ${userId}`);
}

/**
 * Processa invoice.paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
  
    if (!subscriptionId) return;

    // Buscar assinatura
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (!userId) return;

    const userRef = db.collection('users').doc(userId);

    await userRef.update({
        'subscription.lastPaymentDate': new Date(invoice.created * 1000).toISOString(),
        'subscription.status': SubscriptionStatus.ACTIVE
    });

    console.log(`Pagamento processado para usuário ${userId}`);
}

/**
 * Processa invoice.payment_failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
  
    if (!subscriptionId) return;

    // Buscar assinatura
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;

    if (!userId) return;

    const userRef = db.collection('users').doc(userId);

    await userRef.update({
        'subscription.status': SubscriptionStatus.INACTIVE
    });

    console.log(`Falha no pagamento para usuário ${userId}`);
  
    // TODO: Enviar email ao usuário notificando sobre falha no pagamento
}
