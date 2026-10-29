import { UserDTO } from '@models/dtos';
import { userRepository } from '@repositories';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer'
import { User } from '@models/entities';
import { handleRouteError, readJsonBody, requireAdmin } from '@utils/api';

export const dynamic = 'force-dynamic'

// Listar todos os usuários (e-mails, assinaturas) é exclusivo de administradores
export async function GET() {
    try {
        await requireAdmin();
        const users = await userRepository.find();

        return Response.json({ users, message: 'SUCCESS' }, { status: 200 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao listar usuários');
    }
}

// Usuários são criados pelo login (NextAuth). Criação manual só por administradores.
export async function POST(req: Request) {
    try {
        await requireAdmin();
        const body: UserDTO = await readJsonBody(req);
        const dto = plainToInstance(UserDTO, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const newUser = new User(dto);
        const createdUser = await userRepository.create(newUser);

        return Response.json({ user: createdUser, message: 'SUCCESS' }, { status: 201 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao criar usuário');
    }
}
