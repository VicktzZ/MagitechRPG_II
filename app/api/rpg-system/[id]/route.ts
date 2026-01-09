import { rpgSystemRepository } from '@repositories';
import type { NextRequest } from 'next/server';
import { RPGSystem } from '@models/entities';

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
        const body = await req.json();
        const existingSystem = await rpgSystemRepository.findById(params.id);
        
        if (!existingSystem) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        
        const updatedSystem = new RPGSystem({
            ...existingSystem,
            ...body,
            id: params.id,
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
        const body = await req.json();
        const existingSystem = await rpgSystemRepository.findById(params.id);
        
        if (!existingSystem) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        
        const updatedSystem = new RPGSystem({
            ...existingSystem,
            ...body,
            id: params.id,
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
        const existingSystem = await rpgSystemRepository.findById(params.id);
        
        if (!existingSystem) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        
        await rpgSystemRepository.delete(params.id);
        
        return Response.json({ message: 'DELETED' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}
