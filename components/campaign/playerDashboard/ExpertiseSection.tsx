/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { useCampaignContext } from '@contexts';
import { useChatContext } from '@contexts/chatContext'
import { MessageType } from '@enums'
import { Box, Button, Chip, Grid, Paper, Typography } from '@mui/material'
import { blue, green, grey, purple, yellow } from '@mui/material/colors'
import type { Expertises } from '@types'
import { useSession } from 'next-auth/react'
import { type ReactElement } from 'react'

export default function ExpertiseSection(): ReactElement {
    const { campaign: { myFicha: ficha } } = useCampaignContext()
    if (!ficha) return <></>;

    const expertises = ficha.expertises
    const { handleSendMessage, setIsChatOpen, isChatOpen } = useChatContext()
    const { data: session } = useSession()

    // Ordena as perícias em ordem alfabética e divide em 3 colunas
    const expertiseEntries = Object.entries(expertises).sort((a, b) => a[0].localeCompare(b[0]))
    const columnSize = Math.ceil(expertiseEntries.length / 3)
    const columns = [
        expertiseEntries.slice(0, columnSize),
        expertiseEntries.slice(columnSize, columnSize * 2),
        expertiseEntries.slice(columnSize * 2)
    ]

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
        <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Perícias
                </Typography>

                <Grid container spacing={2}>
                    {columns.map((column, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            {column.map(([ nome, expertise ]) => (
                                <Button
                                    key={nome}
                                    fullWidth
                                    onClick={async () => await handleExpertiseClick(nome as keyof Expertises)}
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 1 }}>
                                        <Typography variant="subtitle1" sx={{ minWidth: '40%' }}>{nome}</Typography>
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
                    ))}
                </Grid>
            </Paper>
        </Grid>
    )
}
