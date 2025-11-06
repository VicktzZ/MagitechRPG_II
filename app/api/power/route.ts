/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { powerRepository } from '@repositories';
import { Power } from '@models/entities';
import { PowerDTO } from '@models/dtos/PowerDTO';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const search = req.nextUrl.searchParams.get('search');
        const order = req.nextUrl.searchParams.get('order')?.toLowerCase() || 'asc';
        const filter = req.nextUrl.searchParams.get('filter');
        const limit = Number(req.nextUrl.searchParams.get('limit')) || 20;
        const cursor = req.nextUrl.searchParams.get('cursor'); // cursor pelo nome

        // Busca um item a mais para saber se há próxima página
        let query = powerRepository.limit(limit + 1);

        // Aplicar busca por nome (prefix)
        const trimmedSearch = search?.trim();
        if (trimmedSearch) {
            query = query
                .whereGreaterOrEqualThan('name', trimmedSearch)
                .whereLessThan('name', `${trimmedSearch}\uf8ff`);
        }

        // Aplicar filtro de elemento
        const trimmedFilter = filter?.trim();
        if (trimmedFilter && trimmedFilter !== 'Nenhum') {
            query = query.whereEqualTo('element', trimmedFilter.toUpperCase());
        }

        // Ordenação SEMPRE por name para compatibilidade com cursor e busca
        query = order === 'asc'
            ? query.orderByAscending('name')
            : query.orderByDescending('name');

        // Cursor baseado em nome
        if (cursor) {
            query = query.whereGreaterThan('name', cursor);
        }

        const powers = await query.find();

        console.log('[POWER API] Poderes encontrados:', powers.length);

        // Verifica se há mais itens
        const hasMore = powers.length > limit;
        const data = hasMore ? powers.slice(0, limit) : powers;
        const nextCursor = hasMore ? data[data.length - 1]?.name : undefined;

        console.log('[POWER API] Resposta:', { totalItems: data.length, hasMore, nextCursor });
        
        return Response.json({
            data,
            hasMore,
            nextCursor
        });
    } catch (error: any) {
        console.error('[POWER API] Erro:', error);
        return Response.json({ message: 'INTERNAL ERROR', error: error.message }, { status: 500 });
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
        
        const power = new Power(dto);
        const createdPower = await powerRepository.create(power);
        
        return Response.json(createdPower, { status: 201 });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}