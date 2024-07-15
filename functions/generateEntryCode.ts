import { Chance } from 'chance';

export default function generateEntryCode(length: number = 8): string {
    const chance = new Chance();
    return chance.string({ length, casing: 'upper', alpha: true, numeric: true });
}