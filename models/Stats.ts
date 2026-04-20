import { IsNumber } from 'class-validator';

export class Stats {
    @IsNumber() lp: number = 0;
    @IsNumber() mp: number = 0;
    @IsNumber() ap: number = 0;
    @IsNumber() maxLp: number = 0;
    @IsNumber() maxMp: number = 0;
    @IsNumber() maxAp: number = 0;

    constructor(stats?: Stats) {
        Object.assign(this, stats)
    }
}