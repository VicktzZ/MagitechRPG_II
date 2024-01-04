'use client';

import { Box, FormControl, InputLabel, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useState, type ReactElement, type ChangeEvent, MouseEventHandler, MouseEvent, useRef } from 'react'
import type { Ficha, Skill } from '@types'
import type { FormikContextType } from 'formik'
import { skills } from '@constants/skills';

const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder'
];

export default function Skills({ formik }: { formik: any }): ReactElement {
    const f: FormikContextType<Ficha> = formik
    const skillRef = useRef<EventTarget & HTMLSpanElement | null>()
    const [ selectedSkill, setSelectedSkill ] = useState<Skill | null>(null)
    
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const onClick = (event: MouseEvent<HTMLSpanElement>, skill: Skill): void => {
        if (skillRef.current) {
            skillRef.current.style.backgroundColor = 'transparent'
        }

        if (skillRef.current === event.currentTarget) {
            event.currentTarget.style.backgroundColor = 'transparent'
            setSelectedSkill(null)

            return 
        }

        event.currentTarget.style.backgroundColor = theme.palette.background.paper

        setSelectedSkill(skill)

        skillRef.current = event.currentTarget
    }
    
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
                gap={2}
                p={2}
            >
                <Typography>Todos</Typography>
                <Typography>Classe</Typography>
                <Typography>Subclasse</Typography>
                <Typography>Linhagem</Typography>
                <Typography>Poderes</Typography>
                <Typography>Bõnus</Typography>
            </Box>
            <Box
                display='flex'
                minHeight='25rem'
                maxHeight='35rem'
                gap={4}
            >
                <FormControl
                    sx={{
                        minHeight: '100%',
                        width: '20%',
                        bgcolor: 'background.paper3',
                        borderRadius: 2,
                        overflow: 'auto',
                        p: 2
                    }}
                >
                    {Object.values(f.values.skills).map(item => item.map(skill => (
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
                    )))}
                </FormControl>
                <Box
                    minHeight='100%'
                    width='80%'
                    bgcolor='background.paper3'
                    borderRadius={2}
                >
                    <Box 
                        overflow='auto' 
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