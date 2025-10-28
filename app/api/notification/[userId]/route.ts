import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { notificationRepository } from '@repositories';
import type { Notification } from '@models/entities';
import { NotificationDTO } from '@models/dtos';

export async function GET(_: Request, { params }: { params: { userId: string } }): Promise<Response> {
    try {
        const notifications = await notificationRepository
            .whereEqualTo('userId', params.userId)
            .orderByDescending('timestamp')
            .find();
            
        return Response.json(notifications);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request, { params }: { params: { userId: string } }): Promise<Response> {
    try {
        const body: NotificationDTO = await req.json();
        const dto = plainToInstance(NotificationDTO, { ...body, userId: params.userId }, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true, whitelist: false });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const createdNotification = await notificationRepository.create(dto as Notification);
        
        return Response.json(createdNotification);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}