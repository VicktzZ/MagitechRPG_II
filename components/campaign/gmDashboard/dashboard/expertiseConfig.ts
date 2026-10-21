import { rarityColor } from '@constants';
import { Casino, EmojiEvents, Person, Star, TrendingUp } from '@mui/icons-material';

export const getGMExpertiseLevel = (value: number): 'novice' | 'trained' | 'expert' | 'master' | 'legendary' => {
    if (value < 2) return 'novice';
    if (value < 5) return 'trained';
    if (value < 7) return 'expert';
    if (value < 9) return 'master';
    return 'legendary';
};

/** Cor de cada nível de perícia: a mesma escada de raridades (Comum a Lendário) */
export const getGMExpertiseConfig = (value: number) => {
    const level = getGMExpertiseLevel(value);

    switch (level) {
    case 'novice':
        return {
            color: rarityColor.Comum,
            label: 'Destreinado',
            icon: Person
        };
    case 'trained':
        return {
            color: rarityColor.Incomum,
            label: 'Treinado',
            icon: TrendingUp
        };
    case 'expert':
        return {
            color: rarityColor.Raro,
            label: 'Especialista',
            icon: Star
        };
    case 'master':
        return {
            color: rarityColor['Épico'],
            label: 'Mestre',
            icon: EmojiEvents
        };
    case 'legendary':
    default:
        return {
            color: rarityColor['Lendário'],
            label: 'Lendário',
            icon: Casino
        };
    }
};
