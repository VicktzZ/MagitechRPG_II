import { notificationRepository } from '@repositories';
import { NotificationDTO } from '@models/dtos';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Notification } from '@models/entities';  

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body: NotificationDTO = await req.json();
        const dto = plainToInstance(NotificationDTO, body, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true, whitelist: false });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        await notificationRepository.update({ ...dto, id } as Notification);
        
        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        console.error('Erro ao atualizar notificação:', error);
        return Response.json({ message: 'Erro ao atualizar notificação' }, { status: 500 });
    }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        
        const notifications = await notificationRepository
            .whereEqualTo('userId', id)
            .orderByDescending('timestamp')
            .limit(50)
            .find();
            
        return Response.json(notifications);
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        return Response.json({ message: 'Erro ao buscar notificações' }, { status: 500 });
    }
}