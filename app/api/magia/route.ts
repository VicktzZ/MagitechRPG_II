import Magia from '@models/magia';

import { type Magia as MagiaType } from '@types';
import { connectToDb } from '@utils/database';
import { type PipelineStage } from 'mongoose';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        await connectToDb()
        const query = req.nextUrl.searchParams.get('search')
        const order = req.nextUrl.searchParams.get('order')
        const filter = req.nextUrl.searchParams.get('filter')
        const sort = req.nextUrl.searchParams.get('sort')
        const page = req.nextUrl.searchParams.get('page')
        const limit = req.nextUrl.searchParams.get('limit')
        
        const pipeline: PipelineStage[] = []
        
        if (query) {
            pipeline.push({
                $search: {
                    index: 'magias_search',
                    text: {
                        query,
                        fuzzy: {
                            maxEdits: 2,  // Aumentado para permitir mais variações
                            prefixLength: 2,  // Reduzido para melhorar resultados com prefixos curtos
                            maxExpansions: 100  // Aumentado para mais resultados
                        },
                        path: {
                            wildcard: '*'
                        }
                    }
                }
            })
            
            // Adiciona um estágio $match para melhorar a relevância dos resultados
            // Isso garante que resultados parciais também sejam incluídos
            pipeline.push({
                $match: {
                    $or: [
                        { nome: { $regex: query, $options: 'i' } },
                        { descrição: { $regex: query, $options: 'i' } },
                        { elemento: { $regex: query, $options: 'i' } }
                    ]
                }
            })
        }

        if (filter && filter !== 'Nenhum') {
            pipeline.push({
                $match: {
                    'elemento': filter
                }
            })
        }

        if (sort && sort !== 'Nenhum') {
            const orderBy = order === 'ASC' ? 1 : -1

            if (sort === 'Alfabética') {
                pipeline.push({ $sort: { 'nome': orderBy } })
            } else if (sort === 'Nível') {
                pipeline.push({ $sort: { 'nível': orderBy } })
            } else if (sort === 'Custo') {
                pipeline.push({ $sort: { 'custo': orderBy } })
            }
        }
        
        pipeline.push({ $group: { _id: '$_id', doc: { $first: '$$ROOT' } } })
        pipeline.push({ $replaceRoot: { newRoot: '$doc' } })
        pipeline.push({ $skip: (Number(page) - 1) * Number(limit) })
        pipeline.push({ $limit: Number(limit) })

        console.log('Pipeline:', JSON.stringify(pipeline, null, 2))

        const magias = await Magia.aggregate(pipeline)

        return Response.json(magias)
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 })
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        await connectToDb()
        
        const body: MagiaType = await req.json()
        const magia = await Magia.create(body)

        return Response.json(magia)
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 })
    }
}   