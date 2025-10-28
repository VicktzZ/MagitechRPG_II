/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { powerRepository } from '@repositories';
import type { Power } from '@models/entities';
import { PowerDTO } from '@models/dtos/PowerDTO';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const search = req.nextUrl.searchParams.get('search');
        const order = req.nextUrl.searchParams.get('order')?.toLowerCase() || 'asc';
        const filter = req.nextUrl.searchParams.get('filter');
        const sort = req.nextUrl.searchParams.get('sort')?.toLowerCase() || 'name';
        
        let query = powerRepository.limit(1000); // Start with a query builder
        
        if (search) {
            query = query
                .whereGreaterOrEqualThan('name', search)
                .whereLessThan('name', search + '\uf8ff');
        }
        
        if (filter && filter !== 'Nenhum') {
            query = query.whereEqualTo('element', filter);
        }
        
        const orderByField = filter ? 'name' : sort as keyof Power;
        if (order === 'asc') {
            query = query.orderByAscending(orderByField);
        } else {
            query = query.orderByDescending(orderByField);
        }
        
        const poderes = await query.find();
        
        return Response.json(poderes);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const body: PowerDTO = await req.json();
        const dto = plainToInstance(PowerDTO, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }
        
        const createdPower = await powerRepository.create(dto as Power);
        
        return Response.json(createdPower, { status: 201 });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}