import { PusherEvent } from '@enums';
import { Note } from '@models';
import type { Campaign } from '@models/entities';
import { triggerPusher } from '@utils/pusher';
import { adminUpdateDocInTransaction } from '@utils/firestore/adminDocs';
import { assertId, assertMaxLength, handleRouteError, notFound, readJsonBody, requireCampaignGM, requireUser, TEXT_LIMITS } from '@utils/api';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const user = await requireUser();
        // Notas da campanha são escritas pelo mestre (jogadores só leem)
        const { campaign } = await requireCampaignGM(id, user);

        const body: Note = await readJsonBody(req, { maxBytes: 64 * 1024 });
        assertMaxLength(body.content, TEXT_LIMITS.note, 'content');
        
        const dto = plainToInstance(Note, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const newNote = new Note(dto);

        // Só o campo `notes`, dentro de uma transação: regravar a campanha inteira desfazia o que
        // outros (jogadores entrando, combate) tivessem gravado desde a leitura
        await adminUpdateDocInTransaction<null, Campaign>('campaigns', campaign.id, data => ({
            fields: { notes: [ ...(data?.notes ?? []), { ...newNote } ] },
            result: null
        }));

        await triggerPusher(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            { ...newNote }
        );

        return Response.json(newNote);
    } catch (error) {
        return handleRouteError(error, 'Erro ao criar nota');
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(id, user);
        const body = await readJsonBody(req, { maxBytes: 64 * 1024 });

        assertId(body.noteId, 'noteId');
        assertMaxLength(body.content, TEXT_LIMITS.note, 'content');

        const { noteId, content } = body;
        
        const updatedNote = await adminUpdateDocInTransaction<Note, Campaign>('campaigns', campaign.id, data => {
            const notes = data?.notes ?? [];
            const current = notes.find(note => note.id === noteId);
            if (!current) throw notFound('Nota não encontrada');

            const updated = { ...current, content };
            return { fields: { notes: notes.map(note => note.id === noteId ? updated : note) }, result: updated };
        });

        await triggerPusher(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            updatedNote
        );

        return Response.json(updatedNote);
    } catch (error) {
        return handleRouteError(error, 'Erro ao atualizar nota');
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const user = await requireUser();
        const { campaign } = await requireCampaignGM(id, user);
        const body = await readJsonBody(req);

        const noteId = assertId(body.noteId, 'noteId');
        
        await adminUpdateDocInTransaction<null, Campaign>('campaigns', campaign.id, data => ({
            fields: { notes: (data?.notes ?? []).filter(note => note.id !== noteId) },
            result: null
        }));

        await triggerPusher(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            noteId
        );

        return Response.json({ noteId });
    } catch (error) {
        return handleRouteError(error, 'Erro ao deletar nota');
    }
}