import { spellRepository } from '@repositories';
import { SpellDTO } from '@models/dtos';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { Spell } from '@models/entities';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const spell = await spellRepository.findById(id);
        if (!spell) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        return Response.json(spell);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        // Opcional: Verificar se existe antes de deletar
        const spell = await spellRepository.findById(id);
        if (!spell) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        await spellRepository.delete(id);
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const body: SpellDTO = await req.json();
        const dto = plainToInstance(SpellDTO, body, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const spell = await spellRepository.findById(id);
        if (!spell) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        
        await spellRepository.update({ ...dto, id } as Spell);
        
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}