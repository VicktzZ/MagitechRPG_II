import { PusherEvent } from '@enums';
import { CreateCustomItemDTO } from '@models/dtos';
import { campaignRepository } from '@repositories';
import { triggerPusher } from '@utils/pusher';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { assertMaxLength, badRequest, handleRouteError, readJsonBody, requireCampaignGM, requireUser, TEXT_LIMITS } from '@utils/api';

const ITEM_TYPES = [ 'weapon', 'armor', 'item' ] as const;

export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const { id } = params;
        const user = await requireUser();
        // Itens customizados da campanha são criados pelo mestre
        const { campaign } = await requireCampaignGM(id, user);

        const body: CreateCustomItemDTO = await readJsonBody(req);

        const dto = plainToInstance(CreateCustomItemDTO, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const { type, item } = body;
        if (!ITEM_TYPES.includes(type)) {
            throw badRequest('"type" deve ser weapon, armor ou item');
        }
        assertMaxLength((item as any)?.name, TEXT_LIMITS.name, 'item.name');

        const newItem = {
            ...item,
            id: uuidv4()
        };

        await triggerPusher(
            `presence-${campaign.campaignCode}`,
            PusherEvent.ITEM_ADDED,
            { type, item: newItem }
        );

        await campaignRepository.update({
            ...campaign,
            custom: {
                ...campaign.custom,
                items: {
                    ...campaign.custom?.items,
                    [type]: [ ...campaign.custom?.items?.[type] || [], newItem ]
                }
            }
        });

        return Response.json(newItem);
    } catch (error) {
        return handleRouteError(error, 'Erro ao adicionar item customizado');
    }
}
