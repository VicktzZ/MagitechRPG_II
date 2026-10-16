import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { campaignRepository, notificationRepository } from '@repositories';
import { Notification } from '@models/entities';
import { NotificationDTO } from '@models/dtos';
import { assertId, assertMaxLength, forbidden, handleRouteError, readJsonBody, requireUser, TEXT_LIMITS, type AuthUser } from '@utils/api';

/** O usuário é mestre de alguma campanha onde `targetUserId` joga? */
async function isGMOfPlayer(user: AuthUser, targetUserId: string): Promise<boolean> {
    const gmCampaigns = await campaignRepository.whereArrayContains('admin', user.id).find();
    return gmCampaigns.some(c => c.players?.some(p => p.userId === targetUserId));
}

export async function GET(_: Request, { params }: { params: { userId: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const userId = assertId(params.userId, 'userId');
        if (userId !== user.id && !user.isAdmin) {
            throw forbidden('Você só pode ver suas próprias notificações');
        }

        const notifications = await notificationRepository
            .whereEqualTo('userId', userId)
            .orderByDescending('timestamp')
            .limit(100)
            .find();

        return Response.json(notifications);
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar notificações');
    }
}

/**
 * Cria uma notificação para `userId`. Permitido para o próprio usuário, para
 * administradores e para o mestre de uma campanha em que esse usuário joga.
 */
export async function POST(req: Request, { params }: { params: { userId: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const userId = assertId(params.userId, 'userId');

        if (userId !== user.id && !user.isAdmin && !(await isGMOfPlayer(user, userId))) {
            throw forbidden('Você não pode enviar notificações para este usuário');
        }

        const body: NotificationDTO = await readJsonBody(req);
        assertMaxLength(body.title, TEXT_LIMITS.title, 'title');
        assertMaxLength(body.content, TEXT_LIMITS.description, 'content');
        assertMaxLength(body.type, TEXT_LIMITS.name, 'type');
        assertMaxLength(body.link, TEXT_LIMITS.shortText, 'link');

        // Só os campos conhecidos; userId sempre o da URL (já autorizado acima)
        const fields = {
            userId,
            title: body.title,
            content: body.content,
            ...(body.type ? { type: body.type } : {}),
            ...(body.link ? { link: body.link } : {})
        };
        const dto = plainToInstance(NotificationDTO, fields);
        const errors = await validate(dto, { skipMissingProperties: true, whitelist: false });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const notification = new Notification(fields);
        const createdNotification = await notificationRepository.create(notification);

        return Response.json(createdNotification);
    } catch (error) {
        return handleRouteError(error, 'Erro ao criar notificação');
    }
}
