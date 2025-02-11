import Chance from 'chance';
import type { Message } from '@types';

const chance = new Chance();

export interface DiceResult {
    rolls: number[];
    total: number;
    notation: string;
    operator1: { type: string; value: number } | null;
    operator2: { type: string; value: number } | null;
    subtotal: number;
    error?: string;
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

export const rollDice = (diceNotation: string): DiceResult | null => {
    // Remove todos os espaços da notação
    const cleanNotation = diceNotation.replace(/\s+/g, '');

    // Suporta: XdY, XdY+Z, XdY-Z, XdY*Z, XdY/Z, (XdY+Z)*W, (XdY+Z)/W
    const diceRegex = /(\d+)d(\d+)([-+*/](?:\d*[.,])?\d+)?([-+*/](?:\d*[.,])?\d+)?/;
    const match = cleanNotation.match(diceRegex);

    if (match) {
        const [ , numberOfDice, diceSides, operator1, operator2 ] = match;
        const diceCount = parseInt(numberOfDice);
        const sides = parseInt(diceSides);

        // Validação do número de dados
        if (diceCount > 999) {
            return {
                rolls: [],
                total: 0,
                notation: diceNotation.trim(),
                operator1: null,
                operator2: null,
                subtotal: 0,
                error: 'Número máximo de dados excedido. Use no máximo 999 dados.'
            };
        }

        // Validação de dados inválidos
        if (sides <= 0) {
            return {
                rolls: [],
                total: 0,
                notation: diceNotation.trim(),
                operator1: null,
                operator2: null,
                subtotal: 0,
                error: 'Número de faces inválido. O dado deve ter pelo menos 1 face.'
            };
        }

        const rolls = [];
        let total = 0;

        // Rola os dados
        for (let i = 0; i < diceCount; i++) {
            const roll = chance.rpg('1d' + diceSides);
            rolls.push(roll[0]);
            total += roll[0];
        }

        // Processa os operadores
        let subtotal = total;
        let finalTotal = total;
        let op1Value = 0;
        let op2Value = 0;
        let op1Type = '';
        let op2Type = '';

        const parseDecimal = (value: string) => {
            return parseFloat(value.slice(1).replace(',', '.'));
        };

        if (operator1) {
            op1Type = operator1[0];
            op1Value = parseDecimal(operator1);

            // Aplica o primeiro operador
            switch (op1Type) {
            case '+':
                subtotal = total + op1Value;
                finalTotal = Math.floor(subtotal);
                break;
            case '-':
                subtotal = total - op1Value;
                finalTotal = Math.floor(subtotal);
                break;
            case '*':
                subtotal = total;
                finalTotal = Math.floor(total * op1Value);
                break;
            case '/':
                subtotal = total;
                finalTotal = Math.floor(total / op1Value);
                break;
            }
        }

        if (operator2) {
            op2Type = operator2[0];
            op2Value = parseDecimal(operator2);

            // Aplica o segundo operador
            switch (op2Type) {
            case '*':
                finalTotal = Math.floor(subtotal * op2Value);
                break;
            case '/':
                finalTotal = Math.floor(subtotal / op2Value);
                break;
            case '+':
                if (op1Type === '*' || op1Type === '/') {
                    finalTotal = Math.floor(finalTotal + op2Value);
                }
                break;
            case '-':
                if (op1Type === '*' || op1Type === '/') {
                    finalTotal = Math.floor(finalTotal - op2Value);
                }
                break;
            }
        }

        return {
            rolls,
            total: finalTotal,
            notation: diceNotation.trim(),
            operator1: operator1 ? { type: op1Type, value: op1Value } : null,
            operator2: operator2 ? { type: op2Type, value: op2Value } : null,
            subtotal
        };
    }

    return null;
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
            by: user,
            timestamp: new Date()
        };
    }

    let resultText = formatRolls(diceResult.rolls, diceResult.notation);

    if (diceResult.operator1) {
        const { type, value } = diceResult.operator1;
        resultText += ` ${type} ${value}`;

        if (diceResult.operator2) {
            const op2 = diceResult.operator2;
            resultText += ` ${op2.type} ${op2.value}`;
        }

        resultText += ` = ${diceResult.total}`;
    } else {
        resultText += ` = ${diceResult.total}`;
    }

    return {
        text: `🎲 Rolou ${diceResult.notation}: ${resultText}`,
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
            return [{
                text: `❌ Erro ao rolar ${cleanNotation}: Máximo de 99 dados em sequência permitido.`,
                by: user,
                timestamp: new Date()
            }];
        }
    }
    
    const diceResult = rollDice(cleanNotation);

    if (diceResult) {
        // Se houver erro, retorna apenas a mensagem de erro
        if (diceResult.error) {
            return [{
                text: `❌ Erro ao rolar ${diceResult.notation}: ${diceResult.error}`,
                by: user,
                timestamp: new Date()
            }];
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
