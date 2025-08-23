/* eslint-disable @typescript-eslint/no-use-before-define */
import Chance from 'chance';
import type { Message } from '@types';
import { MessageType } from '@enums';

const chance = new Chance();

export interface DiceResult {
    rolls: number[]; // Para casos simples XdY, mantido por compatibilidade
    total: number;
    notation: string;
    operator1: { type: string; value: number } | null; // legado
    operator2: { type: string; value: number } | null; // legado
    subtotal: number; // legado
    error?: string;
    // Novo: quando a expressão for complexa, usamos esta string para exibir o detalhamento
    display?: string;
}

const formatD20Roll = (roll: number): string => {
    if (roll === 20) return `[${roll}]`;
    if (roll === 1) return `[${roll}]`;
    return `[${roll}]`;
};

const formatRolls = (rolls: number[], notation: string): string => {
    // Verifica se é uma rolagem de d20
    const isD20 = notation.toLowerCase().match(/^\d*d20$/);
    
    if (isD20) {
        return rolls.map(roll => formatD20Roll(roll)).join(', ');
    }
    
    return `[${rolls.join(', ')}]`;
};

// Parser recursivo para expressões com dados e números
// Suporta + - * / e parênteses, termos de dados NdM (N, M até 999), inteiros e decimais
const evalDiceExpr = (expr: string): { total: number; display: string } => {
    const s = expr.replace(/\s+/g, '');
    let i = 0;

    const peek = () => s[i] ?? '';
    const next = () => s[i++] ?? '';

    const parseNumber = (): string => {
        let num = '';
        while (/\d|[.]/.test(peek())) num += next();
        return num;
    };

    const parseDice = (): { total: number; disp: string } => {
        // N d M
        const nStr = parseNumber();
        if (peek().toLowerCase() !== 'd') throw new Error('Esperado d em termo de dado');
        next(); // consume 'd'
        const mStr = parseNumber();
        const n = Math.min(parseInt(nStr || '1'), 999);
        const m = Math.min(parseInt(mStr || '0'), 100000);
        if (!m || m <= 0) throw new Error('Faces inválidas no dado');
        const rolls: number[] = [];
        let total = 0;
        for (let k = 0; k < n; k++) {
            const r = chance.rpg('1d' + m)[0];
            rolls.push(r);
            total += r;
        }
        return { total, disp: `[${rolls.join(', ')}]` };
    };

    function parseFactor(): { total: number; disp: string } {
        if (peek() === '(') {
            next();
            const inner = parseExpr();
            if (next() !== ')') throw new Error('Parêntese não fechado');
            return { total: inner.total, disp: `(${inner.disp})` };
        }
        // número, dado ou número seguido de d (dado)
        if (/\d/.test(peek())) {
            const start = i;
            const numStr = parseNumber();
            if (peek().toLowerCase() === 'd') {
                // é um dado NdM, precisamos voltar para incluir N
                i = start; // reset para reprocessar como dado
                const d = parseDice();
                return { total: d.total, disp: d.disp };
            }
            const val = Math.floor(parseFloat(numStr));
            return { total: val, disp: `${val}` };
        }
        throw new Error('Fator inválido na expressão');
    };

    function parseTerm(): { total: number; disp: string } {
        let left = parseFactor();
        while (peek() === '*' || peek() === '/') {
            const op = next();
            const right = parseFactor();
            if (op === '*') {
                left = { total: Math.floor(left.total * right.total), disp: `${left.disp} * ${right.disp}` };
            } else {
                const denom = right.total || 1;
                left = { total: Math.floor(left.total / denom), disp: `${left.disp} / ${right.disp}` };
            }
        }
        return left;
    };

    function parseExpr(): { total: number; disp: string } {
        let left = parseTerm();
        while (peek() === '+' || peek() === '-') {
            const op = next();
            const right = parseTerm();
            if (op === '+') {
                left = { total: left.total + right.total, disp: `${left.disp} + ${right.disp}` };
            } else {
                left = { total: left.total - right.total, disp: `${left.disp} - ${right.disp}` };
            }
        }
        return left;
    };

    const res = parseExpr();
    if (i < s.length) throw new Error('Expressão inválida');
    return { total: res.total, display: res.disp };
};

export const rollDice = (diceNotation: string): DiceResult | null => {
    const notation = diceNotation.trim();
    const clean = notation.replace(/\s+/g, '');

    // Se não for uma expressão pura de dados, não tenta avaliar (deixa o chamador decidir como enviar)
    const isPureDiceExpr = /^[\d()d\-+*/.,]+$/i.test(clean)
    if (!isPureDiceExpr) {
        return null
    }

    try {
        // Avalia expressão completa (inclui casos simples)
        const { total, display } = evalDiceExpr(clean);

        // Tenta extrair um único termo XdY simples para preencher rolls (compatibilidade)
        const simple = clean.match(/^\(?\s*(\d+)d(\d+)\s*\)?$/i);
        const rolls: number[] = [];
        if (simple) {
            const count = parseInt(simple[1]);
            const sides = parseInt(simple[2]);
            for (let i = 0; i < count; i++) {
                rolls.push(chance.rpg('1d' + sides)[0]);
            }
        }

        return {
            rolls,
            total,
            notation,
            operator1: null,
            operator2: null,
            subtotal: total,
            display
        };
    } catch (e) {
        return {
            rolls: [],
            total: 0,
            notation,
            operator1: null,
            operator2: null,
            subtotal: 0,
            error: (e as Error).message || 'Expressão inválida'
        };
    }
};

export const createDiceMessage = (
    diceResult: DiceResult | null,
    user: { id: string; image: string; name: string }
): Message & { isHTML?: boolean } | null => {
    if (!diceResult) return null;

    // Se houver erro, retorna a mensagem de erro
    if (diceResult.error) {
        return {
            text: `❌ Erro ao rolar ${diceResult.notation}: ${diceResult.error}`,
            type: MessageType.ERROR,
            by: user,
            timestamp: new Date()
        };
    }

    // Usa display quando disponível (expressões complexas). Caso contrário, mantém formato antigo
    const resultText = diceResult.display
        ? `${diceResult.display} = ${diceResult.total}`
        : `${formatRolls(diceResult.rolls, diceResult.notation)} = ${diceResult.total}`;

    return {
        text: `🎲 ${diceResult.notation}: ${resultText}`,
        type: MessageType.ROLL,
        by: user,
        timestamp: new Date(),
        isHTML: true
    };
};

export const rollSeparateDice = (
    diceNotation: string,
    user: { id: string; image: string; name: string }
): Message[] | null => {
    const cleanNotation = diceNotation.substring(1).trim(); // Remove o # e espaços
    
    // Validação do número de dados em sequência
    const numberOfDiceMatch = cleanNotation.match(/^(\d+)d/);
    if (numberOfDiceMatch) {
        const numberOfDice = parseInt(numberOfDiceMatch[1]);
        if (numberOfDice > 99) {
            return [ {
                text: `❌ Erro ao rolar ${cleanNotation}: Máximo de 99 dados em sequência permitido.`,
                type: MessageType.ERROR,
                by: user,
                timestamp: new Date()
            } ];
        }
    }
    
    const diceResult = rollDice(cleanNotation);

    if (diceResult) {
        // Se houver erro, retorna apenas a mensagem de erro
        if (diceResult.error) {
            return [ {
                text: `❌ Erro ao rolar ${diceResult.notation}: ${diceResult.error}`,
                type: MessageType.ERROR,
                by: user,
                timestamp: new Date()
            } ];
        }

        // Remove espaços antes de fazer o split
        const cleanForSplit = cleanNotation.replace(/\s+/g, '');
        const numberOfDice = parseInt(cleanForSplit.split('d')[0]);
        const remainingNotation = cleanForSplit.split('d')[1];
        const diceSides = remainingNotation.split(/[-+*/]/)[0];
        const operators = cleanForSplit.match(/[-+*/](?:\d*[.,])?\d+/g)?.join('') ?? '';

        const separateResults = [];

        for (let i = 0; i < numberOfDice; i++) {
            const singleRoll = rollDice(`1d${diceSides}${operators}`);
            if (singleRoll) {
                const message = createDiceMessage(singleRoll, user);
                if (message) {
                    separateResults.push(message);
                }
            }
        }

        return separateResults;
    }

    return null;
};
