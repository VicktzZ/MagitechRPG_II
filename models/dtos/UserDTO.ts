import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class UserDTO {
    @IsString() name: string;
    @IsEmail() email: string;
    @IsUrl() image: string;
    @IsOptional() charsheets?: string[] = [];

    constructor(user: UserDTO) {
        Object.assign(this, user)
    }
}