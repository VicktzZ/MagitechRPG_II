/**
 * Elementos secundários do RPG: Sangue, Vácuo, Psíquico, Radiação e Explosão. Os demais (Fogo, Água, Terra, Ar,
 * Eletricidade, Luz, Trevas e Não-elemental) são os primários. A lista é a mesma de `specialElements`, que os
 * filtros de magia já usavam com este nome.
 */
export const SECONDARY_ELEMENTS = [ 'Sangue', 'Vácuo', 'Psíquico', 'Radiação', 'Explosão' ] as const;

/**
 * Nível da ficha em que os elementos secundários são liberados. Antes dele as magias desses elementos não aparecem
 * em lugar nenhum do modal de magias (lista, busca, filtros), e ao chegar nele o jogador recebe um aviso.
 */
export const SECONDARY_ELEMENTS_UNLOCK_LEVEL = 10;
