'use client';

import { Backdrop, Box, Button, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Formik } from 'formik'
import { useSession } from 'next-auth/react';
import { useState, type ReactElement } from 'react'
import { Attributes, Characteristics, Expertises, Inventory, Magics, Skills, SkillsModal } from '@components/ficha';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { CustomIconButton, WarningModal } from '@layout';
import { fichaModel } from '@constants/ficha';
import { Edit } from '@mui/icons-material';
import type { Ficha } from '@types';

export default function FichaComponent({ disabled, ficha }: { disabled?: boolean, ficha: Ficha }): ReactElement {
    const { data: session } = useSession()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const router = useRouter()

    const [ openModal, setOpenModal ] = useState<boolean>(false)
    const [ isLoading, setIsLoading ] = useState<boolean>(false)

    const [ openSkillsModal, setOpenSkillsModal ] = useState<boolean>(false)

    const initialValues: Ficha = {
        ...fichaModel,
        ...ficha,
        playerName: session?.user?.name ?? 'undefined',
        userId: session?.user?._id ?? 'undefined'
    }

    const submitForm = (values: typeof initialValues): void => {
        enqueueSnackbar('Aguarde...', { variant: 'info', key: 'loadingFetch', autoHideDuration: 6000 })

        console.log(values)

        if (disabled) {
            setTimeout(() => {
                (async () => {
                    try {
                        const response = await fetch(`/api/ficha/${values._id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                                ...values,
                                attributes: {
                                    ...values.attributes,
                                    ap: initialValues.attributes.ap,
                                    lp: initialValues.attributes.lp,
                                    mp: initialValues.attributes.mp
                                }
                            })
                        }).then(async r => await r.json())

                        closeSnackbar('loadingFetch')

                        console.log(response);

                        enqueueSnackbar('Ficha salva com sucesso!', { variant: 'success' })
                    } catch (error: any) {
                        closeSnackbar('loadingFetch')
                        enqueueSnackbar(`Algo deu errado: ${error.message}`, { variant: 'error' })
                    }
                })()
            }, 1000);
        } else {
            setTimeout(() => {
                (async () => {
                    try {
                        if (values.points.attributes === 0) {
                            // const expertisesValues: Partial<ExpertisesType> = {}
    
                            // for (const expertise in values.expertises) {
                            //     const value = values.expertises[expertise as keyof ExpertisesType].value
                            //     expertisesValues[expertise as keyof ExpertisesType] = value as any
                            // }
    
                            console.log(values);
    
                            const response = await fetch('/api/ficha', {
                                method: 'POST',
                                body: JSON.stringify({
                                    ...values
                                })
                            }).then(async r => await r.json())
    
                            closeSnackbar('loadingFetch')
                            console.log(response);
    
                            enqueueSnackbar('Ficha criada com sucesso!', { variant: 'success' })
    
                            setIsLoading(true)
    
                            setTimeout(() => {
                                router.push('/plataform/ficha/' + response._id)
                            }, 500);
                        } else {
                            enqueueSnackbar('Você deve gastar seus pontos de atributos!', { variant: 'error', autoHideDuration: 3000 })
                        }
                    } catch (error: any) {
                        closeSnackbar('loadingFetch')
                        enqueueSnackbar(`Algo deu errado: ${error.message}`, { variant: 'error' })
                    }
                })()
            }, 1000);
        }
    }
    
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    return ficha && (
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
                            p={1}
                            pt={3}
                            gap={5}
                        >
                            <Box display='flex' flexDirection='column' gap={2.5}>
                                <Box justifyContent='space-between' display='flex' width='100%'>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Typography fontFamily='Sakana' variant='h4'>{!disabled ? 'Criar ficha' : 'Ficha de ' + values.name}</Typography>
                                    </Box>
                                    <Button
                                        variant='contained'
                                        color={'terciary' as any}
                                        type={!disabled ? 'submit' : 'button'}
                                        onClick={disabled ? () => { submitForm(values) } : () => { }}
                                    >{!disabled ? 'Enviar' : 'Salvar Mudanças'}</Button>
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
                                            <Typography fontFamily='Sakana' variant='h5'>Atributos</Typography>
                                        </Box>
                                        <Attributes disabled={disabled} />
                                    </Box>
                                    <Box>
                                        <Box display='flex' alignItems='center' gap={2}>
                                            <Typography fontFamily='Sakana' variant='h5'>Habilidades</Typography>
                                            <CustomIconButton onClick={() => { setOpenSkillsModal(true) }}>
                                                <Edit />
                                            </CustomIconButton>
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
                                        <Typography fontFamily='Sakana' variant='h5'>Perícias</Typography>
                                    </Box>
                                    <Box display='flex' width='100%' gap={3}>
                                        <Expertises disabled={disabled} />
                                    </Box>
                                </Box>
                            </Box>
                            <Box display='flex' flexDirection='column' gap={5} width='100%'>
                                <Inventory disabled={disabled} />
                            </Box>
                            <Box display='flex' flexDirection='column' gap={5} width='100%'>
                                <Magics disabled={disabled} />
                            </Box>
                            <Box display='flex' flexDirection='column' gap={2}>
                                <Typography fontFamily='Sakana' variant='h6'>Anotações</Typography>
                                <Box
                                    component='textarea'
                                    width='100%'
                                    p={2}
                                    height='30rem'
                                    color='white'
                                    fontSize='1.1rem'
                                    bgcolor='background.paper'
                                    onChange={e => { values.anotacoes = e.target.value }}
                                    defaultValue={values.anotacoes}
                                    placeholder='Clique aqui e insira suas anotações!'
                                    sx={{
                                        resize: 'none',
                                        borderRadius: 1,
                                        '&:focus': {
                                            outline: 'none'
                                        }
                                    }}
                                />
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
                        {openSkillsModal && (
                            <SkillsModal
                                open={openSkillsModal}
                                onClose={() => { setOpenSkillsModal(false) }}
                            />
                        )}
                    </>
                )}
            </Formik>
        </Box>
    )
}