import { IsOptional, IsString, IsUrl } from 'class-validator';

export class NotificationDTO {
    @IsString() userId: string;
    @IsString() title: string;
    @IsString() content: string;
    @IsString() type?: string = 'info';
    @IsUrl() @IsOptional() link?: string;

    constructor(notification: Notification) {
        Object.assign(this, notification);
    }
}