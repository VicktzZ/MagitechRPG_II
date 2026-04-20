import { notificationRepository } from '@repositories';

export async function DELETE(req: Request): Promise<Response> {
    try {
        const body = await req.json();
        await notificationRepository.delete(body.id);
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}