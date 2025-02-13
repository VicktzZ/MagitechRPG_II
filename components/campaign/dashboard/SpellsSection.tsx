'use client'

import { type ReactElement, useState } from 'react'
import { Box, Typography, Paper, Grid, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material'
import type { Magia } from '@types'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

interface SpellStageProps {
    stage: number
    description: string
    magic: Magia
}

function SpellStage({ stage, description, magic }: SpellStageProps): ReactElement {
    let mpCost = Number(magic.custo)
    let extraCost: Record<string, number> = {
        'estágio 1': 0,
        'estágio 2': 1,
        'estágio 3': 2
    }

    if (Number(magic.nível) === 4)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 4,
            'maestria': 9
        }
        
    if (Number(magic.nível) === 3)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 2,
            'estágio 3': 5
        }

    if (Number(magic.nível) === 2)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 2,
            'estágio 3': 4
        }

    if (stage === 2) mpCost += extraCost['estágio 2']
    if (stage === 3) mpCost += extraCost['estágio 3']
    if (stage === 4) mpCost += extraCost['maestria']

    return (
        <Box>
            <Box sx={{ mt: 2 }} display='flex' gap={1} alignItems='center'>
                <Typography variant="subtitle2" color="primary" fontWeight='bold' gutterBottom>
                    {stage !== 4 ? `Estágio ${stage}` : 'Maestria'}
                </Typography>
                <Chip label={mpCost + ' MP'}  />
            </Box>
            <Typography variant="body2">{description}</Typography>
        </Box>
    )
}

interface SpellsSectionProps {
    ficha: any
}

export default function SpellsSection({ ficha }: SpellsSectionProps): ReactElement {
    const [ expandedSpell, setExpandedSpell ] = useState<string | false>(false)

    const handleSpellExpand = (spellName: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSpell(isExpanded ? spellName : false)
    }

    const allSpells = ficha.magics

    return (
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper2', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Magias
                </Typography>

                <Box sx={{ mt: 2 }}>
                    {allSpells.map((magic: Magia) => (
                        <Accordion
                            key={magic.nome}
                            expanded={expandedSpell === magic.nome}
                            onChange={handleSpellExpand(magic.nome)}
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
                                <Typography variant="subtitle1">{magic.nome}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: 'auto', mr: 2 }}>
                                    <Chip label={`Nível ${magic['nível']}`} size="small" variant="outlined" />
                                    <Chip label={magic.alcance} size="small" variant="outlined" color="secondary" />
                                    <Chip label={magic.tipo} size="small" variant="outlined" color="error" />
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {magic['estágio 1'] && <SpellStage magic={magic} stage={1} description={magic['estágio 1']} />}
                                {magic['estágio 2'] && <SpellStage magic={magic} stage={2} description={magic['estágio 2']} />}
                                {magic['estágio 3'] && <SpellStage magic={magic} stage={3} description={magic['estágio 3']} />}
                                {magic.maestria && <SpellStage magic={magic} stage={4} description={magic.maestria} />}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Paper>
        </Grid>
    )
}
