import { Typography } from '@mui/material';

interface DiceMessageProps {
    text: string;
}

export function DiceMessage({ text }: DiceMessageProps) {
    // Verifica se é uma mensagem de dados
    if (!text.startsWith('🎲 Rolou')) {
        return <Typography>{text}</Typography>;
    }

    // Extrai a notação dos dados (ex: 1d20)
    const notationMatch = text.match(/Rolou\s+(\d*d\d+)/i);
    const isD20 = notationMatch?.[1].toLowerCase().match(/^\d*d20$/);

    if (!isD20) {
        return <Typography>{text}</Typography>;
    }

    // Encontra os números rolados entre colchetes
    const rollsRegex = /\[(\d+)\]/g;
    let lastIndex = 0;
    const parts = [];
    let match;

    while ((match = rollsRegex.exec(text)) !== null) {
        // Adiciona o texto antes do número
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }

        // Formata o número com a cor apropriada
        const roll = parseInt(match[1]);
        if (roll === 20) {
            parts.push(<span key={match.index} style={{ color: '#4CAF50' }}>[{roll}]</span>);
        } else if (roll === 1) {
            parts.push(<span key={match.index} style={{ color: '#f44336' }}>[{roll}]</span>);
        } else {
            parts.push(<span key={match.index}>[{roll}]</span>);
        }

        lastIndex = match.index + match[0].length;
    }

    // Adiciona o resto do texto
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return <Typography>{parts}</Typography>;
}
