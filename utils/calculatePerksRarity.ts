export function calculatePowerRarity(preRequisites?: string): string {
    if (!preRequisites) {
        return 'Incomum';
    }

    const levelMatch = preRequisites.match(/ORM Nível (\d+)/);

    if (!levelMatch) {
        return 'Incomum';
    }

    const level = parseInt(levelMatch[1]);
    
    switch (level) {
        case 1:
            return 'Incomum';
        case 2:
            return 'Raro';
        case 3:
            return 'Épico';
        case 4:
            return 'Lendário';
        default:
            return level >= 5 ? 'Lendário' : 'Incomum';
    }
}

export function calculateSkillRarity(
    type: string, 
    level?: number, 
    existingRarity?: string
): string {
    // Para skills do tipo "Classe"
    if (type === 'Classe') {
        if (!level || level <= 1) return 'Comum';
        if (level === 5) return 'Incomum';
        if (level === 10) return 'Raro';
        if (level === 15) return 'Épico';
        if (level === 20) return 'Lendário';
        // Para níveis acima de 20
        if (level > 20) return 'Lendário';
        // Para níveis intermediários
        if (level < 5) return 'Comum';
        if (level < 10) return 'Incomum';
        if (level < 15) return 'Raro';
        if (level < 20) return 'Épico';
    }
    
    // Para skills do tipo "Subclasse"
    if (type === 'Subclasse') {
        if (!level || level < 10) return 'Comum';
        if (level === 10) return 'Épico';
        if (level === 15) return 'Lendário';
        if (level === 20) return 'Único';
        // Para níveis acima de 20
        if (level > 20) return 'Único';
        // Para níveis intermediários
        if (level < 15) return 'Épico';
        if (level < 20) return 'Lendário';
    }
    
    // Para os demais tipos, manter a raridade existente
    return existingRarity || 'Comum';
}