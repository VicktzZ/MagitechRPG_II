import { useSyncExternalStore } from 'react';

/**
 * Acertos críticos que ainda esperam o dano (regra do dono: o d20 natural que passa da margem marca o crítico sozinho, ver `utils/combat/critical.ts`).
 *
 * Em combate o ataque declarado ao mestre já carrega `critical`, mas fora do combate (ou sem alvo) não há ataque declarado, e a arma pode ser rolada de seções diferentes
 * (Inventário e Ações): este pequeno depósito, único na página, guarda "a última rolagem de acerto dessa arma foi crítica" para o botão de dano rolar o crítico sozinho e
 * mostrar isso. É conveniência da tela de quem joga: nunca vai ao banco e some ao recarregar.
 */

let marks: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();
const EMPTY: ReadonlySet<string> = new Set();

const emit = (): void => { listeners.forEach(listener => { listener(); }); };

/** Chave do acerto: quem rolou, de onde (arma ou magia) e o nome */
export const hitMarkKey = (charsheetId: string | undefined, source: 'weapon' | 'spell', name: string): string => `${charsheetId ?? ''}|${source}|${name}`;

/** Marca (ou desmarca) o acerto crítico da última rolagem */
export function setHitCritical(key: string, critical: boolean): void {
    if (marks.has(key) === critical) return;
    const next = new Set(marks);
    if (critical) next.add(key);
    else next.delete(key);
    marks = next;
    emit();
}

export const isHitCritical = (key: string): boolean => marks.has(key);

/** Esvazia tudo (testes e troca de personagem) */
export function resetHitCriticals(): void {
    if (marks.size === 0) return;
    marks = new Set();
    emit();
}

const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
};

/** As marcas de agora; a tela refaz quando muda alguma */
export function useHitCriticals(): ReadonlySet<string> {
    return useSyncExternalStore(subscribe, () => marks, () => EMPTY);
}
