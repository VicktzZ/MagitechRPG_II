import { PusherEvent } from '@enums';
import { Note } from '@models';
import { campaignRepository } from '@repositories';
import { triggerPusher } from '@utils/pusher';
import { assertId, assertMaxLength, handleRouteError, readJsonBody, requireCampaignGM, requireUser, TEXT_LIMITS } from '@utils/api';
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

        await campaignRepository.update({
            ...campaign,
            notes: [ ...(campaign.notes || []), { ...newNote } ]
        });

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
        
        const updatedNotes = (campaign.notes || []).map(note => 
            note.id === noteId ? { ...note, content } : note
        );
        
        await campaignRepository.update({
            ...campaign,
            notes: updatedNotes
        });
        
        const updatedNote = updatedNotes.find(note => note.id === noteId);
        
        if (!updatedNote) {
            return Response.json({ message: 'Nota não encontrada' }, { status: 404 });
        }

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
        
        const updatedNotes = (campaign.notes || []).filter(note => note.id !== noteId);
        
        await campaignRepository.update({
            ...campaign,
            notes: updatedNotes
        });

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