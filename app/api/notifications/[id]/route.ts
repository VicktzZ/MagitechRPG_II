import { notificationRepository } from '@repositories';
import { assertId, badRequest, forbidden, handleRouteError, notFound, readJsonBody, requireUser } from '@utils/api';

/** Marca a notificação como lida/não lida. Só o destinatário (ou admin). */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await requireUser();
        const id = assertId(params.id);
        const body = await readJsonBody<{ read?: unknown }>(req);

        if (typeof body.read !== 'boolean') {
            throw badRequest('"read" deve ser verdadeiro ou falso');
        }

        const notification = await notificationRepository.findById(id);
        if (!notification) throw notFound('Notificação não encontrada');
        if (notification.userId !== user.id && !user.isAdmin) {
            throw forbidden('Você só pode alterar suas próprias notificações');
        }

        await notificationRepository.update({ ...notification, read: body.read });

        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar notificação');
    }
}

/** Lista as notificações do usuário `id` (o parâmetro é o ID do usuário). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await requireUser();
        const userId = assertId(params.id);
        if (userId !== user.id && !user.isAdmin) {
            throw forbidden('Você só pode ver suas próprias notificações');
        }

        const notifications = await notificationRepository
            .whereEqualTo('userId', userId)
            .orderByDescending('timestamp')
            .limit(50)
            .find();

        return Response.json(notifications);
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar notificações');
    }
}
