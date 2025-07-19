'use client';

import { toastDefault } from '@constants';
import { WarningModal } from '@layout';
import {
    ArrowForward,
    AttachMoney,
    Delete,
    Star
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Card,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { fichaService } from '@services';
import type { Ficha } from '@types';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useState, type ReactElement } from 'react';

export default function FichaCard({ ficha, onClick, disableDeleteButton, onDelete }: { ficha: Ficha, onClick?: () => void, disableDeleteButton?: boolean, onDelete?: () => void }): ReactElement {
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
                    onDelete?.()
                }, 500);
            } catch (error: any) {
                enqueueSnackbar(`Algo deu errado: ${error.message}`, toastDefault('error', 'error'))
            }
        })()
    }

    return (
        <>
            <Card
                onClick={onClick ?? (() => { router.push(`/app/ficha/${ficha._id}`) })}
                key={ficha._id}
                sx={{
                    position: 'relative',
                    height: !matches ? 290 : 320,
                    width: !matches ? 320 : '100%',
                    maxWidth: 360,
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(160deg, #1a2234 0%, #2a3441 100%)'
                        : 'linear-gradient(160deg, #f8fafc 0%, #edf2f7 100%)',
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    boxShadow: theme.palette.mode === 'dark' 
                        ? '0 8px 16px rgba(0,0,0,0.3)'
                        : '0 8px 16px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 12px 20px rgba(0,0,0,0.4)'
                            : '0 12px 20px rgba(0,0,0,0.12)',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
                    },
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: theme.palette.primary.main,
                        opacity: 0.9
                    }
                }}
            >
                <Stack spacing={1} sx={{ p: 2.5, height: '100%' }}>
                    {/* Header com Avatar e Nome */}
                    <Box display='flex' alignItems='center' gap={2}>
                        <Avatar
                            sx={{
                                width: 46,
                                height: 46,
                                background: theme.palette.primary.main,
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                boxShadow: 1
                            }}
                        >
                            {ficha.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box flex={1}>
                            <Typography 
                                variant='h6' 
                                sx={{ 
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    mb: 0.5,
                                    fontSize: !matches ? '1.1rem' : '1.25rem'
                                }}
                            >
                                {ficha.name}
                            </Typography>
                            <Box display='flex' alignItems='center' gap={1.5}>
                                <Box 
                                    display='flex' 
                                    alignItems='center' 
                                    sx={{
                                        color: theme.palette.primary.main,
                                        '& svg': { fontSize: '0.9rem', mr: 0.3 }
                                    }}
                                >
                                    <Star fontSize='small' />
                                    <Typography variant='caption' sx={{ fontWeight: 600 }}>
                                        {ficha.level}
                                    </Typography>
                                </Box>
                                <Typography 
                                    variant='caption' 
                                    sx={{ 
                                        px: 1, 
                                        py: 0.2, 
                                        borderRadius: 1,
                                        bgcolor: theme.palette.mode === 'dark' 
                                            ? 'rgba(144, 202, 249, 0.08)' 
                                            : 'rgba(25, 118, 210, 0.08)',
                                        color: theme.palette.mode === 'dark' 
                                            ? 'rgba(144, 202, 249, 0.9)' 
                                            : theme.palette.primary.main,
                                        fontWeight: 500
                                    }}
                                >
                                    {ficha.mode}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ opacity: 0.4 }} />

                    {/* Informações do Personagem */}
                    <Stack spacing={1} flex={1}>
                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                                Gênero:
                            </Typography>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                                {ficha.gender}
                            </Typography>
                        </Box>
                        
                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                                Classe:
                            </Typography>
                            <Typography variant='body2' sx={{ fontWeight: 600, color: theme.palette.info.main }}>  
                                {ficha.class as string}
                            </Typography>
                        </Box>

                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                                Linhagem:
                            </Typography>
                            <Typography 
                                variant='body2' 
                                sx={{ 
                                    fontWeight: 600, 
                                    textAlign: 'right',
                                    maxWidth: '60%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {ficha.lineage as unknown as string}
                            </Typography>
                        </Box>

                        <Box display='flex' justifyContent='space-between' alignItems='center'>
                            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                                Raça:
                            </Typography>
                            <Typography variant='body2' sx={{ fontWeight: 600, color: theme.palette.success.main }}>  
                                {ficha.race as string}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider sx={{ opacity: 0.4 }} />

                    {/* Footer com Dinheiro e Ação */}
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                        <Box 
                            display='flex' 
                            alignItems='center' 
                            sx={{
                                px: 0.8,
                                py: 0.2,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 167, 38, 0.15)' : 'rgba(255, 167, 38, 0.08)',
                                borderRadius: 1.5,
                                gap: 0.5
                            }}
                        >
                            <AttachMoney sx={{ fontSize: '1rem', color: 'warning.main' }} />
                            <Typography 
                                variant='body1' 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'warning.main'
                                }}
                            >
                                {ficha.mode === 'Classic' ? '¥' : '¢'}{ficha.inventory.money}
                            </Typography>
                        </Box>
                        
                        <Box display='flex' alignItems='center' gap={1}>
                            {!disableDeleteButton && (
                                <Tooltip title='Deletar Ficha'>
                                    <IconButton
                                        onClick={e => { e.stopPropagation(); setOpenModal(true) }}
                                        size='small'
                                        sx={{
                                            color: theme.palette.error.main,
                                            opacity: 0.7,
                                            '&:hover': {
                                                opacity: 1
                                            }
                                        }}
                                    >
                                        <Delete fontSize='small' />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <IconButton
                                size='small'
                                sx={{
                                    color: theme.palette.primary.main,
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.12)' : 'rgba(25, 118, 210, 0.08)',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(25, 118, 210, 0.12)'
                                    }
                                }}
                            >
                                <ArrowForward fontSize='small' />
                            </IconButton>
                        </Box>
                    </Box>
                </Stack>
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