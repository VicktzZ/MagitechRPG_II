/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { SpellDTO } from '@models/dtos/SpellDTO';
import { spellRepository } from '@repositories';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { NextRequest } from 'next/server';
import type { Spell } from '@models/entities';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const search = req.nextUrl.searchParams.get('search');
        const order = req.nextUrl.searchParams.get('order')?.toLowerCase() || 'asc';
        const filter = req.nextUrl.searchParams.get('filter');
        const sort = req.nextUrl.searchParams.get('sort')?.toLowerCase() || 'name';
        const limit = Number(req.nextUrl.searchParams.get('limit')) || 10;
        
        let query = spellRepository.limit(limit);
        
        if (search) {
            query = query
                .whereGreaterOrEqualThan('name', search)
                .whereLessThan('name', search);
        }
        
        if (filter && filter !== 'Nenhum') {
            query = query.whereEqualTo('element', filter);
        }
        
        const orderByField = filter === 'element' ? 'name' : sort as keyof Spell;
        if (order === 'asc') {
            query = query.orderByAscending(orderByField);
        } else {
            query = query.orderByDescending(orderByField);
        }
        
        const spells = await query.find();
        
        return Response.json(spells);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const body: SpellDTO = await req.json();
        const dto = plainToInstance(SpellDTO, body);
        const errors = await validate(dto);
        
        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }
        
        const createdSpell = await spellRepository.create(dto as Spell);
        
        return Response.json(createdSpell, { status: 201 });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}