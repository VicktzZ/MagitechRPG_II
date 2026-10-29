import admin from 'firebase-admin';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';
import { handleRouteError, requireUser } from '@utils/api';

export const dynamic = 'force-dynamic';

/**
 * POST /api/firebase/token
 * Troca a sessão do NextAuth por um token customizado do Firebase Auth.
 * O uid é o id do usuário no banco, e administradores recebem a claim
 * `admin` — é isso que as regras do Firestore leem em request.auth.
 */
export async function POST(): Promise<Response> {
    try {
        const user = await requireUser();
        initFirebaseAdmin();

        const token = await admin.auth().createCustomToken(user.id, user.isAdmin ? { admin: true } : {});

        return Response.json({ token }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        return handleRouteError(error, 'Erro ao gerar token do Firebase');
    }
}
