import { Chance } from 'chance';

export default function generateSessionCode(): string {
    const chance = new Chance();
    return chance.string({ length: 8, casing: 'upper', alpha: true, numeric: true });
}