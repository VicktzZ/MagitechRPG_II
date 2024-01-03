'use client';

import { Box, FormControl, InputLabel, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useState, type ReactElement, type ChangeEvent, MouseEventHandler, MouseEvent, useRef } from 'react'
import type { Ficha } from '@types'
import type { FormikContextType } from 'formik'

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
    const [ selected, setSelected ] = useState<string | null>(null)
    
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const onClick = (event: MouseEvent<HTMLSpanElement>): void => {
        if (skillRef.current) {
            skillRef.current.style.backgroundColor = 'transparent'
        }

        if (skillRef.current === event.currentTarget) {
            event.currentTarget.style.backgroundColor = 'transparent'
            setSelected(null)

            return 
        }

        event.currentTarget.style.backgroundColor = theme.palette.background.paper

        setSelected(event.currentTarget.innerHTML)

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
                    {names.map((name) => (
                        <Typography
                            key={name}
                            noWrap
                            onClick={onClick}
                            sx={{
                                cursor: 'pointer',
                                p: 0.5
                            }}
                        >
                            {name}
                        </Typography>
                    ))}
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
                            <Typography fontFamily='WBZ' variant='h3'>Visão do futuro</Typography>
                        </Box>
                        <Box>
                            <Typography whiteSpace='pre-wrap'>{selected}</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>        
    )
}