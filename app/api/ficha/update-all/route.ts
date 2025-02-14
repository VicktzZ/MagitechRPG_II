import { NextResponse } from 'next/server'
import Ficha from '@models/ficha'
import type { Ficha as FichaType } from '@types'
import { connectToDb } from '@utils/database'

export async function POST() {
    try {
        await connectToDb()

        // Busca todas as fichas que não têm o campo session ou que têm o campo como undefined
        const fichas = await Ficha.find<FichaType>({
            $or: [
                { session: { $exists: false } },
                { session: null },
                { session: { $size: 0 } }
            ]
        })

        console.log(`Encontradas ${fichas.length} fichas para atualizar`)

        // Atualiza cada ficha
        const updatePromises = fichas.map(async ficha => {
            try {
                // Atualiza a ficha com um array vazio de sessões
                const result = await Ficha.updateOne(
                    { _id: ficha._id },
                    { 
                        $set: { 
                            session: [] 
                        }
                    },
                    { upsert: true } // Cria o campo se não existir
                )

                console.log(`Ficha ${ficha._id} atualizada:`, result)
                return result
            } catch (error) {
                console.error(`Erro ao atualizar ficha ${ficha._id}:`, error)
                return null
            }
        })

        // Aguarda todas as atualizações terminarem
        const results = await Promise.all(updatePromises)
        const successCount = results.filter(r => r?.modifiedCount === 1).length

        console.log(`${successCount} fichas atualizadas com sucesso`)

        return NextResponse.json({ 
            success: true,
            message: `${successCount} fichas atualizadas com sucesso`
        })
    } catch (error) {
        console.error('Erro ao atualizar fichas:', error)
        return NextResponse.json(
            { error: 'Erro ao atualizar fichas', details: error }, 
            { status: 500 }
        )
    }
}
