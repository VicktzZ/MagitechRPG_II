import { rpgSystemRepository } from '@repositories';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { RPGSystem } from '@models/entities';

export async function GET(req: NextRequest): Promise<Response> {
    try {
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

        // Lista sistemas de um criador específico
        if (creatorId) {
            const systems = await rpgSystemRepository
                .whereEqualTo('creatorId', creatorId)
                .find();
            return Response.json(systems);
        }

        // Lista sistemas disponíveis para um usuário (públicos + do próprio usuário)
        if (userId) {
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
        const allSystems = await rpgSystemRepository.find();
        return Response.json(allSystems);

    } catch (error: any) {
        return Response.json({ message: 'ERROR', error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const body = await req.json();

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
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}
