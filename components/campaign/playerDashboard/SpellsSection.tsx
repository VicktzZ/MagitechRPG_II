/* eslint-disable react-hooks/rules-of-hooks */
'use client'

import { elementColor } from '@constants';
import { useCampaignCurrentCharsheetContext } from '@contexts';
import type { SpellDTO } from '@models/dtos';
import { charsheetEntity } from '@utils/firestoreEntities';
import { useSnackbar } from 'notistack';
import {
    Air,
    AutoAwesome,
    Brightness2,
    Circle,
    Delete,
    ExpandMore,
    FlashOn,
    LocalFireDepartment,
    Terrain,
    WaterDrop,
    WbSunny
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import { blue, green, grey, orange, purple, red } from '@mui/material/colors';
import { type ReactElement, useState } from 'react';

function getSpellColor(spell: SpellDTO): string {
    switch (spell.element?.toUpperCase()) {
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
        return { color: purple[600], bg: purple[100] };
    case 4:
        return { color: orange[600], bg: orange[100] };
    default:
        return { color: grey[600], bg: grey[100] };
    }
}
interface SpellStageProps {
    stage: number
    description: string
    spell: SpellDTO
}

function SpellStage({ stage, description, spell }: SpellStageProps): ReactElement {
    let mpCost = Number(spell.mpCost)
    let extraCost: Record<string, number> = {
        'estágio 1': 0,
        'estágio 2': 1,
        'estágio 3': 2
    }

    if (Number(spell.level) === 4)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 4,
            'maestria': 9
        }
        
    if (Number(spell.level) === 3)
        extraCost = {
            'estágio 1': 0,
            'estágio 2': 2,
            'estágio 3': 5
        }

    if (Number(spell.level) === 2)
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
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const [ expandedSpell, setExpandedSpell ] = useState<string | false>(false)

    const handleSpellExpand = (spellName: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedSpell(isExpanded ? spellName : false)
    }

    const handleDeleteSpell = async (spellName: string) => {
        if (!charsheet?.id) return;
        
        try {
            const newSpells = charsheet.spells.filter(spell => spell.name !== spellName);
            await charsheetEntity.update(charsheet.id, { spells: newSpells });
            enqueueSnackbar('Magia excluída com sucesso!', { variant: 'success' });
        } catch (error) {
            console.error('Erro ao excluir magia:', error);
            enqueueSnackbar('Erro ao excluir magia', { variant: 'error' });
        }
    }

    const handleSetSpellStage = async (spell: SpellDTO, stage: 1 | 2 | 3) => {
        if (!charsheet?.id) return

        const spellId = spell.id || spell.name
        if (!spellId) return

        try {
            await charsheetEntity.update(charsheet.id, {
                spellStages: {
                    ...(charsheet.spellStages || {}),
                    [spellId]: stage
                }
            } as any)

            enqueueSnackbar(`Estágio da magia "${spell.name}" definido para ${stage}!`, { variant: 'success' })
        } catch (error) {
            console.error('Erro ao atualizar estágio da magia:', error)
            enqueueSnackbar('Erro ao atualizar estágio da magia', { variant: 'error' })
        }
    }

    const allSpells = charsheet.spells
    const spellsByLevel = {
        1: allSpells.filter(spell => Number(spell.level) === 1),
        2: allSpells.filter(spell => Number(spell.level) === 2),
        3: allSpells.filter(spell => Number(spell.level) === 3),
        4: allSpells.filter(spell => Number(spell.level) === 4)
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
                    {/* Header com Espaço de Magias */}
                    <Box 
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        {/* Espaço de Magias */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Espaço de Magias
                            </Typography>
                            <Chip
                                label={`${allSpells.length} / ${charsheet.spellSpace || 0}`}
                                color={allSpells.length >= (charsheet.spellSpace || 0) ? 'warning' : 'primary'}
                                variant="filled"
                                sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                            />
                        </Box>

                        {/* Estatísticas por Nível */}
                        <Stack direction="row" spacing={3}>
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
                        </Stack>
                    </Box>

                    {/* Lista de Spells */}
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
                                    O grimório está vazio. Aprenda novas spells para começar a conjurar!
                                </Typography>
                            </Paper>
                        ) : (
                            <Stack spacing={2}>
                                {allSpells.map(spell => {
                                    const ElementIcon = getElementIcon(spell.element);
                                    const levelConfig = getSpellLevelColor(Number(spell.level));
                                    const spellId = spell.id || spell.name
                                    const selectedStage = (charsheet.spellStages?.[spellId] as 1 | 2 | 3 | undefined) || 1
                                    const availableStages: Array<1 | 2 | 3> = [ 1 ]
                                    if (spell.stages?.[1]) availableStages.push(2)
                                    if (spell.stages?.[2]) availableStages.push(3)
                                    
                                    return (
                                        <Accordion
                                            key={spell.name}
                                            expanded={expandedSpell === spell.name}
                                            onChange={handleSpellExpand(spell.name)}
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
                                                            bgcolor: elementColor[spell.element] || grey[300],
                                                            border: '1px solid',
                                                            borderColor: 'rgba(0,0,0,0.2)'
                                                        }}
                                                    >
                                                        <ElementIcon 
                                                            sx={{ 
                                                                color: getSpellColor(spell),
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
                                                            {spell.name}
                                                        </Typography>
                                                        <Box display="flex" gap={1} flexWrap="wrap">
                                                            <Chip 
                                                                label={spell.element} 
                                                                size="small" 
                                                                sx={{ 
                                                                    bgcolor: elementColor[spell.element] || grey[300], 
                                                                    color: getSpellColor(spell),
                                                                    fontWeight: 600
                                                                }} 
                                                            />
                                                            <Chip 
                                                                label={`Nível ${spell.level}`} 
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
                                                
                                                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                                    <Tooltip title="Alcance">
                                                        <Chip 
                                                            label={spell.range} 
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
                                                            label={spell.execution} 
                                                            size="small" 
                                                            sx={{
                                                                bgcolor: green[100],
                                                                color: green[800],
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Tipo de Spell">
                                                        <Chip 
                                                            label={spell.type} 
                                                            size="small" 
                                                            sx={{
                                                                bgcolor: red[100],
                                                                color: red[800],
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Excluir Magia">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteSpell(spell.name);
                                                            }}
                                                            sx={{ ml: 1 }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </AccordionSummary>
                                            
                                            <AccordionDetails sx={{ p: 3 }}>
                                                <Stack spacing={2}>
                                                    <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                                                        <Typography variant="caption" color="text.secondary">Estágio ativo:</Typography>
                                                        {availableStages.map(stage => (
                                                            <Chip
                                                                key={stage}
                                                                label={`Estágio ${stage}`}
                                                                size="small"
                                                                clickable
                                                                onClick={() => { void handleSetSpellStage(spell, stage) }}
                                                                color={selectedStage === stage ? 'primary' : 'default'}
                                                                variant={selectedStage === stage ? 'filled' : 'outlined'}
                                                            />
                                                        ))}
                                                    </Box>

                                                    {selectedStage === 1 && spell.stages?.[0] && (
                                                        <SpellStage spell={spell} stage={1} description={spell.stages?.[0]} />
                                                    )}
                                                    {selectedStage === 2 && spell.stages?.[1] && (
                                                        <SpellStage spell={spell} stage={2} description={spell.stages?.[1]} />
                                                    )}
                                                    {selectedStage === 3 && spell.stages?.[2] && (
                                                        <SpellStage spell={spell} stage={3} description={spell.stages?.[2]} />
                                                    )}
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
