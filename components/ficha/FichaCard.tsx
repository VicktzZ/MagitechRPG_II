'use client';

import { CustomIconButton, WarningModal } from '@layout'
import { ArrowRight } from '@mui/icons-material'
import { Box, Button, Card, Typography, useMediaQuery, useTheme } from '@mui/material'
import type { Ficha } from '@types'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack';
import { useState, type ReactElement } from 'react'

export default function FichaCard({ ficha, onClick, disableDeleteButton }: { ficha: Ficha, onClick?: () => void, disableDeleteButton?: boolean }): ReactElement {
    const theme = useTheme()
    const router = useRouter()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    const [ openModal, setOpenModal ] = useState<boolean>(false)

    const deleteFicha = (): void => {
        (async () => {
            setOpenModal(false) 
            enqueueSnackbar('Aguarde...', { variant: 'info', key: 'loadingDelete', autoHideDuration: 6000 })

            try {
                await fetch(`/api/ficha/${ficha._id}`, {
                    method: 'DELETE'
                })

                setTimeout(() => {
                    closeSnackbar('loadingDelete')
                    enqueueSnackbar(`Ficha ${ficha.name} deletada!`, { variant: 'success' })
                    window.location.reload()
                }, 500);
            } catch (error: any) {
                enqueueSnackbar(`Algo deu errado: ${error.message}`, { variant: 'error' })
            }
        })()
    }

    return (
        <>
            <Card
                onClick={onClick ?? (() => { router.push(`/plataform/ficha/${ficha._id}`) })}
                key={ficha._id}
                sx={{
                    display: 'flex',
                    height: !matches ? '15rem' : '20rem',
                    width: !matches ? '20rem' : '25rem',
                    backgroundColor: 'background.paper3',
                    cursor: 'pointer',
                    transition: '.3s ease-in-out',
                    ':hover': {
                        transform: 'scale(1.05)'
                    }
                }}
            >
                <Box display='flex' width='100%' flexDirection='column' justifyContent='center'>
                    <Box alignItems='center' justifyContent='center' width='100%' display='flex' gap={2}>
                        <Box display='flex' width='50%' flexDirection='column'>
                            <Typography variant='h6'>{ficha.name}</Typography>
                            <Box display='flex' width='100%' gap={1} flexDirection='column'>
                                <Box display='flex' width='100%' flexDirection='column'>
                                    <Typography variant='caption'>{ficha.gender}</Typography>
                                    <Typography variant='caption'>Nível: {ficha.level}</Typography>
                                </Box>
                                <Box display='flex' flexDirection='column'>
                                    <Typography variant='caption'>{ficha.class as string}</Typography>
                                    <Typography variant='caption'>{ficha.lineage as unknown as string}</Typography>
                                    <Typography variant='caption'>{ficha.race as string}</Typography>
                                    <Typography variant='caption'>¥{ficha.inventory.money}</Typography>
                                </Box>
                            </Box>
                        </Box>
                        <CustomIconButton>
                            <ArrowRight />
                        </CustomIconButton>
                    </Box>
                    {!disableDeleteButton && (
                        <Box pr={3} display='flex' justifyContent='right'>
                            <Button 
                                onClick={e => { e.stopPropagation(); setOpenModal(true) } } 
                                variant='contained' 
                                color={'terciary' as any}
                            >Deletar</Button>
                        </Box>
                    )}
                </Box>
            </Card>
            <WarningModal 
                open={openModal}
                onClose={() => { setOpenModal(false) }}
                onConfirm={deleteFicha}
                title='Tem certeza que deseja deletar essa ficha?'
                text='Esta ação é irreversível!'
            />
        </>
    )
}