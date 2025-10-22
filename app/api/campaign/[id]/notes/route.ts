/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { updateDoc, arrayUnion } from 'firebase/firestore';
import { campaignDoc } from '@models/db/campaign';
import { pusherServer } from '@utils/pusher';
import { PusherEvent } from '@enums';
import type { Note } from '@types';
import { v4 as uuidv4 } from 'uuid';
import { getCampaign } from '@utils/server/getCampaign';

// Criar nota
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const note: Note = await req.json();
        const noteId = note._id || uuidv4();
        const noteWithId = { ...note, _id: noteId, timestamp: note.timestamp || new Date() };

        // Adicionar nota ao array usando arrayUnion
        await updateDoc(campaignDoc(id), {
            notes: arrayUnion(noteWithId)
        });

        // Dispara o evento do Pusher
        await pusherServer.trigger(
            `presence-${id}`,
            PusherEvent.NOTES_UPDATED,
            noteWithId
        );

        return Response.json(noteWithId);
    } catch (error) {
        console.error('Erro ao criar nota:', error);
        return Response.json({ message: 'Erro ao criar nota' }, { status: 500 });
    }
}

// Atualizar nota
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { noteId, content } = await req.json();

        if (!noteId || !content) {
            return Response.json({ message: 'ID da nota e conteúdo são obrigatórios' }, { status: 400 });
        }

        // Firestore não suporta atualização de itens específicos em arrays diretamente.
        // Para atualizar uma nota específica, precisamos buscar o documento,
        // modificar localmente e salvar de volta.
        // Por simplicidade, vamos buscar e atualizar manualmente.
        const campaignSnap = await getCampaign(id);
        if (!campaignSnap.exists()) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }
        const campaign = campaignSnap.data();
        
        // Atualizar nota no array
        const updatedNotes = campaign.notes.map(note => 
            note._id === noteId ? { ...note, content } : note
        );
        
        await updateDoc(campaignDoc(id), { notes: updatedNotes });
        
        const updatedNote = updatedNotes.find(note => note._id === noteId);
        
        if (!updatedNote) {
            return Response.json({ message: 'Nota não encontrada' }, { status: 404 });
        }

        // Dispara o evento do Pusher
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

// Deletar nota
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { noteId } = await req.json();

        if (!noteId) {
            return Response.json({ message: 'ID da nota é obrigatório' }, { status: 400 });
        }

        // Buscar campanha atual
        const campaignSnap = await getCampaign(id);
        if (!campaignSnap.exists()) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }
        const campaign = campaignSnap.data();
        
        // Remover nota do array
        const updatedNotes = campaign.notes.filter(note => note._id !== noteId);
        await updateDoc(campaignDoc(id), { notes: updatedNotes });

        // Dispara o evento do Pusher
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