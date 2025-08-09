/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-shadow */

import { Box, Chip, Collapse, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { MessageType } from '@enums'
import { Casino, ExpandMore } from '@mui/icons-material'
import { useState } from 'react'

interface DiceMessageProps {
    text: string
    type?: MessageType
}

export function DiceMessage({ text, type }: DiceMessageProps) {
    const [ open, setOpen ] = useState(false)

    // Se for mensagem HTML ou não começar com emoji de dado, exibe texto simples
    if (!text.startsWith('🎲')) {
        return <Typography>{text}</Typography>
    }

    // Remove o emoji de dado do início
    const messageText = text.substring(2).trim()

    // Caso 1: Mensagens de perícia (mantém suporte anterior)
    if (type === MessageType.EXPERTISE) {
        let match: any = messageText.match(/(.+?)\s+-\s+(\d*d\d+)([+-]\d+)?:\s+\[([^\]]+)\]\s*=\s*(\d+)/i)
        if (!match) {
            match = messageText.match(/(\d*d\d+)([+-]\d+)?:\s+\[([^\]]+)\]\s*=\s*(\d+)/i)
            if (!match) return <Typography>{text}</Typography>
            const [ , dice, bonus, roll, total ] = match
            match = [ null, '', dice, bonus, roll, total ]
        }

        const [ , expertiseName, dice, bonus, rollPart, total ] = match
        let rolls: number[] = []
        let finalRoll: number
        if (rollPart.includes(':')) {
            const [ allRolls, final ] = rollPart.split(':').map((s: string) => s.trim())
            rolls = allRolls.split(',').map((r: string) => parseInt(r.trim()))
            finalRoll = parseInt(final)
        } else {
            finalRoll = parseInt(rollPart)
            rolls = [ finalRoll ]
        }

        const bonusValue = bonus ? parseInt(bonus.replace(/[+]/, '')) : 0
        const expertiseColor = bonusValue >= 9 ? '#ffeb3b' : bonusValue >= 7 ? '#9c27b0' : bonusValue >= 5 ? '#2196f3' : bonusValue >= 2 ? '#4caf50' : '#9e9e9e'

        const formattedRolls = rolls.map((r, i) => (
            <span key={i} style={{ color: r === 1 ? '#f44336' : r === 20 ? '#4CAF50' : 'inherit' }}>
                {r}{i < rolls.length - 1 ? ', ' : ''}
            </span>
        ))

        return (
            <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Casino fontSize="small" />
                    {expertiseName && (
                        <Typography component="span" fontWeight={700} sx={{ color: expertiseColor }}>
                            {expertiseName}
                        </Typography>
                    )}
                    <Typography component="span" fontWeight={600}>{dice}{bonus || ''}</Typography>
                    <Box flex={1} />
                    <Chip size="small" label={`Total ${total}`} color="primary" variant="outlined" />
                </Stack>
                <Typography variant="body2">
                    [{formattedRolls}] = {total}
                </Typography>
            </Stack>
        )
    }

    // Caso 2: Mensagem de rolagem multiline gerada pelo useCustomDices
    // Formato esperado:
    // **Nome** (XdY + ...)
    // Modificadores: +N NAME ... (opcional)
    // Rolagens: [a, b, c]
    // Total: **Z**
    const lines = messageText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

    // Header: **Nome** (notação)
    const header = lines[0] || ''
    const headerMatch = header.match(/\*\*(.+?)\*\*\s*\((.+?)\)/)
    const name = headerMatch?.[1] ?? 'Rolagem'
    const notation = headerMatch?.[2] ?? ''

    // Modificadores (opcional)
    const modsLine = lines.find(l => l.toLowerCase().startsWith('modificadores:'))
    const modsRaw = modsLine ? modsLine.replace(/^modificadores:\s*/i, '') : ''
    // Tenta quebrar em pares "+N Nome"; nomes sem espaço esperado (ex.: LOG, Bônus)
    const modsTokens = modsRaw.split(/\s+/).filter(Boolean)
    const modifiers: Array<{ value: number, name: string }> = []
    for (let i = 0; i < modsTokens.length; i++) {
        const val = parseInt(modsTokens[i])
        if (!Number.isNaN(val) || /^[+-]\d+$/.test(modsTokens[i])) {
            const value = Number(modsTokens[i])
            const name = modsTokens[i + 1] || ''
            modifiers.push({ value, name })
            i += 1
        }
    }

    // Rolagens
    const rollsLine = lines.find(l => l.toLowerCase().startsWith('rolagens:')) || ''
    const rollsMatch = rollsLine.match(/\[([^\]]+)\]/)
    const rolls = rollsMatch ? rollsMatch[1].split(',').map(s => parseInt(s.trim())) : []

    // Total
    const totalLine = lines.find(l => l.toLowerCase().startsWith('total:')) || ''
    const totalMatch = totalLine.match(/\*\*(\d+)\*\*/)
    const total = totalMatch ? parseInt(totalMatch[1]) : undefined

    const best = rolls.length ? Math.max(...rolls) : undefined
    const worst = rolls.length ? Math.min(...rolls) : undefined
    const avg = rolls.length ? (rolls.reduce((a, b) => a + b, 0) / rolls.length).toFixed(1) : undefined

    return (
        <Box>
            {/* Cabeçalho compacto */}
            <Stack direction="row" alignItems="center" spacing={1}>
                <Casino fontSize="small" />
                <Typography component="span" fontWeight={700}>{name}</Typography>
                {notation && (
                    <Typography component="span" color="text.secondary">({notation})</Typography>
                )}
                <Box flex={1} />
                {typeof total === 'number' && (
                    <Chip size="small" color="primary" label={`Total ${total}`} />
                )}
                <Tooltip title={open ? 'Ocultar detalhes' : 'Ver detalhes'}>
                    <IconButton size="small" onClick={() => setOpen(v => !v)}>
                        <ExpandMore sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Detalhes colapsáveis */}
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Divider sx={{ my: 1 }} />
                {!!modifiers.length && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                        {modifiers.map((m, i) => (
                            <Chip key={i} size="small" variant="outlined" color={m.value >= 0 ? 'success' : 'error'} label={`${m.value >= 0 ? '+' : ''}${m.value} ${m.name}`} />
                        ))}
                    </Stack>
                )}
                {!!rolls.length && (
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="body2">Rolagens:</Typography>
                        {rolls.map((r, i) => (
                            <Chip
                                key={i}
                                size="small"
                                label={r}
                                sx={{
                                    bgcolor: r === best ? 'success.main' : r === worst ? 'error.main' : 'action.selected',
                                    color: r === best || r === worst ? 'common.white' : 'text.primary'
                                }}
                            />
                        ))}
                        {avg && (
                            <Chip size="small" variant="outlined" label={`Média ${avg}`} />
                        )}
                    </Stack>
                )}
            </Collapse>
        </Box>
    )
}
