import { rpgSystemRepository } from '@repositories';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { RPGSystem } from '@models/entities';
import { isAdminEmail } from '@utils/adminCheck';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const system = await rpgSystemRepository.findById(params.id);

        if (!system) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json(system);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const existingSystem = await rpgSystemRepository.findById(params.id);

        if (!existingSystem) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        if (session.user.id !== existingSystem.creatorId && !isAdminEmail(session.user.email)) {
            return Response.json({ message: 'FORBIDDEN', error: 'Você só pode editar seus próprios sistemas' }, { status: 403 });
        }

        // Impede transferência de dono / adulteração de metadados via body
        const { creatorId: _creatorId, createdAt: _createdAt, id: _id, ...rest } = body;

        const updatedSystem = new RPGSystem({
            ...existingSystem,
            ...rest,
            id: params.id,
            creatorId: existingSystem.creatorId,
            createdAt: existingSystem.createdAt,
            updatedAt: new Date().toISOString()
        });

        await rpgSystemRepository.update(updatedSystem);

        return Response.json(updatedSystem);
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const existingSystem = await rpgSystemRepository.findById(params.id);

        if (!existingSystem) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        if (session.user.id !== existingSystem.creatorId && !isAdminEmail(session.user.email)) {
            return Response.json({ message: 'FORBIDDEN', error: 'Você só pode editar seus próprios sistemas' }, { status: 403 });
        }

        const { creatorId: _creatorId, createdAt: _createdAt, id: _id, ...rest } = body;

        const updatedSystem = new RPGSystem({
            ...existingSystem,
            ...rest,
            id: params.id,
            creatorId: existingSystem.creatorId,
            createdAt: existingSystem.createdAt,
            updatedAt: new Date().toISOString()
        });

        await rpgSystemRepository.update(updatedSystem);

        return Response.json(updatedSystem);
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return Response.json({ message: 'UNAUTHORIZED', error: 'Não autorizado' }, { status: 401 });
        }

        const existingSystem = await rpgSystemRepository.findById(params.id);

        if (!existingSystem) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        if (session.user.id !== existingSystem.creatorId && !isAdminEmail(session.user.email)) {
            return Response.json({ message: 'FORBIDDEN', error: 'Você só pode deletar seus próprios sistemas' }, { status: 403 });
        }

        await rpgSystemRepository.delete(params.id);

        return Response.json({ message: 'DELETED' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}
