/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Backdrop, CircularProgress, TextField, useTheme } from '@mui/material';
import { Typography } from '@mui/material';
import { Box, Modal } from '@mui/material';
import { generateEntryCode } from '@functions';
import { useState, type ReactElement } from 'react';
import { useSnackbar } from 'notistack';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import type { Campaign } from '@types';
import { campaignService } from '@services';
import { useMutation } from '@node_modules/@tanstack/react-query/build/modern';

export default function CampaignOptionsModal({
    open,
    setOpen,
    contentType 
}: { 
    open: boolean,
    setOpen: (open: boolean) => void,
    contentType: 'create' | 'join' 
}): ReactElement {
    const { data: session } = useSession();

    const [ campaignCode, setCampaignCode ] = useState<string>('');
    const [ campaignProps, setCampaignProps ] = useState<Partial<Campaign>>({
        title: '',
        description: ''
    });

    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const router = useRouter();
    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (props: Partial<Campaign>) => await campaignService.create(props)
    })

    const joinCampaign = async (): Promise<void> => {
        if (campaignCode) {
            const response = await campaignService.getById(campaignCode)

            if (response) {
                setOpen(false);
                router.push(`/app/campaign/${campaignCode}`);
            } else {
                enqueueSnackbar('Código da sessão inválido ou inexistente!', { variant: 'error' });
            }
        } else {
            enqueueSnackbar('Insira o código da sessão!', { variant: 'error' });
        }
    };

    const createCampaign = async (): Promise<void> => {
        const campaignCodeGen = generateEntryCode();

        try {
            setOpen(false);

            await mutateAsync({
                admin: [ session?.user?._id ?? '' ],
                campaignCode: campaignCodeGen,
                title: campaignProps.title ?? '',
                description: campaignProps.description ?? '',
                players: [],
                notes: [],
                custom: {
                    creatures: [],
                    items: {
                        weapon: [],
                        armor: [],
                        item: []
                    },
                    magias: [],
                    skills: [],
                    dices: []
                },
                session: {
                    users: [],
                    messages: []
                }
            })

            enqueueSnackbar('Campanha criada com sucesso!', { variant: 'success' });
            router.push(`/app/campaign/${campaignCodeGen}`);
        } catch (error: any) {
            enqueueSnackbar('Erro ao criar sessão: ' + error.message, { variant: 'error' });
        }
    };

    return (
        <>
            <Modal
                open={open}
                onClose={() => { setOpen(false); }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <Box
                    minHeight='20%'
                    width='40%'
                    bgcolor='background.paper'
                    borderRadius={2}
                    component='form'
                    onSubmit={(e) => { e.preventDefault(); contentType === 'join' ? joinCampaign() : createCampaign(); }}
                    p={2.5}
                    sx={{
                        [theme.breakpoints.down('md')]: {
                            width: '80%'
                        }
                    }}
                >   
                    <Box height='100%' display='flex' gap={4} flexDirection='column'>
                        <Box display='flex' gap={2} justifyContent='space-between' alignItems='center'>
                            <Typography variant='h6'>Campanha</Typography>
                        </Box>
                        <Box display='flex' flexDirection='column' gap={2}>
                            <Box display='flex' flexDirection='column' gap={2}>
                                {contentType === 'join' ? (
                                    <TextField
                                        fullWidth 
                                        label='Código'
                                        placeholder='Código da campanha'
                                        value={campaignCode}
                                        onChange={(e) => { setCampaignCode(e.target.value); }}
                                    />
                                ) : (
                                    <>
                                        <TextField
                                            fullWidth 
                                            label='Título'
                                            placeholder='Nome da campanha'
                                            value={campaignProps.title}
                                            onChange={(e) => { setCampaignProps(state => ({ ...state, title: e.target.value })); }}
                                        />
                                        <TextField
                                            fullWidth 
                                            label='Descrição'
                                            placeholder='Descrição da campanha'
                                            value={campaignProps.description}
                                            onChange={(e) => { setCampaignProps(state => ({ ...state, description: e.target.value })); }}
                                        />
                                    </>
                                )}
                            </Box>
                            <Box display='flex' gap={2} justifyContent='space-between' width='100%'>
                                <Button onClick={() => { setOpen(false); }} variant='outlined'>Cancelar</Button>
                                <Box display='flex'alignItems='center' gap={1.5}>
                                    <Button 
                                        onClick={contentType === 'join' ? joinCampaign : createCampaign} 
                                        color={'terciary' as any} 
                                        variant='contained'
                                    >{contentType === 'join' ? 'Ingressar' : 'Criar'}</Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal>
            <Backdrop sx={{ zIndex: 999 }} open={isPending}>
                <CircularProgress />
            </Backdrop>
        </>
    );
}