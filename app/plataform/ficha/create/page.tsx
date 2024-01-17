'use client';

import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Formik  } from 'formik'
import { fichaModel } from '@constants/ficha';
import { useSession } from 'next-auth/react';
import { useState, type ReactElement } from 'react'
import type { Expertises as ExpertisesType, Ficha } from '@types';
import { Attributes, Characteristics, Expertises, Inventory, Magics, Skills } from '@components/ficha';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { WarningModal } from '@layout';

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
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const router = useRouter()

    const [ openModal, setOpenModal ] = useState<boolean>(false)

    const initialValues: Ficha = { 
        ...fichaModel as Ficha,
        playerName: session?.user?.name ?? 'undefined'
        // playerId: session?.user?._id ?? 0
    }

    const submitForm = (values: typeof initialValues): void => {
        enqueueSnackbar('Aguarde...', { variant: 'info', key: 'loadingFetch' })

        setTimeout(() => {
            try {
                (async () => {
                    const expertisesValues: Partial<ExpertisesType> = {}
    
                    for (const expertise in values.expertises) {
                        const value = values.expertises[expertise as keyof ExpertisesType].value
                        expertisesValues[expertise as keyof ExpertisesType] = value as any
                    }
    
                    const response = await fetch('/api/ficha', {
                        method: 'POST',
                        body: JSON.stringify({
                            ...values,
                            expertises: expertisesValues
                        })
                    }).then(async r => await r.json())
    
                    closeSnackbar('loadingFetch')
                    console.log(response);
                    
                    enqueueSnackbar('Ficha criada com sucesso!', { variant: 'success' })
    
                    // setTimeout(() => {
                    //     router.push('/plataform/ficha')
                    // }, 200);
                })()
            } catch (error: any) {
                closeSnackbar('loadingFetch')
                enqueueSnackbar(`Algo deu errado: ${error.message}`, { variant: 'error' })
            }   
        }, 1000);
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
                onSubmit={() => { setOpenModal(true) }}
            >
                {({ handleSubmit, values }) => (
                    <>
                        <Box
                            display='flex'
                            minHeight='100vh'
                            width='100%'
                            flexDirection='column'
                            component='form'
                            onSubmit={handleSubmit}
                            p={5} 
                            gap={5}
                        >
                            <Box display='flex' flexDirection='column' gap={2.5}>
                                <Box justifyContent='space-between' display='flex' width='100%'>
                                    <Typography variant='h5'>Criar ficha</Typography>
                                    <Button 
                                        variant='contained' 
                                        color={'terciary' as any}
                                        type='submit'
                                    >Enviar</Button>
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
                        <WarningModal 
                            open={openModal}
                            onClose={() => { setOpenModal(false) }}
                            onConfirm={() => { submitForm(values); setOpenModal(false) }}
                            text='Não serão possíveis algumas alterações depois de criada. Tem certeza que deseja criar esta ficha?'
                            title='Cuidado!'
                        />
                    </>
                )}
            </Formik>
        </Box>
    )
}