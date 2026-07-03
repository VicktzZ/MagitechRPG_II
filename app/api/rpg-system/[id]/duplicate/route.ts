import { rpgSystemRepository } from '@repositories';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { RPGSystem } from '@models/entities';
import { isAdminEmail } from '@utils/adminCheck';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return Response.json({ message: 'Name is required' }, { status: 400 });
        }

        const existingSystem = await rpgSystemRepository.findById(params.id);

        if (!existingSystem) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        // Só permite duplicar sistemas públicos ou próprios
        const isOwner = session.user.id === existingSystem.creatorId;
        if (!existingSystem.isPublic && !isOwner && !isAdminEmail(session.user.email)) {
            return Response.json({ message: 'FORBIDDEN', error: 'Você não tem acesso a este sistema' }, { status: 403 });
        }

        // Cria uma cópia do sistema com novo nome; criador é o usuário da sessão
        const duplicatedSystem = new RPGSystem({
            ...existingSystem,
            id: undefined as unknown as string, // FireORM irá gerar um novo ID
            name,
            creatorId: session.user.id,
            isPublic: false, // Por padrão, cópias são privadas
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        const createdSystem = await rpgSystemRepository.create(duplicatedSystem);

        return Response.json(createdSystem, { status: 201 });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}
