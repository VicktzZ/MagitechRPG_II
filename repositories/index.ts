import { Campaign, Charsheet, Notification, Power, Spell, User, Perk, ItemEntity, ArmorEntity, WeaponEntity, SkillEntity, Job } from '@models/entities';
import { initFirebaseAdmin } from '@utils/initializeFireOrm';
import { getRepository } from 'fireorm';

initFirebaseAdmin();

export const userRepository = getRepository(User);
export const campaignRepository = getRepository(Campaign);
export const charsheetRepository = getRepository(Charsheet);
export const notificationRepository = getRepository(Notification);
export const spellRepository = getRepository(Spell);
export const powerRepository = getRepository(Power);
export const perkRepository = getRepository(Perk);
export const itemRepository = getRepository(ItemEntity);
export const armorRepository = getRepository(ArmorEntity);
export const weaponRepository = getRepository(WeaponEntity);
export const skillRepository = getRepository(SkillEntity);
export const jobRepository = getRepository(Job);
