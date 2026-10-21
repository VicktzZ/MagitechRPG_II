import { PusherEvent } from '@enums';
import { triggerPusher } from '@utils/pusher';
import { charsheetRepository } from '@repositories';
import { CharsheetDTO } from '@models/dtos/CharsheetDTO';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { type Charsheet } from '@models/entities';
import { assertId, campaignHasCharsheet, forbidden, handleRouteError, readJsonBody, requireCampaignMember, requireUser } from '@utils/api';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await requireUser();
        const { campaign, isGM } = await requireCampaignMember(params.id, user);

        const body: CharsheetDTO = await readJsonBody(req);
        const charsheetId = body.id;

        const dto = plainToInstance(CharsheetDTO, body);
        const errors = await validate(dto, { skipMissingProperties: true });

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        if (!charsheetId) {
            return Response.json({ message: 'BAD REQUEST', errors: [ { property: 'id', constraints: { isNotEmpty: 'O ID da charsheet é obrigatório no body' } } ] }, { status: 400 });
        }
        assertId(charsheetId, 'id');

        if (!campaignHasCharsheet(campaign, charsheetId)) {
            throw forbidden('Esta ficha não faz parte da campanha');
        }

        const existingCharsheet = await charsheetRepository.findById(charsheetId)
        if (!existingCharsheet) {
            return Response.json({ message: 'NOT FOUND', error: 'Charsheet não encontrada' }, { status: 404 })
        }

        // Mestre da campanha edita qualquer ficha dela; jogador, só a própria
        if (!isGM && existingCharsheet.userId !== user.id) {
            throw forbidden('Você só pode editar a sua própria ficha');
        }

        const spellsToSave = Array.isArray((body as any)?.spells)
            ? (body as any).spells.map((spell: any) => spell?.id ?? spell?.name ?? '').filter((v: string) => v.trim() !== '')
            : undefined

        const updatedCharsheet = {
            ...existingCharsheet,
            ...body,
            id: charsheetId,
            // O dono nunca muda por edição
            userId: existingCharsheet.userId,
            spells: spellsToSave ?? existingCharsheet.spells
        }

        await charsheetRepository.update(updatedCharsheet as unknown as Charsheet)
        await triggerPusher('presence-' + campaign.campaignCode, PusherEvent.CHARSHEET_UPDATED, updatedCharsheet)

        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar ficha');
    }
}
