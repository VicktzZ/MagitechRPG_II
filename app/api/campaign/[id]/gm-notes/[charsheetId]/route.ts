import { assertCharsheetInCampaign, assertGmNoteBody } from '@utils/api/gmNotes';
import { handleRouteError, readJsonBody, requireCampaignGM, requireUser } from '@utils/api';
import { saveGmNote } from '@utils/firestore/gmNotes';

/**
 * PUT /api/campaign/[id]/gm-notes/[charsheetId] — body: { text }
 *
 * Grava (ou, com texto vazio, apaga) a anotação privada do mestre sobre uma ficha da campanha. Só o mestre da
 * campanha escreve, e só para fichas que jogam nela. A leitura não passa por aqui: o navegador do mestre ouve o
 * documento em tempo real e as regras do Firestore só deixam o mestre ler.
 */
export async function PUT(req: Request, { params }: { params: { id: string; charsheetId: string } }): Promise<Response> {
    try {
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(params.id, user);
        const charsheetId = assertCharsheetInCampaign(campaign, params.charsheetId);
        const text = assertGmNoteBody(await readJsonBody(req, { maxBytes: 64 * 1024 }));

        const saved = await saveGmNote(campaign.id, charsheetId, text, user.id);

        return Response.json({ message: 'SUCCESS', saved });
    } catch (error) {
        return handleRouteError(error, 'Erro ao salvar anotação');
    }
}
