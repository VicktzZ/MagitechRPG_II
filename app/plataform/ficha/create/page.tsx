'use client';

import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Formik  } from 'formik'
import { fichaModel } from '@constants/ficha';
import { useSession } from 'next-auth/react';
import { type ReactElement } from 'react'
import type { Ficha } from '@types';
import { Attributes, Characteristics, Expertises, Inventory, Magics, Skills } from '@components/ficha';

// import * as Yup from 'yup'

// const validationSchema = Yup.object().shape({
//     playerName: Yup.string().notRequired().default(''),
//     name: Yup.string().notRequired(),
//     age: Yup.number().notRequired(),
//     gender: Yup.string().notRequired(),
//     class: Yup.string().notRequired(),
//     race: Yup.string().notRequired(),
//     lineage: Yup.string().notRequired(),
//     financialCondition: Yup.string().notRequired().default(''),
//     capacity: Yup.number().notRequired().default(5),
//     displacement: Yup.number().notRequired().default(9),
//     skills: Yup.array().of(Yup.string()).notRequired().default([]),
//     magics: Yup.array().of(Yup.string()).notRequired().default([]),
//     expertises: Yup.array().of(Yup.string()).notRequired().default([]),
//     perks: Yup.array().of(Yup.string()).notRequired().default([]),
//     penalties: Yup.array().of(Yup.string()).notRequired().default([]),
//     attributes: Yup.number().notRequired().default(9),
//     subClass: Yup.string().notRequired().default(''),
//     level: Yup.number().notRequired().default(0),
//     elementMastery: Yup.string().notRequired().default(''),

//     inventory: Yup.object().notRequired().default({
//         items: [],
//         weapons: [],
//         armors: [],
//         money: 0
//     }),

//     points: Yup.object().notRequired().default({
//         attributes: 9,
//         expertises: 0,
//         skills: 0,
//         magics: 0
//     })
// })

export default function FichaComponent({ disabled }: { disabled?: boolean }): ReactElement {
    const { data: session } = useSession()

    const initialValues: Ficha = { 
        ...fichaModel as Ficha,
        playerName: session?.user?.name ?? ''
    }

    const onSubmit = (values: any): void => {
        console.log(values)
    }

    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    return (
        <Box 
            display='flex' 
            height='100%' 
            width='100%'
            borderRadius='10px'
        >
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
            >
                <Box
                    display='flex'
                    minHeight='100vh'
                    width='100%'
                    flexDirection='column'
                    component='form'
                    p={5} 
                    gap={5}
                >
                    <Box display='flex' flexDirection='column' gap={2.5}>
                        <Box>
                            <Typography variant='h5'>Criar ficha</Typography>
                        </Box>
                        <Box width='100%'>
                            <Box
                                sx={{
                                    display: 'flex',
                                    width: '100%',
                                    flexDirection: 'column',
                                    gap: 5
                                }} 
                            >
                                <Characteristics />
                            </Box>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: matches ? 'column' : 'row',
                            width: '100%',
                            gap: 8
                        }} 
                    >
                        <Box 
                            width='100%'
                            display='flex'
                            flexDirection='column'
                            gap={8}
                        >
                            <Box>
                                <Box>
                                    <Typography variant='h6'>Atributos</Typography>
                                </Box>
                                <Attributes />
                            </Box>
                            <Box>
                                <Box>
                                    <Typography variant='h6'>Habilidades</Typography>
                                </Box>
                                <Skills />
                            </Box>
                        </Box>
                        <Box 
                            width='100%'
                            display='flex'
                            flexDirection='column'
                            gap={2.5}
                        >
                            <Box>
                                <Typography variant='h6'>Perícias</Typography>
                            </Box>
                            <Box display='flex' width='100%' gap={3}>
                                <Expertises />
                            </Box>
                        </Box>
                    </Box>
                    <Box display='flex' flexDirection='column' gap={5} width='100%'>
                        <Inventory />
                    </Box>
                    <Box display='flex' flexDirection='column' gap={5} width='100%'>
                        <Magics />
                    </Box>
                </Box>
            </Formik>
        </Box>
    )
}