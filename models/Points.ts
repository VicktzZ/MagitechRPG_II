import { IsNumber, IsOptional } from 'class-validator';

export class Points {
    @IsNumber() attributes: number = 0;
    @IsNumber() expertises: number = 0;
    @IsNumber() skills: number = 0;
    @IsNumber() magics: number = 0;
    /** Ponto de evolução: gasto 1 a 1 para liberar o próximo estágio de uma magia; concedido pelo mestre (ver `utils/spellStages.ts`) */
    @IsOptional() @IsNumber() evolution?: number = 0;

    constructor(points?: Points) {
        Object.assign(this, points)
    }
}