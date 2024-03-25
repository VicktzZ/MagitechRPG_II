/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Box, FormControl, type SxProps, Typography, useMediaQuery, useTheme, Chip } from '@mui/material'
import { useState, type ReactElement, type MouseEvent, useRef, useMemo, useCallback } from 'react'
import type { Classes, Ficha, Skill } from '@types'
import { useFormikContext, type FormikContextType } from 'formik'
import { skills } from '@constants/skills';

type skillsFilterType = 'all' | 'class' | 'subclass' | 'lineage' | 'powers' | 'bonus'

export default function Skills(): ReactElement {
    const f: FormikContextType<Ficha> = useFormikContext()
    const skillRef = useRef<EventTarget & HTMLSpanElement | null>()
    const [ selectedSkill, setSelectedSkill ] = useState<Skill | null>(null)
    const [ skillsFilter, setSkillsFilter ] = useState<skillsFilterType>('all')
    
    const theme = useTheme()

    const filterBtnStyle: SxProps = {
        [ theme.breakpoints.down('md') ]: {
            height: 30,
            width: 70,
            fontSize: '0.6rem'
        },
        '&': {
            transition: '.1s ease-in-out',
            cursor: 'pointer',
            ':hover': {
                filter: 'brightness(0.75)'
            }
        }
    }

    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const onClick = useCallback((event: MouseEvent<HTMLSpanElement>, skill: Skill): void => {
        if (skillRef.current) {
            skillRef.current.style.backgroundColor = 'transparent'
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
        const classSkillsByLevel = Object.values(skills.class[f.values.class as Classes] ?? {}).filter(sk => sk.level as unknown as number <= f.values.level)

        f.values.skills.class = classSkillsByLevel

        if (skillsFilter === 'all') {
            return Object.values(f.values.skills).map(item => item.map(skill => (
                <Typography
                    key={skill.name}
                    noWrap
                    onClick={e => { onClick(e, skill) }}
                    sx={{
                        cursor: 'pointer',
                        p: 0.5
                    }}
                >
                    {skill.name}
                </Typography>
            )))
        } else {
            return f.values.skills[skillsFilter].map(skill => (
                <Typography
                    key={skill.name}
                    noWrap
                    onClick={e => { onClick(e, skill) }}
                    sx={{
                        cursor: 'pointer',
                        p: 0.5
                    }}
                >
                    {skill.name}
                </Typography>
            ))
        }
    }, [ f, onClick, skillsFilter ])

    return (
        <Box
            width='100%'
            display='flex'
            flexDirection='column'
            gap={2}
        >
            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                gap={1}
                p={2}
            >
                <Chip onClick={() => { setSkillsFilter('all') }} sx={filterBtnStyle} label='Todos' />
                <Chip onClick={() => { setSkillsFilter('class') }} sx={filterBtnStyle} label='Classe' />
                <Chip onClick={() => { setSkillsFilter('subclass') }} sx={filterBtnStyle} label='Subclasse' />
                <Chip onClick={() => { setSkillsFilter('lineage') }} sx={filterBtnStyle} label='Linhagem' />
                <Chip onClick={() => { setSkillsFilter('powers') }} sx={filterBtnStyle} label='Poderes' />
                <Chip onClick={() => { setSkillsFilter('bonus') }} sx={filterBtnStyle} label='Bônus' />
            </Box>
            <Box
                display='flex'
                minHeight={matches ? '40rem' : '25rem'}
                maxHeight={matches ? '60rem' : '35rem'}
                gap={4}
                flexDirection={matches ? 'column' : 'row'}
            >
                <FormControl
                    sx={{
                        height: '35rem',
                        width: matches ? '100%' : '20%',
                        bgcolor: 'background.paper3',
                        borderRadius: 2,
                        overflow: 'auto',
                        p: 2
                    }}
                >
                    {skillsRender}
                </FormControl>
                <Box
                    minHeight={matches ? '40rem' : '100%'}
                    width={matches ? '100%' : '80%'}
                    bgcolor='background.paper3'
                    borderRadius={2}
                >
                    <Box 
                        overflow='auto'
                        maxHeight='35rem' 
                        display='flex' 
                        flexDirection='column' 
                        gap={3} 
                        p={2}
                    >
                        <Box>
                            <Typography fontWeight={900} fontFamily='Inter' variant='h4'>{selectedSkill?.name} { selectedSkill ? `(${selectedSkill?.type})` : ''}</Typography>
                        </Box>
                        <Box>
                            <Typography whiteSpace='pre-wrap'>{selectedSkill?.description}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>        
    )
}