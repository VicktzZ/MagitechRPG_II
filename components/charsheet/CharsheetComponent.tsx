/* eslint-disable @typescript-eslint/no-shadow */
'use client';

import { Attributes, Characteristics, CustomDices, Expertises, Inventory, Magics, Passives, Skills, SkillsModal } from '@components/charsheet';
import { toastDefault } from '@constants';
import { useAudio } from '@hooks';
import { CustomIconButton, WarningModal } from '@layout';
import type { CharsheetDTO } from '@models/dtos';
import type { Charsheet } from '@models/entities';
import {
    Add,
    ArticleRounded,
    AutoAwesome,
    CasinoSharp,
    Edit,
    Equalizer,
    EventNote,
    Inventory2,
    Notes,
    Person,
    Psychology,
    Save,
    SportsMartialArts,
    Warning
} from '@mui/icons-material';
import {
    Alert,
    Backdrop,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Fade,
    LinearProgress,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
    type SxProps
} from '@mui/material';
import { useSession } from '@node_modules/next-auth/react';
import { charsheetService } from '@services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useEffect, useState, type ReactElement } from 'react';
import { useFormContext, type SubmitHandler } from 'react-hook-form';

function Section({ title, icon, children, action, sx }: { 
    title: string; 
    icon?: ReactElement; 
    children: ReactElement;
    action?: ReactElement;
    sx?: SxProps;
}) {
    return (
        <Paper 
            elevation={2} 
            sx={{ 
                p: 3, 
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: 4
                },
                ...sx
            }}
        >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    {icon}
                    <Typography variant="h6" fontFamily="Sakana">{title}</Typography>
                </Box>
                {action}
            </Box>
            <Divider sx={{ mb: 2 }} />
            {children}
        </Paper>
    )
}

export default function CharsheetComponent(): ReactElement {
    const form = useFormContext<Charsheet>()
    const charsheet = form.getValues()
    const { data: session } = useSession()
    const queryClient = useQueryClient()
    const audio = useAudio('/sounds/arcade-cyber-bling.wav')

    const changeGameMode = (): void => {
        const currentMode = form.getValues('mode')
        const newMode = currentMode === 'Classic' ? 'Apocalypse' : 'Classic'
        
        form.setValue('mode', newMode, { shouldValidate: true })
        form.setValue('financialCondition', '' as any)    
        form.setValue('inventory.money', 0)
        form.setValue('lineage', undefined as unknown as any)
        audio.play()
    }

    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const [ openModal, setOpenModal ] = useState<boolean>(false)
    const [ isLoading, setIsLoading ] = useState<boolean>(false)
    const [ openSkillsModal, setOpenSkillsModal ] = useState<boolean>(false)
    const [ saveProgress, setSaveProgress ] = useState<number>(0)
    const router = useRouter()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const isTablet = useMediaQuery(theme.breakpoints.down('md'))
    const isNotebook = useMediaQuery(theme.breakpoints.between('md', 'xl'))
    const submitAudio = useAudio('/sounds/sci-fi-interface-zoom.wav')
    const [ , setCreateCharsheetAutosave ] = useLocalStorage<Charsheet | null>('create-charsheet-autosave')

    const { mutateAsync: updateCharsheet } = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: CharsheetDTO }) => await charsheetService.updateById({ id, data }),
        onSuccess: () => {
            enqueueSnackbar('Charsheet atualizada com sucesso!', toastDefault('success', 'success'))
            setSaveProgress(100)
            setTimeout(() => setSaveProgress(0), 2000)
            queryClient.invalidateQueries({ queryKey: [ 'charsheet', charsheet.id ] })
            queryClient.invalidateQueries({ queryKey: [ 'charsheets', session?.user?.id ] })
        },
        onError: (error: any) => {
            enqueueSnackbar(`Algo deu errado: ${error.message}`, toastDefault('error', 'error'))
            setSaveProgress(0)
        }
    })

    const { mutateAsync: createCharsheet } = useMutation({
        mutationFn: async (data: CharsheetDTO) => await charsheetService.create(data),
        onSuccess: () => {
            enqueueSnackbar('Charsheet criada com sucesso!', toastDefault('success', 'success'))
            queryClient.invalidateQueries({ queryKey: [ 'charsheet', charsheet.id ] })
            queryClient.invalidateQueries({ queryKey: [ 'charsheets', session?.user?.id ] })
        },
        onError: (error: any) => {
            enqueueSnackbar(`Algo deu errado: ${error.message}`, toastDefault('error', 'error'))
        }
    })

    const { errors, isValid } = form.formState;

    useEffect(() => {
        console.log(errors)
    }, [ errors ])

    const submitForm: SubmitHandler<CharsheetDTO> = async (values) => {
        const charsheetDto: Charsheet = {
            ...values,
            spells: values.spells.map(m => m.id) as string[],
            skills: {
                ...values.skills,
                powers: values.skills.powers.map(p => p.id) as string[]
            }
        }

        enqueueSnackbar('Aguarde...', toastDefault('loadingFetch', 'info'))

        if (!values.id) {
            try {
                const response = await createCharsheet(charsheetDto)

                closeSnackbar('loadingFetch')

                enqueueSnackbar('Charsheet criada com sucesso!', toastDefault('success', 'success'))
                setIsLoading(true)
                submitAudio.play()
                setCreateCharsheetAutosave(null)
                setTimeout(() => {
                    router.push('/app/charsheet/' + response.id)
                }, 500);
            } catch (error: any) {
                closeSnackbar('loadingFetch')
                enqueueSnackbar(`Algo deu errado: ${error.message}`, toastDefault('error', 'error'))
            }
            return
        }

        try {
            const response = await updateCharsheet({ id: values.id, data: charsheetDto })

            closeSnackbar('loadingFetch')

            if (charsheet.id) {
                enqueueSnackbar('Charsheet salva com sucesso!', toastDefault('success', 'success'))
            } else {
                enqueueSnackbar('Charsheet criada com sucesso!', toastDefault('charsheetCreated', 'success'))
                setIsLoading(true)
                setTimeout(() => {
                    router.push('/app/charsheet/' + response.id)
                }, 500);
            }
        } catch (error: any) {
            closeSnackbar('loadingFetch')
            enqueueSnackbar(`Algo deu errado: ${error.message}`, toastDefault('error', 'error'))
        }
    };

    return (
        <Box 
            component="form" 
            onSubmit={!charsheet.id ? form.handleSubmit(submitForm) : undefined}
            sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                p: isMobile ? '15px 0' : 3,
                maxWidth: '1900px',
                mx: 'auto',
                width: '100%'
            }}
        >
            {/* Header com informações e ações */}
            <Paper 
                elevation={3} 
                sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(39, 136, 205, 0.1), rgba(39, 136, 205, 0.05))'
                }}
            >
                <Stack 
                    direction={isMobile ? 'column' : 'row'} 
                    justifyContent="space-between" 
                    alignItems={isMobile ? 'stretch' : 'center'}
                    spacing={2}
                >
                    <Box display='flex' gap={2}>
                        <Box>
                            <Typography 
                                variant={isMobile ? 'h5' : 'h4'} 
                                fontFamily="Sakana"
                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                            >
                                {!charsheet.id ? (
                                    <>
                                        <Add /> Criar Nova Ficha
                                    </>
                                ) : (
                                    <>
                                        <Person /> {charsheet.name || 'Ficha sem nome'}
                                    </>
                                )}
                            </Typography>
                            {charsheet.id && (
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    Jogador: {charsheet.playerName}
                                </Typography>
                            )}
                        </Box>
                        {!charsheet.id && (
                            <Box>
                                <Button
                                    variant='contained'
                                    color={'terciary' as any}
                                    type='button'
                                    onClick={() => {
                                        setCreateCharsheetAutosave(null)
                                        window.location.reload()
                                    }}
                                >
                                    Resetar Ficha
                                </Button>
                            </Box>
                        )}
                    </Box>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant='contained'
                            color={'terciary' as any}
                            type='button'
                            onClick={changeGameMode}
                            disabled={!!form.getValues().id}
                        >
                            Modo de jogo: {form.getValues().mode}
                        </Button>
                        <Tooltip 
                            title={
                                !isValid ? 'Preencha todos os campos obrigatórios' : 
                                    session?.user.id !== charsheet.userId ? 'Você não pode salvar esta ficha' : 
                                        'Salvar alterações'
                            }
                        >
                            <span>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type={!charsheet.id ? 'submit' : 'button'}
                                    onClick={form.handleSubmit(submitForm)}
                                    disabled={!!charsheet?.id && (session?.user.id !== charsheet.userId)}
                                    startIcon={<Save />}
                                    size={isMobile ? 'small' : 'medium'}
                                    sx={{ minWidth: isMobile ? 100 : 150 }}
                                >
                                    {!charsheet.id ? 'Criar' : 'Salvar'}
                                </Button>
                            </span>
                        </Tooltip>
                    </Stack>
                </Stack>
                
                {/* Barra de progresso do salvamento */}
                {saveProgress > 0 && (
                    <Fade in>
                        <LinearProgress 
                            variant="determinate" 
                            value={saveProgress} 
                            sx={{ mt: 2, borderRadius: 1 }}
                        />
                    </Fade>
                )}
            </Paper>

            {/* Alertas de validação */}
            {Object.keys(errors).length > 0 && (
                <Alert severity="error" icon={<Warning />}>
                    <Typography variant="body2">
                        Existem erros no formulário. Por favor, verifique os campos destacados.
                    </Typography>
                </Alert>
            )}

            {/* Características */}
            <Section 
                title="Características" 
                icon={<ArticleRounded sx={{ color: 'primary.main' }} />}
            >
                <Characteristics />
            </Section>

            {/* Grid de Atributos e Habilidades */}
            {/* Layout para Desktop: duas colunas lado a lado */}
            {!isTablet && !isNotebook && (
                <Stack 
                    direction="row"
                    spacing={3}
                    sx={{ width: '100%' }}
                >
                    {/* Coluna Esquerda - Atributos */}
                    <Stack spacing={3} sx={{ flex: 1 }}>
                        <Section 
                            title="Atributos" 
                            icon={<Equalizer sx={{ color: 'warning.main' }} />}
                        >
                            <Attributes />
                        </Section>
                    </Stack>

                    {/* Coluna Direita - Habilidades e Dados */}
                    <Stack spacing={3} sx={{ flex: 1 }}>
                        {/* Habilidades */}
                        <Section 
                            title="Habilidades" 
                            icon={<SportsMartialArts sx={{ color: 'secondary.main' }} />}
                            action={
                                <Tooltip title="Gerenciar habilidades">
                                    <CustomIconButton 
                                        onClick={() => setOpenSkillsModal(true)}
                                        size="small"
                                    >
                                        <Edit fontSize="small" />
                                    </CustomIconButton>
                                </Tooltip>
                            }
                        >
                            <Skills />
                        </Section>

                        {/* Dados Personalizados */}
                        <Section
                            title='Dados Personalizados'
                            icon={<CasinoSharp sx={{ color: 'secondary.main' }} />}
                        >
                            <Box>
                                <CustomDices />
                                {/* // TODO: Incrementar sistema de personalização de rolagem de dados */ }
                            </Box>
                        </Section>
                        
                        {/* Passivas */}
                        <Section
                            title='Passivas'
                            icon={<EventNote sx={{ color: 'info.main' }} />}
                        >
                            <Box>
                                <Passives />
                            </Box>
                        </Section>
                    </Stack>
                </Stack>
            )}

            {/* Layout para Notebook/Tablet/Mobile: coluna única com componentes empilhados */}
            {(isTablet || isNotebook) && (
                <Stack spacing={3} sx={{ width: '100%' }}>
                    {/* Atributos */}
                    <Section 
                        title="Atributos" 
                        icon={<Equalizer sx={{ color: 'warning.main' }} />}
                    >
                        <Attributes />
                    </Section>

                    {/* Habilidades */}
                    <Section 
                        title="Habilidades" 
                        icon={<SportsMartialArts sx={{ color: 'secondary.main' }} />}
                        action={
                            <Tooltip title="Gerenciar habilidades">
                                <CustomIconButton 
                                    onClick={() => setOpenSkillsModal(true)}
                                    size="small"
                                >
                                    <Edit fontSize="small" />
                                </CustomIconButton>
                            </Tooltip>
                        }
                    >
                        <Skills />
                    </Section>

                    {/* Dados Personalizados */}
                    <Section
                        title='Dados Personalizados'
                        icon={<CasinoSharp sx={{ color: 'terciary.main' }} />}
                    >
                        <Box>
                            <CustomDices />
                            {/* // TODO: Incrementar sistema de personalização de rolagem de dados */ }
                        </Box>
                    </Section>

                    {/* Passivas */}
                    <Section
                        title='Passivas'
                        icon={<EventNote sx={{ color: 'info.main' }} />}
                    >
                        <Box>
                            <Passives />
                        </Box>
                    </Section>
                </Stack>
            )}

            {/* Perícias */}
            <Section 
                title="Perícias" 
                icon={<Psychology sx={{ color: 'info.main' }} />}
            >
                <Expertises />
            </Section>

            {/* Inventário */}
            <Section 
                title="Inventário" 
                icon={<Inventory2 sx={{ color: 'success.main' }} />}
            >
                <Box>
                    <Stack 
                        direction="row" 
                        spacing={2} 
                        flexWrap="wrap"
                        sx={{ mb: 2 }}
                    >
                        {[ 'Armas', 'Armaduras', 'Itens', 'Consumíveis' ].map((categoria) => (
                            <Chip
                                key={categoria}
                                label={categoria}
                                variant="outlined"
                                size="small"
                                disabled
                            />
                        ))}
                    </Stack>
                    <Inventory />
                </Box>
            </Section>

            {/* Magias */}
            <Section 
                title="Magias" 
                icon={<AutoAwesome sx={{ color: 'primary.main' }} />}
            >
                <Magics />
            </Section>

            {/* Anotações */}
            <Section 
                title="Anotações" 
                icon={<Notes sx={{ color: 'text.secondary' }} />}
                sx={{ height: '100%' }}
            >
                <Box>
                    <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ mb: 1, display: 'block' }}
                    >
                        Use este espaço para anotar informações importantes sobre seu personagem
                    </Typography>
                    <Box
                        component='textarea'
                        {...form.register('anotacoes')}
                        aria-label="Anotações do personagem"
                        placeholder='Digite suas anotações aqui...'
                        sx={{
                            width: '100%',
                            minHeight: isMobile ? '15rem' : '20rem',
                            maxHeight: '20rem',
                            p: 2,
                            fontSize: '1rem',
                            lineHeight: 1.5,
                            color: 'text.primary',
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease',
                            '&:focus': {
                                outline: 'none',
                                borderColor: 'primary.main',
                                boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}20`
                            },
                            '&:hover': {
                                borderColor: 'text.secondary'
                            }
                        }}
                    />
                </Box>
            </Section>

            {/* Modais */}
            <WarningModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onConfirm={() => { submitForm(charsheet); setOpenModal(false) }}
                text='Após criar a charsheet, alguns campos não poderão ser alterados. Deseja continuar?'
                title='Confirmar Criação'
            />
            
            <Backdrop 
                open={isLoading}
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backdropFilter: 'blur(3px)'
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress size={60} />
                    <Typography variant="h6" color="primary">
                        Criando sua charsheet...
                    </Typography>
                </Stack>
            </Backdrop>
            
            {openSkillsModal && (
                <SkillsModal
                    open={openSkillsModal}
                    onClose={() => setOpenSkillsModal(false)}
                />
            )}
        </Box>
    )
}