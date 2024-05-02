import Magia from '@models/magia';

import { type Magia as MagiaType } from '@types';
import { connectToDb } from '@utils/database';
import { type PipelineStage } from 'mongoose';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        await connectToDb();
        const query = req.nextUrl.searchParams.get('search');
        const filter = req.nextUrl.searchParams.get('filter');
        const sort = req.nextUrl.searchParams.get('sort');

        const pipeline: PipelineStage[] = [ { $skip: 0 } ]; 
        
        if (query) {
            pipeline.unshift({
                $search: {
                    index: 'magias_search',
                    text: {
                        query,
                        fuzzy: {
                            maxEdits: 1,
                            prefixLength: 3,
                            maxExpansions: 50
                        },
                        path: {
                            wildcard: '*'
                        }
                    }
                }
            });
        }

        if (filter) {
            pipeline.push({
                $match: {
                    'elemento': filter
                }
            });
        }

        if (sort) {
            pipeline.push({ $sort: { [sort.toLowerCase()]: 1 } });
        }

        const magias = await Magia.aggregate(pipeline);

        return Response.json(magias);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        await connectToDb();
        
        const body: MagiaType = await req.json();
        const magia = await Magia.create(body);

        return Response.json(magia);
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}   