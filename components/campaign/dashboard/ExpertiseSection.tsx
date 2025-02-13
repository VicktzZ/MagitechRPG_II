'use client'

import { type ReactElement } from 'react'
import { Box, Typography, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { Expertise, Ficha } from '@types'
import { blue, green, grey, purple, yellow } from '@mui/material/colors'

interface ExpertiseSectionProps {
    ficha: Ficha
}

export default function ExpertiseSection({ ficha }: ExpertiseSectionProps): ReactElement {
    const expertises = ficha.expertises

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

    return (
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Perícias
                </Typography>

                <Box sx={{ mt: 2 }}>
                    {Object.entries(expertises).map(([ nome, expertise ]: [string, Expertise<any>]) => (
                        <Accordion
                            key={nome}
                            sx={{
                                mb: 1,
                                bgcolor: 'background.paper3',
                                '&:before': { display: 'none' },
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    minHeight: 48,
                                    '& .MuiAccordionSummary-content': {
                                        alignItems: 'center',
                                        gap: 1
                                    }
                                }}
                            >
                                <Typography variant="subtitle1">{nome}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 'auto', mr: 2 }}>
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
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {'Esta é uma descrição de teste'}
                                    </Typography>    
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Paper>
        </Grid>
    )
}
