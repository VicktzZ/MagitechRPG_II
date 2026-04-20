import { PusherEvent } from '@enums';
import { Note } from '@models';
import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { pusherServer } from '@utils/pusher';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body: Note = await req.json();
        
        const dto = plainToInstance(Note, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const newNote = new Note(dto);

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }

        await campaignRepository.update({
            ...campaign,
            notes: [ ...(campaign.notes || []), { ...newNote } ]
        });

        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            { ...newNote }
        );

        return Response.json(newNote);
    } catch (error) {
        console.error('Erro ao criar nota:', error);
        return Response.json({ message: 'Erro ao criar nota' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();

        // Validação manual simples
        if (!body.noteId || typeof body.noteId !== 'string') {
            return Response.json({ message: 'noteId é obrigatório e deve ser uma string' }, { status: 400 });
        }
        
        if (body.content !== undefined && typeof body.content !== 'string') {
            return Response.json({ message: 'content deve ser uma string' }, { status: 400 });
        }

        const { noteId, content } = body;
        const campaign = await findCampaignByCodeOrId(id);

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }
        
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

        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            updatedNote
        );

        return Response.json(updatedNote);
    } catch (error) {
        console.error('Erro ao atualizar nota:', error);
        return Response.json({ message: 'Erro ao atualizar nota' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();

        // Validação manual simples
        if (!body.noteId || typeof body.noteId !== 'string') {
            return Response.json({ message: 'noteId é obrigatório e deve ser uma string' }, { status: 400 });
        }
        
        const { noteId } = body;
        const campaign = await findCampaignByCodeOrId(id);

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }
        
        const updatedNotes = (campaign.notes || []).filter(note => note.id !== noteId);
        
        await campaignRepository.update({
            ...campaign,
            notes: updatedNotes
        });

        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            noteId
        );

        return Response.json({ noteId });
    } catch (error) {
        console.error('Erro ao deletar nota:', error);
        return Response.json({ message: 'Erro ao deletar nota' }, { status: 500 });
    }
}