'use client';

import { Backdrop, Box, Button, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Formik  } from 'formik'
import { fichaModel } from '@constants/ficha';
import { useSession } from 'next-auth/react';
import { useState, type ReactElement } from 'react'
import type { Expertises as ExpertisesType, Ficha } from '@types';
import { Attributes, Characteristics, Expertises, Inventory, Magics, Skills } from '@components/ficha';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { WarningModal } from '@layout';

export default function FichaComponent({ disabled, ficha }: { disabled?: boolean, ficha?: Ficha }): ReactElement {
    const { data: session }: any = useSession()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const router = useRouter()

    const [ openModal, setOpenModal ] = useState<boolean>(false)
    const [ isLoading, setIsLoading ] = useState<boolean>(false)

    const initialValues: Ficha = { 
        ...fichaModel as Ficha,
        playerName: session?.user?.name ?? 'undefined',
        userId: session?.user?._id ?? 'undefined'
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
    
                    setIsLoading(true)

                    setTimeout(() => {
                        router.push('/plataform/ficha/' + response._id)
                    }, 500);
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
                {({ handleSubmit, values, errors }) => (
                    <>
                        <Box
                            display='flex'
                            minHeight='100vh'
                            width='100%'
                            flexDirection='column'
                            component='form'
                            onSubmit={handleSubmit}
                            p={1}
                            pt={3} 
                            gap={5}
                        >
                            <Box display='flex' flexDirection='column' gap={2.5}>
                                {!disabled && (
                                    <Box justifyContent='space-between' display='flex' width='100%'>
                                        <Typography variant='h5'>Criar ficha</Typography>
                                        <Button 
                                            variant='contained' 
                                            color={'terciary' as any}
                                            type='submit'
                                        >Enviar</Button>
                                    </Box>
                                )}
                                <Box width='100%'>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: '100%',
                                            flexDirection: 'column',
                                            gap: 5
                                        }} 
                                    >
                                        <Characteristics disabled={disabled} />
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
                        <Backdrop open={isLoading}>
                            <CircularProgress />
                        </Backdrop>
                    </>
                )}
            </Formik>
        </Box>
    )
}