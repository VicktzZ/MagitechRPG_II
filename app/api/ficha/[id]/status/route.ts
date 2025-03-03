// import { connectToDb } from '@utils/database'
// import { pusherServer } from '@utils/pusher'
// import { PusherEvent } from '@enums'
// import Ficha from '@models/ficha'
// import type { Status } from '@types'

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//     try {
//         await connectToDb()

//         const { status }: { status: Status[] } = await req.json()
//         const { id } = params

//         // Atualiza o status da ficha
//         const updatedFicha = await Ficha.findByIdAndUpdate(
//             id,
//             { $set: { status } },
//             { new: true }
//         )

//         if (!updatedFicha) {
//             return Response.json({ message: 'Ficha não encontrada' }, { status: 404 })
//         }

//         // Notifica os clientes sobre a atualização
//         await pusherServer.trigger(
//             `presence-${updatedFicha.userId}`,
//             PusherEvent.FICHA_UPDATED,
//             updatedFicha
//         )

//         return Response.json(updatedFicha)
//     } catch (error) {
//         console.error('Erro ao atualizar status:', error)
//         return Response.json({ message: 'Erro ao atualizar status' }, { status: 500 })
//     }
// }
