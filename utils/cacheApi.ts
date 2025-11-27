export const cache = new Map<string, { data: any; timestamp: number }>();
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Gera chave de cache baseada nos parâmetros da query
 */
export function generateCacheKey(collections: string[], filters: any): string {
    const key = {
        collections: collections.sort(),
        filters: {
            perkType: filters.perkType,
            levelRequired: filters.levelRequired,
            rarity: filters.rarity,
            seed: filters.seed,
            perkAmount: filters.perkAmount
        }
    };
    return JSON.stringify(key);
}

/**
 * Verifica se cache é válido
 */
export function isCacheValid(entry: { data: any; timestamp: number }): boolean {
    return Date.now() - entry.timestamp < CACHE_TTL;
}

/**
 * Gera ETag simples baseado no conteúdo dos dados
 */
export function generateETag(data: any[]): string {
    const contentHash = require('node:crypto')
        .createHash('md5')
        .update(JSON.stringify(data))
        .digest('hex');
    return `"${contentHash}"`;
}