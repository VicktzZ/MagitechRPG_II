/**
 * Utilitários para seleção aleatória com seed
 */

import createRandom from 'random-seed'

/**
 * Seleciona aleatoriamente N itens de um array usando seed
 */
export function selectRandomItems<T>(items: T[], count: number, seed: string): T[] {
    if (items.length <= count) return items
    
    const rng = createRandom(seed)
    const shuffled = [...items]
    
    // Fisher-Yates shuffle com seed
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled.slice(0, count)
}

/**
 * Gera uma seed aleatória
 */
export function generateRandomSeed(): string {
    return Math.random().toString(36).substring(2, 15)
}

/**
 * Cria um gerador de números aleatórios com seed
 */
export function createSeededRng(seed: string) {
    return createRandom(seed)
}
