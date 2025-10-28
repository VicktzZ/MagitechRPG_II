import { IsBoolean, IsString } from 'class-validator'

export class JoinCampaignDTO {
    @IsString() campaignCode: string
    @IsString() userId: string
    @IsBoolean() isGM: boolean
}