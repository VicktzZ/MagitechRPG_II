import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as admin from 'firebase-admin';
import { SubscriptionPlan, SubscriptionStatus } from '@enums/subscriptionEnum';
import { isAdminEmail } from '@utils/adminCheck';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

/**
 * PATCH /api/user/[id]/subscription
 * Atualiza o plano de assinatura de um usuário
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
    
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const userId = params.id;
        const body = await request.json();
        const { plan, paymentData } = body;

        // Verificar se o usuário é admin ou está atualizando sua própria assinatura
        const isAdmin = isAdminEmail(session.user.email);

        if (session.user.id !== userId && !isAdmin) {
            return NextResponse.json(
                { error: 'Você só pode atualizar sua própria assinatura' },
                { status: 403 }
            );
        }

        // Buscar usuário atual
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();
        const currentPlan = userData?.subscription?.plan || SubscriptionPlan.FREEMIUM;

        // Calcular data de término baseado no plano
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1); // 1 mês de assinatura

        // Preparar dados de atualização
        const updateData: any = {
            subscription: {
                plan,
                status: SubscriptionStatus.ACTIVE,
                startDate: userData?.subscription?.startDate || now.toISOString(),
                endDate: plan !== SubscriptionPlan.FREEMIUM ? endDate.toISOString() : undefined,
                autoRenew: plan !== SubscriptionPlan.FREEMIUM,
                lastPaymentDate: paymentData ? now.toISOString() : undefined,
                nextBillingDate: plan !== SubscriptionPlan.FREEMIUM ? endDate.toISOString() : undefined,
                paymentMethod: paymentData?.paymentMethod
            }
        };

        // Adicionar ao histórico
        const history = userData?.subscriptionHistory || [];
        history.push({
            plan,
            startDate: now.toISOString(),
            previousPlan: currentPlan
        });
        updateData.subscriptionHistory = history;

        // Atualizar no banco
        await userRef.update(updateData);

        // Buscar dados atualizados
        const updatedUserDoc = await userRef.get();
        const updatedUser = updatedUserDoc.data();

        return NextResponse.json({
            success: true,
            user: {
                id: userId,
                ...updatedUser
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        return NextResponse.json(
            { 
                error: 'Erro ao atualizar assinatura',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/user/[id]/subscription
 * Obtém informações da assinatura de um usuário
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
    
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const userId = params.id;

        // Verificar se o usuário é admin ou está acessando sua própria assinatura
        const isAdmin = isAdminEmail(session.user.email);

        if (session.user.id !== userId && !isAdmin) {
            return NextResponse.json(
                { error: 'Você só pode acessar sua própria assinatura' },
                { status: 403 }
            );
        }

        // Buscar usuário
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();

        return NextResponse.json({
            subscription: userData?.subscription,
            usageStats: userData?.usageStats,
            subscriptionHistory: userData?.subscriptionHistory
        });

    } catch (error) {
        console.error('Erro ao obter assinatura:', error);
        return NextResponse.json(
            { 
                error: 'Erro ao obter assinatura',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
