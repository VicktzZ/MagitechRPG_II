import { campaignRepository } from '@repositories';
import { deleteCampaignMessages } from '@utils/firestore/campaignMessages';
import type { Campaign } from '@models/entities/Campaign';
import {
    assertMaxLength,
    badRequest,
    findCampaignOrThrow,
    getCampaignRole,
    handleRouteError,
    readJsonBody,
    requireCampaignGM,
    requireUser,
    TEXT_LIMITS,
    toCampaignPreview
} from '@utils/api';

export async function GET(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const campaign = await findCampaignOrThrow(params.id);

        // Membros recebem a campanha inteira; quem só tem o código (ex.: ao entrar), uma prévia
        return Response.json(getCampaignRole(campaign, user).isMember ? campaign : toCampaignPreview(campaign));
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar campanha');
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(params.id, user);

        await campaignRepository.delete(campaign.id);

        // O Firestore não apaga as subcoleções junto com o documento: sem isto o chat ficaria órfão
        try {
            await deleteCampaignMessages(campaign.id);
        } catch (error) {
            console.error('[Campanha] Campanha excluída, mas as mensagens do chat não foram apagadas:', error);
        }

        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao remover campanha');
    }
}

/**
 * Edita dados básicos da campanha (somente mestre). Jogadores, mestres,
 * sessão e código não mudam por aqui — cada um tem sua própria rota.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(params.id, user);
        const body = await readJsonBody<Partial<Pick<Campaign, 'title' | 'description' | 'mode'>>>(req);

        assertMaxLength(body.title, TEXT_LIMITS.title, 'title');
        assertMaxLength(body.description, TEXT_LIMITS.description, 'description');
        if (body.mode !== undefined && body.mode !== 'Classic' && body.mode !== 'Roguelite') {
            throw badRequest('"mode" deve ser Classic ou Roguelite');
        }

        await campaignRepository.update({
            ...campaign,
            ...(body.title !== undefined ? { title: body.title } : {}),
            ...(body.description !== undefined ? { description: body.description } : {}),
            ...(body.mode !== undefined ? { mode: body.mode } : {})
        });

        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar campanha');
    }
}
