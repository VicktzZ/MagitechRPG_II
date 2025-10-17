/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { type ReactElement, useState } from 'react'
import { 
    Box, 
    Typography, 
    Paper, 
    Accordion, 
    AccordionSummary, 
    AccordionDetails, 
    Chip,
    Stack,
    Tooltip,
    useTheme
} from '@mui/material'
import {
    ExpandMore,
    AutoAwesome,
    LocalFireDepartment,
    WaterDrop,
    Terrain,
    Air,
    FlashOn,
    Brightness2,
    WbSunny,
    Circle
} from '@mui/icons-material'
import type { Magia } from '@types'
import { useCampaignCurrentFichaContext } from '@contexts';
import { elementColor } from '@constants'
import { blue, red, green, orange, purple, grey } from '@mui/material/colors';

function getMagicColor(magic: Magia): string {
    switch (magic.elemento) {
    case 'AR':
    case 'LUZ':
    case 'NÃO-ELEMENTAL':
        return 'black'
    default:
        return 'white'
    }
}

function getElementIcon(element: string) {
    switch (element) {
    case 'FOGO':
        return LocalFireDepartment;
    case 'ÁGUA':
        return WaterDrop;
    case 'TERRA':
        return Terrain;
    case 'AR':
        return Air;
    case 'ELETRICIDADE':
        return FlashOn;
    case 'TREVAS':
        return Brightness2;
    case 'LUZ':
        return WbSunny;
    case 'NÃO-ELEMENTAL':
        return Circle;
    default:
        return AutoAwesome;
    }
}

function getSpellLevelColor(level: number) {
    switch (level) {
    case 1:
        return { color: green[600], bg: green[100] };
    case 2:
        return { color: blue[600], bg: blue[100] };
    case 3:
        return { color: orange[600], bg: orange[100] };
    case 4:
        return { color: purple[600], bg: purple[100] };
    default:
        return { color: grey[600], bg: grey[100] };
    }
}
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

    if (Number(magic['nível']) === 4)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 4,
            'maestria': 9
        }
        
    if (Number(magic['nível']) === 3)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 2,
            'estágio 3': 5
        }

    if (Number(magic['nível']) === 2)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 2,
            'estágio 3': 4
        }

    if (stage === 2) mpCost += extraCost['estágio 2']
    if (stage === 3) mpCost += extraCost['estágio 3']
    if (stage === 4) mpCost += extraCost['maestria']

    const getStageColor = (stageNum: number) => {
        if (stageNum === 4) return { color: purple[600], bg: purple[100] }; // Maestria
        switch (stageNum) {
        case 1:
            return { color: green[600], bg: green[100] };
        case 2:
            return { color: blue[600], bg: blue[100] };
        case 3:
            return { color: orange[600], bg: orange[100] };
        default:
            return { color: grey[600], bg: grey[100] };
        }
    };

    const stageConfig = getStageColor(stage);

    return (
        <Paper 
            elevation={1}
            sx={{ 
                p: 2, 
                mb: 2,
                border: '1px solid',
                borderColor: stageConfig.color + '40',
                borderRadius: 2,
                bgcolor: stageConfig.bg + '20'
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: stageConfig.color,
                        fontWeight: 700
                    }}
                >
                    {stage !== 4 ? `✨ Estágio ${stage}` : '🌟 Maestria'}
                </Typography>
                <Chip 
                    label={`${mpCost} MP`}
                    sx={{
                        bgcolor: blue[100],
                        color: blue[800],
                        fontWeight: 600
                    }}
                />
            </Box>
            <Typography 
                variant="body2" 
                sx={{ 
                    lineHeight: 1.6,
                    textAlign: 'justify'
                }}
            >
                {description}
            </Typography>
        </Paper>
    )
}

export default function SpellsSection(): ReactElement {
    const { ficha } = useCampaignCurrentFichaContext();
    const theme = useTheme();

    const [ expandedSpell, setExpandedSpell ] = useState<string | false>(false)

    const handleSpellExpand = (spellName: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSpell(isExpanded ? spellName : false)
    }

    const allSpells = ficha.magics
    const spellsByLevel = {
        1: allSpells.filter(spell => Number(spell['nível']) === 1),
        2: allSpells.filter(spell => Number(spell['nível']) === 2),
        3: allSpells.filter(spell => Number(spell['nível']) === 3),
        4: allSpells.filter(spell => Number(spell['nível']) === 4)
    };

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
                                bgcolor: purple[100],
                                border: '2px solid',
                                borderColor: purple[200]
                            }}
                        >
                            <AutoAwesome sx={{ color: purple[700], fontSize: '2rem' }} />
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
                                Grimório de Magias
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {allSpells.length} magia{allSpells.length !== 1 ? 's' : ''} conhecida{allSpells.length !== 1 ? 's' : ''}
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
                            borderColor: 'divider'
                        }}
                    >
                        {[ 1, 2, 3, 4 ].map(level => {
                            const levelConfig = getSpellLevelColor(level);
                            const count = spellsByLevel[level as keyof typeof spellsByLevel].length;
                            return (
                                <Stack key={level} alignItems="center" spacing={0.5}>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Typography variant="h6" sx={{ color: levelConfig.color, fontWeight: 700 }}>
                                            {count}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Nível {level}
                                    </Typography>
                                </Stack>
                            );
                        })}
                    </Box>

                    {/* Lista de Magias */}
                    <Box>
                        {allSpells.length === 0 ? (
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
                                    Nenhuma magia conhecida
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    O grimório está vazio. Aprenda novas magias para começar a conjurar!
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={2}>
                                {allSpells.map((magic: Magia) => {
                                    const ElementIcon = getElementIcon(magic.elemento);
                                    const levelConfig = getSpellLevelColor(Number(magic['nível']));
                                    
                                    return (
                                        <Accordion
                                            key={magic.nome}
                                            expanded={expandedSpell === magic.nome}
                                            onChange={handleSpellExpand(magic.nome)}
                                            elevation={2}
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                '&:before': { display: 'none' },
                                                '&:hover': {
                                                    borderColor: levelConfig.color + '60',
                                                    boxShadow: 3
                                                }
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMore sx={{ color: levelConfig.color }} />}
                                                sx={{
                                                    minHeight: 64,
                                                    bgcolor: levelConfig.bg + '40',
                                                    borderRadius: '8px 8px 0 0',
                                                    '& .MuiAccordionSummary-content': {
                                                        alignItems: 'center',
                                                        gap: 2
                                                    }
                                                }}
                                            >
                                                <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                                                    <Box 
                                                        sx={{
                                                            p: 0.8,
                                                            borderRadius: 1,
                                                            bgcolor: elementColor[magic.elemento] || grey[300],
                                                            border: '1px solid',
                                                            borderColor: 'rgba(0,0,0,0.2)'
                                                        }}
                                                    >
                                                        <ElementIcon 
                                                            sx={{ 
                                                                color: getMagicColor(magic),
                                                                fontSize: '1.2rem'
                                                            }} 
                                                        />
                                                    </Box>
                                                    <Box flex={1}>
                                                        <Typography 
                                                            variant="h6" 
                                                            sx={{ 
                                                                fontWeight: 700,
                                                                color: levelConfig.color,
                                                                mb: 0.5
                                                            }}
                                                        >
                                                            {magic.nome}
                                                        </Typography>
                                                        <Box display="flex" gap={1} flexWrap="wrap">
                                                            <Chip 
                                                                label={magic.elemento} 
                                                                size="small" 
                                                                sx={{ 
                                                                    bgcolor: elementColor[magic.elemento] || grey[300], 
                                                                    color: getMagicColor(magic),
                                                                    fontWeight: 600
                                                                }} 
                                                            />
                                                            <Chip 
                                                                label={`Nível ${magic['nível']}`} 
                                                                size="small" 
                                                                sx={{
                                                                    bgcolor: levelConfig.bg,
                                                                    color: levelConfig.color,
                                                                    fontWeight: 600
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                
                                                <Box display="flex" gap={1} flexWrap="wrap">
                                                    <Tooltip title="Alcance">
                                                        <Chip 
                                                            label={magic.alcance} 
                                                            size="small" 
                                                            sx={{
                                                                bgcolor: blue[100],
                                                                color: blue[800],
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Tempo de Execução">
                                                        <Chip 
                                                            label={magic.execução} 
                                                            size="small" 
                                                            sx={{
                                                                bgcolor: green[100],
                                                                color: green[800],
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Tipo de Magia">
                                                        <Chip 
                                                            label={magic.tipo} 
                                                            size="small" 
                                                            sx={{
                                                                bgcolor: red[100],
                                                                color: red[800],
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Tooltip>
                                                </Box>
                                            </AccordionSummary>
                                            
                                            <AccordionDetails sx={{ p: 3 }}>
                                                <Stack spacing={2}>
                                                    {magic['estágio 1'] && <SpellStage magic={magic} stage={1} description={magic['estágio 1']} />}
                                                    {magic['estágio 2'] && <SpellStage magic={magic} stage={2} description={magic['estágio 2']} />}
                                                    {magic['estágio 3'] && <SpellStage magic={magic} stage={3} description={magic['estágio 3']} />}
                                                    {magic.maestria && <SpellStage magic={magic} stage={4} description={magic.maestria} />}
                                                </Stack>
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}
