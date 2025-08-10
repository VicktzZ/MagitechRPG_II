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
            <Box sx={{ wordBreak: 'break-word' }}>
                {/* Título acima, completo */}
                {!!expertiseName && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Casino fontSize="small" />
                        <Typography variant="subtitle2" fontWeight={700}>{expertiseName}</Typography>
                    </Stack>
                )}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                    {/* Expressão em cinza no cabeçalho */}
                    <Typography component="span" color="text.secondary" noWrap sx={{ minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '60%' }}>
                        ({`${dice}${bonus || ''}`})
                    </Typography>
                    <Box flex={1} />
                    <Chip size="small" label={`Total ${total}`} color="primary" variant="contained" />
                    <Tooltip title={open ? 'Ocultar detalhes' : 'Ver detalhes'}>
                        <IconButton size="small" onClick={() => setOpen(v => !v)}>
                            <ExpandMore sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
                        </IconButton>
                    </Tooltip>
                </Stack>

                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 1 }} />
                    {!!rolls.length && (
                        <Stack spacing={1}>
                            <Typography variant="body2" fontWeight={700}>Rolagens:</Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {rolls.map((n, i) => (
                                    <Chip key={i} size="small" label={n} color={n === 20 ? 'success' : (n === 1 ? 'error' : 'default')} />
                                ))}
                            </Stack>
                        </Stack>
                    )}
                    {/* Subtotal/Média por último */}
                    {(rolls.length > 0) && (
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                            <Chip size="small" label={`Subtotal ${rolls.reduce((a, b) => a + b, 0)}`} />
                            <Chip size="small" label={`Média ${(rolls.reduce((a, b) => a + b, 0) / rolls.length).toFixed(2)}`} />
                        </Stack>
                    )}
                </Collapse>
            </Box>
        )
    }

    // Caso 2: Mensagem de rolagem multiline gerada pelo useCustomDices
    // Formato esperado:
    // **Nome** (XdY + ...)
    // Modificadores: +N NAME ... (opcional)
    // Rolagens: [a, b, c]
    // Total: **Z**
    const lines = messageText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

    // Caso 2.a: Linha única (mensagens manuais/antigas do diceRoller)
    if (lines.length === 1) {
        // Exemplos aceitos:
        // "1d20: [15] = 15"
        // "3d6+2: [1, 3, 5] + 2 = 11"
        // "2d20: [5], [18] = 23" (d20 vem como múltiplos [x] separados por vírgula)
        const single = lines[0]
        const headerAlt = single.match(/^(.+?):\s*(.+)$/)
        const notation = headerAlt?.[1] ?? ''
        const rest = headerAlt?.[2] ?? single

        // Captura cada grupo de rolagens entre colchetes na ordem
        const groupMatches = Array.from(rest.matchAll(/\[([^\]]+)\]/g)).map(m => m[1])
        const groups: number[][] = groupMatches.map(g => g.split(',').map(s => parseInt(s.trim())).filter(n => !Number.isNaN(n)))

        // Coleção total para melhor/pior, média e subtotal
        const rollNums: number[] = groups.flat()
        const subtotal = rollNums.reduce((acc, n) => acc + n, 0)
        const avg = rollNums.length ? (subtotal / rollNums.length) : undefined

        // Se não conseguiu por grupos (ex.: nenhum colchete), tenta fallback antigo
        if (!groups.length) {
            const flatFallback: number[] = Array.from(rest.matchAll(/\[(\d+)\]/g)).map(m => parseInt(m[1]))
            if (flatFallback.length) groups.push(flatFallback)
        }

        // Operadores após as rolagens
        const operators = Array.from(rest.matchAll(/([+\-*/])\s*([0-9]+(?:[.,][0-9]+)?)/g)).map(m => ({
            type: m[1] as '+' | '-' | '*' | '/',
            value: m[2]
        }))

        // Total final
        const totalMatch = rest.match(/=\s*(\d+)/)
        const total = totalMatch ? parseInt(totalMatch[1]) : undefined

        const best = rollNums.length ? Math.max(...rollNums) : undefined
        const worst = rollNums.length ? Math.min(...rollNums) : undefined

        const palette = [ 'primary', 'secondary', 'success', 'warning', 'info', 'error' ] as const

        return (
            <Box sx={{ wordBreak: 'break-word' }}>
                {/* Título acima, completo */}
                {!!notation && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Casino fontSize="small" />
                        <Typography variant="subtitle2" fontWeight={700}>{'Rolagem'}</Typography>
                    </Stack>
                )}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                    {/* Expressão em cinza no cabeçalho */}
                    {notation && (
                        <Typography component="span" color="text.secondary" noWrap sx={{ minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '60%' }}>({notation.replace(/\s+/g, '')})</Typography>
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

                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 1 }} />
                    {!!notation && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Expressão:</strong> <span style={{ fontFamily: 'monospace' }}>{notation.replace(/\s+/g, '')}</span>
                        </Typography>
                    )}
                    {!!groups.length && (
                        <Stack spacing={1}>
                            <Typography variant="body2" fontWeight={700}>Rolagens:</Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                                {groups.map((g, idx) => (
                                    <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                                        {g.map((n, i) => (
                                            <Chip key={i} size="small" color={palette[idx % palette.length]} label={n} variant={(best === n || worst === n) ? 'filled' : 'outlined'} />
                                        ))}
                                    </Stack>
                                ))}
                            </Stack>
                        </Stack>
                    )}
                    {!!operators.length && (
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                            <Typography variant="body2" fontWeight={700}>Operadores:</Typography>
                            {operators.map((op, i) => (
                                <Chip key={i} size="small" label={`${op.type} ${op.value}`} />
                            ))}
                        </Stack>
                    )}
                    {(rollNums.length > 0) && (
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                            <Chip size="small" label={`Subtotal ${rollNums.reduce((a, b) => a + b, 0)}`} />
                            <Chip size="small" label={`Média ${(rollNums.reduce((a, b) => a + b, 0) / rollNums.length).toFixed(2)}`} />
                        </Stack>
                    )}
                </Collapse>
            </Box>
        )
    }

    // Header: **Nome** (notação)
    const header = lines[0] || ''
    const headerMatch = header.match(/\*\*(.+?)\*\*\s*\((.+?)\)/)
    const name = headerMatch?.[1] ?? 'Rolagem'
    const headerNotation = ((headerMatch?.[2] as string) || (messageText.match(/\(([^)]+)\)/)?.[1] || '')).replace(/\s+/g, '')

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
        <Box sx={{ wordBreak: 'break-word' }}>
            {/* Título acima, completo */}
            {!!(headerMatch?.[1] || 'Rolagem') && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Casino fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>{headerMatch?.[1] || 'Rolagem'}</Typography>
                </Stack>
            )}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                {/* Expressão em cinza no cabeçalho */}
                {!!headerNotation && (
                    <Typography component="span" color="text.secondary" noWrap sx={{ minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '60%' }}>({headerNotation})</Typography>
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

            <Collapse in={open} timeout="auto" unmountOnExit>
                <Divider sx={{ my: 1 }} />
                {!!headerNotation && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Expressão:</strong> <span style={{ fontFamily: 'monospace' }}>{headerNotation}</span>
                    </Typography>
                )}
                {!!modifiers.length && (
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
                        {modifiers.map((m, i) => (
                            <Chip key={i} size="small" color={m.value >= 0 ? 'success' : 'error'} label={`${m.value >= 0 ? '+' : ''}${m.value} ${m.name}`} />
                        ))}
                    </Stack>
                )}
                {!!rolls.length && (
                    <Stack spacing={1}>
                        <Typography variant="body2" fontWeight={700}>Rolagens:</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {rolls.map((n, i) => (
                                <Chip key={i} size="small" color={n === best ? 'success' : (n === worst ? 'error' : 'default')} label={n} />
                            ))}
                        </Stack>
                    </Stack>
                )}
                {(rolls.length > 0) && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        <Chip size="small" label={`Subtotal ${rolls.reduce((a, b) => a + b, 0)}`} />
                        {!!avg && <Chip size="small" label={`Média ${avg}`} />}
                    </Stack>
                )}
            </Collapse>
        </Box>
    )
}
