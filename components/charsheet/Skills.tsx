/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
'use client';

import { 
    Box, 
    FormControl, 
    type SxProps, 
    Typography, 
    useTheme, 
    Chip,
    FormHelperText,
    Button
} from '@mui/material'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    useState, 
    type ReactElement, 
    type MouseEvent, 
    useRef, 
    useMemo, 
    useCallback, 
    useEffect
} from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { skills } from '@constants/skills';
import type { CharsheetDTO } from '@models/dtos';
import type { Power } from '@models/entities';
import type { Skill } from '@models';

type SkillsFilterType = 'all' | 'class' | 'subclass' | 'lineage' | 'powers' | 'bonus' | 'race'

export default function Skills(): ReactElement {
    const { control, setValue, getValues, formState: { errors } } = useFormContext<CharsheetDTO>()
    const skillRef = useRef<EventTarget & HTMLSpanElement | null>()
    const [ selectedSkill, setSelectedSkill ] = useState<Power | null>(null) 
    const [ skillsFilter, setSkillsFilter ] = useState<SkillsFilterType>('all')
    const [ showMasteryDescription, setShowMasteryDescription ] = useState(false)
    const theme = useTheme()
    
    // Observar os pontos de habilidade disponíveis
    const skillPoints = useWatch({
        control,
        name: 'points.skills'
    })

    const formSkills = useWatch({
        control,
        name: 'skills'
    })
    
    // Observar a maestria elemental do personagem
    const elementalMastery = useWatch({
        control,
        name: 'elementalMastery'
    })

    const filterBtnStyle: SxProps = useMemo(() => ({
        '&.MuiChip-root': {
            height: 36,
            minWidth: 80,
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText'
            },
            '&.MuiChip-clickable:active': {
                transform: 'translateY(0)'
            },
            [theme.breakpoints.down('md')]: {
                height: 32,
                minWidth: 70,
                fontSize: '0.7rem',
                padding: '0 8px'
            }
        }
    }), [ theme ])

    const handleSkillClick = useCallback((event: MouseEvent<HTMLSpanElement>, skill: Skill): void => {
        if (skillRef.current) {
            const element = skillRef.current as HTMLElement
            element.style.backgroundColor = 'transparent'
        }

        if (skillRef.current === event.currentTarget) {
            event.currentTarget.style.backgroundColor = 'transparent'
            setSelectedSkill(null)
            skillRef.current = null
            return
        }

        event.currentTarget.style.backgroundColor = theme.palette.background.paper

        setSelectedSkill(skill)

        skillRef.current = event.currentTarget
    }, [])

    const skillsRender = useMemo(() => {

        const getOriginLabel = (type: string) => {
            const origins: Record<string, string> = {
                'class': 'Classe',
                'subclass': 'Subclasse',
                'race': 'Raça',
                'lineage': 'Linhagem',
                'powers': 'Poder',
                'bonus': 'Bônus'
            };
            return origins[type] || type;
        };

        const renderSkill = (skill: Skill) => (
            <Box
                key={`${skill.name}-${skill.type}`}
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                layout
                sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'center',
                    minHeight: 120,
                    height: '100%',
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 2,
                        borderColor: 'primary.main',
                        backgroundColor: 'background.default',
                        zIndex: 1
                    },
                    '&:active': {
                        transform: 'translateY(-1px)'
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        backgroundColor: 'primary.main',
                        transform: 'scaleX(0.3)',
                        transformOrigin: 'left',
                        transition: 'transform 0.3s ease-in-out, opacity 0.2s ease',
                        opacity: 0.7
                    },
                    '&:hover::before': {
                        transform: 'scaleX(1)',
                        opacity: 1
                    }
                }}
                onClick={e => { handleSkillClick(e, skill) }}
            >
                <Box sx={{ 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flex: 1
                }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 500,
                            color: 'text.primary',
                            px: 0.5,
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            lineHeight: 1.3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '3.5em',
                            maxHeight: '3.5em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mb: 0.5
                        }}
                    >
                        {skill.name}
                    </Typography>
                    {(skill.level || skill.level === 0) && (
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{
                                fontSize: '0.7rem',
                                lineHeight: 1,
                                opacity: 0.8,
                                display: 'inline-block',
                                backgroundColor: 'action.hover',
                                px: 0.8,
                                py: 0.2,
                                borderRadius: 1,
                                mb: 1
                            }}
                        >
                            {skill.level === 0 ? 'Poder de Classe' : `Nv. ${skill.level}`}
                        </Typography>
                    )}
                </Box>
                
                <Box 
                    sx={{
                        width: '100%',
                        textAlign: 'left',
                        mt: 'auto',
                        pt: 0.5,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                            fontSize: '0.6rem',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            opacity: 0.7,
                            display: 'block',
                            textAlign: 'left',
                            lineHeight: 1.2
                        }}
                    >
                        {getOriginLabel(skill.type)}
                    </Typography>
                </Box>
            </Box>
        )

        if (skillsFilter === 'all') {
            return [
                ...(formSkills?.class || []),
                ...(formSkills?.subclass || []),
                ...(formSkills?.bonus || []),
                ...(formSkills?.powers || []),
                ...(formSkills?.lineage || []),
                ...(formSkills?.race || [])
            ].map(renderSkill)
        } else {
            const filteredSkills = formSkills[skillsFilter as keyof typeof formSkills] || []
            return Array.isArray(filteredSkills) 
                ? filteredSkills.map(renderSkill)
                : []
        }
    }, [ formSkills, skills, skillsFilter, getValues, setValue, handleSkillClick ])
    
    // Exibe erros de validação se houver
    const renderErrors = () => {
        const skillsError = errors.skills as any
        if (!skillsError) return null
        
        return (
            <FormHelperText error sx={{ mt: 1 }}>
                {skillsError.message || 'Erro nas habilidades'}
            </FormHelperText>
        )
    }

    useEffect(() => {
        // Resetar o estado de exibição de maestria ao mudar de habilidade
        setShowMasteryDescription(false)
    }, [ selectedSkill ])
    
    // Verifica se a habilidade selecionada é um poder mágico e corresponde à maestria elemental
    const canShowMasteryDescription = useMemo(() => {
        if (!selectedSkill || !elementalMastery || selectedSkill.type !== 'Poder Mágico') return false
        return selectedSkill.element === elementalMastery?.toUpperCase()
    }, [ selectedSkill, elementalMastery ])

    return (
        <Box
            width='100%'
            display='flex'
            flexDirection='column'
            gap={2}
        >
            {/* Cabeçalho com título e pontos disponíveis */}
            <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                px={2} 
                pt={1}
            >
                <Typography variant="h6" fontWeight={600}>
                    Habilidades
                </Typography>
                <Chip 
                    label={`${skillPoints || 0} pontos disponíveis`}
                    color="primary"
                    size="small"
                    sx={{
                        fontWeight: 'bold',
                        '& .MuiChip-label': {
                            px: 1.5
                        }
                    }}
                />
            </Box>
            <Box
                display='grid'
                gridTemplateColumns='repeat(5, 1fr)'
                gap={1.5}
                p={2}
                sx={{
                    [theme.breakpoints.down('xl')]: {
                        gridTemplateColumns: 'repeat(4, 1fr)'
                    },
                    [theme.breakpoints.down('lg')]: {
                        gridTemplateColumns: 'repeat(3, 1fr)'
                    },
                    [theme.breakpoints.down('md')]: {
                        gridTemplateColumns: 'repeat(3, 1fr)'
                    },
                    [theme.breakpoints.down('sm')]: {
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 1,
                        p: 1.5
                    },
                    [theme.breakpoints.down('xs')]: {
                        gridTemplateColumns: 'repeat(1, 1fr)'
                    }
                }}
            >
                <Chip 
                    label='Todos' 
                    onClick={() => setSkillsFilter('all')} 
                    sx={filterBtnStyle} 
                    color={skillsFilter === 'all' ? 'primary' : 'default'}
                />
                <Chip 
                    label='Classe' 
                    onClick={() => setSkillsFilter('class')} 
                    sx={filterBtnStyle} 
                    color={skillsFilter === 'class' ? 'primary' : 'default'}
                />
                <Chip 
                    label='Subclasse' 
                    onClick={() => setSkillsFilter('subclass')} 
                    sx={filterBtnStyle} 
                    color={skillsFilter === 'subclass' ? 'primary' : 'default'}
                />
                <Chip 
                    label='Raça' 
                    onClick={() => setSkillsFilter('race')} 
                    sx={filterBtnStyle} 
                    color={skillsFilter === 'race' ? 'primary' : 'default'}
                />
                <Chip 
                    label='Linhagem' 
                    onClick={() => setSkillsFilter('lineage')} 
                    sx={filterBtnStyle} 
                    color={skillsFilter === 'lineage' ? 'primary' : 'default'}
                />
                <Chip 
                    label='Poderes' 
                    onClick={() => setSkillsFilter('powers')} 
                    sx={filterBtnStyle} 
                    color={skillsFilter === 'powers' ? 'primary' : 'default'}
                />
                <Chip 
                    label='Bônus' 
                    onClick={() => setSkillsFilter('bonus')} 
                    sx={filterBtnStyle} 
                    color={skillsFilter === 'bonus' ? 'primary' : 'default'}
                />
            </Box>
            
            {renderErrors()}
            
            <Box
                display='flex'
                minHeight='40rem'
                width='100%'
                gap={4}
                flexDirection='column'
            >
                <FormControl
                    error={!!errors.skills}
                    sx={{
                        width: '100%',
                        bgcolor: 'background.paper3',
                        borderRadius: 2,
                        p: 2,
                        border: errors.skills ? '1px solid' : 'none',
                        borderColor: 'error.main',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: 1.5,
                            [theme.breakpoints.down('xl')]: {
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))'
                            },
                            [theme.breakpoints.down('lg')]: {
                                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))'
                            },
                            [theme.breakpoints.down('md')]: {
                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))'
                            },
                            [theme.breakpoints.down('sm')]: {
                                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                                gap: 1
                            },
                            [theme.breakpoints.down('xs')]: {
                                gridTemplateColumns: '1fr'
                            }
                        }}
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            {skillsRender}
                        </AnimatePresence>
                    </Box>
                </FormControl>

                {selectedSkill && (
                    <Box 
                        bgcolor='background.paper3' 
                        borderRadius={2} 
                        p={3}
                        flex={1}
                        overflow='hidden'
                        key={`skill-${selectedSkill.name}`}
                    >
                        <Box display='flex' flexDirection='column' gap={2}>
                            <Box>
                                <Typography 
                                    fontWeight={900} 
                                    fontFamily='Inter' 
                                    variant='h4'
                                    color='primary.main'
                                >
                                    {selectedSkill.name}
                                </Typography>
                                <Typography variant='subtitle1' color='text.secondary'>
                                    {selectedSkill.type}
                                    {selectedSkill.origin && ` • ${selectedSkill.origin}`}
                                    {(selectedSkill?.level || selectedSkill?.level === 0) && (
                                        selectedSkill?.level === 0 
                                            ? ' • Poder de Classe'
                                            : ` • Nível ${selectedSkill?.level}`
                                    )}
                                </Typography>
                            </Box>
                    
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={`desc-${selectedSkill.name}`}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ 
                                        opacity: 1, 
                                        height: 'auto',
                                        transition: { 
                                            opacity: { duration: 0.3, delay: 0.1 },
                                            height: { duration: 0.4 }
                                        }
                                    }}
                                    exit={{ 
                                        opacity: 0, 
                                        height: 0,
                                        transition: { 
                                            opacity: { duration: 0.2 },
                                            height: { duration: 0.3 }
                                        }
                                    }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <Box mt={2}>
                                        <Typography 
                                            variant='body1' 
                                            whiteSpace='pre-wrap' 
                                            lineHeight={1.6}
                                        >
                                            {canShowMasteryDescription && showMasteryDescription
                                                ? selectedSkill.mastery || 'Este poder não possui descrição específica de maestria.'
                                                : selectedSkill.description}
                                        </Typography>
                                        {canShowMasteryDescription && (
                                            <Box display="flex" justifyContent="flex-end" mb={1}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="secondary"
                                                    startIcon={<AutoFixHighIcon />}
                                                    onClick={() => setShowMasteryDescription(prev => !prev)}
                                                    sx={{
                                                        borderRadius: 4,
                                                        textTransform: 'none',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        px: 1.5,
                                                        '&:hover': {
                                                            backgroundColor: 'secondary.main',
                                                            color: 'secondary.contrastText'
                                                        }
                                                    }}
                                                >
                                                    {showMasteryDescription ? 'Descrição Normal' : 'Maestria Elemental'}
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                    
                                    {selectedSkill.effects && selectedSkill.effects.length > 0 && (
                                        <Box mt={2}>
                                            <Typography variant='subtitle2' fontWeight='bold' mb={1}>
                                                Efeitos:
                                            </Typography>
                                        </Box>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </Box>
                    </Box>
                )}
                
                {!selectedSkill && (
                    <Box 
                        display='flex' 
                        alignItems='center' 
                        justifyContent='center' 
                        height='100%'
                        flexDirection='column'
                        gap={2}
                        textAlign='center'
                        p={4}
                        bgcolor='background.paper3'
                        borderRadius={2}
                        flex={1}
                    >
                        <Typography variant='h6' color='text.secondary'>
                            Selecione uma habilidade para ver os detalhes
                        </Typography>
                        <Typography variant='body2' color='text.disabled'>
                            Clique em qualquer habilidade para visualizar suas informações completas
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    )
}