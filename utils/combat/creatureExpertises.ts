import { Expertises } from '@models/Expertises';

/**
 * Perícias de uma criatura. O editor grava só as que o mestre mexeu e, nas criaturas antigas, as demais ficaram **inexistentes** (a criatura
 * "não tinha" Percepção, por exemplo, e não dava para rolá-la). Toda criatura tem todas as perícias: as que não têm bônus nem ônus valem 0.
 *
 * Completa com as perícias padrão do Magitech (valor 0 e atributo padrão de cada uma) as que faltam. Criatura de sistema customizado, que
 * guarda perícias com as chaves do sistema (não as do Magitech), fica como está: não há como saber quais são as dela só pela criatura.
 */

export interface CreatureExpertise {
    value: number;
    defaultAttribute: string | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** As perícias padrão do Magitech, todas em 0 */
export function defaultCreatureExpertises(): Record<string, CreatureExpertise> {
    return Object.fromEntries(
        Object.entries(new Expertises()).map(([ name, expertise ]) => [ name, { value: 0, defaultAttribute: (expertise as { defaultAttribute: string | null }).defaultAttribute ?? null } ])
    );
}

/** O que a criatura tem mais as perícias padrão que faltam (valor 0); o que ela já tem não muda */
export function completeCreatureExpertises<T extends object = CreatureExpertise>(stored: unknown): Record<string, T> {
    const have = isRecord(stored) ? stored : {};
    const defaults = defaultCreatureExpertises();

    // Chave que não é do Magitech: perícias do sistema customizado, que a criatura guarda sozinha
    if (Object.keys(have).some(name => !(name in defaults))) return have as Record<string, T>;
    return { ...defaults, ...have } as unknown as Record<string, T>;
}
