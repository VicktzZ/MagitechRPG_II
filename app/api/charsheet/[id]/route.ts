/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { CharsheetDTO } from '@models/dtos';
import { charsheetRepository, powerRepository, spellRepository } from '@repositories';
import { chunk } from '@utils/helpers/chunk';
import { plainToInstance } from 'class-transformer';
import { badRequest, handleRouteError, readJsonBody, requireCharsheetAccess, requireUser } from '@utils/api';
import { toSpellIds } from '@utils/charsheetDiff';
import { adminUpdateDoc, assertFieldUpdates } from '@utils/firestore/adminDocs';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const user = await requireUser();
        // Dono, mestre de uma campanha onde a ficha joga ou colega de campanha
        const { charsheet } = await requireCharsheetAccess(id, user, 'read');

        // Criar o DTO a partir da entidade
        const charsheetDto = plainToInstance(CharsheetDTO, charsheet);
        
        if (charsheet.spells && charsheet.spells.length > 0) {
            const spellIds = charsheet.spells;
            const idChunks = chunk(spellIds, 10);

            const queries = idChunks.map(ids =>
                spellRepository.whereIn('id', ids).find()
            );

            const results = await Promise.all(queries);
            charsheetDto.spells = results.flat();
        }

        if (charsheet.skills.powers && charsheet.skills.powers.length > 0) {
            const powerIds = charsheet.skills.powers;
            const idChunks = chunk(powerIds, 10);

            const queries = idChunks.map(ids =>
                powerRepository.whereIn('id', ids).find()
            );

            const powersData = (await Promise.all(queries)).flat();

            charsheetDto.skills.powers = powersData.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                element: p.element,
                mastery: p.mastery,
                type: 'Poder Mágico' as const
            }));
        }

        return Response.json(charsheetDto);
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar ficha');
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const user = await requireUser();
        await requireCharsheetAccess(id, user, 'owner');
        await charsheetRepository.delete(id);
        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao remover ficha');
    }
}

/** Chaves que o corpo do PATCH nunca grava: identidade, dono, data de criação e o que a campanha escreve em `session` */
const PROTECTED_KEYS = [ 'id', 'userId', 'createdAt', 'updatedAt', 'session', 'abilityUses' ];

/**
 * Atualização parcial da ficha: grava só as chaves de topo que vieram no corpo.
 *
 * Antes a rota remontava a ficha inteira (`{ ...salva, ...corpo }` passando por `plainToInstance`) e regravava o
 * documento todo: o `session` do corpo (uma foto antiga) substituía o salvo e apagava as vantagens da campanha, os
 * valores padrão das classes (`effects: []`, ids novos) vazavam para o banco e uma lista de traços vazia nunca persistia.
 * A tela da ficha agora usa `PATCH /api/charsheet/[id]/fields` (só o que mudou); esta rota fica para abas abertas
 * antes da atualização e clientes externos.
 */
export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const user = await requireUser();
        // Dono da ficha ou mestre de uma campanha onde ela joga
        const { charsheet } = await requireCharsheetAccess(id, user, 'write');

        const body = await readJsonBody<Record<string, unknown>>(req);
        if (typeof body !== 'object' || body === null || Array.isArray(body)) {
            throw badRequest('O corpo deve ser um objeto com os campos da ficha');
        }

        const fields: Record<string, unknown> = {};
        for (const [ key, value ] of Object.entries(body)) {
            if (PROTECTED_KEYS.includes(key) || value === undefined) continue;
            // Magias ficam salvas como ids. A ficha pode chegar com ids (edição do mestre sobre os dados crus do
            // Firestore) ou com objetos; lista vazia é uma alteração válida (o jogador removeu todas as magias).
            if (key === 'spells') {
                if (Array.isArray(value)) fields[key] = toSpellIds(value);
                continue;
            }
            fields[key] = value;
        }

        if (Object.keys(fields).length === 0) return Response.json({ message: 'SUCCESS' });

        await adminUpdateDoc('charsheets', charsheet.id, assertFieldUpdates(fields, { protectedPaths: PROTECTED_KEYS }));

        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar ficha');
    }
}
