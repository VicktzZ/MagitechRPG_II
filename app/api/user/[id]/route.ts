/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { userRepository } from '@repositories';
import { assertId, assertMaxLength, badRequest, forbidden, handleRouteError, readJsonBody, requireAdmin, requireUser, TEXT_LIMITS } from '@utils/api';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const user = await requireUser();
        assertId(id);
        if (user.id !== id && !user.isAdmin) {
            throw forbidden('Você só pode ver o seu próprio perfil');
        }

        const found = await userRepository.findById(id);

        if (!found) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        return Response.json(found);
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar usuário');
    }
}

/**
 * Atualiza o próprio perfil. Apenas nome e imagem são editáveis por aqui —
 * e-mail identifica a conta e assinatura só muda pelas rotas de assinatura.
 */
export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const user = await requireUser();
        assertId(id);
        if (user.id !== id && !user.isAdmin) {
            throw forbidden('Você só pode editar o seu próprio perfil');
        }

        const body = await readJsonBody<{ name?: unknown, image?: unknown }>(req);
        assertMaxLength(body.name, TEXT_LIMITS.name, 'name');
        assertMaxLength(body.image, TEXT_LIMITS.shortText, 'image');
        if (typeof body.image === 'string' && body.image && !/^https:\/\//.test(body.image)) {
            throw badRequest('"image" deve ser uma URL https');
        }

        const existing = await userRepository.findById(id);
        if (!existing) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        await userRepository.update({
            ...existing,
            ...(typeof body.name === 'string' && body.name.trim() ? { name: body.name.trim() } : {}),
            ...(typeof body.image === 'string' && body.image ? { image: body.image } : {})
        });

        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar usuário');
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await requireAdmin();
        assertId(id);
        await userRepository.delete(id);
        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao remover usuário');
    }
}
