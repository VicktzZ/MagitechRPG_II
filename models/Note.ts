import { IsString } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

export class Note {
    @IsString() id: string = uuidv4();
    @IsString() content: string;
    @IsString() timestamp: string = new Date().toISOString();

    constructor(note?: Partial<Note>) {
        Object.assign(this, note)
    }
}