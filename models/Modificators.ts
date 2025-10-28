import { IsNumber, IsObject } from 'class-validator';

export class Modificators {
    @IsObject() attributes: {
        des: number;
        vig: number;
        log: number;
        sab: number;
        foc: number;
        car: number;
    } = {
            des: 0,
            vig: 0,
            log: 0,
            sab: 0,
            foc: 0,
            car: 0
        };
        
    @IsNumber() discount: number = 0;

    constructor(modificators?: Modificators) {
        Object.assign(this, modificators)
    }
}