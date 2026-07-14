import { useRef } from 'react';

/**
 * Preserva a identidade referencial de um valor entre renders enquanto seu
 * conteúdo (comparado por JSON) não mudar. Essencial para dados vindos de
 * snapshots do Firestore, que sempre criam novos objetos/arrays mesmo quando
 * nada mudou — sem isso, todo snapshot invalida memos e re-renderiza
 * consumidores de contexto em cascata.
 */
export function useStableValue<T>(value: T): T {
    const ref = useRef<{ lastInput: T; value: T; serialized: string }>();

    // Fast path: mesma referência de entrada → não re-serializa
    if (ref.current && ref.current.lastInput === value) {
        return ref.current.value;
    }

    const serialized = JSON.stringify(value) ?? '';
    if (!ref.current || ref.current.serialized !== serialized) {
        ref.current = { lastInput: value, value, serialized };
    } else {
        ref.current.lastInput = value;
    }

    return ref.current.value;
}

/**
 * Estabiliza um array item a item: mantém a referência anterior de cada item
 * cujo conteúdo não mudou (comparado por JSON, indexado por `keyOf`), e a
 * referência do próprio array quando nenhum item mudou de conteúdo nem de
 * posição. Permite que `React.memo` em filhos (ex: um card por jogador)
 * pule renders quando só OUTRO item mudou.
 */
export function useStableArrayItems<T>(items: T[], keyOf: (item: T) => string): T[] {
    const itemsRef = useRef<Map<string, { item: T; serialized: string }>>(new Map());
    const resultRef = useRef<{ lastInput: T[]; result: T[] }>({ lastInput: [], result: [] });

    // Fast path: mesma referência de entrada → mesmo resultado
    if (resultRef.current.lastInput === items) {
        return resultRef.current.result;
    }

    const next = new Map<string, { item: T; serialized: string }>();
    const result = items.map(item => {
        const key = keyOf(item);
        const serialized = JSON.stringify(item) ?? '';
        const prev = itemsRef.current.get(key);

        if (prev && prev.serialized === serialized) {
            next.set(key, prev);
            return prev.item;
        }
        const entry = { item, serialized };
        next.set(key, entry);
        return item;
    });
    itemsRef.current = next;

    // Preserva a identidade do array se todos os itens são os mesmos, na mesma ordem
    const prevResult = resultRef.current.result;
    const sameArray = result.length === prevResult.length && result.every((item, i) => item === prevResult[i]);

    resultRef.current = { lastInput: items, result: sameArray ? prevResult : result };
    return resultRef.current.result;
}
