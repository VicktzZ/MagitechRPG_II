/**
 * Normaliza um valor que pode ser um array ou um objeto com chaves numéricas
 * Converte Record<number, T> para T[]
 */
export function normalizeToArray<T>(value: unknown): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    // Se é um objeto com chaves numéricas, converter para array
    if (typeof value === 'object') {
        const record = value as Record<string, T>;
        const keys = Object.keys(record);
        // Verificar se todas as chaves são números
        const isNumericKeys = keys.every(key => !isNaN(Number(key)));
        if (isNumericKeys) {
            // Converter para array ordenado
            return keys
                .map(key => Number(key))
                .sort((a, b) => a - b)
                .map(key => record[key]);
        }
    }

    return [];
}
