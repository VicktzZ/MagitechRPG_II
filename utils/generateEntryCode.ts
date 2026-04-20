import { Chance } from 'chance';

export default function generateEntryCode(length: number = 8, casing: 'upper' | 'lower' = 'upper'): string {
    const chance = new Chance();
    return chance.string({ length, casing, alpha: true, numeric: true });
}