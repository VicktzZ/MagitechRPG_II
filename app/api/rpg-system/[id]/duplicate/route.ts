import { rpgSystemRepository } from '@repositories';
import type { NextRequest } from 'next/server';
import { RPGSystem } from '@models/entities';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<Response> {
    try {
        const body = await req.json();
        const { name, creatorId } = body;

        if (!name || !creatorId) {
            return Response.json({ message: 'Name and creatorId are required' }, { status: 400 });
        }

        const existingSystem = await rpgSystemRepository.findById(params.id);
        
        if (!existingSystem) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        
        // Cria uma cópia do sistema com novo nome e criador
        const duplicatedSystem = new RPGSystem({
            ...existingSystem,
            id: undefined as unknown as string, // FireORM irá gerar um novo ID
            name,
            creatorId,
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
