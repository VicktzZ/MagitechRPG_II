/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { UserDTO } from '@models/dtos';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { userRepository } from '@repositories';
import type { User } from '@models/entities';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const user = await userRepository.findById(id);

        if (!user) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json(user);
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const body: UserDTO = await req.json();
        const dto = plainToInstance(UserDTO, body, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true, whitelist: false });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        await userRepository.update({ ...dto, id } as User);

        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await userRepository.delete(id);
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}