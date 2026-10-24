import { SECONDARY_ELEMENTS, SECONDARY_ELEMENTS_UNLOCK_LEVEL } from '../constants/secondaryElements';

/** Tira acento e caixa: o banco guarda os elementos em maiúsculas (`EXPLOSÃO`) e as listas do app em título (`Explosão`) */
const normalize = (value: string): string => value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

/** Dois nomes de elemento são o mesmo? Ignora caixa e acento; nome vazio nunca é igual a nada */
export function sameElement(a: unknown, b: unknown): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const left = normalize(a);
    return left !== '' && left === normalize(b);
}

const SECONDARY_KEYS = new Set<string>(SECONDARY_ELEMENTS.map(normalize));

/** O elemento é secundário (Sangue, Vácuo, Psíquico, Radiação ou Explosão), em qualquer caixa e com ou sem acento? */
export function isSecondaryElement(element: unknown): boolean {
    return typeof element === 'string' && SECONDARY_KEYS.has(normalize(element));
}

/** A ficha desse nível já tem os elementos secundários liberados? */
export const secondaryElementsUnlocked = (level: unknown): boolean => Number(level) >= SECONDARY_ELEMENTS_UNLOCK_LEVEL;

/**
 * A magia fica escondida para a ficha desse nível: é de elemento secundário e o nível de liberação ainda não chegou.
 * Serve ao modal de magias, que não mostra essas magias de nenhuma maneira (lista, busca ou filtro) antes disso.
 */
export const isHiddenSpell = (spell: { element?: unknown }, level: unknown): boolean =>
    isSecondaryElement(spell.element) && !secondaryElementsUnlocked(level);

/** Esta subida de nível (de `oldLevel` para `newLevel`) libera os elementos secundários? Só na primeira vez que cruza o nível */
export const unlocksSecondaryElements = (oldLevel: number, newLevel: number): boolean =>
    oldLevel < SECONDARY_ELEMENTS_UNLOCK_LEVEL && newLevel >= SECONDARY_ELEMENTS_UNLOCK_LEVEL;

/** Notificação ao jogador que acabou de liberar os elementos secundários: o título e, logo abaixo, um elemento por linha */
export const secondaryElementsUnlockedNotice = (): { title: string; content: string } => ({
    title: 'Elementos secundários desbloqueados!',
    content: SECONDARY_ELEMENTS.join('\n')
});
