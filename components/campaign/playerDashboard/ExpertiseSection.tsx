/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { useCampaignCurrentFichaContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext'
import { MessageType } from '@enums'
import { 
    Box, 
    Button, 
    Chip, 
    Paper, 
    Typography,
    Stack,
    Tooltip,
    useTheme,
    Divider
} from '@mui/material'
import {
    Person,
    Casino,
    TrendingUp,
    Star,
    EmojiEvents
} from '@mui/icons-material'
import { blue, green, grey, purple, yellow, orange, red } from '@mui/material/colors'
import type { Expertises } from '@types'
import { useSession } from 'next-auth/react'
import { type ReactElement } from 'react'

export default function ExpertiseSection(): ReactElement {
    const { ficha } = useCampaignCurrentFichaContext();
    const theme = useTheme();

    const expertises = ficha.expertises
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext()
    const { data: session } = useSession()

    // Ordena as perícias em ordem alfabética
    const expertiseEntries = Object.entries(expertises).sort((a, b) => a[0].localeCompare(b[0]))
    
    // Estatísticas das perícias
    const expertiseStats = {
        total: expertiseEntries.length,
        novice: expertiseEntries.filter(([, exp]) => exp.value < 2).length,
        trained: expertiseEntries.filter(([, exp]) => exp.value >= 2 && exp.value < 5).length,
        expert: expertiseEntries.filter(([, exp]) => exp.value >= 5 && exp.value < 7).length,
        master: expertiseEntries.filter(([, exp]) => exp.value >= 7 && exp.value < 9).length,
        legendary: expertiseEntries.filter(([, exp]) => exp.value >= 9).length
    }

    const getExpertiseConfig = (value: number) => {
        if (value < 2) {
            return { 
                color: grey[600], 
                bg: grey[100], 
                label: 'Novato',
                icon: Person
            }
        } else if (value < 5) {
            return { 
                color: green[600], 
                bg: green[100], 
                label: 'Treinado',
                icon: TrendingUp
            }
        } else if (value < 7) {
            return { 
                color: blue[600], 
                bg: blue[100], 
                label: 'Especialista',
                icon: Star
            }
        } else if (value < 9) {
            return { 
                color: purple[600], 
                bg: purple[100], 
                label: 'Mestre',
                icon: EmojiEvents
            }
        } else {
            return { 
                color: orange[600], 
                bg: orange[100], 
                label: 'Lendário',
                icon: Casino
            }
        }
    }

    const getAttributeColor = (attr: string) => {
        const colors: Record<string, string> = {
            'FOR': red[600],
            'AGI': green[600],
            'INT': blue[600],
            'PRE': purple[600],
            'VIG': orange[600]
        }
        return colors[attr] || grey[600]
    }

    const handleExpertiseClick = async (expertiseName: keyof Expertises) => {
        const expertise = ficha.expertises[expertiseName]
        const expertiseValue = expertise.value

        // Pega o atributo base da expertise
        const baseAttribute = expertise.defaultAttribute?.toLowerCase() as keyof typeof ficha.attributes
        const baseAttributeValue = ficha.attributes[baseAttribute]

        // Determina quantos d20s rolar baseado no valor do atributo base
        let numDice = 1
        let useWorst = false

        if (baseAttributeValue === -1) {
            numDice = 2
            useWorst = true
        } else if (baseAttributeValue === 3) {
            numDice = 2
        } else if (baseAttributeValue === 5) {
            numDice = 3
        }

        // Rola os dados
        const rolls: number[] = []
        for (let i = 0; i < numDice; i++) {
            rolls.push(Math.floor(Math.random() * 20) + 1)
        }

        // Determina qual resultado usar
        let roll = rolls[0]
        if (numDice > 1) {
            roll = useWorst ? Math.min(...rolls) : Math.max(...rolls)
        }

        const total = roll + expertiseValue

        // Formata os rolls para exibição de uma forma que possamos reconhecer depois
        const rollPart = rolls.length > 1 ? 
            `${rolls.join(', ')}: ${roll}` : 
            `${roll}`

        const text = `🎲 ${(expertiseName as string).toUpperCase()} - ${numDice}d20${expertiseValue >= 0 ? '+' : ''}${expertiseValue}: [${rollPart}] = ${total}`
        
        // Envia a mensagem diretamente
        if (session?.user) {
            await handleSendMessage({
                text,
                type: MessageType.EXPERTISE,
                by: {
                    id: session.user._id ?? '',
                    name: session.user.name ?? '',
                    image: session.user.image ?? ''
                },
                timestamp: new Date(),
                isHTML: true
            })
        }

        if (!isChatOpen) {
            setIsChatOpen(true)
        }
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Paper 
                elevation={2}
                sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #1e293b 0%, #334155 100%)'
                        : 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Stack spacing={3}>
                    {/* Header */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box 
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: blue[100],
                                border: '2px solid',
                                borderColor: blue[200]
                            }}
                        >
                            <Person sx={{ color: blue[700], fontSize: '2rem' }} />
                        </Box>
                        <Box flex={1}>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 700,
                                    color: 'primary.main',
                                    mb: 0.5
                                }}
                            >
                                Perícias & Especialidades
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {expertiseStats.total} perícia{expertiseStats.total !== 1 ? 's' : ''} disponível{expertiseStats.total !== 1 ? 'eis' : ''}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Estatísticas por Nível */}
                    <Box 
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            p: 2,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            flexWrap: 'wrap',
                            gap: 2
                        }}
                    >
                        {[
                            { key: 'novice', label: 'Novatos', count: expertiseStats.novice, color: grey[600] },
                            { key: 'trained', label: 'Treinados', count: expertiseStats.trained, color: green[600] },
                            { key: 'expert', label: 'Especialistas', count: expertiseStats.expert, color: blue[600] },
                            { key: 'master', label: 'Mestres', count: expertiseStats.master, color: purple[600] },
                            { key: 'legendary', label: 'Lendários', count: expertiseStats.legendary, color: orange[600] }
                        ].map(stat => (
                            <Stack key={stat.key} alignItems="center" spacing={0.5}>
                                <Typography variant="h6" sx={{ color: stat.color, fontWeight: 700 }}>
                                    {stat.count}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {stat.label}
                                </Typography>
                            </Stack>
                        ))}
                    </Box>

                    {/* Lista de Perícias */}
                    <Box>
                        {expertiseEntries.length === 0 ? (
                            <Paper 
                                sx={{ 
                                    p: 4, 
                                    textAlign: 'center',
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    bgcolor: 'transparent'
                                }}
                            >
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                    Nenhuma perícia encontrada
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    As perícias do personagem aparecerão aqui.
                                </Typography>
                            </Paper>
                        ) : (
                            <Box 
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(3, 1fr)'
                                    },
                                    gap: 2
                                }}
                            >
                                {expertiseEntries.map(([nome, expertise]) => {
                                    const config = getExpertiseConfig(expertise.value);
                                    const IconComponent = config.icon;
                                    
                                    return (
                                        <Tooltip 
                                            key={nome}
                                            title={`Clique para rolar ${nome} (${config.label})`}
                                            placement="top"
                                        >
                                            <Button
                                                fullWidth
                                                onClick={async () => await handleExpertiseClick(nome as keyof Expertises)}
                                                elevation={1}
                                                sx={{
                                                    p: 2.5,
                                                    bgcolor: config.bg + '40',
                                                    border: '1px solid',
                                                    borderColor: config.color + '40',
                                                    borderRadius: 2,
                                                    justifyContent: 'flex-start',
                                                    textAlign: 'left',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        bgcolor: config.bg + '60',
                                                        borderColor: config.color + '80',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: 3
                                                    }
                                                }}
                                            >
                                                <Stack spacing={1.5} width="100%">
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Box 
                                                            sx={{
                                                                p: 0.8,
                                                                borderRadius: 1,
                                                                bgcolor: config.color + '20',
                                                                border: '1px solid',
                                                                borderColor: config.color + '40'
                                                            }}
                                                        >
                                                            <IconComponent 
                                                                sx={{ 
                                                                    color: config.color,
                                                                    fontSize: '1.2rem'
                                                                }} 
                                                            />
                                                        </Box>
                                                        <Typography 
                                                            variant="subtitle1" 
                                                            sx={{ 
                                                                fontWeight: 600,
                                                                color: 'text.primary',
                                                                flex: 1
                                                            }}
                                                        >
                                                            {nome}
                                                        </Typography>
                                                    </Box>
                                                    
                                                    <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between">
                                                        <Chip 
                                                            label={`${expertise.value >= 0 ? '+' : ''}${expertise.value}`}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: config.color,
                                                                color: 'white',
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem'
                                                            }}
                                                        />
                                                        <Chip 
                                                            label={expertise.defaultAttribute.toUpperCase()}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: getAttributeColor(expertise.defaultAttribute.toUpperCase()) + '20',
                                                                color: getAttributeColor(expertise.defaultAttribute.toUpperCase()),
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                        <Chip 
                                                            label={config.label}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                borderColor: config.color + '60',
                                                                color: config.color,
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>
                                            </Button>
                                        </Tooltip>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}
