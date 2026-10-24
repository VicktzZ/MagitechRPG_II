import { badRequest, notFound } from './errors';
import { assertMaxLength, isValidId, TEXT_LIMITS } from './input';

/** Corpo de PUT /api/campaign/[id]/gm-notes/[charsheetId]: `{ text }`; texto vazio apaga a anotação */
export function assertGmNoteBody(body: unknown): string {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) throw badRequest('Corpo inválido');

    const source = body as Record<string, unknown>;
    const unknown = Object.keys(source).filter(key => key !== 'text');
    if (unknown.length > 0) throw badRequest(`Campo desconhecido: ${unknown[0]}`);

    const text = source['text'];
    if (typeof text !== 'string') throw badRequest('"text" deve ser um texto');
    assertMaxLength(text, TEXT_LIMITS.note, 'text');

    return text;
}

/** A ficha tem de jogar nesta campanha: anotação de ficha de fora (ou de ID inventado) não vira documento */
export function assertCharsheetInCampaign(campaign: { players?: Array<{ charsheetId?: string }> }, charsheetId: unknown): string {
    if (!isValidId(charsheetId)) throw badRequest('"charsheetId" inválido');
    if (!campaign.players?.some(player => player.charsheetId === charsheetId)) {
        throw notFound('Essa ficha não joga nesta campanha');
    }
    return charsheetId;
}
