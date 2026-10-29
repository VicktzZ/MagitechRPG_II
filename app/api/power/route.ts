/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { powerRepository } from '@repositories';
import { Power } from '@models/entities';
import { PowerDTO } from '@models/dtos/PowerDTO';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { NextRequest } from 'next/server';
import { clampInt, handleRouteError, limitQueryString, readJsonBody, requireAdmin } from '@utils/api';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const search = limitQueryString(req.nextUrl.searchParams.get('search'));
        const order = req.nextUrl.searchParams.get('order')?.toLowerCase() || 'asc';
        const elementsParam = limitQueryString(req.nextUrl.searchParams.get('elements'), 200);
        const legacyFilter = limitQueryString(req.nextUrl.searchParams.get('filter'), 50);
        // Teto de página para ninguém pedir a coleção inteira de uma vez
        const limit = clampInt(req.nextUrl.searchParams.get('limit'), 1, 100, 20);
        const cursor = limitQueryString(req.nextUrl.searchParams.get('cursor'), 200); // cursor pelo nome

        // Firestore limita cláusulas "in" a 10 valores
        const elements = (elementsParam
            ? elementsParam.split(',').map(e => e.trim()).filter(Boolean)
            : (legacyFilter && legacyFilter !== 'Nenhum' ? [ legacyFilter ] : []))
            .slice(0, 10)
            .map(e => e.toUpperCase());

        // Busca um item a mais para saber se há próxima página
        let query = powerRepository.limit(limit + 1);

        // Aplicar busca por nome (prefix)
        const trimmedSearch = search?.trim();
        if (trimmedSearch) {
            query = query
                .whereGreaterOrEqualThan('name', trimmedSearch)
                .whereLessThan('name', `${trimmedSearch}\uf8ff`);
        }

        // Aplicar filtro de elemento(s) — múltipla seleção via whereIn
        if (elements.length === 1) {
            query = query.whereEqualTo('element', elements[0]);
        } else if (elements.length > 1) {
            query = query.whereIn('element', elements);
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
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar poderes');
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        await requireAdmin();
        const body: PowerDTO = await readJsonBody(req);
        const dto = plainToInstance(PowerDTO, body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }
        
        const power = new Power(dto);
        const createdPower = await powerRepository.create(power);
        
        return Response.json(createdPower, { status: 201 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao criar registro');
    }
}