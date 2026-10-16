/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { SpellDTO } from '@models/dtos/SpellDTO';
import { spellRepository } from '@repositories';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { NextRequest } from 'next/server';
import { clampInt, handleRouteError, limitQueryString, readJsonBody, requireAdmin } from '@utils/api';
import { Spell } from '@models/entities';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const search = limitQueryString(req.nextUrl.searchParams.get('search'));
        const order = req.nextUrl.searchParams.get('order')?.toLowerCase() || 'asc';
        const filter = limitQueryString(req.nextUrl.searchParams.get('filter'), 50);
        // Teto de página para ninguém pedir a coleção inteira de uma vez
        const limit = clampInt(req.nextUrl.searchParams.get('limit'), 1, 100, 20);
        const cursor = limitQueryString(req.nextUrl.searchParams.get('cursor'), 200); // cursor pelo nome

        console.log('[SPELL API] Parâmetros recebidos:', { search, order, filter, limit, cursor });

        // Busca um item a mais para saber se há próxima página
        let query = spellRepository.limit(limit + 1);

        // Filtro de busca por prefixo do nome
        const trimmedSearch = search?.trim();
        if (trimmedSearch) {
            query = query
                .whereGreaterOrEqualThan('name', trimmedSearch)
                .whereLessThan('name', `${trimmedSearch}\uf8ff`);
        }

        // Filtro por elemento
        const trimmedFilter = filter?.trim();
        if (trimmedFilter && trimmedFilter !== 'Nenhum') {
            query = query.whereEqualTo('element', trimmedFilter.toUpperCase());
        }

        // Ordenação SEMPRE por name para compatibilidade com buscas e cursor
        query = order === 'asc'
            ? query.orderByAscending('name')
            : query.orderByDescending('name');

        // Cursor baseado em name para evitar conflitos com índices
        if (cursor) {
            query = query.whereGreaterThan('name', cursor);
        }

        const spells = await query.find();

        console.log('[SPELL API] Magias encontradas:', spells.length);

        // Verifica se há mais itens
        const hasMore = spells.length > limit;
        const data = hasMore ? spells.slice(0, limit) : spells;
        const nextCursor = hasMore ? data[data.length - 1]?.name : undefined;

        console.log('[SPELL API] Resposta:', { totalItems: data.length, hasMore, nextCursor });
        
        return Response.json({
            data,
            hasMore,
            nextCursor
        });
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar magias');
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        await requireAdmin();
        const body: SpellDTO = await readJsonBody(req);
        const dto = plainToInstance(SpellDTO, body);
        const errors = await validate(dto);
        
        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }
        
        const spell = new Spell(dto);
        const createdSpell = await spellRepository.create(spell);
        
        return Response.json(createdSpell, { status: 201 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao criar registro');
    }
}