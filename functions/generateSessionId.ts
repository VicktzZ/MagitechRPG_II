import { Chance } from 'chance';

export default function generateSessionId(): string {
    const chance = new Chance();
    return chance.string({ length: 8, casing: 'upper', alpha: true, numeric: true });
}