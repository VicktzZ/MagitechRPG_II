import { connectToDb } from '@utils/database'
import { pusherServer } from '@utils/pusher'
import { PusherEvent } from '@enums'
import Campaign from '@models/db/campaign'
import type { Campaign as CampaignType, Note } from '@types'

// Criar nota
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDb()

        const { id } = params
        const note: Note = await req.json()

        // Cria um novo documento de nota usando o schema
        const campaign: CampaignType | null = await Campaign.findByIdAndUpdate(
            id,
            { 
                $push: { 
                    notes: {
                        content: note.content,
                        timestamp: note.timestamp || new Date()
                    }
                } 
            },
            { new: true }
        ).lean()

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 })
        }

        // Pega a nota recém criada (última do array)
        const createdNote = campaign.notes[campaign.notes.length - 1]

        // Dispara o evento do Pusher
        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            createdNote
        )

        return Response.json(createdNote)
    } catch (error) {
        console.error('Erro ao criar nota:', error)
        return Response.json({ message: 'Erro ao criar nota' }, { status: 500 })
    }
}

// Atualizar nota
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDb()

        const { id } = params
        const { noteId, content } = await req.json()

        if (!noteId || !content) {
            return Response.json({ message: 'ID da nota e conteúdo são obrigatórios' }, { status: 400 })
        }

        const campaign: CampaignType | null = await Campaign.findByIdAndUpdate(
            id,
            { $set: { 'notes.$[note].content': content } },
            { 
                arrayFilters: [ { 'note._id': noteId } ],
                new: true 
            }
        ).lean()

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 })
        }

        // Encontra a nota atualizada
        const updatedNote = campaign.notes.find(note => note._id!.toString() === noteId)

        if (!updatedNote) {
            return Response.json({ message: 'Nota não encontrada' }, { status: 404 })
        }

        // Dispara o evento do Pusher
        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            updatedNote
        )

        return Response.json(updatedNote)
    } catch (error) {
        console.error('Erro ao atualizar nota:', error)
        return Response.json({ message: 'Erro ao atualizar nota' }, { status: 500 })
    }
}

// Deletar nota
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDb()

        const { id } = params
        const { noteId } = await req.json()

        if (!noteId) {
            return Response.json({ message: 'ID da nota é obrigatório' }, { status: 400 })
        }

        const campaign: CampaignType | null = await Campaign.findByIdAndUpdate(
            id,
            { $pull: { notes: { _id: noteId } } },
            { new: true }
        ).lean()

        if (!campaign) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 })
        }

        // Dispara o evento do Pusher
        await pusherServer.trigger(
            `presence-${campaign.campaignCode}`,
            PusherEvent.NOTES_UPDATED,
            noteId
        )

        return Response.json({ noteId })
    } catch (error) {
        console.error('Erro ao deletar nota:', error)
        return Response.json({ message: 'Erro ao deletar nota' }, { status: 500 })
    }
}