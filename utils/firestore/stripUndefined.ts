/**
 * Remove recursivamente propriedades com valor `undefined` de objetos e arrays.
 *
 * Motivação: Firestore REJEITA valores `undefined` ao escrever
 *   (`Value for argument "data" is not a valid Firestore document. Cannot use "undefined" ...`).
 * Nossas entities têm vários campos opcionais que podem ser `undefined` quando o usuário
 * não preenche (description, modifiers, element, campaignId, ...).
 *
 * Esta função normaliza recursivamente:
 *  - objetos: omite chaves cujo valor é `undefined`
 *  - arrays: remove entradas `undefined` (não usa `null`, que o JSON.stringify produziria)
 *  - primitivos: retornados como são
 *  - `null`: preservado (é válido no Firestore)
 *
 * Não usa `JSON.parse(JSON.stringify(...))` porque converteria `undefined` em arrays
 * para `null` e perderia datas/classes (aqui usamos tudo string/number, mas a função
 * deixa o tratamento explícito e menos frágil).
 */
export function stripUndefined<T>(value: T): T {
    if (Array.isArray(value)) {
        return value
            .filter(v => v !== undefined)
            .map(v => stripUndefined(v)) as unknown as T
    }

    if (value !== null && typeof value === 'object') {
        const out: Record<string, any> = {}
        for (const key of Object.keys(value as Record<string, any>)) {
            const v = (value as Record<string, any>)[key]
            if (v === undefined) continue
            out[key] = stripUndefined(v)
        }
        return out as T
    }

    return value
}
