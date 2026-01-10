import { Charsheet } from '@models/entities';
import { CharsheetDTO } from '@models/dtos/CharsheetDTO';
import { charsheetRepository } from '@repositories';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const userId = req.nextUrl.searchParams.get('userId');
        if (!userId) {
            return Response.json({ message: 'BAD REQUEST', error: 'Missing userId' }, { status: 400 });
        }

        const charsheets = await charsheetRepository
            .whereEqualTo('userId', userId)
            .find();
            
        return Response.json(charsheets);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: NextRequest): Promise<Response> {
    try {
        const body: CharsheetDTO = await req.json();
        const dto = plainToInstance(CharsheetDTO, body, { excludeExtraneousValues: true });
        const errors = await validate(dto, { skipMissingProperties: true }); // Remover em produção
        
        if (errors.length > 0) {
            console.log(errors);
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const newCharsheet = new Charsheet(body as any);

        newCharsheet.skills.powers = body.skills.powers?.map((power) => power?.id ?? '');
        newCharsheet.spells = body.spells?.map((spell) => spell?.id ?? ''); 
        
        const createdCharsheet = await charsheetRepository.create(newCharsheet);
    
        return Response.json(createdCharsheet, { status: 201 });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}