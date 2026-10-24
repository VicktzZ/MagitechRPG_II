/**
 * Diferença entre dois textos por palavra, para mostrar o que a magia ganha de um estágio para o seguinte.
 * Só marca o que há de novo no texto atual (palavras que não estavam no anterior, na mesma ordem); o que saiu não aparece.
 */

export interface DiffSegment {
    text: string;
    /** Trecho novo ou alterado em relação ao texto anterior */
    changed: boolean;
}

export interface TextDiff {
    segments: DiffSegment[];
    /** Quantas palavras do texto atual são novas ou alteradas */
    changedWords: number;
    /** O estágio foi reescrito (quase nada em comum): destacar tudo seria só ruído, então nada é marcado */
    rewritten: boolean;
}

/** Acima disto o cálculo por palavra fica caro e o texto é longo demais para um destaque útil */
const MAX_WORDS = 500;

/** Mais que esta fração de palavras novas conta como texto reescrito */
const REWRITTEN_RATIO = 0.7;

/** Palavra para comparar: sem caixa e sem pontuação nas pontas ("fogo," = "Fogo"), mas "2d6" e "3d6" continuam diferentes */
const wordKey = (word: string): string => word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '') || word.toLowerCase();

const plain = (text: string): TextDiff => ({ segments: text ? [ { text, changed: false } ] : [], changedWords: 0, rewritten: false });

/** Maior subsequência comum entre as palavras: devolve, para cada palavra do texto atual, se ela veio do anterior */
function matchedWords(previous: string[], current: string[]): boolean[] {
    const rows = previous.length + 1;
    const cols = current.length + 1;
    const table = Array.from({ length: rows }, () => new Uint16Array(cols));

    for (let i = previous.length - 1; i >= 0; i--) {
        for (let j = current.length - 1; j >= 0; j--) {
            table[i]![j] = previous[i] === current[j]
                ? table[i + 1]![j + 1]! + 1
                : Math.max(table[i + 1]![j]!, table[i]![j + 1]!);
        }
    }

    const matched = new Array<boolean>(current.length).fill(false);
    let i = 0;
    let j = 0;
    while (i < previous.length && j < current.length) {
        if (previous[i] === current[j]) {
            matched[j] = true;
            i++;
            j++;
        } else if (table[i + 1]![j]! >= table[i]![j + 1]!) {
            i++;
        } else {
            j++;
        }
    }
    return matched;
}

export function diffAgainst(previous: string | null | undefined, current: string | null | undefined): TextDiff {
    const now = current ?? '';
    const before = previous ?? '';
    if (!now.trim() || !before.trim()) return plain(now);

    // Pedaços alternados: palavra, espaço, palavra... (o espaço volta junto, para o texto sair idêntico ao original)
    const pieces = now.split(/(\s+)/);
    const wordIndexes = pieces.map((piece, index) => (piece && !/^\s+$/.test(piece) ? index : -1)).filter(index => index >= 0);
    const previousWords = before.split(/\s+/).filter(Boolean).map(wordKey);
    const currentWords = wordIndexes.map(index => wordKey(pieces[index]!));
    if (currentWords.length > MAX_WORDS || previousWords.length > MAX_WORDS) return plain(now);

    const matched = matchedWords(previousWords, currentWords);
    const changedWords = matched.filter(isMatched => !isMatched).length;
    if (changedWords === 0) return { ...plain(now), changedWords: 0 };
    if (changedWords / currentWords.length > REWRITTEN_RATIO) return { ...plain(now), changedWords, rewritten: true };

    // Une palavras novas vizinhas (e o espaço entre elas) num só trecho marcado
    const changedAt = new Map<number, boolean>();
    wordIndexes.forEach((pieceIndex, order) => changedAt.set(pieceIndex, !matched[order]));

    const segments: DiffSegment[] = [];
    const push = (text: string, changed: boolean): void => {
        const last = segments[segments.length - 1];
        if (last && last.changed === changed) last.text += text;
        else segments.push({ text, changed });
    };

    pieces.forEach((piece, index) => {
        if (!piece) return;
        if (changedAt.has(index)) {
            push(piece, changedAt.get(index) === true);
            return;
        }
        // Espaço entre duas palavras novas faz parte do trecho marcado; nas demais posições fica sem marca
        const betweenChanged = changedAt.get(index - 1) === true && changedAt.get(index + 1) === true;
        push(piece, betweenChanged);
    });

    return { segments, changedWords, rewritten: false };
}
