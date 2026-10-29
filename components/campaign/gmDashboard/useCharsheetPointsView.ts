import { useCharsheetSystem } from '@hooks/useCharsheetSystem';
import type { CharsheetDTO } from '@models/dtos';

/**
 * Como a ficha mostra LP, MP e AP: sistemas customizados podem desligá-los e dar outro nome
 * (mesma regra do cabeçalho do jogador). Usado pelo cartão do jogador, pela barra do grupo e pelas janelas.
 */
export function useCharsheetPointsView(charsheet: Pick<CharsheetDTO, 'systemId'>) {
    const { system: customSystem } = useCharsheetSystem(charsheet.systemId);

    return {
        customSystem,
        weightUnit: customSystem ? (customSystem.weightConfig?.unit ?? '') : 'kg',
        hasLP: !customSystem || (customSystem.pointsConfig?.hasLP ?? customSystem.initialFields?.life?.enabled ?? true),
        hasMP: !customSystem || (customSystem.pointsConfig?.hasMP ?? customSystem.initialFields?.mana?.enabled ?? true),
        hasAP: !customSystem || (customSystem.pointsConfig?.hasAP ?? customSystem.initialFields?.armor?.enabled ?? true),
        lpName: customSystem?.pointsConfig?.lpName || customSystem?.initialFields?.life?.label || 'Vida',
        mpName: customSystem?.pointsConfig?.mpName || customSystem?.initialFields?.mana?.label || 'Mana',
        apName: customSystem?.pointsConfig?.apName || customSystem?.initialFields?.armor?.label || 'Armadura'
    };
}
