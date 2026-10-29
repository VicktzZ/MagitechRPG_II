import { alpha, type Theme } from '@mui/material';
import { color } from '@themes/tokens';

/** Fundo translúcido (14%) da cor de um papel do tema, para chips e ícones */
const roleTint = (role: 'error' | 'info' | 'primary' | 'success' | 'warning') =>
    (theme: Theme) => alpha(theme.palette[role].main, 0.14);

/** Cor (fundo e texto) do chip de cada tipo de perk */
export const getPerkTypeColor = (perkType: string) => {
    switch (perkType) {
    case 'WEAPON': return { bg: roleTint('error'), color: 'error.light' };
    case 'ARMOR': return { bg: roleTint('info'), color: 'info.main' };
    case 'ITEM': return { bg: roleTint('primary'), color: 'primary.main' };
    case 'SKILL': 
    case 'HABILIDADE': return { bg: alpha(color.ap, 0.14), color: 'text.secondary' };
    case 'SPELL': return { bg: roleTint('warning'), color: 'warning.light' };
    case 'BONUS': return { bg: roleTint('success'), color: 'success.main' };
    default: return { bg: 'action.hover', color: 'text.secondary' };
    }
};

/** Traduz o tipo de perk para o rótulo exibido */
export const getPerkTypeLabel = (perkType: string) => {
    switch (perkType) {
    case 'WEAPON': return 'Arma';
    case 'ARMOR': return 'Armadura';
    case 'ITEM': return 'Item';
    case 'SKILL':
    case 'HABILIDADE': return 'Habilidade';
    case 'SPELL': return 'Magia';
    case 'BONUS': return 'Bônus';
    case 'EXPERTISE': return 'Perícia';
    default: return perkType;
    }
};
