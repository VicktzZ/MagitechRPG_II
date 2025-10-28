import { IsBoolean, IsDate, IsObject, IsOptional, IsString } from 'class-validator'
import { v4 as uuidv4 } from 'uuid';

export class Message {
    @IsString() id: string = uuidv4();
    @IsString() text: string;
    @IsDate() timestamp: Date = new Date();

    @IsString()
    @IsOptional() 
        type?: string;

    @IsBoolean()
    @IsOptional() 
        isHTML?: boolean;
    
    @IsObject() by: {
        id: string;
        image: string;
        name: string;
        isBot?: boolean;
        isGM?: boolean;
    };

    constructor(message?: Partial<Message>) {
        Object.assign(this, message)
    }
}