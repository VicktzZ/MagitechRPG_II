import { rpgSystemRepository } from '@repositories';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { RPGSystem } from '@models/entities';
import { assertId, assertMaxLength, forbidden, handleRouteError, readJsonBody, requireUser, TEXT_LIMITS } from '@utils/api';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const user = await requireUser();
        const userId = req.nextUrl.searchParams.get('userId');
        const isPublic = req.nextUrl.searchParams.get('isPublic');
        const creatorId = req.nextUrl.searchParams.get('creatorId');

        // Lista apenas sistemas públicos
        if (isPublic === 'true') {
            const systems = await rpgSystemRepository
                .whereEqualTo('isPublic', true)
                .find();
            return Response.json(systems);
        }

        // Lista sistemas de um criador específico — os privados só para o próprio criador
        if (creatorId) {
            assertId(creatorId, 'creatorId');
            const systems = await rpgSystemRepository
                .whereEqualTo('creatorId', creatorId)
                .find();
            const canSeePrivate = creatorId === user.id || user.isAdmin;
            return Response.json(canSeePrivate ? systems : systems.filter(s => s.isPublic));
        }

        // Lista sistemas disponíveis para um usuário (públicos + do próprio usuário)
        if (userId) {
            assertId(userId, 'userId');
            if (userId !== user.id && !user.isAdmin) {
                throw forbidden('Você só pode listar os seus próprios sistemas');
            }
            const [ publicSystems, userSystems ] = await Promise.all([
                rpgSystemRepository.whereEqualTo('isPublic', true).find(),
                rpgSystemRepository.whereEqualTo('creatorId', userId).find()
            ]);

            // Combina e remove duplicados
            const systemMap = new Map<string, RPGSystem>();
            publicSystems.forEach(s => systemMap.set(s.id, s));
            userSystems.forEach(s => systemMap.set(s.id, s));

            return Response.json(Array.from(systemMap.values()));
        }

        // Lista todos (apenas para admin)
        if (!user.isAdmin) {
            throw forbidden('Apenas administradores podem listar todos os sistemas');
        }
        const allSystems = await rpgSystemRepository.find();
        return Response.json(allSystems);

    } catch (error) {
        return handleRouteError(error);
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const body = await readJsonBody(req);
        assertMaxLength(body.name, TEXT_LIMITS.title, 'name');
        assertMaxLength(body.description, TEXT_LIMITS.description, 'description');

        // creatorId sempre vem da sessão — nunca do body
        const { creatorId: _creatorId, id: _id, ...rest } = body;

        const newSystem = new RPGSystem({
            ...rest,
            creatorId: session.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        const createdSystem = await rpgSystemRepository.create(newSystem);

        return Response.json(createdSystem, { status: 201 });
    } catch (error) {
        return handleRouteError(error);
    }
}
