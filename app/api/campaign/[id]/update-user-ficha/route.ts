import { PusherEvent } from '@enums';
import { pusherServer } from '@utils/pusher';
import { charsheetRepository } from '@repositories';
import { CharsheetDTO } from '@models/dtos/CharsheetDTO';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { type Charsheet } from '@models/entities';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const body: CharsheetDTO = await req.json();
        const charsheetId = body.id;
        const { id: code } = params;
        
        const dto = plainToInstance(CharsheetDTO, body, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        if (!charsheetId) {
            return Response.json({ message: 'BAD REQUEST', errors: [ { property: 'id', constraints: { isNotEmpty: 'O ID da charsheet é obrigatório no body' } } ] }, { status: 400 });
        }

        await charsheetRepository.update({ ...dto, id: charsheetId } as unknown as Charsheet);
        await pusherServer.trigger('presence-' + code, PusherEvent.CHARSHEET_UPDATED, { ...dto, id: charsheetId });

        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}