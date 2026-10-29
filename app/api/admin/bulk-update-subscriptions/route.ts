import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import * as admin from 'firebase-admin';
import { SubscriptionPlan, SubscriptionStatus } from '@enums/subscriptionEnum';
import { isAdminEmail } from '@utils/adminCheck';
import { assertIdList, handleRouteError, readJsonBody } from '@utils/api';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();

/**
 * POST /api/admin/bulk-update-subscriptions
 * 
 * Atualiza o plano de múltiplos usuários de uma vez
 * Requer autenticação de administrador
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
    
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Não autorizado' },
                { status: 401 }
            );
        }

        // Verificar se o usuário é admin
        if (!isAdminEmail(session.user.email)) {
            return NextResponse.json(
                { error: 'Permissões insuficientes. Apenas administradores podem usar esta função.' },
                { status: 403 }
            );
        }

        const body = await readJsonBody(request);
        const { plan } = body;
        const userIds = assertIdList(body.userIds, 'userIds', 500);

        if (!Object.values(SubscriptionPlan).includes(plan)) {
            return NextResponse.json(
                { error: 'Plano inválido' },
                { status: 400 }
            );
        }

        const results = {
            updated: 0,
            errors: 0,
            errorDetails: [] as Array<{ userId: string; error: string }>
        };

        // Atualizar cada usuário
        for (const userId of userIds) {
            try {
                const userRef = db.collection('users').doc(userId);
                const userDoc = await userRef.get();

                if (!userDoc.exists) {
                    results.errors++;
                    results.errorDetails.push({
                        userId,
                        error: 'Usuário não encontrado'
                    });
                    continue;
                }

                const userData = userDoc.data();
                const now = new Date();
                const endDate = plan !== SubscriptionPlan.FREEMIUM
                    ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 dias
                    : undefined;

                // Preparar dados de atualização
                const updateData: any = {
                    subscription: {
                        plan,
                        status: SubscriptionStatus.ACTIVE,
                        startDate: now.toISOString(),
                        endDate: endDate?.toISOString(),
                        autoRenew: plan !== SubscriptionPlan.FREEMIUM,
                        paymentMethod: 'admin_assignment',
                        lastPaymentDate: now.toISOString()
                    }
                };

                // Adicionar ao histórico
                const history = userData?.subscriptionHistory || [];
                history.push({
                    plan,
                    startDate: now.toISOString(),
                    previousPlan: userData?.subscription?.plan,
                    reason: 'Atribuição administrativa'
                });
                updateData.subscriptionHistory = history;

                // Atualizar no banco
                await userRef.update(updateData);
                results.updated++;

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                results.errors++;
                results.errorDetails.push({
                    userId,
                    error: errorMessage
                });
            }
        }

        return NextResponse.json({
            success: results.errors === 0,
            results
        });

    } catch (error) {
        return handleRouteError(error, 'Erro ao executar atualização em massa');
    }
}
