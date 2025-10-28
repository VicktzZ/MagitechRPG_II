import { PusherEvent } from '@enums';
import { getCollectionDoc } from '@models/docs';
import { CreateCustomItemDTO } from '@models/dtos';
import { updateDoc } from '@firebase/firestore';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { pusherServer } from '@utils/pusher';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const { id } = params;
        const body = await req.json();

        const dto = plainToInstance(CreateCustomItemDTO, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const { type, item } = dto;

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }

        const newItem = {
            ...item,
            id: uuidv4()
        };

        const fieldPath = `custom.items.${type}`;

        await updateDoc(getCollectionDoc('campaigns', campaign.id), {
            [fieldPath]: FieldValue.arrayUnion(newItem)
        });

        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.ITEM_ADDED,
            { type, item: newItem }
        );

        return Response.json(newItem);
    } catch (error: any) {
        console.error('Erro ao adicionar item customizado:', error);
        return Response.json({ 
            message: 'Erro ao adicionar item customizado', 
            error: error.message 
        }, { status: 500 });
    }
}