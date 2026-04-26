import { charsheetService } from '@services';

/**
 * Aumenta o nível de um personagem
 * Aplica recompensas automáticas baseadas no nível
 */
export async function increaseLevelCharsheet(charsheetId: string, levelsToAdd: number = 1) {
    try {
        await charsheetService.increaseLevel(charsheetId, levelsToAdd);
        return { success: true, message: `Nível aumentado em +${levelsToAdd}!` };
    } catch (error) {
        console.error('Erro ao aumentar nível:', error);
        return { success: false, message: 'Erro ao aumentar nível' };
    }
}

/**
 * Diminui o nível de um personagem (rollback)
 * Remove recompensas de nível de forma proporcional
 */
export async function decreaseLevelCharsheet(charsheetId: string, levelsToRemove: number = 1) {
    try {
        // Chamar endpoint de decrease level (se existir)
        // ou passar valor negativo para increaseLevel
        await charsheetService.increaseLevel(charsheetId, -levelsToRemove);
        return { success: true, message: `Nível diminuído em -${levelsToRemove}!` };
    } catch (error) {
        console.error('Erro ao diminuir nível:', error);
        return { success: false, message: 'Erro ao diminuir nível' };
    }
}

/**
 * Calcula recompensas de nível
 * Baseado nas regras padrão do sistema
 */
export function calculateLevelRewards(currentLevel: number, newLevel: number) {
    const levelDiff = newLevel - currentLevel;
    
    return {
        attributePoints: levelDiff * 1,  // +1 ponto de atributo por nível
        expertisePoints: levelDiff * 1,  // +1 ponto de perícia por nível
        skillPoints: Math.floor(levelDiff / 2),  // +1 ponto de habilidade a cada 2 níveis
        magicPoints: Math.floor(levelDiff / 3),  // +1 ponto de magia a cada 3 níveis
    };
}
