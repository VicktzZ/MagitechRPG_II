import { UserDTO } from '@models/dtos';
import { userRepository } from '@repositories';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer'
import { User } from '@models/entities';

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const users = await userRepository.find();

        return Response.json({ users, message: 'SUCCESS' }, { status: 200 });
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error?.message }, { status: 403 });
    }
}

export async function POST(req: Request) {
    try {
        const body: UserDTO = await req.json();
        const dto = plainToInstance(UserDTO, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const newUser = new User(dto);
        const createdUser = await userRepository.create(newUser);

        return Response.json({ user: createdUser, message: 'SUCCESS' }, { status: 201 });
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error?.message }, { status: 403 });
    }
}