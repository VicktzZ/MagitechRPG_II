import { Typography } from '@mui/material'
import type { Message } from '@types'
import { MessageType } from '@enums'

interface DiceMessageProps {
    text: string
    type?: MessageType
}

export function DiceMessage({ text, type }: DiceMessageProps) {
    // Se não for mensagem de dados ou perícia, retorna texto normal
    if (!text.startsWith('🎲')) {
        return <Typography>{text}</Typography>
    }

    // Remove o emoji de dado do início
    const messageText = text.substring(2).trim()

    // Se for mensagem de perícia
    if (type === MessageType.EXPERTISE) {
        // Tenta primeiro o formato completo com nome da perícia
        let match = messageText.match(/(.+?)\s+-\s+(\d*d\d+)([+-]\d+)?:\s+\[([^\]]+)\]\s*=\s*(\d+)/i)
        
        // Se não encontrar, tenta o formato simples
        if (!match) {
            match = messageText.match(/(\d*d\d+)([+-]\d+)?:\s+\[([^\]]+)\]\s*=\s*(\d+)/i)
            if (!match) return <Typography>{text}</Typography>

            // Reorganiza o match para ter o mesmo formato
            const [, dice, bonus, roll, total] = match
            match = [null, '', dice, bonus, roll, total]
        }

        const [, expertiseName, dice, bonus, rollPart, total] = match
        
        // Extrai os rolls e o resultado final
        let rolls: number[] = []
        let finalRoll: number
        
        if (rollPart.includes(':')) {
            // Caso de múltiplos dados
            const [allRolls, final] = rollPart.split(':').map(s => s.trim())
            rolls = allRolls.split(',').map(r => parseInt(r.trim()))
            finalRoll = parseInt(final)
        } else {
            // Caso de um único dado
            finalRoll = parseInt(rollPart)
            rolls = [finalRoll]
        }

        // Determina a cor baseada no valor do bônus
        let expertiseColor = '#9e9e9e' // grey[500]
        const bonusValue = bonus ? parseInt(bonus.replace(/[+]/, '')) : 0
        
        if (bonusValue >= 9) {
            expertiseColor = '#ffeb3b' // yellow[500]
        } else if (bonusValue >= 7) {
            expertiseColor = '#9c27b0' // purple[500]
        } else if (bonusValue >= 5) {
            expertiseColor = '#2196f3' // blue[500]
        } else if (bonusValue >= 2) {
            expertiseColor = '#4caf50' // green[500]
        }

        // Formata os números com cores individuais
        const formattedRolls = rolls.map((roll, index) => (
            <span key={index} style={{ 
                color: roll === 1 ? '#f44336' : 
                       roll === 20 ? '#4CAF50' : 
                       'inherit'
            }}>
                {roll}{index < rolls.length - 1 ? ', ' : ''}
            </span>
        ))

        return (
            <Typography>
                {expertiseName && (
                    <>
                        <span style={{ color: expertiseColor, fontWeight: 'bold' }}>
                            {expertiseName}
                        </span>
                        {' - '}
                    </>
                )}
                {dice}{bonus || ''}: {' '}
                [{formattedRolls}]
                {' = '}{total}
            </Typography>
        )
    }

    // Para outras mensagens de dados (não perícia)
    const notationMatch = messageText.match(/(\d*d\d+)([+-]\d+)?/i)
    if (!notationMatch) return <Typography>{text}</Typography>

    const resultMatch = messageText.match(/\[(\d+)\]\s*=\s*(\d+)/)
    if (!resultMatch) return <Typography>{text}</Typography>

    const roll = parseInt(resultMatch[1])
    const total = parseInt(resultMatch[2])

    return (
        <Typography>
            {notationMatch[1]}{notationMatch[2] || ''}: {' '}
            <span style={{ 
                color: roll === 20 ? '#4CAF50' : 
                       roll === 1 ? '#f44336' : 
                       'inherit'
            }}>
                [{roll}]
            </span>
            {' = '}{total}
        </Typography>
    )
}
