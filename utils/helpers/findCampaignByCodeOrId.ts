import { campaignRepository } from '@repositories';

export async function findCampaignByCodeOrId(codeOrId: string) {
    if (codeOrId.length === 8) {
        return await campaignRepository.whereEqualTo('campaignCode', codeOrId).findOne();
    }
    return await campaignRepository.findById(codeOrId);
}