import { notificationRepository } from '@repositories';
import { assertId, forbidden, handleRouteError, notFound, readJsonBody, requireUser } from '@utils/api';

export async function DELETE(req: Request): Promise<Response> {
    try {
        const user = await requireUser();
        const body = await readJsonBody<{ id?: unknown }>(req);
        const id = assertId(body.id);

        const notification = await notificationRepository.findById(id);
        if (!notification) throw notFound('Notificação não encontrada');
        if (notification.userId !== user.id && !user.isAdmin) {
            throw forbidden('Você só pode remover suas próprias notificações');
        }

        await notificationRepository.delete(id);
        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao remover notificação');
    }
}
