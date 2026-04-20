import { IsNumber } from 'class-validator';

export class Points {
    @IsNumber() attributes: number = 0;
    @IsNumber() expertises: number = 0;
    @IsNumber() skills: number = 0;
    @IsNumber() magics: number = 0;

    constructor(points?: Points) {
        Object.assign(this, points)
    }
}