import type { RPGSystem } from '@models/entities';
import { DEFAULT_ATTRIBUTE_DEFS, DEFAULT_EXPERTISE_DEFS, type RolePreset } from './constants';
import type { AttributeDef, CreatureData, ExpertiseDef } from './types';

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Modificador exibido do atributo, na mesma escala usada nas rolagens de criatura */
export const attributeModifier = (value: number): number => (value === 0 ? -1 : Math.min(5, Math.floor(value / 5)));

export function getAttributeDefs(rpgSystem: RPGSystem | null): AttributeDef[] {
    if (rpgSystem?.attributes?.length) {
        return rpgSystem.attributes.map(a => ({
            key: a.key,
            label: (a.abbreviation || a.name || a.key).toUpperCase(),
            name: a.name || a.key
        }));
    }
    return DEFAULT_ATTRIBUTE_DEFS;
}

export function getExpertiseDefs(rpgSystem: RPGSystem | null): ExpertiseDef[] {
    if (rpgSystem?.expertises?.length) {
        const attrByKey = new Map((rpgSystem.attributes ?? []).map(a => [ a.key, (a.abbreviation || a.name || a.key).toUpperCase() ]));
        return rpgSystem.expertises.map(e => ({
            key: e.key,
            name: e.name || e.key,
            attrKey: e.defaultAttribute ?? null,
            attrLabel: e.defaultAttribute ? (attrByKey.get(e.defaultAttribute) ?? e.defaultAttribute.toUpperCase()) : '—'
        }));
    }
    return DEFAULT_EXPERTISE_DEFS;
}

export function buildInitialCreature(
    editing: CreatureData | null | undefined,
    attrDefs: AttributeDef[]
): CreatureData {
    const attributes: Record<string, number> = {};
    attrDefs.forEach(d => { attributes[d.key] = Number(editing?.attributes?.[d.key] ?? 0) || 0; });

    if (!editing) {
        return {
            name: '',
            description: '',
            type: '',
            imageUrl: '',
            level: 1,
            attributes,
            stats: { lp: 10, maxLp: 10, mp: 5, maxMp: 5, ap: 3 },
            skills: [],
            spells: [],
            expertises: {}
        };
    }

    return {
        ...editing,
        type: editing.type ?? '',
        imageUrl: editing.imageUrl ?? '',
        attributes,
        stats: {
            lp: editing.stats?.lp ?? 10,
            maxLp: editing.stats?.maxLp ?? editing.stats?.lp ?? 10,
            mp: editing.stats?.mp ?? 5,
            maxMp: editing.stats?.maxMp ?? editing.stats?.mp ?? 5,
            ap: editing.stats?.ap ?? 3
        },
        skills: editing.skills ?? [],
        spells: editing.spells ?? [],
        expertises: editing.expertises ?? {}
    };
}

/** Atributos e status que um preset de papel gera para o nível dado */
export function buildRolePresetStats(
    preset: RolePreset,
    level: number,
    attrDefs: AttributeDef[]
): Pick<CreatureData, 'attributes' | 'stats'> {
    const attrValue = clamp(Math.round(level * preset.attrFactor), 1, 30);
    const attributes: Record<string, number> = {};
    attrDefs.forEach(d => { attributes[d.key] = attrValue; });
    const lp = Math.max(1, Math.round(preset.lpPerLevel * level));
    const mp = Math.max(0, Math.round(preset.mpPerLevel * level));
    return {
        attributes,
        stats: { lp, maxLp: lp, mp, maxMp: mp, ap: preset.ap }
    };
}

/** Escala atributos, status e perícias da versão salva para um nível alvo e tamanho de grupo */
export function scaleCreature(
    baseCreature: CreatureData,
    scalingLevel: number,
    scalingPlayers: number,
    attrDefs: AttributeDef[]
): Pick<CreatureData, 'level' | 'attributes' | 'stats' | 'expertises'> {
    const levelBase = baseCreature.level || 1;
    const levelTarget = clamp(scalingLevel || levelBase, 1, 30);
    const playersBase = 4;
    const playersTarget = Math.max(1, scalingPlayers || playersBase);

    const levelFactor = levelTarget / levelBase;
    const playersFactor = playersTarget / playersBase;
    const scale = clamp(levelFactor * playersFactor, 0.5, 3);

    const scaleNumber = (value: number, min: number, max: number) =>
        clamp(Math.round(value * scale), min, max);

    const scaledAttributes: Record<string, number> = {};
    attrDefs.forEach(d => {
        scaledAttributes[d.key] = scaleNumber(baseCreature.attributes?.[d.key] ?? 0, 0, 30);
    });

    const scaledStats = {
        lp: scaleNumber(baseCreature.stats.lp, 1, Number.MAX_SAFE_INTEGER),
        maxLp: scaleNumber(baseCreature.stats.maxLp, 1, Number.MAX_SAFE_INTEGER),
        mp: scaleNumber(baseCreature.stats.mp, 0, Number.MAX_SAFE_INTEGER),
        maxMp: scaleNumber(baseCreature.stats.maxMp, 0, Number.MAX_SAFE_INTEGER),
        ap: scaleNumber(baseCreature.stats.ap, 0, Number.MAX_SAFE_INTEGER)
    };

    const scaledExpertises: CreatureData['expertises'] = {};
    Object.entries(baseCreature.expertises || {}).forEach(([ key, value ]) => {
        scaledExpertises[key] = { ...value, value: scaleNumber(value?.value ?? 0, 0, 20) };
    });

    return {
        level: levelTarget,
        attributes: scaledAttributes,
        stats: scaledStats,
        expertises: scaledExpertises
    };
}
