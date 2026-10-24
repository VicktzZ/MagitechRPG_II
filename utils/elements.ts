import { SECONDARY_ELEMENTS } from '../constants/secondaryElements';

/** Texto curto para marcar um elemento secundário (selo, dica de filtro) */
export const SECONDARY_ELEMENT_LABEL = 'Secundário';

/** A regra, por extenso, para onde cabe uma explicação */
export const SECONDARY_ELEMENTS_RULE = `${SECONDARY_ELEMENTS.slice(0, -1).join(', ')} e ${SECONDARY_ELEMENTS[SECONDARY_ELEMENTS.length - 1]} são elementos secundários.`;

/** Tira acento e caixa: o banco guarda os elementos em maiúsculas (`EXPLOSÃO`) e as listas do app em título (`Explosão`) */
const normalize = (value: string): string => value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

const SECONDARY_KEYS = new Set<string>(SECONDARY_ELEMENTS.map(normalize));

/** O elemento é secundário (Sangue, Vácuo, Psíquico, Radiação ou Explosão), em qualquer caixa e com ou sem acento? */
export function isSecondaryElement(element: unknown): boolean {
    return typeof element === 'string' && SECONDARY_KEYS.has(normalize(element));
}

/** Observação para as listas de elementos (filtros de magia): "secundário" ao lado dos secundários, nada nos demais */
export const elementHint = (element: string): string | undefined => (isSecondaryElement(element) ? SECONDARY_ELEMENT_LABEL.toLowerCase() : undefined);
