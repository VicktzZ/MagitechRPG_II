import { IsArray, IsEnum, IsString } from 'class-validator';

export class CampaignDTO {
    @IsArray() admin: string[];
    @IsString() title: string;
    @IsString() description: string;
    @IsEnum([ 'Classic', 'Roguelite' ]) mode: 'Classic' | 'Roguelite' = 'Classic';
    
    @IsArray() 
    @IsString({ each: true })
        players: Array<{ userId: string, charsheetId: string }> = [];

    constructor(campaign?: CampaignDTO) {
        Object.assign(this, campaign);
    }
}