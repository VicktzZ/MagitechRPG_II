import { connectToDb } from '@utils/database'
import Notification from '@models/notification'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDb()

        const { id } = params
        const { read } = await req.json()

        const notification = await Notification.findByIdAndUpdate(
            id,
            { $set: { read } },
            { new: true }
        )

        if (!notification) {
            return Response.json({ message: 'Notificação não encontrada' }, { status: 404 })
        }

        return Response.json(notification)
    } catch (error) {
        console.error('Erro ao atualizar notificação:', error)
        return Response.json({ message: 'Erro ao atualizar notificação' }, { status: 500 })
    }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectToDb()

        const { id } = params

        // Verifica se o ID é válido
        if (!id) {
            return Response.json({ message: 'ID do usuário é obrigatório' }, { status: 400 })
        }

        // Busca notificações do usuário, ordenadas por data (mais recentes primeiro)
        const notifications = await Notification.find({ 
            userId: id 
        })
            .sort({ timestamp: -1 })
            .limit(50)

        if (!notifications) {
            return Response.json([])
        }

        return Response.json(notifications)
    } catch (error) {
        console.error('Erro ao buscar notificações:', error)
        return Response.json({ message: 'Erro ao buscar notificações' }, { status: 500 })
    }
}
