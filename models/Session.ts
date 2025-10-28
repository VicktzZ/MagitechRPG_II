import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Message } from './Message';
import { Type } from 'class-transformer';

export class Session {
    @IsArray()
    @IsString({ each: true })
        users: string[];
    
    @ValidateNested({ each: true })
    @IsOptional()
    @Type(() => Message)
    @IsArray()
        messages?: Message[];
    
    constructor(session?: Session) {
        Object.assign(this, session)
    }
}