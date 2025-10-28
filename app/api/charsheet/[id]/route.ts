/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { DbCharsheet } from '@models';
import { CharsheetDTO } from '@models/dtos';
import { charsheetRepository, powerRepository, spellRepository } from '@repositories';
import { chunk } from '@utils/helpers/chunk';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const charsheet = await charsheetRepository.findById(id);

        if (!charsheet) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        // Criar o DTO a partir da entidade
        const charsheetDto = plainToInstance(CharsheetDTO, charsheet);
        
        if (charsheet.spells && charsheet.spells.length > 0) {
            const spellIds = charsheet.spells;
            const idChunks = chunk(spellIds, 10);

            const queries = idChunks.map(ids =>
                spellRepository.whereIn('id', ids).find()
            );

            const results = await Promise.all(queries);
            charsheetDto.spells = results.flat();
        }

        if (charsheet.skills.powers && charsheet.skills.powers.length > 0) {
            const powerIds = charsheet.skills.powers;
            const idChunks = chunk(powerIds, 10);

            const queries = idChunks.map(ids =>
                powerRepository.whereIn('id', ids).find()
            );

            const powersData = (await Promise.all(queries)).flat();

            charsheetDto.skills.powers = powersData.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                element: p.element,
                mastery: p.mastery,
                type: 'Poder Mágico' as const
            }));
        }

        return Response.json(charsheetDto);
    } catch (error: any) {
        return Response.json({ message: 'INTERNAL SERVER ERROR', error: error.message }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const charsheet = await charsheetRepository.findById(id);
        if (!charsheet) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        await charsheetRepository.delete(id);
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const body: CharsheetDTO | DbCharsheet = await req.json();
        const defaultDto = plainToInstance(CharsheetDTO, body, { excludeExtraneousValues: true });
        const dbDto = plainToInstance(DbCharsheet, body, { excludeExtraneousValues: true });

        const defaultDtoErrors = await validate(defaultDto, { skipMissingProperties: true });
        const dbDtoErrors = await validate(dbDto, { skipMissingProperties: true });

        if (defaultDtoErrors.length > 0 && dbDtoErrors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors: defaultDtoErrors }, { status: 400 });
        }

        const charsheet = await charsheetRepository.findById(id);
        if (!charsheet) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }

        const updatedCharsheet = new DbCharsheet({ ...defaultDto, id } as unknown as DbCharsheet);

        await charsheetRepository.update(updatedCharsheet);

        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}