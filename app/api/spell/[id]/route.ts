import { spellRepository } from '@repositories';
import { SpellDTO } from '@models/dtos';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { Spell } from '@models/entities';
import { assertId, handleRouteError, readJsonBody, requireAdmin } from '@utils/api';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        assertId(id);
        const spell = await spellRepository.findById(id);
        if (!spell) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        return Response.json(spell);
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await requireAdmin();
        assertId(id);
        // Opcional: Verificar se existe antes de deletar
        const spell = await spellRepository.findById(id);
        if (!spell) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        await spellRepository.delete(id);
        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await requireAdmin();
        assertId(id);
        const body: SpellDTO = await readJsonBody(req);
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
    } catch (error) {
        return handleRouteError(error);
    }
}