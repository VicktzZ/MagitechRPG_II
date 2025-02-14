'use client'

import { type ReactElement } from 'react'
import { Box, Typography, Paper, Grid, Button, Chip } from '@mui/material'
import type { Expertise, Ficha } from '@types'
import { blue, green, grey, purple, yellow } from '@mui/material/colors'

interface ExpertiseSectionProps {
    ficha: Ficha
    onRollTest?: (result: number, expertiseName: string, bonus: number) => void
}

export default function ExpertiseSection({ ficha, onRollTest }: ExpertiseSectionProps): ReactElement {
    const expertises = ficha.expertises

    // Divide as perícias em duas colunas
    const expertiseEntries = Object.entries(expertises)
    const midPoint = Math.ceil(expertiseEntries.length / 2)
    const leftColumnExpertises = expertiseEntries.slice(0, midPoint)
    const rightColumnExpertises = expertiseEntries.slice(midPoint)

    const determinateColor = (value: number): string => {
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

    const handleRollTest = (expertiseName: string, bonus: number) => {
        // Rola 1d20 + bônus da perícia
        const roll = Math.floor(Math.random() * 20) + 1
        const total = roll + bonus

        if (onRollTest) {
            onRollTest(total, expertiseName, bonus)
        }
    }

    const renderExpertiseButton = (entries: [string, Expertise<any>][]) => (
        <Grid item xs={12} md={6}>
            {entries.map(([ nome, expertise ]) => (
                <Button
                    key={nome}
                    fullWidth
                    onClick={() => handleRollTest(nome, expertise.value)}
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
                                    bgcolor: determinateColor(expertise.value)
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
