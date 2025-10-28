import { Campaign, Charsheet, Notification, Power, Spell, User } from '@models/entities';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';
import { getRepository } from 'fireorm';

initFirebaseAdmin();

export const userRepository = getRepository(User);
export const campaignRepository = getRepository(Campaign);
export const charsheetRepository = getRepository(Charsheet);
export const notificationRepository = getRepository(Notification);
export const spellRepository = getRepository(Spell);
export const powerRepository = getRepository(Power);
