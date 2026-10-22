import type { CharsheetDTO } from '@models/dtos';

/** Atualiza um campo aninhado (caminho com pontos, ex: 'stats.lp') nos dados em edição */
export type UpdateNestedField = (path: string, value: unknown) => void;

/** Trata o texto de um input numérico e grava o campo aninhado */
export type HandleNumberInputChange = (path: string, inputValue: string) => void;

/** Props comuns às abas do modal de detalhes da ficha */
export interface CharsheetTabProps {
    charsheet: Required<CharsheetDTO>;
    /** Dados em edição (cópia da ficha alterada pelo mestre) */
    editedData: Partial<CharsheetDTO>;
    isEditing: boolean;
    updateNestedField: UpdateNestedField;
}
