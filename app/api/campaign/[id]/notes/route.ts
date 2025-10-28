import { PusherEvent } from '@enums';
import { updateDoc } from '@firebase/firestore';
import { Note } from '@models';
import { getCollectionDoc } from '@models/docs';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { pusherServer } from '@utils/pusher';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();
        
        const dto = plainToInstance(Note, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const noteWithId = { 
            ...dto, 
            id: uuidv4(), 
            timestamp: new Date() 
        };

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }

        await updateDoc(getCollectionDoc('campaigns', campaign.id), {
            notes: FieldValue.arrayUnion(noteWithId)
        });

        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            noteWithId
        );

        return Response.json(noteWithId);
    } catch (error) {
        console.error('Erro ao criar nota:', error);
        return Response.json({ message: 'Erro ao criar nota' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body: Note = await req.json();

        const dto = plainToInstance(Note, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const { id: noteId, content } = dto;
        const campaign = await findCampaignByCodeOrId(id);

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }
        
        const updatedNotes = campaign.notes.map(note => 
            note.id === noteId ? { ...note, content } : note
        );
        
        await updateDoc(getCollectionDoc('campaigns', campaign.id), { 
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
        const body: Note = await req.json();

        const dto = plainToInstance(Note, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }
        
        const { id: noteId } = dto;
        const campaign = await findCampaignByCodeOrId(id);

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }
        
        const updatedNotes = campaign.notes.filter(note => note.id !== noteId);
        
        await updateDoc(getCollectionDoc('campaigns', campaign.id), { 
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