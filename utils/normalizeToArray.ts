/**
 * Normaliza um valor que pode ser um array ou um objeto com chaves numéricas
 * (o Firestore devolve assim arrays gravados com índices): Record<number, T> vira T[].
 * Um objeto com outras chaves (mapa por id) vira a lista dos seus valores, achatando arrays.
 * Qualquer outra coisa (inclusive null/undefined) vira [].
 */
export function normalizeToArray<T>(value: unknown): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];

    if (typeof value === 'object') {
        const record = value as Record<string, T>;
        const keys = Object.keys(record);
        const isNumericKeys = keys.every(key => !isNaN(Number(key)));
        if (isNumericKeys) {
            return keys
                .map(key => Number(key))
                .sort((a, b) => a - b)
                .map(key => record[key]!);
        }

        return Object.values(record)
            .flatMap(item => Array.isArray(item) ? item : [ item ])
            .filter(item => item !== undefined && item !== null);
    }

    return [];
}
