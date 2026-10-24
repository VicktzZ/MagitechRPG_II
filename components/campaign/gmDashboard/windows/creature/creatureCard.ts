import type { Creature } from '@models';
import { attributeModifier } from '../../creatureCreator/creatureStats';

/** O que a janela da criatura mostra, já em texto e número (a criatura guardada pode ter formatos antigos ou incompletos) */
export interface CreatureCard {
    id: string;
    name: string;
    type: string;
    description: string;
    imageUrl: string;
    level: number;
    stats: { lp: number; maxLp: number; mp: number; maxMp: number; ap: number };
    attributes: Array<{ key: string; label: string; value: number; mod: number }>;
    /** Só as perícias com valor diferente de zero: as demais são "sem treino" e só poluem a tela */
    expertises: Array<{ name: string; value: number; attribute: string }>;
    skills: Array<{ id: string; name: string; type: string; description: string }>;
    spells: Array<{ id: string; name: string; level: number; element: string; cost: number; description: string }>;
}

const asNumber = (value: unknown): number => {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const asText = (value: unknown): string => (typeof value === 'string' ? value : '');

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const asList = (value: unknown): Array<Record<string, unknown>> => (Array.isArray(value) ? value.filter(isRecord) : []);

/**
 * Lê uma criatura da campanha para a janela. As magias da criatura são gravadas pelo editor como
 * `{ name, description, level, element, cost }` (e não no formato do catálogo, com `mpCost` e `stages`), então lê os dois.
 */
export function toCreatureCard(creature: Creature): CreatureCard {
    const raw = creature as unknown as Record<string, unknown>;
    const stats = isRecord(raw['stats']) ? raw['stats'] : {};
    const attributes = isRecord(raw['attributes']) ? raw['attributes'] : {};
    const expertises = isRecord(raw['expertises']) ? raw['expertises'] : {};

    const lp = asNumber(stats['lp']);
    const mp = asNumber(stats['mp']);

    return {
        id: asText(raw['id']),
        name: asText(raw['name']) || 'Criatura sem nome',
        type: asText(raw['type']),
        description: asText(raw['description']),
        imageUrl: asText(raw['imageUrl']),
        level: asNumber(raw['level']),
        stats: {
            lp,
            maxLp: asNumber(stats['maxLp']) || lp,
            mp,
            maxMp: asNumber(stats['maxMp']) || mp,
            ap: asNumber(stats['ap'])
        },
        attributes: Object.entries(attributes).map(([ key, value ]) => {
            const numeric = asNumber(value);
            return { key, label: key.toUpperCase(), value: numeric, mod: attributeModifier(numeric) };
        }),
        expertises: Object.entries(expertises)
            .map(([ name, expertise ]) => {
                const entry = isRecord(expertise) ? expertise : {};
                return { name, value: asNumber(entry['value']), attribute: asText(entry['defaultAttribute']).toUpperCase() };
            })
            .filter(expertise => expertise.value !== 0),
        skills: asList(raw['skills']).map((skill, index) => ({
            id: asText(skill['id']) || `skill-${index}`,
            name: asText(skill['name']) || 'Habilidade sem nome',
            type: asText(skill['type']),
            description: asText(skill['description'])
        })),
        spells: asList(raw['spells']).map((spell, index) => {
            const stages = Array.isArray(spell['stages']) ? spell['stages'] : [];
            return {
                id: asText(spell['id']) || `spell-${index}`,
                name: asText(spell['name']) || 'Magia sem nome',
                level: asNumber(spell['level']),
                element: asText(spell['element']),
                cost: asNumber(spell['cost'] ?? spell['mpCost']),
                description: asText(spell['description']) || asText(stages[0])
            };
        })
    };
}
