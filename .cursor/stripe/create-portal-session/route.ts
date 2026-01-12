import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { stripe } from '@/lib/stripe';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

/**
 * POST /api/stripe/create-portal-session
 * 
 * Cria uma sessão do Stripe Customer Portal
 * Permite ao usuário gerenciar sua assinatura (cancelar, atualizar método de pagamento, etc.)
 */
export async function POST() {
    try {
        const session = await getServerSession();
    
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Buscar o Stripe Customer ID do usuário
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();
        const stripeCustomerId = userData?.subscription?.stripeCustomerId;

        if (!stripeCustomerId) {
            return NextResponse.json(
                { error: 'Você não possui uma assinatura ativa no Stripe' },
                { status: 400 }
            );
        }

        // URL base da aplicação
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Criar sessão do portal
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${appUrl}/app/subscription/manage`
        });

        return NextResponse.json({
            url: portalSession.url
        });

    } catch (error) {
        console.error('Erro ao criar portal session:', error);
        return NextResponse.json(
            { 
                error: 'Erro ao criar portal session',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
