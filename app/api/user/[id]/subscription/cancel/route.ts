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
 * PATCH /api/user/[id]/subscription/cancel
 * Cancela a assinatura de um usuário
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

        // Verificar se o usuário é admin ou está cancelando sua própria assinatura
        const isAdmin = isAdminEmail(session.user.email);

        if (session.user.id !== userId && !isAdmin) {
            return NextResponse.json(
                { error: 'Você só pode cancelar sua própria assinatura' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { reason } = body;

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
        const currentSubscription = userData?.subscription;

        // Preparar dados de cancelamento
        const now = new Date();
        const updateData: any = {
            subscription: {
                ...currentSubscription,
                plan: SubscriptionPlan.FREEMIUM,
                status: SubscriptionStatus.CANCELLED,
                cancelledAt: now.toISOString(),
                autoRenew: false,
                cancellationReason: reason
            }
        };

        // Adicionar ao histórico
        const history = userData?.subscriptionHistory || [];
        history.push({
            plan: SubscriptionPlan.FREEMIUM,
            startDate: now.toISOString(),
            previousPlan: currentSubscription?.plan,
            reason: 'Cancelamento pelo usuário'
        });
        updateData.subscriptionHistory = history;

        // Atualizar no banco
        await userRef.update(updateData);

        // Buscar dados atualizados
        const updatedUserDoc = await userRef.get();
        const updatedUser = updatedUserDoc.data();

        return NextResponse.json({
            success: true,
            message: 'Assinatura cancelada com sucesso',
            user: {
                id: userId,
                ...updatedUser
            }
        });

    } catch (error) {
        console.error('Erro ao cancelar assinatura:', error);
        return NextResponse.json(
            { 
                error: 'Erro ao cancelar assinatura',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
