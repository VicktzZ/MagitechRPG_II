// import { connectToDb } from '@utils/database'
// import { pusherServer } from '@utils/pusher'
// import { PusherEvent } from '@enums'
// import Charsheet from '@models/charsheet'
// import type { Status } from '@types'

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//     try {
//         await connectToDb()

//         const { status }: { status: Status[] } = await req.json()
//         const { id } = params

//         // Atualiza o status da charsheet
//         const updatedCharsheet = await Charsheet.findByIdAndUpdate(
//             id,
//             { $set: { status } },
//             { new: true }
//         )

//         if (!updatedCharsheet) {
//             return Response.json({ message: 'Charsheet não encontrada' }, { status: 404 })
//         }

//         // Notifica os clientes sobre a atualização
//         await pusherServer.trigger(
//             `presence-${updatedCharsheet.userId}`,
//             PusherEvent.FICHA_UPDATED,
//             updatedCharsheet
//         )

//         return Response.json(updatedCharsheet)
//     } catch (error) {
//         console.error('Erro ao atualizar status:', error)
//         return Response.json({ message: 'Erro ao atualizar status' }, { status: 500 })
//     }
// }
