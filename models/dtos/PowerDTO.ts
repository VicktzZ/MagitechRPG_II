import { IsOptional, IsString } from 'class-validator';

export class PowerDTO {
    @IsString() name: string;
    @IsString() description: string;
    @IsString() element: string;
    @IsString() mastery: string;
    @IsString() @IsOptional() type?: string = 'Poder Mágico';
    @IsString() @IsOptional() origin?: string;
    @IsString() @IsOptional() preRequisite?: string;

    constructor(power?: Partial<PowerDTO>) {
        Object.assign(this, power);
    }
}