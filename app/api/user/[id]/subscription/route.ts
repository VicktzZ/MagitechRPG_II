import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import * as admin from 'firebase-admin';
import { SubscriptionPlan, SubscriptionStatus } from '@enums/subscriptionEnum';
import { isAdminEmail } from '@utils/adminCheck';
import { assertId, assertMaxLength, handleRouteError, readJsonBody, TEXT_LIMITS } from '@utils/api';

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
        const session = await getServerSession(authOptions);
    
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Trocar de plano sem pagamento seria um upgrade gratuito: só administradores
        // alteram planos por aqui (o fluxo de pagamento deve gravar a assinatura no servidor)
        if (!isAdminEmail(session.user.email)) {
            return NextResponse.json(
                { error: 'Apenas administradores podem alterar planos de assinatura' },
                { status: 403 }
            );
        }

        const userId = assertId(params.id);
        const body = await readJsonBody(request);
        const { plan, paymentData } = body;

        if (!Object.values(SubscriptionPlan).includes(plan)) {
            return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
        }
        assertMaxLength(paymentData?.paymentMethod, TEXT_LIMITS.name, 'paymentData.paymentMethod');

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
        return handleRouteError(error, 'Erro ao atualizar assinatura');
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
        const session = await getServerSession(authOptions);
    
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        const userId = assertId(params.id);

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
        return handleRouteError(error, 'Erro ao obter assinatura');
    }
}
