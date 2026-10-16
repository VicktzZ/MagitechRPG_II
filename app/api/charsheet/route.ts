import { Charsheet } from '@models/entities';
import { CharsheetDTO } from '@models/dtos/CharsheetDTO';
import { charsheetRepository } from '@repositories';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { NextRequest } from 'next/server';
import { assertId, forbidden, handleRouteError, readJsonBody, requireUser } from '@utils/api';

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const user = await requireUser();
        const userId = req.nextUrl.searchParams.get('userId');
        if (!userId) {
            return Response.json({ message: 'BAD REQUEST', error: 'Missing userId' }, { status: 400 });
        }
        assertId(userId, 'userId');
        if (userId !== user.id && !user.isAdmin) {
            throw forbidden('Você só pode listar as suas próprias fichas');
        }

        const charsheets = await charsheetRepository
            .whereEqualTo('userId', userId)
            .find();
            
        return Response.json(charsheets);
    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar fichas');
    }
}

export async function POST(req: NextRequest): Promise<Response> {
    try {
        const user = await requireUser();
        const body: CharsheetDTO = await readJsonBody(req);
        const dto = plainToInstance(CharsheetDTO, body, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true }); // Remover em produção
        
        if (errors.length > 0) {
            console.log(errors);
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        // A ficha sempre pertence a quem cria — nunca ao userId enviado no body.
        // O id também é descartado: com id definido o FireORM faz set() e
        // sobrescreveria uma ficha existente de outra pessoa.
        const { id: _ignoredId, ...charsheetData } = body as any;
        const newCharsheet = new Charsheet({ ...charsheetData, userId: user.id });

        newCharsheet.skills.powers = body.skills.powers?.map((power) => power?.id ?? '');
        newCharsheet.spells = body.spells?.map((spell) => spell?.id ?? ''); 
        
        const createdCharsheet = await charsheetRepository.create(newCharsheet);
    
        return Response.json(createdCharsheet, { status: 201 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao criar ficha');
    }
}