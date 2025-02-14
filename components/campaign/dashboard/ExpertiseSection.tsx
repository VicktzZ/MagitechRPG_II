'use client'

import { type ReactElement } from 'react'
import { Box, Typography, Paper, Grid, Button, Chip } from '@mui/material'
import type { Expertise, Ficha } from '@types'
import { grey, blue, green, purple, yellow } from '@mui/material/colors'
import { useChatContext } from '@contexts/chatContext'
import { MessageType } from '@enums'
import { useSession } from 'next-auth/react'

interface ExpertiseSectionProps {
    ficha: Ficha
}

export default function ExpertiseSection({ ficha }: ExpertiseSectionProps): ReactElement {
    const expertises = ficha.expertises
    const { handleSendMessage, setIsChatOpen, chatOpen } = useChatContext()
    const { data: session } = useSession()

    // Divide as perícias em duas colunas
    const expertiseEntries = Object.entries(expertises)
    const midPoint = Math.ceil(expertiseEntries.length / 2)
    const leftColumnExpertises = expertiseEntries.slice(0, midPoint)
    const rightColumnExpertises = expertiseEntries.slice(midPoint)

    const determinateExpertiseColor = (value: number): string => {
        if (value < 2) {
            return grey[500]
        } else if (value < 5) {
            return green[500]
        } else if (value < 7) {
            return blue[500]
        } else if (value < 9) {
            return purple[500]
        } else {
            return yellow[500]
        }
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

        const text = `🎲 ${expertiseName.toUpperCase()} - ${numDice}d20${expertiseValue >= 0 ? '+' : ''}${expertiseValue}: [${rollPart}] = ${total}`
        
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

        if (!chatOpen) {
            setIsChatOpen(true)
        }
    }

    const renderExpertiseButton = (entries: Array<[string, Expertise<any>]>) => (
        <Grid item xs={12} md={6}>
            {entries.map(([ nome, expertise ]) => (
                <Button
                    key={nome}
                    fullWidth
                    onClick={() => handleExpertiseClick(nome)}
                    sx={{
                        mb: 1,
                        p: 2,
                        bgcolor: 'background.paper3',
                        color: 'white',
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        '&:hover': {
                            bgcolor: 'action.hover'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography variant="subtitle1">{nome}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 'auto' }}>
                            <Chip 
                                label={`${expertise.value >= 0 ? '+' : ''}${expertise.value}`}
                                size="small"
                                sx={{
                                    bgcolor: determinateExpertiseColor(expertise.value)
                                }}
                            />
                            <Chip 
                                label={expertise.defaultAttribute.toUpperCase()}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        </Box>
                    </Box>
                </Button>
            ))}
        </Grid>
    )

    return (
        <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Perícias
                </Typography>

                <Grid container spacing={2}>
                    {renderExpertiseButton(leftColumnExpertises)}
                    {renderExpertiseButton(rightColumnExpertises)}
                </Grid>
            </Paper>
        </Grid>
    )
}
