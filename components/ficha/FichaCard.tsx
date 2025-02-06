'use client';

import { toastDefault } from '@constants';
import { CustomIconButton, WarningModal } from '@layout'
import { ArrowRight } from '@mui/icons-material'
import { Box, Button, Card, Typography, useMediaQuery, useTheme } from '@mui/material'
import { fichaService } from '@services';
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
            enqueueSnackbar('Aguarde...', toastDefault('loadingDelete', 'info'))

            try {
                await fichaService.deleteById(ficha._id ?? '')
                setTimeout(() => {
                    closeSnackbar('loadingDelete')
                    enqueueSnackbar(`Ficha ${ficha.name} deletada!`, toastDefault('itemDeleted', 'success'))
                    window.location.reload()
                }, 500);
            } catch (error: any) {
                enqueueSnackbar(`Algo deu errado: ${error.message}`, toastDefault('error', 'error'))
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
                                    <Typography variant='caption'>Modo de Jogo: {ficha.mode}</Typography>
                                </Box>
                                <Box display='flex' flexDirection='column'>
                                    <Typography variant='caption'>{ficha.class as string}</Typography>
                                    <Typography variant='caption'>{ficha.lineage as unknown as string}</Typography>
                                    <Typography variant='caption'>{ficha.race as string}</Typography>
                                    <Typography variant='caption'>{ficha.mode === 'Classic' ? '¥' : '¢'}{ficha.inventory.money}</Typography>
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