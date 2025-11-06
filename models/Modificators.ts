import { IsNumber, ValidateNested } from 'class-validator';
import { Attributes } from './Attributes';
import { Type } from 'class-transformer';

export class Modificators {
    @ValidateNested()
    @Type(() => Attributes)
        attributes: Attributes = new Attributes();

    @IsNumber() discount: number = 0;

    constructor(mods?: Modificators) {
        Object.assign(this, mods)
    }
}