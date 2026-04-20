import { IsNumber } from 'class-validator';

export class Attributes {
    @IsNumber() des: number = 0;
    @IsNumber() vig: number = 0;
    @IsNumber() log: number = 0;
    @IsNumber() sab: number = 0;
    @IsNumber() foc: number = 0;
    @IsNumber() car: number = 0;

    constructor(attributes?: Attributes) {
        Object.assign(this, attributes)
    }
}