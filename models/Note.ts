import { IsDate, IsString } from 'class-validator'
import { v4 as uuidv4 } from 'uuid';

export class Note {
    @IsString() id: string = uuidv4();
    @IsString() content: string;
    @IsDate() timestamp: Date = new Date();

    constructor(note?: Partial<Note>) {
        Object.assign(this, note)
    }
}