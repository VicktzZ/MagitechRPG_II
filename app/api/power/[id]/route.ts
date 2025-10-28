import { powerRepository } from '@repositories';
import { PowerDTO } from '@models/dtos/PowerDTO';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { Power } from '@models/entities';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const power = await powerRepository.findById(id);
        if (!power) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        return Response.json(power);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const power = await powerRepository.findById(id);
        if (!power) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        await powerRepository.delete(id);
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const body: PowerDTO = await req.json();
        const dto = plainToInstance(PowerDTO, body, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const power = await powerRepository.findById(id);
        if (!power) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        
        await powerRepository.update({ ...dto, id } as Power);
        
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}