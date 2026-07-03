/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Backdrop, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, useTheme, Divider, Chip } from '@mui/material';
import { Typography } from '@mui/material';
import { Box, Modal } from '@mui/material';
import { useState, useEffect, type ReactElement } from 'react';
import { useSnackbar } from 'notistack';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { campaignService } from '@services';
import { useMutation } from '@tanstack/react-query';
import generateEntryCode from '@utils/generateEntryCode';
import type { Campaign, RPGSystem } from '@models/entities';

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
        description: '',
        mode: 'Classic',
        systemId: undefined
    });
    const [ availableSystems, setAvailableSystems ] = useState<RPGSystem[]>([]);
    const [ loadingSystems, setLoadingSystems ] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    // Carrega sistemas disponíveis quando o modal abre para criação
    useEffect(() => {
        if (open && contentType === 'create' && session?.user?.id) {
            const fetchSystems = async () => {
                setLoadingSystems(true);
                try {
                    const response = await fetch(`/api/rpg-system?userId=${session.user.id}`);
                    const data = await response.json();
                    setAvailableSystems(data);
                } catch (error) {
                    console.error('Erro ao carregar sistemas:', error);
                } finally {
                    setLoadingSystems(false);
                }
            };
            fetchSystems();
        }
    }, [ open, contentType, session?.user?.id ]);
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
                admin: [ session?.user?.id ?? '' ],
                campaignCode: campaignCodeGen,
                title: campaignProps.title ?? '',
                description: campaignProps.description ?? '',
                mode: campaignProps.mode ?? 'Classic',
                systemId: campaignProps.systemId,
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
                                        <FormControl fullWidth>
                                            <InputLabel>Modo da campanha</InputLabel>
                                            <Select
                                                fullWidth
                                                label='Modo'
                                                value={campaignProps.mode}
                                                placeholder='Modo da campanha'
                                                onChange={(e) => { setCampaignProps(state => ({ ...state, mode: e.target.value })); }}
                                                displayEmpty
                                            >
                                                <MenuItem value="" disabled>Selecione um modo</MenuItem>
                                                <MenuItem value='Classic'>Classic</MenuItem>
                                                <MenuItem value='Roguelite'>Roguelite</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Divider sx={{ my: 1 }}>
                                            <Chip label="Sistema de RPG" size="small" />
                                        </Divider>

                                        <FormControl fullWidth>
                                            <InputLabel>Sistema</InputLabel>
                                            <Select
                                                fullWidth
                                                label='Sistema'
                                                value={campaignProps.systemId || ''}
                                                onChange={(e) => { setCampaignProps(state => ({ ...state, systemId: e.target.value || undefined })); }}
                                                disabled={loadingSystems}
                                            >
                                                <MenuItem value="">
                                                    <em>Magitech RPG (Padrão)</em>
                                                </MenuItem>
                                                {availableSystems.map((system) => (
                                                    <MenuItem key={system.id} value={system.id}>
                                                        {system.name}
                                                        {system.isPublic && (
                                                            <Chip 
                                                                label="Público" 
                                                                size="small" 
                                                                sx={{ ml: 1 }} 
                                                                color="info"
                                                            />
                                                        )}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </>
                                )}
                            </Box>
                            <Box display='flex' gap={2} justifyContent='space-between' width='100%'>
                                <Button onClick={() => { setOpen(false); }} variant='outlined'>Cancelar</Button>
                                <Box display='flex' alignItems='center' gap={1.5}>
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